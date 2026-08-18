/**
 * LIORA P0.31 — kontrakt statusu integracji Telegrama (client-safe).
 *
 * Zawiera wyłącznie flagi i liczby. Nigdy tokeny, sekrety ani chat ID.
 */
export type TelegramTransportStatus = "configured" | "not_configured" | "not_verified";

export interface TelegramIntegrationStatus {
  bot: "admin" | "stats";
  /** "operational" = dozwolone mutacje; "read_only" = wyłącznie agregaty. */
  mode: "operational" | "read_only";
  configured: boolean;
  tokenConfigured: boolean;
  webhookSecretConfigured: boolean;
  authorizationConfigured: boolean;
  /** Liczba wpisów allowlisty — bez samych identyfikatorów. */
  allowlistSize: number;
  transport: TelegramTransportStatus;
  webhookPath: string;
}
