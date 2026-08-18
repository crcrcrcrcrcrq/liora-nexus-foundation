/**
 * LIORA P0.38 — Release Manager (SERVER-ONLY).
 *
 * Rejestr release'ów żyje w S3 (`liora/releases/<id>/release.json`). Nie
 * dotykamy bazy biznesowej: release jest artefaktem systemowym, nie encją
 * domenową.
 */
import {
  assertReleaseId,
  formatReleaseId,
  storageKey,
  storagePrefix,
  type StorageObjectRef,
} from "@/lib/storage/model";
import { getJsonObject, listObjects, putJsonObject } from "@/lib/storage/s3.server";
import { createRelease, transitionRelease, type Release, type ReleaseStatus } from "./model";

const RELEASE_FILE = "release.json";

function releaseKey(id: string): string {
  return storageKey("releases", assertReleaseId(id), RELEASE_FILE);
}

export async function saveRelease(release: Release): Promise<Release> {
  await putJsonObject(releaseKey(release.id), release);
  return release;
}

export async function getRelease(id: string): Promise<Release> {
  return getJsonObject<Release>(releaseKey(id));
}

export async function listReleaseRefs(limit = 50): Promise<StorageObjectRef[]> {
  const { objects } = await listObjects(storagePrefix("releases"), { maxKeys: limit * 4 });
  return objects
    .filter((object) => object.key.endsWith(`/${RELEASE_FILE}`))
    .sort((a, b) => (a.key < b.key ? 1 : -1))
    .slice(0, limit);
}

/**
 * Wyznacza wolny identyfikator na dany dzień (`LIORA-YYYY.MM.DD-NNN`) na
 * podstawie tego, co już leży w S3. Bez zapisu.
 */
export async function nextReleaseId(now = new Date()): Promise<string> {
  const datePart = formatReleaseId(now, 1).slice(0, "LIORA-2026.08.10".length);
  const { objects } = await listObjects(storagePrefix("releases"), { maxKeys: 1000 });
  const used = new Set(
    objects.map((object) => object.key.split("/")[2] ?? "").filter((id) => id.startsWith(datePart)),
  );
  for (let sequence = 1; sequence <= 999; sequence += 1) {
    const candidate = formatReleaseId(now, sequence);
    if (!used.has(candidate)) return candidate;
  }
  throw new Error("RELEASE_ID_EXHAUSTED: more than 999 releases for this day");
}

/** Tworzy i utrwala nowy release w statusie `draft`. */
export async function openRelease(version: string, commit?: string | null): Promise<Release> {
  const now = new Date();
  const id = await nextReleaseId(now);
  return saveRelease(createRelease({ version, commit: commit ?? null, id, now }));
}

/** Zmiana statusu przechodzi przez walidację przejść z modelu. */
export async function advanceRelease(id: string, to: ReleaseStatus): Promise<Release> {
  const current = await getRelease(id);
  return saveRelease(transitionRelease(current, to));
}
