import { Link } from "@/components/i18n/LocaleLink";
import { FOOTER_NAV } from "@/constants/navigation";
import { SITE } from "@/config/site";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <p className="font-display text-2xl text-gold-gradient">{SITE.name}</p>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-foreground/55">
              {t("seo.defaultDescription")}
            </p>
            <NewsletterForm />
          </div>

          <nav
            className="grid gap-10 sm:grid-cols-3"
            aria-label={t("layout.footer.footerNavAriaLabel")}
          >
            {FOOTER_NAV.map((group) => (
              <div key={group.titleKey}>
                <p className="eyebrow" id={`footer-${group.titleKey}`}>
                  {t(group.titleKey)}
                </p>
                <ul className="mt-3" aria-labelledby={`footer-${group.titleKey}`}>
                  {group.items.map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className="inline-flex min-h-11 items-center rounded-sm text-sm text-foreground/65 outline-none transition-colors duration-500 hover:text-gold focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        activeProps={{ className: "text-gold" }}
                      >
                        {t(item.labelKey)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="hairline mt-16" />
        <div className="mt-8 flex flex-col gap-3 text-[0.7rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55 sm:flex-row sm:justify-between">
          <p>
            {t("layout.footer.copyright", {
              year: new Date().getFullYear(),
              legalName: SITE.legalName,
            })}
          </p>
          <div className="flex items-center gap-6">
            <p>{t("layout.footer.practiceSince", { year: SITE.founded })}</p>
            <LanguageSwitcher className="2xl:hidden" />
          </div>
        </div>
      </div>
    </footer>
  );
}
