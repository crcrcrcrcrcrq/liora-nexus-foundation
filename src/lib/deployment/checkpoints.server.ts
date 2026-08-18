/**
 * LIORA P0.38 — Checkpoint Manager (SERVER-ONLY).
 *
 * Checkpointy zapisujemy w S3 pod `liora/checkpoints/<releaseId>/<id>.json`.
 * Metadane przechodzą przez `sanitizeCheckpointMetadata`, więc do magazynu nie
 * trafiają sekrety, adresy IP ani e-maile.
 *
 * P0.38 NIE wykonuje automatycznego rollbacku.
 */
import { assertReleaseId, storageKey, storagePrefix } from "@/lib/storage/model";
import { getJsonObject, listObjects, putJsonObject } from "@/lib/storage/s3.server";
import {
  createCheckpoint,
  type Checkpoint,
  type CheckpointId,
  type CreateCheckpointInput,
} from "./model";

function checkpointKey(releaseId: string, id: CheckpointId): string {
  return storageKey("checkpoints", assertReleaseId(releaseId), `${id}.json`);
}

export async function saveCheckpoint(input: CreateCheckpointInput): Promise<Checkpoint> {
  const checkpoint = createCheckpoint(input);
  await putJsonObject(checkpointKey(checkpoint.releaseId, checkpoint.id), checkpoint);
  return checkpoint;
}

export async function getCheckpoint(releaseId: string, id: CheckpointId): Promise<Checkpoint> {
  return getJsonObject<Checkpoint>(checkpointKey(releaseId, id));
}

export async function listCheckpoints(releaseId: string): Promise<Checkpoint[]> {
  const prefix = storagePrefix("checkpoints", assertReleaseId(releaseId));
  const { objects } = await listObjects(prefix, { maxKeys: 100 });
  const checkpoints = await Promise.all(
    objects
      .filter((object) => object.key.endsWith(".json"))
      .map((object) => getJsonObject<Checkpoint>(object.key)),
  );
  return checkpoints.sort((a, b) => a.id.localeCompare(b.id));
}
