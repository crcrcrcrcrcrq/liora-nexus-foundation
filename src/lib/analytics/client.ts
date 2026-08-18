/**
 * LIORA P0.31 — klient analityki (wyłącznie przeglądarka).
 *
 * Zasady prywatności (twarde, egzekwowane w tym pliku):
 *  - identyfikator odwiedzającego jest losowy (crypto), pseudonimowy i rotowany
 *    co 30 dni; nie pochodzi z e-maila, telefonu, `user_id` ani z adresu IP,
 *  - nie stosujemy fingerprintingu (żadnego canvas/fonts/UA hashowania),
 *  - do serwera trafiają wyłącznie: typ zdarzenia, ścieżka, język, pseudonim,
 *    typ odwiedzającego, typ urządzenia, host referrera i metadane z allowlisty,
 *  - kraj/region/miasto dolicza serwer z nagłówków runtime'u — klient ich nie zna,
 *  - każdy błąd jest połykany: analityka nigdy nie może zepsuć strony.
 */
import { trackAnalyticsEvent } from "@/lib/analytics.functions";
import type { AnalyticsEventType, DeviceType, VisitorType } from "./model/events";

const VISITOR_KEY = "liora.analytics.visitor";
const SESSION_FLAG = "liora.analytics.session";
/** Rotacja pseudonimu — po tym czasie odwiedzający dostaje nowy, losowy klucz. */
const ROTATION_MS = 30 * 24 * 60 * 60 * 1000;

/** Metadane akceptowane przez UI; mapowane na allowlistę schematu serwera. */
export interface TrackMetadata {
  /** Miejsce w interfejsie, np. "home_hero". */
  surface?: string;
  /** Wariant zdarzenia, np. nazwa CTA. */
  variant?: string;
  /** Identyfikator rozkładu Tarota (bez kart i bez pytań użytkownika). */
  spread?: string;
  /** Slug usługi (dane katalogowe, nie osobowe). */
  service?: string;
}

const isBrowser = (): boolean => typeof window !== "undefined";

function randomId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID().replace(/-/g, "");
    }
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
  }
}

interface VisitorKey {
  id: string;
  visitorType: VisitorType;
}

/** Pseudonim z rotacją. Brak dostępu do storage = pseudonim tylko na tę kartę. */
function readVisitorKey(): VisitorKey {
  const fresh = (): VisitorKey => ({ id: randomId(), visitorType: "new" });
  try {
    const raw = window.localStorage.getItem(VISITOR_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { id?: unknown; issued?: unknown };
      const id = typeof parsed.id === "string" ? parsed.id : "";
      const issued = typeof parsed.issued === "number" ? parsed.issued : 0;
      if (id.length >= 8 && Date.now() - issued < ROTATION_MS) {
        return { id, visitorType: "returning" };
      }
    }
    const next = fresh();
    window.localStorage.setItem(VISITOR_KEY, JSON.stringify({ id: next.id, issued: Date.now() }));
    return next;
  } catch {
    return fresh();
  }
}

/** Typ urządzenia z szerokości viewportu — bez UA parsingu, bez fingerprintu. */
function deviceType(): DeviceType {
  try {
    const width = window.innerWidth;
    if (width < 640) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  } catch {
    return "unknown";
  }
}

/** Wyłącznie host referrera; pełny URL mógłby nieść dane z query stringa. */
function referrerHost(): string | undefined {
  try {
    if (!document.referrer) return undefined;
    return new URL(document.referrer).hostname.slice(0, 128) || undefined;
  } catch {
    return undefined;
  }
}

function safeMetadata(metadata?: TrackMetadata): Record<string, string> {
  const out: Record<string, string> = {};
  if (!metadata) return out;
  for (const key of ["surface", "variant", "spread", "service"] as const) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) out[key] = value.trim().slice(0, 48);
  }
  return out;
}

/** Wysyłka poza ścieżką renderowania — nigdy nie blokuje interakcji. */
function defer(run: () => void): void {
  const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => number })
    .requestIdleCallback;
  if (typeof idle === "function") idle(run);
  else window.setTimeout(run, 0);
}

/**
 * Jedyny punkt wysyłki zdarzeń z przeglądarki. Fire-and-forget, bez wyjątków.
 */
export function trackEvent(
  type: AnalyticsEventType,
  options: { path?: string; locale?: "pl" | "en"; metadata?: TrackMetadata } = {},
): void {
  if (!isBrowser()) return;
  try {
    const visitor = readVisitorKey();
    const payload = {
      type,
      path: (options.path ?? window.location.pathname).split("?")[0] ?? "/",
      locale: options.locale ?? "pl",
      anonymousSessionId: visitor.id,
      visitorType: visitor.visitorType,
      deviceType: deviceType(),
      ...(referrerHost() ? { referrerHost: referrerHost() } : {}),
      metadata: safeMetadata(options.metadata),
    };
    defer(() => {
      try {
        void Promise.resolve(trackAnalyticsEvent({ data: payload })).catch(() => undefined);
      } catch {
        /* analityka jest obserwatorem — awaria nie dotyka użytkownika */
      }
    });
  } catch {
    /* jw. */
  }
}

/**
 * Start sesji przeglądania. Emituje `session_start` (nowy pseudonim) albo
 * `session_return` (pseudonim sprzed rotacji) dokładnie raz na kartę.
 */
export function trackSessionOnce(options: { path: string; locale: "pl" | "en" }): void {
  if (!isBrowser()) return;
  try {
    if (window.sessionStorage.getItem(SESSION_FLAG)) return;
    window.sessionStorage.setItem(SESSION_FLAG, "1");
  } catch {
    /* brak sessionStorage — zdarzenie poleci raz na załadowanie dokumentu */
  }
  const visitor = readVisitorKey();
  trackEvent(visitor.visitorType === "returning" ? "session_return" : "session_start", options);
}
