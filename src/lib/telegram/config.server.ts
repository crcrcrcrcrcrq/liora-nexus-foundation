export function adminAllowlist() {
  return new Map([["1250521295", "1250521295"]])
}
export function statsAllowlist() {
  return new Map([["1250521295", "1250521295"]])
}
export function botToken() {
  // @ts-ignore
  const env = typeof process !== 'undefined' ? process.env : {} as any
  return env.BOT_TOKEN || env.TELEGRAM_BOT_TOKEN || env.TELEGRAM_BOT_WEBHOOK_SECRET || ""
}
export const getBotToken = botToken
export const config = { adminAllowlist, statsAllowlist, botToken, getBotToken }
export default config
