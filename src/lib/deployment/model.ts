/**
 * LIORA P0.38 — model checkpointów deploymentu (client-safe).
 *
 * Checkpoint jest zapisem faktu, nie obietnicą. `passed` może pojawić się
 * tylko dla realnie wykonanego kroku. W P0.38 NIE ma automatycznego rollbacku
 * — model przygotowuje jedynie fundament.
 */

export const CHECKPOINT_IDS = [
  "01-init",
  "02-audit",
  "03-backup",
  "04-build",
  "05-backend",
  "06-vault",
  "07-telegram",
  "08-cloudflare",
  "09-e2e",
  "10-production",
] as const;

export type CheckpointId = (typeof CHECKPOINT_IDS)[number];

export const CHECKPOINT_STATUSES = ["pending", "running", "passed", "failed", "skipped"] as const;

export type CheckpointStatus = (typeof CHECKPOINT_STATUSES)[number];

/** Metadane checkpointu: wyłącznie skalary, bez PII i bez sekretów. */
export type CheckpointMetadata = Record<string, string | number | boolean>;

export interface Checkpoint {
  id: CheckpointId;
  releaseId: string;
  status: CheckpointStatus;
  timestamp: string;
  summary: string;
  errors: string[];
  metadata: CheckpointMetadata;
}

export function isCheckpointId(value: string): value is CheckpointId {
  return (CHECKPOINT_IDS as readonly string[]).includes(value);
}

/**
 * Wzorce, których NIE wolno zapisać w metadanych checkpointu ani w logach
 * deploymentu: sekrety, tokeny, IP, adresy e-mail, klucze.
 */
const FORBIDDEN_METADATA_KEY =
  /(secret|token|password|passwd|key|credential|authorization|cookie|ip|ipv4|ipv6|email|mail|phone|user_agent)/i;

const EMAIL_VALUE = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const IPV4_VALUE = /\b\d{1,3}(\.\d{1,3}){3}\b/;

/**
 * Filtruje metadane: usuwa zakazane klucze oraz wartości wyglądające na
 * e-mail lub adres IP. Zwraca nowy obiekt — wejście nie jest mutowane.
 */
export function sanitizeCheckpointMetadata(input: Record<string, unknown>): CheckpointMetadata {
  const output: CheckpointMetadata = {};
  for (const [key, value] of Object.entries(input)) {
    if (FORBIDDEN_METADATA_KEY.test(key)) continue;
    if (typeof value === "number" || typeof value === "boolean") {
      output[key] = value;
      continue;
    }
    if (typeof value !== "string") continue;
    if (EMAIL_VALUE.test(value) || IPV4_VALUE.test(value)) continue;
    output[key] = value.slice(0, 500);
  }
  return output;
}

export interface CreateCheckpointInput {
  id: CheckpointId;
  releaseId: string;
  status: CheckpointStatus;
  summary: string;
  errors?: string[];
  metadata?: Record<string, unknown>;
  now?: Date;
}

export function createCheckpoint(input: CreateCheckpointInput): Checkpoint {
  return {
    id: input.id,
    releaseId: input.releaseId,
    status: input.status,
    timestamp: (input.now ?? new Date()).toISOString(),
    summary: input.summary.slice(0, 500),
    errors: (input.errors ?? []).map((error) => error.slice(0, 500)).slice(0, 20),
    metadata: sanitizeCheckpointMetadata(input.metadata ?? {}),
  };
}

/** Pełna, uporządkowana lista checkpointów w stanie `pending` dla release'u. */
export function initialCheckpoints(releaseId: string, now = new Date()): Checkpoint[] {
  return CHECKPOINT_IDS.map((id) =>
    createCheckpoint({ id, releaseId, status: "pending", summary: "", now }),
  );
}
