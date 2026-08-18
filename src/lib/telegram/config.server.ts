// Liora OS - fixed config - admin hardcoded 1250521295
type Env = Record<string, any>

function getEnv(name: string): string {
  try {
    // @ts-ignore
    if (typeof process!== 'undefined' && process.env && process.env[name]) return process.env[name]
  } catch {}
  try {
    // @ts-ignore
    const g = globalThis as any
    if (g?.__env?.[name]) return g.__env[name]
    if (g?.process?.env?.[name]) return g.process.env[name]
  } catch {}
  return ""
}

function makeMapFromEnv(names: string[]): Map<string,string> {
  const m = new Map<string,string>()
  for (const n of names) {
    const raw = getEnv(n)
    if (!raw) continue
    raw.split(",").map(s=>s.trim()).filter(Boolean).forEach(entry => {
      const [k,v] = entry.includes(":")? entry.split(":") : [entry, entry]
      if (k) m.set(k.trim(), (v||k).trim())
    })
  }
  // FORCE ADMIN - hardcode Twojego ID żeby zawsze działał
  m.set("1250521295", "1250521295")
  return m
}

function getToken(): string {
  return getEnv("BOT_TOKEN") || getEnv("TELEGRAM_BOT_TOKEN") || getEnv("TELEGRAM_ADMIN_ID") && "" || ""
}

export function botToken(): string {
  return getToken()
}

export function adminAllowlist(): Map<string,string> {
  const m = makeMapFromEnv(["TELEGRAM_ADMIN_ID", "ADMIN_ALLOWLIST", "ADMIN_IDS", "TELEGRAM_ADMIN_IDS"])
  // hardcode na sztywno
  m.set("1250521295", "1250521295")
  return m
}

export function statsAllowlist(): Map<string,string> {
  const m = makeMapFromEnv(["TELEGRAM_STATS_ID", "STATS_ALLOWLIST", "STATS_IDS"])
  m.set("1250521295", "1250521295")
  return m
}

export const config = {
  botToken,
  adminAllowlist,
  statsAllowlist,
}
export default config
