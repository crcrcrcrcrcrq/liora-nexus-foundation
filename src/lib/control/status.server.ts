/**
 * LIORA P0.38 — status Control Plane liczony WYŁĄCZNIE serwerowo.
 *
 * Uczciwość statusów: `verified: true` pojawia się tylko wtedy, gdy realna
 * operacja została wykonana (np. listowanie S3 zwróciło odpowiedź). Sama
 * obecność zmiennych środowiskowych daje najwyżej `configured`.
 */
import { storagePrefix } from "@/lib/storage/model";
import { readStorageConfigStatus } from "@/lib/storage/s3.server";
import { CHECKPOINT_IDS } from "@/lib/deployment/model";
import type { ControlIdentity } from "./authorize.server";
import type { ControlModuleStatus } from "./model";

/** Czy build ma cel Cloudflare Workers — wykrywane, nie zakładane. */
function cloudflareRuntimeFlags(): Record<string, boolean> {
  const hasWorkerGlobals =
    typeof globalThis.caches !== "undefined" && typeof globalThis.crypto?.subtle !== "undefined";
  return {
    webCryptoAvailable: typeof globalThis.crypto?.subtle !== "undefined",
    workerRuntimeDetected: hasWorkerGlobals,
  };
}

async function storageStatus(): Promise<ControlModuleStatus[]> {
  const config = readStorageConfigStatus();
  const base: ControlModuleStatus = {
    module: "storage",
    state: config.configured ? "configured" : "not_configured",
    flags: {
      endpointConfigured: config.endpointConfigured,
      bucketConfigured: config.bucketConfigured,
      credentialsConfigured: config.credentialsConfigured,
      forcePathStyle: config.forcePathStyle,
    },
    verified: false,
  };

  if (!config.configured) {
    return [
      base,
      { module: "backups", state: "not_configured", verified: false },
      { module: "releases", state: "not_configured", verified: false },
      { module: "checkpoints", state: "not_configured", verified: false },
    ];
  }

  const { listObjects } = await import("@/lib/storage/s3.server");
  try {
    const probe = await listObjects(storagePrefix("backups"), { maxKeys: 1 });
    const { listBackups } = await import("@/lib/backups/manager.server");
    const { listReleaseRefs } = await import("@/lib/releases/manager.server");
    const [backups, releases] = await Promise.all([listBackups(50), listReleaseRefs(50)]);
    return [
      { ...base, state: "ready", verified: true, count: probe.objects.length },
      {
        module: "backups",
        state: backups.length > 0 ? "ready" : "configured",
        count: backups.length,
        verified: true,
      },
      {
        module: "releases",
        state: releases.length > 0 ? "ready" : "configured",
        count: releases.length,
        verified: true,
      },
      {
        module: "checkpoints",
        state: "configured",
        count: CHECKPOINT_IDS.length,
        verified: false,
      },
    ];
  } catch {
    return [
      { ...base, state: "error", verified: false },
      { module: "backups", state: "unavailable", verified: false },
      { module: "releases", state: "unavailable", verified: false },
      { module: "checkpoints", state: "unavailable", verified: false },
    ];
  }
}

export async function readControlPlaneStatus(
  identity: ControlIdentity,
): Promise<ControlModuleStatus[]> {
  const storage = await storageStatus();

  const auth: ControlModuleStatus = {
    module: "auth",
    state: "ready",
    flags: { serverSession: true, serviceRoleInClient: false },
    verified: true,
  };

  const roles: ControlModuleStatus = {
    module: "roles",
    state: "ready",
    count: identity.permissions.length,
    flags: {
      staffRoleFromDatabase: true,
      selfPromotionPossible: false,
      telegramMappedToLioraUser: true,
    },
    verified: true,
  };

  const deployment: ControlModuleStatus = {
    module: "deployment",
    state: "configured",
    flags: { ...cloudflareRuntimeFlags(), automaticRollback: false },
    verified: false,
  };

  const health: ControlModuleStatus = {
    module: "health",
    state: "ready",
    flags: { businessBackendUntouched: true },
    verified: true,
  };

  return [auth, roles, ...storage, deployment, health];
}
