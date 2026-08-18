/**
 * LIORA — weryfikacja `initData` z Telegram Mini App (server-only).
 *
 * Zgodnie ze specyfikacją Telegrama:
 *   secret_key = HMAC_SHA256(key="WebAppData", data=<bot_token>)
 *   hash       = HMAC_SHA256(key=secret_key, data=<data_check_string>)
 * gdzie `data_check_string` to pary `klucz=wartość` (bez `hash`), posortowane
 * alfabetycznie i połączone znakiem `\n`.
 *
 * Implementacja używa Web Crypto (`crypto.subtle`) — działa na Cloudflare
 * Workers, gdzie moduły natywne Node są niedostępne.
 *
 * ZASADA: `initData` samo w sobie NIE nadaje uprawnień. Dowodzi wyłącznie, że
 * dane pochodzą od Telegrama i nie zostały zmienione. Rolę administratora
 * rozstrzyga baza (`user_roles`) — patrz `admin.server.ts`.
 */

/** Maksymalny wiek `initData`. Starsze dane odrzucamy (ochrona przed replay). */
const MAX_AGE_SECONDS = 24 * 60 * 60;

export interface TmaUser {
  telegramId: string;
  username?: string;
}

async function hmac(key: ArrayBuffer | Uint8Array, message: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message));
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Porównanie o stałym czasie — nie zdradza, ile znaków podpisu się zgadza. */
function safeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Zwraca użytkownika Telegrama, jeśli podpis i świeżość są poprawne.
 * `null` w każdym innym przypadku — brak wyjątków ujawniających szczegóły.
 */
export async function verifyInitData(
  initData: string,
  botToken: string,
  now: Date = new Date(),
): Promise<TmaUser | null> {
  if (!initData || !botToken) return null;

  const params = new URLSearchParams(initData);
  const providedHash = params.get("hash");
  if (!providedHash) return null;

  params.delete("hash");
  const dataCheckString = [...params.entries()]
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join("\n");

  const secretKey = await hmac(new TextEncoder().encode("WebAppData"), botToken);
  const expected = toHex(await hmac(secretKey, dataCheckString));
  if (!safeEqual(expected, providedHash.toLowerCase())) return null;

  // Świeżość: chroni przed odtworzeniem przechwyconego, poprawnie podpisanego
  // `initData` po dowolnie długim czasie.
  const authDate = Number(params.get("auth_date"));
  if (!Number.isFinite(authDate)) return null;
  const ageSeconds = Math.floor(now.getTime() / 1000) - authDate;
  if (ageSeconds < 0 || ageSeconds > MAX_AGE_SECONDS) return null;

  try {
    const user = JSON.parse(params.get("user") ?? "null") as {
      id?: number;
      username?: string;
    } | null;
    if (!user?.id) return null;
    return {
      telegramId: String(user.id),
      ...(user.username ? { username: user.username } : {}),
    };
  } catch {
    return null;
  }
}
