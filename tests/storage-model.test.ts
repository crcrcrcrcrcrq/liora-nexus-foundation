/**
 * LIORA P0.38 — testy modelu magazynu i identyfikatorów release.
 * Uruchamiane przez `bun test`; brak nowych zależności.
 */
import { describe, expect, test } from "bun:test";
import {
  assertReleaseId,
  assertSafeArtifactName,
  formatReleaseId,
  isForbiddenArtifactName,
  isReleaseId,
  StorageError,
  storageKey,
  storagePrefix,
} from "../src/lib/storage/model";

describe("storage keys", () => {
  test("builds keys under the liora/<area> namespace", () => {
    expect(storageKey("backups", "LIORA-2026.08.10-001", "manifest.json")).toBe(
      "liora/backups/LIORA-2026.08.10-001/manifest.json",
    );
    expect(storagePrefix("checkpoints", "LIORA-2026.08.10-001")).toBe(
      "liora/checkpoints/LIORA-2026.08.10-001/",
    );
  });

  test("rejects traversal, slashes and empty segments", () => {
    expect(() => storageKey("logs", "..")).toThrow(StorageError);
    expect(() => storageKey("logs", "a/b")).toThrow(StorageError);
    expect(() => storageKey("logs", "")).toThrow(StorageError);
  });
});

describe("release ids", () => {
  test("formats LIORA-YYYY.MM.DD-NNN", () => {
    expect(formatReleaseId(new Date("2026-08-10T09:00:00Z"), 1)).toBe("LIORA-2026.08.10-001");
    expect(formatReleaseId(new Date("2026-08-10T09:00:00Z"), 42)).toBe("LIORA-2026.08.10-042");
  });

  test("validates the id shape", () => {
    expect(isReleaseId("LIORA-2026.08.10-001")).toBe(true);
    expect(isReleaseId("LIORA-2026.8.10-1")).toBe(false);
    expect(() => assertReleaseId("nope")).toThrow(StorageError);
  });

  test("rejects out-of-range sequences", () => {
    expect(() => formatReleaseId(new Date(), 0)).toThrow(StorageError);
    expect(() => formatReleaseId(new Date(), 1000)).toThrow(StorageError);
  });
});

describe("artifact safety", () => {
  test("refuses credential-bearing artifact names", () => {
    for (const name of [".env", ".env.production", "server.key", "cert.pem", "aws-credentials"]) {
      expect(isForbiddenArtifactName(name)).toBe(true);
      expect(() => assertSafeArtifactName(name)).toThrow(StorageError);
    }
  });

  test("accepts ordinary artifacts", () => {
    expect(isForbiddenArtifactName("liora-source.zip")).toBe(false);
    expect(assertSafeArtifactName("liora-source.zip")).toBe("liora-source.zip");
  });
});
