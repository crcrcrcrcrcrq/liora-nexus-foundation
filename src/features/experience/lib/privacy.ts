import type { Role } from "@/features/identity/model/types";
import type { Presence } from "../model/types";

/**
 * Warstwa prywatności Experience Center.
 *
 * ARCHITEKTURA (przygotowanie pod szyfrowanie):
 * 1. Dane wrażliwe (imię, e-mail, notatki) są w docelowym backendzie trzymane
 *    w kolumnach szyfrowanych po stronie serwera (envelope encryption: klucz
 *    danych per rekord, klucz główny w KMS). Frontend nigdy nie widzi
 *    szyfrogramu ani klucza.
 * 2. Odszyfrowanie zachodzi wyłącznie w handlerze serwerowym, po sprawdzeniu
 *    roli. Moderator nie ma ścieżki, którą mógłby zażądać odszyfrowania —
 *    zapytanie po prostu nie zwraca tych kolumn.
 * 3. Maskowanie poniżej jest DRUGĄ linią obrony. Pierwszą jest brak danych
 *    w odpowiedzi API. Jeśli backend kiedykolwiek prześle za dużo, warstwa
 *    prezentacji i tak tego nie pokaże.
 * 4. Klucz osoby w logach i powiadomieniach to zawsze LioraId — nigdy e-mail.
 */

/** Role uprawnione do oglądania danych osobowych w pełnej postaci. */
const FULL_VIEW_ROLES: readonly Role[] = ["admin"];

export function canSeePersonalData(role: Role): boolean {
  return FULL_VIEW_ROLES.includes(role);
}

/** Redukcja obiektu obecności do zakresu widocznego dla danej roli. */
export function redactPresence(presence: Presence, role: Role): Presence {
  if (canSeePersonalData(role)) return presence;
  const { givenName: _name, email: _email, ...safe } = presence;
  return safe;
}

export function redactPresences(list: readonly Presence[], role: Role): Presence[] {
  return list.map((presence) => redactPresence(presence, role));
}

/** Ostatnia zapora: e-mail nigdy nie wychodzi w całości poza rolę admina. */
export function maskEmail(email: string): string {
  const [local = "", domain] = email.split("@");
  if (!domain || !local) return "•••";
  const head = local.slice(0, 1);
  return `${head}${"•".repeat(Math.max(local.length - 1, 2))}@${domain}`;
}
