import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LocaleBoundary } from "@/components/i18n/LocaleBoundary";
import { setActiveLanguage } from "@/lib/i18n";

/** P0.22 — wszystko pod tym adresem renderuje się w języku EN. */
export const Route = createFileRoute("/en")({
  beforeLoad: () => {
    setActiveLanguage("en");
  },
  component: LocaleLayout,
});

function LocaleLayout() {
  return (
    <LocaleBoundary language="en">
      <Outlet />
    </LocaleBoundary>
  );
}
