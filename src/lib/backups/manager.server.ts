/**
 * LIORA P0.38 — Backup Manager (SERVER-ONLY).
 *
 * Warstwa nie tworzy nowego źródła prawdy biznesowej. Zapisuje wyłącznie
 * manifesty i artefakty systemowe w S3 pod `liora/backups/<releaseId>/`.
 *
 * NIE wysyła plików `.env`, kluczy ani niczego, co pasuje do listy zakazanej
 * (`assertSafeArtifactName`). Dane klientów nie są częścią backupu systemowego.
 */
import {
  assertReleaseId,
  assertSafeArtifactName,
  storageKey,
  storagePrefix,
  type StorageObjectRef,
} from "@/lib/storage/model";
import {
  checksum,
  getJsonObject,
  listObjects,
  putJsonObject,
  putObject,
} from "@/lib/storage/s3.server";
import type { BackupManifest } from "./model";

const MANIFEST_FILE = "manifest.json";

function manifestKey(releaseId: string): string {
  return storageKey("backups", assertReleaseId(releaseId), MANIFEST_FILE);
}

/** Zapisuje manifest backupu (idempotentnie, jeden na release). */
export async function saveBackupManifest(manifest: BackupManifest): Promise<BackupManifest> {
  await putJsonObject(manifestKey(manifest.releaseId), manifest);
  return manifest;
}

/**
 * Wysyła artefakt backupu i aktualizuje manifest o checksum, rozmiar i klucz.
 * Nazwa artefaktu przechodzi przez allowlistę bezpieczeństwa.
 */
export async function uploadBackupArtifact(
  manifest: BackupManifest,
  artifactName: string,
  payload: Uint8Array,
  contentType = "application/zip",
): Promise<BackupManifest> {
  assertSafeArtifactName(artifactName);
  const key = storageKey("backups", assertReleaseId(manifest.releaseId), artifactName);
  try {
    const result = await putObject(key, payload, contentType);
    const stored: BackupManifest = {
      ...manifest,
      artifactKey: result.key,
      sizeBytes: result.size,
      checksum: await checksum(payload),
      status: "stored",
    };
    return saveBackupManifest(stored);
  } catch (error) {
    await saveBackupManifest({ ...manifest, status: "failed" }).catch(() => undefined);
    throw error;
  }
}

export async function getBackupMetadata(releaseId: string): Promise<BackupManifest> {
  return getJsonObject<BackupManifest>(manifestKey(releaseId));
}

/** Lista backupów = lista manifestów w przestrzeni `liora/backups/`. */
export async function listBackups(limit = 50): Promise<StorageObjectRef[]> {
  const { objects } = await listObjects(storagePrefix("backups"), { maxKeys: limit * 4 });
  return objects
    .filter((object) => object.key.endsWith(`/${MANIFEST_FILE}`))
    .sort((a, b) => (a.key < b.key ? 1 : -1))
    .slice(0, limit);
}

export async function countBackups(): Promise<number> {
  return (await listBackups(200)).length;
}
