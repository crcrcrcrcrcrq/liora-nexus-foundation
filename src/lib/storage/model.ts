/**
 * LIORA P0.38 — kontrakt magazynu systemowego S3 (client-safe: same typy).
 *
 * Ten plik NIE czyta środowiska i NIE zawiera żadnych sekretów. Cała warstwa
 * wykonawcza (podpis SigV4, credentials) żyje w `s3.server.ts`.
 */

/** Korzeń przestrzeni systemowej w buckecie. */
export const STORAGE_ROOT = "liora" as const;

/** Logiczne obszary magazynu — dokładnie te z kontraktu P0.38. */
export const STORAGE_AREAS = [
  "backups",
  "releases",
  "deployments",
  "checkpoints",
  "artifacts",
  "logs",
] as const;

export type StorageArea = (typeof STORAGE_AREAS)[number];

export type StorageErrorCode =
  "not_configured" | "invalid_key" | "not_found" | "access_denied" | "upstream" | "network";

/** Typowany błąd magazynu. Nigdy nie niesie credentials ani nagłówków auth. */
export class StorageError extends Error {
  readonly code: StorageErrorCode;
  readonly status?: number;

  constructor(code: StorageErrorCode, message: string, status?: number) {
    super(message);
    this.name = "StorageError";
    this.code = code;
    if (typeof status === "number") this.status = status;
  }
}

export interface StorageObjectRef {
  key: string;
  size: number;
  lastModified: string | null;
  etag: string | null;
}

export interface PutObjectResult {
  key: string;
  size: number;
  etag: string | null;
}

export interface ListObjectsResult {
  objects: StorageObjectRef[];
  truncated: boolean;
  nextToken: string | null;
}

/** Status konfiguracji — wyłącznie flagi boolowskie, bez wartości sekretów. */
export interface StorageConfigStatus {
  configured: boolean;
  endpointConfigured: boolean;
  bucketConfigured: boolean;
  credentialsConfigured: boolean;
  region: string;
  forcePathStyle: boolean;
}

const SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/**
 * Buduje klucz w przestrzeni `liora/<area>/...`. Odrzuca puste segmenty,
 * `..`, ukośniki i znaki spoza allowlisty — klucz nigdy nie powstaje z
 * niesprawdzonego wejścia.
 */
export function storageKey(area: StorageArea, ...segments: string[]): string {
  if (segments.length === 0)
    throw new StorageError("invalid_key", "Storage key requires at least one segment");
  for (const segment of segments) {
    if (!SEGMENT.test(segment)) {
      throw new StorageError(
        "invalid_key",
        `Invalid storage key segment: ${JSON.stringify(segment)}`,
      );
    }
  }
  return [STORAGE_ROOT, area, ...segments].join("/");
}

/** Prefiks obszaru — do listowania. */
export function storagePrefix(area: StorageArea, ...segments: string[]): string {
  for (const segment of segments) {
    if (!SEGMENT.test(segment)) {
      throw new StorageError(
        "invalid_key",
        `Invalid storage prefix segment: ${JSON.stringify(segment)}`,
      );
    }
  }
  return [STORAGE_ROOT, area, ...segments].join("/") + "/";
}

/** Format identyfikatora release: `LIORA-2026.08.10-001`. */
export const RELEASE_ID_PATTERN = /^LIORA-\d{4}\.\d{2}\.\d{2}-\d{3}$/;

export function formatReleaseId(date: Date, sequence: number): string {
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > 999) {
    throw new StorageError("invalid_key", "Release sequence must be an integer between 1 and 999");
  }
  const y = date.getUTCFullYear().toString().padStart(4, "0");
  const m = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const d = date.getUTCDate().toString().padStart(2, "0");
  return `LIORA-${y}.${m}.${d}-${sequence.toString().padStart(3, "0")}`;
}

export function isReleaseId(value: string): boolean {
  return RELEASE_ID_PATTERN.test(value);
}

export function assertReleaseId(value: string): string {
  if (!isReleaseId(value)) {
    throw new StorageError("invalid_key", `Invalid release id: ${JSON.stringify(value)}`);
  }
  return value;
}

/**
 * Nazwy plików, których NIGDY nie wolno wysłać do systemowego magazynu —
 * mogą zawierać credentials. Reguła jest twarda i testowana.
 */
const FORBIDDEN_ARTIFACT =
  /(^|\/)(\.env(\..*)?|.*\.pem|.*\.key|id_rsa|.*credentials.*|.*secret.*)$/i;

export function isForbiddenArtifactName(name: string): boolean {
  return FORBIDDEN_ARTIFACT.test(name);
}

export function assertSafeArtifactName(name: string): string {
  if (isForbiddenArtifactName(name)) {
    throw new StorageError(
      "invalid_key",
      `Refusing to store a credential-bearing artifact: ${name}`,
    );
  }
  return name;
}
