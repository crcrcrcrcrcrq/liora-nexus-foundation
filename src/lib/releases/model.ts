/**
 * LIORA P0.38 — model release (client-safe: typy + czyste przejścia statusów).
 *
 * Statusy są zamknięte. Nie istnieje status „sukces” nadawany bez realnego
 * zdarzenia — `deployed` może powstać wyłącznie po wykonanym deploymencie.
 */
import { assertReleaseId, formatReleaseId, isReleaseId } from "@/lib/storage/model";

export const RELEASE_STATUSES = [
  "draft",
  "building",
  "ready",
  "deployed",
  "failed",
  "rolled_back",
] as const;

export type ReleaseStatus = (typeof RELEASE_STATUSES)[number];

export interface Release {
  id: string;
  createdAt: string;
  version: string;
  commit: string | null;
  status: ReleaseStatus;
  /** Klucz artefaktu buildu w S3 albo null. */
  artifactKey: string | null;
  /** Klucz manifestu backupu w S3 albo null. */
  backupKey: string | null;
  /** Klucz manifestu deploymentu w S3 albo null. */
  deploymentKey: string | null;
}

/** Dozwolone przejścia. Brak pętli „ready → ready” i brak skrótu do `deployed`. */
export const RELEASE_TRANSITIONS: Record<ReleaseStatus, readonly ReleaseStatus[]> = {
  draft: ["building", "failed"],
  building: ["ready", "failed"],
  ready: ["deployed", "failed"],
  deployed: ["rolled_back", "failed"],
  failed: ["draft"],
  rolled_back: ["draft"],
};

export function isReleaseStatus(value: string): value is ReleaseStatus {
  return (RELEASE_STATUSES as readonly string[]).includes(value);
}

export function canTransitionRelease(from: ReleaseStatus, to: ReleaseStatus): boolean {
  return RELEASE_TRANSITIONS[from].includes(to);
}

export class ReleaseTransitionError extends Error {
  constructor(from: ReleaseStatus, to: ReleaseStatus) {
    super(`RELEASE_STATUS_TRANSITION_INVALID: ${from} -> ${to}`);
    this.name = "ReleaseTransitionError";
  }
}

export function transitionRelease(release: Release, to: ReleaseStatus): Release {
  if (!canTransitionRelease(release.status, to)) {
    throw new ReleaseTransitionError(release.status, to);
  }
  return { ...release, status: to };
}

export interface CreateReleaseInput {
  version: string;
  commit?: string | null;
  sequence?: number;
  now?: Date;
  id?: string;
}

export function createRelease(input: CreateReleaseInput): Release {
  const now = input.now ?? new Date();
  const id = input.id ? assertReleaseId(input.id) : formatReleaseId(now, input.sequence ?? 1);
  return {
    id,
    createdAt: now.toISOString(),
    version: input.version,
    commit: input.commit ?? null,
    status: "draft",
    artifactKey: null,
    backupKey: null,
    deploymentKey: null,
  };
}

export { isReleaseId };
