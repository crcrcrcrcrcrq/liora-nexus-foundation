export type TelegramBot = any;

function readEnv(name: string): string {
  try {
    const g = globalThis as any;
    if (g?.[name]) return String(g[name]);
    if (g?.env?.[name]) return String(g.env[name]);
    if (g?.process?.env?.[name]) return String(g.process.env[name]);
  } catch {}
  try {
    // @ts-ignore
    if (typeof process!== 'undefined' && process.env?.[name]) return String(process.env[name]);
  } catch {}
  return "";
}

function makeGetter(...names: string[]) {
  const getVal = () => {
    for (const n of names) {
      const v = readEnv(n);
      if (v) return v;
    }
    return "";
  };
  const fn = (_bot?: any) => getVal();
  return new Proxy(fn, {
    apply() { return getVal(); },
    get(_t, prop) {
      if (prop === Symbol.toPrimitive) return () => getVal();
      if (prop === 'toString' || prop === 'valueOf') return () => getVal();
      const v = getVal();
      // @ts-ignore
      if (typeof v === 'string' && prop in v) return (v as any)[prop];
      // @ts-ignore
      return (fn as any)[prop];
    }
  }) as any;
}

function makeAllowlist(...envNames: string[]): Map<string, string> {
  const raw = envNames.map(readEnv).find(Boolean) || "";
  const map = new Map<string, string>();
  if (!raw) return map;
  raw.split(",").forEach(entry => {
    const e = entry.trim();
    if (!e) return;
    if (e.includes(":")) {
      const [tgId, userId] = e.split(":").map(s => s.trim());
      if (tgId) map.set(tgId, userId || tgId);
    } else {
      map.set(e, e);
    }
  });
  return map;
}

// GŁÓWNE - te co już masz
export const botToken = makeGetter("BOT_TOKEN", "TELEGRAM_BOT_TOKEN", "TELEGRAM_TOKEN");
export const botWebhookSecret = makeGetter("TELEGRAM_BOT_WEBHOOK_SECRET", "BOT_WEBHOOK_SECRET", "TELEGRAM_WEBHOOK_SECRET", "WEBHOOK_SECRET");
export const botLanguage = makeGetter("BOT_LANGUAGE", "TELEGRAM_BOT_LANGUAGE", "LANGUAGE");

export function adminAllowlist(): Map<string, string> {
  return makeAllowlist("TELEGRAM_ADMIN_ID", "ADMIN_ALLOWLIST", "ADMIN_IDS");
}

export function statsAllowlist(): Map<string, string> {
  return makeAllowlist("TELEGRAM_STATS_ID", "STATS_ALLOWLIST", "ADMIN_ALLOWLIST", "TELEGRAM_ADMIN_ID");
}

// aliasy żeby nic więcej nie krzyczało MISSING_EXPORT
export const adminIds = adminAllowlist;
export const statsIds = statsAllowlist;
