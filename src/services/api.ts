import type { ApiResult } from "@/types";
import { translate as t } from "@/lib/i18n";

/**
 * Warstwa komunikacji z backendem.
 *
 * WAŻNE: frontend nie zawiera żadnych sekretów. Powiadomienia Telegram,
 * podpisywanie JWT oraz szyfrowanie realizuje backend pod adresem
 * VITE_API_BASE_URL. Tutaj wysyłamy wyłącznie dane wprowadzone przez
 * użytkownika i odbieramy odpowiedź.
 */
const BASE_URL = (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ?? "/api";

/** Limit czasu pojedynczego żądania — chroni interfejs przed wiecznym spinnerem. */
const TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * BEZPIECZEŃSTWO SESJI (przygotowanie pod backend):
 *
 * Frontend nie przechowuje ani nie odczytuje żadnego tokenu dostępu.
 * Sesja jest przenoszona wyłącznie przez ciasteczko `HttpOnly; Secure;
 * SameSite=Lax` ustawiane przez backend po weryfikacji linku jednorazowego,
 * dlatego każde żądanie wysyłamy z `credentials: "include"`.
 *
 * Zakaz architektoniczny: nigdy nie zapisujemy tokenów w localStorage /
 * sessionStorage ani nie budujemy nagłówka `Authorization` po stronie klienta.
 */
async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), TIMEOUT_MS) : null;

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      ...(controller ? { signal: controller.signal } : {}),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });

    const text = await response.text();
    const payload = text ? (JSON.parse(text) as unknown) : null;

    if (!response.ok) {
      const message =
        payload && typeof payload === "object" && "error" in payload
          ? String((payload as { error: unknown }).error)
          : t("errors.api.requestFailed");
      return { ok: false, error: message };
    }

    return { ok: true, data: payload as T };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return {
        ok: false,
        error: t("errors.api.timeout"),
      };
    }
    return {
      ok: false,
      error:
        error instanceof Error ? t("errors.api.offline") : t("errors.api.connectionInterrupted"),
    };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export const API_ROUTES = {
  contact: "/contact",
  booking: "/bookings",
  bookingAvailability: "/bookings/availability",
  newsletter: "/newsletter",
  newsletterUnsubscribe: "/newsletter/unsubscribe",
  telegramNotify: "/telegram/notify",
  telegramStatus: "/telegram/status",
  tarotInterpretation: "/tarot/interpretation",
  astrologyChart: "/astrology/chart",
  magicLinkRequest: "/auth/magic-link",
  magicLinkVerify: "/auth/magic-link/verify",
  session: "/auth/session",
  signOut: "/auth/sign-out",
  cmsBlocks: "/cms/blocks",
  cmsPosts: "/cms/posts",
  adminStats: "/admin/stats",
} as const;

export interface SubmissionAck {
  id: string;
  receivedAt: string;
}
