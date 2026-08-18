export function adminAllowlist(){return new Map([["1250521295","1250521295"]])}
export function statsAllowlist(){return new Map([["1250521295","1250521295"]])}
export function botLanguage(){return "pl"}
export function botToken(){// @ts-ignore
const e=(typeof process!=="undefined"&&(process as any).env)?(process as any).env:{} as any
return e.BOT_TOKEN||e.TELEGRAM_BOT_TOKEN||e.TELEGRAM_TOKEN||""}
export function botWebhookSecret(){// @ts-ignore
const e=(typeof process!=="undefined"&&(process as any).env)?(process as any).env:{} as any
return e.TELEGRAM_BOT_WEBHOOK_SECRET||e.BOT_WEBHOOK_SECRET||""}
export const getBotToken=botToken
export const getAdminAllowlist=adminAllowlist
export const getStatsAllowlist=statsAllowlist
export const getBotLanguage=botLanguage
export const getBotWebhookSecret=botWebhookSecret
export const getWebhookSecret=botWebhookSecret
export const config={adminAllowlist,statsAllowlist,botLanguage,botToken,botWebhookSecret,getBotToken,getAdminAllowlist,getStatsAllowlist,getBotLanguage,getBotWebhookSecret,getWebhookSecret}
export default config
