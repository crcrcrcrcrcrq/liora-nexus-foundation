/**
 * LIORA P0.34 — kontrakt statusu operacyjnego modułów Admina (client-safe).
 *
 * Wyłącznie flagi, liczby i identyfikatory modułów. Nigdy sekrety, tokeny,
 * adresy e-mail ani dane klientów.
 */

/**
 * - `ready`          — moduł działa i ma dane (odczyt serwerowy się powiódł),
 * - `configured`     — moduł skonfigurowany, ale bez danych / bez weryfikacji dostawy,
 * - `not_configured` — brak wymaganej konfiguracji serwerowej,
 * - `unavailable`    — brak uprawnień lub źródło danych nieosiągalne,
 * - `error`          — odczyt zakończył się błędem.
 */
export type OperationsState = "ready" | "configured" | "not_configured" | "unavailable" | "error";

export type OperationsModuleKey =
  | "bookings"
  | "services"
  | "schedule"
  | "blog"
  | "content"
  | "theme"
  | "email"
  | "telegramAdmin"
  | "telegramStats";

export interface OperationsModuleStatus {
  key: OperationsModuleKey;
  state: OperationsState;
  /** Liczba rekordów, jeżeli moduł jest oparty na tabeli. Nigdy dane osobowe. */
  count?: number;
  /**
   * Dodatkowe flagi bez wartości sekretów, np. `senderConfigured`.
   * Wyłącznie boolowskie — UI tłumaczy je na tekst.
   */
  flags?: Record<string, boolean>;
  /** `true`, gdy realny transport nie został potwierdzony ruchem produkcyjnym. */
  transportVerified: boolean;
}
