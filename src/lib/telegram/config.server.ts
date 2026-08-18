import { get } from "some-env-lib-or-process-env";

function getEnv(name: string): string {
  // @ts-ignore
  return (typeof process!== 'undefined'? process.env?.[name] : undefined) || (globalThis as any).__env?.[name] || "";
}

function createGetter(envName: string, fallbackEnv?: string) {
  const fn = (bot?: any) => getEnv(envName) || (fallbackEnv? getEnv(fallbackEnv) : "") || "";
  // @ts-ignore sprawia że działa jako string i jako funkcja
  const proxy = new Proxy(fn, {
    apply(_t, _this, args) { return fn(args[0]); },
    get(_t, prop) {
      if (prop === 'toString' || prop === Symbol.toPrimitive || prop === 'valueOf') {
        return () => fn();
      }
      // @ts-ignore
      return (fn as any)[prop];
    }
  });
  return proxy as any;
}

export const botToken = createGetter("BOT_TOKEN", "TELEGRAM_BOT_TOKEN");
export const botWebhookSecret = createGetter("TELEGRAM_BOT_WEBHOOK_SECRET", "BOT_WEBHOOK_SECRET");

export function adminAllowlist() {
  const raw = getEnv("TELEGRAM_ADMIN_ID") || getEnv("ADMIN_ALLOWLIST") || "";
  const map = new Map<string, string>();
  if (!raw) return map;
  // format: "12345:userId" lub samo "12345"
  raw.split(",").forEach(entry => {
    const [tgId, userId] = entry.split(":").map(s => s.trim());
    if (tgId) map.set(tgId, userId || tgId);
  });
  return map;
}

export type TelegramBot = any;
