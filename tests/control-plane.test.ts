/**
 * LIORA P0.38 — testy modeli release, checkpointów i uprawnień Control Plane.
 */
import { describe, expect, test } from "bun:test";
import {
  canTransitionRelease,
  createRelease,
  ReleaseTransitionError,
  transitionRelease,
} from "../src/lib/releases/model";
import {
  CHECKPOINT_IDS,
  createCheckpoint,
  initialCheckpoints,
  sanitizeCheckpointMetadata,
} from "../src/lib/deployment/model";
import { createBackupManifest } from "../src/lib/backups/model";
import { CONTROL_MODULES, hasControlPermission } from "../src/lib/control/model";

describe("release status machine", () => {
  const release = createRelease({
    version: "0.38.0",
    now: new Date("2026-08-10T09:00:00Z"),
    sequence: 1,
  });

  test("starts as draft with the expected id", () => {
    expect(release.id).toBe("LIORA-2026.08.10-001");
    expect(release.status).toBe("draft");
  });

  test("forbids skipping straight to deployed", () => {
    expect(canTransitionRelease("draft", "deployed")).toBe(false);
    expect(() => transitionRelease(release, "deployed")).toThrow(ReleaseTransitionError);
  });

  test("allows the real path draft -> building -> ready -> deployed", () => {
    const building = transitionRelease(release, "building");
    const ready = transitionRelease(building, "ready");
    expect(transitionRelease(ready, "deployed").status).toBe("deployed");
  });

  test("forbids no-op transitions", () => {
    expect(canTransitionRelease("ready", "ready")).toBe(false);
  });
});

describe("checkpoints", () => {
  test("exposes the ten P0.38 checkpoints, all pending initially", () => {
    expect(CHECKPOINT_IDS.length).toBe(10);
    const checkpoints = initialCheckpoints("LIORA-2026.08.10-001");
    expect(checkpoints.every((checkpoint) => checkpoint.status === "pending")).toBe(true);
  });

  test("strips secrets, IP addresses and e-mails from metadata", () => {
    const metadata = sanitizeCheckpointMetadata({
      s3_secret_access_key: "AKIA-should-never-appear",
      bot_token: "123:abc",
      clientEmail: "someone@example.com",
      remoteAddress: "203.0.113.7",
      visitor: "1.2.3.4",
      buildDurationMs: 1234,
      cloudflare: true,
      note: "build ok",
    });
    expect(metadata).toEqual({ buildDurationMs: 1234, cloudflare: true, note: "build ok" });
  });

  test("checkpoint metadata is sanitized on creation", () => {
    const checkpoint = createCheckpoint({
      id: "04-build",
      releaseId: "LIORA-2026.08.10-001",
      status: "passed",
      summary: "vite build",
      metadata: { secretKey: "x", ok: true },
    });
    expect(checkpoint.metadata).toEqual({ ok: true });
  });
});

describe("backup manifest", () => {
  test("never starts as stored and carries no payload", () => {
    const manifest = createBackupManifest({
      releaseId: "LIORA-2026.08.10-001",
      projectVersion: "0.38.0",
    });
    expect(manifest.status).toBe("draft");
    expect(manifest.checksum).toBeNull();
    expect(manifest.artifactKey).toBeNull();
  });

  test("refuses a credential-bearing artifact name", () => {
    expect(() =>
      createBackupManifest({
        releaseId: "LIORA-2026.08.10-001",
        projectVersion: "0.38.0",
        artifactName: ".env.production",
      }),
    ).toThrow();
  });
});

describe("control permissions", () => {
  test("moderator cannot write, admin can", () => {
    expect(hasControlPermission("moderator", "control:read")).toBe(true);
    expect(hasControlPermission("moderator", "control:deployment:write")).toBe(false);
    expect(hasControlPermission("admin", "control:deployment:write")).toBe(true);
  });

  test("declares the eight control modules", () => {
    expect([...CONTROL_MODULES]).toEqual([
      "auth",
      "roles",
      "deployment",
      "backups",
      "releases",
      "storage",
      "checkpoints",
      "health",
    ]);
  });
});
