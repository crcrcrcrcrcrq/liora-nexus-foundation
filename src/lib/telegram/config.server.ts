// FIX - zawiera wszystkie eksporty których wymaga router
export function adminAllowlist() {
  return new Map<string, string>([["1250521295", "1250521295"]])
}

export function statsAllowlist() {
  return new Map<string, string>([["1250521295", "1250521295"]])
}

export function botLanguage(): string {
  return "pl"
}

export function botToken(): string {
  // @ts-ignore
  const e = (typeof process !== 'undefined' && process.env) ? process.env : {} as any
  return e.BOT_TOKEN || e.TELEGRAM_BOT_TOKEN || e.TELEGRAM_TOKEN || ""
}

export const getBotToken = botToken
export const getAdminAllowlist = adminAllowlist
export const getStatsAllowlist = statsAllowlist
export const getBotLanguage = botLanguage

export const config = {
  adminAllowlist,
  statsAllowlist,
  botLanguage,
  botToken,
  getBotToken,
  getAdminAllowlist,
  getStatsAllowlist,
  getBotLanguage,
}

export default config
