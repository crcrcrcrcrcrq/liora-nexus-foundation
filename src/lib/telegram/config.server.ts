export type TelegramBot = any;

function readEnv(name: string): string {
  try {
    const g = globalThis as any;
    if (g?.[name]) return String(g[name]);
    if (g?.env?.[name]) return String(g.env[name]);
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

function makeMap(...envNames: string[]): Map<string, string> {
  const raw = envNames.map(readEnv).find(Boolean) || "";
  const map = new Map<string, string>();
  if (!raw) return map;
  raw.split(",").forEach(e => {
    const s = e.trim(); if (!s) return;
    if (s.includes(":")) { const [a,b]=s.split(":").map(x=>x.trim()); if(a) map.set(a,b||a); }
    else map.set(s,s);
  });
  return map;
}

export const botToken = makeGetter("BOT_TOKEN","TELEGRAM_BOT_TOKEN","TELEGRAM_TOKEN");
export const botWebhookSecret = makeGetter("TELEGRAM_BOT_WEBHOOK_SECRET","BOT_WEBHOOK_SECRET","TELEGRAM_WEBHOOK_SECRET","WEBHOOK_SECRET");
export const botLanguage = makeGetter("BOT_LANGUAGE","TELEGRAM_BOT_LANGUAGE","LANGUAGE");

export function adminAllowlist(): Map<string, string> {
  return makeMap("TELEGRAM_ADMIN_ID","ADMIN_ALLOWLIST","ADMIN_IDS");
}
export function statsAllowlist(): Map<string, string> {
  return makeMap("TELEGRAM_STATS_ID","STATS_ALLOWLIST","ADMIN_ALLOWLIST","TELEGRAM_ADMIN_ID");
}
export const adminIds = adminAllowlist;
export const statsIds = statsAllowlist;
