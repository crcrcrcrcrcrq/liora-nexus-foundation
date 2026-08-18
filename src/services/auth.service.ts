import { supabase } from "@/integrations/liora/supabase";
import { fetchIdentity } from "@/lib/identity.functions";
import { destroySession, establishSession, currentSessionExpiry } from "@/lib/session.functions";
import { SITE } from "@/config/site";
import { translate as t } from "@/lib/i18n";
import type { ApiResult } from "@/types";
import type { AdminUser, MagicLinkSession } from "@/features/auth/model/types";
import type { IdentitySession } from "@/features/identity/model/types";

export type { AdminUser, MagicLinkSession };

/**
 * Warstwa sesji — jedyne wejście frontendu do uwierzytelniania.
 *
 * ARCHITEKTURA (P0.3.1):
 * • autorytatywnym dostawcą tożsamości jest Supabase Auth (link jednorazowy),
 * • frontend nie tworzy, nie podpisuje i nie waliduje tokenów,
 * • rolę i profil rozstrzyga serwer (`fetchIdentity`) na podstawie tokenu
 *   odczytanego z ciasteczka HttpOnly; klient nigdy nie deklaruje roli,
 * • sesją (odświeżanie, trwałość) zarządza wyłącznie serwer TanStack Start
 *   przez `@supabase/ssr`; przeglądarka nie przechowuje tokenów.
 *
 * Poprzednie kontrakty `/api/auth/*` zostały zastąpione bezpośrednią
 * integracją z Supabase Auth — patrz docs/supabase.md.
 */

/** Adres powrotny linku jednorazowego — wyłącznie z konfiguracji, bez zaszytych domen. */
function callbackUrl(): string {
  const base = SITE.baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/powrot`;
}

/** Krok 1 — wysłanie linku jednorazowego na adres e-mail. */
export async function requestMagicLink(email: string): Promise<ApiResult<{ sentTo: string }>> {
  const address = email.trim();
  if (!address) return { ok: false, error: t("forms.validation.emailInvalid") };

  const { error } = await supabase.auth.signInWithOtp({
    email: address,
    options: { emailRedirectTo: callbackUrl() },
  });

  // Komunikat nie ujawnia, czy adres istnieje, ani szczegółów technicznych.
  if (error) return { ok: false, error: t("auth.magicLink.errors.sendFailed") };
  return { ok: true, data: { sentTo: address } };
}

/**
 * Krok 2 — wymiana klucza powrotu z adresu URL na sesję.
 * Token zużywa Supabase Auth; wynikiem jest realna sesja użytkownika.
 */
export async function verifyMagicLink(token: string): Promise<ApiResult<IdentitySession>> {
  try {
    await establishSession({ data: { token } });
  } catch {
    return { ok: false, error: t("auth.magicLink.errors.verifyFailed") };
  }
  return getCurrentSession();
}

/** Aktualna sesja rozstrzygnięta przez serwer na podstawie ciasteczka HttpOnly. */
export async function getCurrentSession(): Promise<ApiResult<IdentitySession>> {
  try {
    const expiry = await currentSessionExpiry();
    if (!expiry) return { ok: false, error: t("auth.magicLink.errors.verifyFailed") };
    const user = await fetchIdentity();
    return {
      ok: true,
      data: {
        // Bez surowego tokenu — nosicielem sesji jest ciasteczko HttpOnly.
        expiresAt: expiry.expiresAt,
        user,
      },
    };
  } catch {
    return { ok: false, error: t("auth.magicLink.errors.verifyFailed") };
  }
}

/** Zakończenie sesji — serwer unieważnia sesję i czyści ciasteczka. */
export async function signOut(): Promise<ApiResult<{ ok: true }>> {
  try {
    await destroySession();
  } catch {
    return { ok: false, error: t("errors.api.requestFailed") };
  }
  // Zgodnie z P0.3: SDK w przeglądarce nie posiada trwałej sesji, ale
  // czyścimy jego stan ulotny, aby żaden fragment UI go nie zobaczył.
  await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
  return { ok: true, data: { ok: true } };
}
