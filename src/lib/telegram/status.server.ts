/**
 * LIORA P0.31 — status integracji Telegrama liczony WYŁĄCZNIE po stronie serwera.
 *
 * Zwracamy fakty, nie obietnice:
 *  - `configured` — bot ma token i sekret webhooka,
 *  - `authorizationConfigured` — istnieje niepusta allowlista,
 *  - `transport` — nigdy nie raportujemy "connected"/"configured" bez realnej
 *    weryfikacji runtime. Brak zweryfikowanego połączenia = "not_verified".
 *    Nie wykonujemy sztucznych requestów do API Telegrama, żeby "zazielenić" UI.
 *
 * Do przeglądarki nie trafia żaden token, sekret ani identyfikator czatu —
 * wyłącznie flagi boolowskie i liczba wpisów allowlisty.
 */
import {
  adminAllowlist,
  botToken,
  botWebhookSecret,
  statsAllowlist,
  type TelegramBot,
} from "./config.server";
import type { TelegramIntegrationStatus } from "./model/status";

/** Nie ma mechanizmu trwałego zapisu udanego handshake'u, więc transport
 *  pozostaje "not_verified" dopóki konfiguracja nie zostanie potwierdzona
 *  realnym ruchem webhooka. Świadoma, uczciwa decyzja. */
function transportStatus(configured: boolean): TelegramIntegrationStatus["transport"] {
  return configured ? "not_verified" : "not_configured";
}

function statusFor(bot: TelegramBot): TelegramIntegrationStatus {
  const hasToken = Boolean(botToken(bot));
  const hasSecret = Boolean(botWebhookSecret(bot));
  const allowlistSize = bot === "admin" ? adminAllowlist().size : statsAllowlist().size;
  const configured = hasToken && hasSecret;

  return {
    bot,
    mode: bot === "admin" ? "operational" : "read_only",
    configured,
    tokenConfigured: hasToken,
    webhookSecretConfigured: hasSecret,
    authorizationConfigured: allowlistSize > 0,
    allowlistSize,
    transport: transportStatus(configured),
    webhookPath: bot === "admin" ? "/api/public/telegram/admin" : "/api/public/telegram/stats",
  };
}

export function readTelegramIntegrationStatus(): TelegramIntegrationStatus[] {
  return [statusFor("admin"), statusFor("stats")];
}
