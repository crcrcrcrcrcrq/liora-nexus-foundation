/**
 * Model domenowy modułu Identity & Access.
 *
 * Role i uprawnienia opisujemy deklaratywnie, żeby kolejne wersje platformy
 * (1.1, 2.0) mogły dodawać nowe zakresy dostępu bez przebudowy widoków.
 */

export type Role = "guest" | "client" | "moderator" | "admin";

export type Permission =
  /* Kronika Duszy — przestrzeń klienta. */
  | "chronicle:read"
  | "chronicle:write"
  /* Obsługa zgłoszeń i treści. */
  | "requests:read"
  | "requests:manage"
  | "content:publish"
  | "blog:manage"
  /* Experience Center — opieka nad historiami ludzi. */
  | "experience:read"
  | "consultations:manage"
  | "activity:read"
  /** Widok obecności bez danych osobowych (moderator). */
  | "clients:read:masked"
  /* Obszar wyłącznie administracyjny. */
  | "clients:read:full"
  | "roles:manage"
  | "security:manage"
  | "integrations:manage"
  | "settings:manage"
  | "stats:read";

export interface IdentityUser {
  id: string;
  email: string;
  role: Role;
  displayName?: string;
  createdAt?: string;
}

/**
 * Sesja rozstrzygnięta przez serwer po weryfikacji linku powrotnego.
 *
 * P0.3.1-R1: model NIE przenosi surowego tokenu dostępu ani odświeżania.
 * Nosicielem sesji jest wyłącznie ciasteczko HttpOnly zarządzane przez serwer
 * (`@supabase/ssr`); przeglądarka nigdy nie posiada tokenu.
 */
export interface IdentitySession {
  expiresAt: string;
  user: IdentityUser;
}

export type IdentityStatus = "loading" | "guest" | "authenticated";
