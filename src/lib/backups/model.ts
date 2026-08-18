/**
 * LIORA P0.38 — model backupu systemowego (client-safe: same typy i czyste funkcje).
 *
 * Manifest opisuje WYŁĄCZNIE metadane techniczne. Nie zawiera danych klientów,
 * adresów e-mail, IP ani żadnych sekretów.
 */
import { assertReleaseId, assertSafeArtifactName } from "@/lib/storage/model";

export type BackupStatus = "draft" | "uploading" | "stored" | "failed";

export interface BackupManifest {
  backupId: string;
  releaseId: string;
  createdAt: string;
  /** Wersja projektu (np. z package.json / release). */
  projectVersion: string;
  /** Commit gita, jeżeli dostępny w środowisku budowania. */
  gitCommit: string | null;
  /** `sha256:<hex>` artefaktu. */
  checksum: string | null;
  sizeBytes: number | null;
  /** Klucz artefaktu w S3 (null, dopóki nie wysłano). */
  artifactKey: string | null;
  status: BackupStatus;
  /** Krótka, nietechniczna notka; walidowana pod kątem długości. */
  note?: string;
}

export interface CreateBackupManifestInput {
  releaseId: string;
  projectVersion: string;
  gitCommit?: string | null;
  artifactName?: string;
  note?: string;
  now?: Date;
}

function backupIdFor(date: Date): string {
  return `backup-${date.toISOString().replace(/[-:]/g, "").replace(/\..*$/, "Z")}`;
}

/** Czysta funkcja — brak I/O, dzięki czemu jest w pełni testowalna. */
export function createBackupManifest(input: CreateBackupManifestInput): BackupManifest {
  const now = input.now ?? new Date();
  if (input.artifactName) assertSafeArtifactName(input.artifactName);
  const manifest: BackupManifest = {
    backupId: backupIdFor(now),
    releaseId: assertReleaseId(input.releaseId),
    createdAt: now.toISOString(),
    projectVersion: input.projectVersion,
    gitCommit: input.gitCommit ?? null,
    checksum: null,
    sizeBytes: null,
    artifactKey: null,
    status: "draft",
  };
  if (input.note) manifest.note = input.note.slice(0, 280);
  return manifest;
}
