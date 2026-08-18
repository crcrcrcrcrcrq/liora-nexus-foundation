import { useCallback, useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { DEFAULT_LANGUAGE, type Language } from "@/config/i18n";
import { readLocaleFromPathname } from "@/config/routes";
import { trackEvent, trackSessionOnce, type TrackMetadata } from "@/lib/analytics/client";
import type { AnalyticsEventType } from "@/lib/analytics/model/events";

/**
 * LIORA P0.31 — dostęp do analityki z warstwy UI.
 *
 * Język bierzemy z ADRESU (P0.22 — URL jest jedynym źródłem prawdy); nie
 * czytamy localStorage. Panel administracyjny nie jest instrumentowany.
 */
function isPublicPath(pathname: string): boolean {
  return !pathname.startsWith("/admin");
}

function localeOf(pathname: string): Language {
  return readLocaleFromPathname(pathname) ?? DEFAULT_LANGUAGE;
}

export function useAnalytics(): {
  track: (type: AnalyticsEventType, metadata?: TrackMetadata) => void;
} {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const track = useCallback(
    (type: AnalyticsEventType, metadata?: TrackMetadata) => {
      if (!isPublicPath(pathname)) return;
      trackEvent(type, {
        path: pathname,
        locale: localeOf(pathname),
        ...(metadata ? { metadata } : {}),
      });
    },
    [pathname],
  );

  return { track };
}

/** Jednorazowe zdarzenie po zamontowaniu widoku (np. `privacy_policy_view`). */
export function useTrackOnce(type: AnalyticsEventType, metadata?: TrackMetadata): void {
  const { track } = useAnalytics();
  const sent = useRef(false);
  const meta = useRef(metadata);
  meta.current = metadata;

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    track(type, meta.current);
  }, [track, type]);
}

/**
 * Instrumentacja odsłon dla całej strony publicznej. Montowana raz, w roocie.
 * Wysyłka jest odroczona (idle callback), więc nie blokuje pierwszego renderu.
 */
export function usePageViewTracking(): void {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!isPublicPath(pathname)) return;
    if (lastPath.current === pathname) return;
    const previous = lastPath.current;
    lastPath.current = pathname;

    const locale = localeOf(pathname);
    if (previous === null) trackSessionOnce({ path: pathname, locale });
    trackEvent("page_view", { path: pathname, locale });
  }, [pathname]);
}
