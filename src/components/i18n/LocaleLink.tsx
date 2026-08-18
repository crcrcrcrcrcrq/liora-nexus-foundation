/**
 * LIORA P0.22 — link świadomy języka.
 *
 * Komponenty nadal podają ścieżkę kanoniczną (PL, np. `/uslugi`), a ten
 * komponent zamienia ją na adres w aktywnym języku (`/pl/uslugi`,
 * `/en/services`). Dzięki temu żaden link publiczny nie prowadzi już do
 * adresu bez prefiksu językowego.
 */
import { Link as RouterLink, type LinkComponentProps } from "@tanstack/react-router";
import { useLanguage } from "@/hooks/useLanguage";
import { localizePath } from "@/lib/i18n";

type LocaleLinkProps = Omit<LinkComponentProps<"a">, "to" | "params"> & {
  to: string;
  /** Wartości segmentów `$param` ścieżki kanonicznej. */
  params?: Record<string, string>;
};

/** Podstawia `$slug` → `slug` przed przetłumaczeniem adresu. */
function fillParams(path: string, params?: Record<string, string>): string {
  if (!params) return path;
  let filled = path;
  for (const [key, value] of Object.entries(params)) {
    filled = filled.replace(`$${key}`, value);
  }
  return filled;
}

export function Link({ to, params, ...props }: LocaleLinkProps) {
  const { language } = useLanguage();
  const canonical = fillParams(to, params);
  const href = canonical.startsWith("/admin") ? canonical : localizePath(canonical, language);
  return <RouterLink {...(props as LinkComponentProps<"a">)} to={href as never} />;
}
