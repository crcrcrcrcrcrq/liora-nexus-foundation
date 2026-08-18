import { useEffect, useState } from "react";
import { Link } from "@/components/i18n/LocaleLink";
import { Menu, X } from "lucide-react";
import { MAIN_NAV } from "@/constants/navigation";
import { useLanguage } from "@/hooks/useLanguage";
import { useAnalytics } from "@/hooks/useAnalytics";
import { SITE } from "@/config/site";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChronicleLink } from "@/features/identity/components/ChronicleLink";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

/** Sekcje landing page powiązane z pozycjami menu (scroll-spy na stronie głównej). */
const SECTION_FOR_NAV: Record<string, string> = {
  "/tarot": "tarot",
  "/uslugi": "uslugi",
  "/biblioteka": "biblioteka",
};

export function Header() {
  const { t } = useLanguage();
  const { track } = useAnalytics();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const ids = Object.values(SECTION_FOR_NAV);
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,backdrop-filter,border-color,box-shadow] duration-700 ease-[var(--ease-luxe)]",
        scrolled
          ? "border-border bg-[color-mix(in_oklab,var(--surface)_70%,transparent)] shadow-[0_18px_50px_-32px_oklch(0_0_0/90%)] backdrop-blur-2xl backdrop-saturate-150"
          : "border-transparent bg-[color-mix(in_oklab,var(--surface)_20%,transparent)] backdrop-blur-md",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 transition-[height] duration-700 ease-[var(--ease-luxe)] sm:px-8 lg:px-10",
          scrolled ? "h-16 lg:h-20" : "h-20 lg:h-28",
        )}
      >
        <Link
          to="/"
          className="group flex min-w-0 flex-col rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          aria-label={t("layout.header.homeAriaLabel", { name: SITE.name })}
        >
          <span className="font-display text-xl tracking-[var(--tracking-luxe)] text-gold-gradient">
            {SITE.name}
          </span>
          <span className="eyebrow mt-1 text-foreground/50">{t("layout.header.tagline")}</span>
        </Link>

        <nav
          className="hidden min-w-0 items-center gap-5 lg:flex xl:gap-7 2xl:gap-9"
          aria-label={t("layout.header.mainNavAriaLabel")}
        >
          {MAIN_NAV.map((item) => {
            const isActiveSection =
              SECTION_FOR_NAV[item.to] !== undefined && SECTION_FOR_NAV[item.to] === activeSection;
            return (
              <Link
                key={item.to}
                to={item.to}
                {...(isActiveSection ? { "aria-current": "true" as const } : {})}
                className={cn(
                  "relative whitespace-nowrap rounded-sm py-1 text-[0.7rem] uppercase tracking-[var(--tracking-luxe)] outline-none transition-colors duration-500 ease-[var(--ease-luxe)] hover:text-gold focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background",
                  "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-gold/70 after:transition-transform after:duration-500 after:ease-[var(--ease-luxe)] hover:after:scale-x-100",
                  isActiveSection ? "text-gold after:scale-x-100" : "text-foreground/70",
                )}
                activeProps={{ className: "text-gold", "aria-current": "page" }}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <ChronicleLink className="hidden whitespace-nowrap 2xl:inline-flex" />
          <Button asChild variant="outline" size="sm" className="hidden min-h-11 sm:inline-flex">
            <Link
              to="/rezerwacja"
              onClick={() => track("cta_click", { variant: "booking", surface: "header" })}
            >
              {t("layout.header.bookButton")}
            </Link>
          </Button>
          {/* LANGUAGE_SWITCHER_SLOT */}
          <LanguageSwitcher className="hidden 2xl:flex" />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="-mr-2 inline-flex size-11 items-center justify-center rounded-sm text-gold outline-none transition-colors duration-500 ease-[var(--ease-luxe)] hover:bg-accent/50 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:hidden"
            aria-label={open ? t("layout.header.closeMenu") : t("layout.header.openMenu")}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          // P0.33 — panel jest niemal nieprzezroczysty: treść strony nie może
          // prześwitywać przez menu i psuć czytelności pozycji nawigacji.
          "border-t border-border bg-[color-mix(in_oklab,var(--surface)_96%,transparent)] backdrop-blur-2xl transition-all duration-500 ease-[var(--ease-luxe)] lg:hidden",
          // Menu nigdy nie ucina treści — przy niskim ekranie przewija się samo.
          open
            ? "max-h-[calc(100dvh-4rem)] overflow-y-auto shadow-[0_40px_80px_-40px_oklch(0_0_0/85%)]"
            : "max-h-0 overflow-hidden border-transparent",
        )}
        // Zwinięte menu jest w pełni wyłączone z nawigacji klawiaturą i czytników.
        inert={!open}
      >
        <nav
          className="flex flex-col gap-1 px-6 pb-10 pt-6 sm:px-8"
          aria-label={t("layout.header.mobileNavAriaLabel")}
        >
          {MAIN_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center rounded-sm text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/75 outline-none transition-colors duration-500 ease-[var(--ease-luxe)] hover:text-gold focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              activeProps={{ className: "text-gold", "aria-current": "page" }}
            >
              {t(item.labelKey)}
            </Link>
          ))}

          <ChronicleLink
            className="flex min-h-11 items-center text-xs text-foreground/75"
            onNavigate={() => setOpen(false)}
          />
          <Button asChild variant="gold" size="lg" className="mt-5">
            <Link
              to="/rezerwacja"
              onClick={() => {
                track("cta_click", { variant: "booking", surface: "header_mobile" });
                setOpen(false);
              }}
            >
              {t("layout.header.bookButton")}
            </Link>
          </Button>
          <LanguageSwitcher className="mt-6" />
        </nav>
      </div>
    </header>
  );
}
