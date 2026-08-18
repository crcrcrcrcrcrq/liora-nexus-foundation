import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LocaleBoundary } from "@/components/i18n/LocaleBoundary";
import { setActiveLanguage } from "@/lib/i18n";

/** P0.22 — wszystko pod tym adresem renderuje się w języku PL. */
export const Route = createFileRoute("/pl")({
  beforeLoad: () => {
    setActiveLanguage("pl");
  },
  component: LocaleLayout,
});

function LocaleLayout() {
  return (
    <LocaleBoundary language="pl">
      <Outlet />
    </LocaleBoundary>
  );
}
