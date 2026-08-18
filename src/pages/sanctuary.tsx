import { Link } from "@/components/i18n/LocaleLink";
import { definePage } from "@/lib/locale-route";
import { motion, useReducedMotion } from "motion/react";
import { ProtectedRoute } from "@/features/identity/components/ProtectedRoute";
import { useIdentity } from "@/features/identity/context/identity-context";
import { SanctuaryCard } from "@/features/sanktuarium/components/SanctuaryCard";
import { useReflections } from "@/features/kronika/hooks/useReflections";
import { formatChronicleDateTime } from "@/features/kronika/lib/format";
import { useDailyLimit } from "@/features/tarot/hooks/useDailyLimit";
import { chronicleHead } from "@/features/kronika/lib/head";
import { useLanguage } from "@/hooks/useLanguage";
import { translate as t } from "@/lib/i18n";

export const page = definePage({
  path: "/sanktuarium",
  head: () => ({
    ...chronicleHead("sanctuary.meta.title", t("sanctuary.meta.description")),
  }),
  component: SanctuaryRoute,
});

function SanctuaryRoute() {
  return (
    <ProtectedRoute roles={["client", "admin"]} permission="chronicle:read">
      <Sanctuary />
    </ProtectedRoute>
  );
}

const LINK_CLASS =
  "inline-block rounded-sm text-[0.7rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55 outline-none transition-colors duration-500 hover:text-gold focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background";

function Sanctuary() {
  const { t, language } = useLanguage();
  const { session } = useIdentity();
  const reduced = useReducedMotion();
  const { entries, ready } = useReflections();
  const { ready: limitReady, locked } = useDailyLimit();

  const name = session?.user.displayName;
  const last = entries[0];
  const history = entries.slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-28 pt-28 sm:px-8 lg:px-10">
      <motion.header
        className="border-b border-border pb-12"
        initial={reduced ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="eyebrow text-foreground/55">
          {name ? t("sanctuary.eyebrowWithName", { name }) : t("sanctuary.eyebrow")}
        </p>
        <h1 className="mt-6 text-balance font-display text-4xl leading-[1.12] text-foreground sm:text-5xl">
          {t("sanctuary.title")}
        </h1>
        <p className="mt-4 max-w-2xl text-[0.95rem] leading-[1.9] text-foreground/55">
          {t("sanctuary.description")}
        </p>
        <p className="mt-6 max-w-2xl text-xs leading-relaxed text-foreground/45">
          {t("chronicle.privacy.line1")} {t("chronicle.privacy.line2")}
        </p>
      </motion.header>

      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        <SanctuaryCard
          index={0}
          eyebrow={t("sanctuary.today.eyebrow")}
          title={limitReady && locked ? t("sanctuary.today.doneTitle") : t("sanctuary.today.title")}
          description={
            limitReady && locked ? t("sanctuary.today.doneBody") : t("sanctuary.today.body")
          }
          footer={
            <Link to="/tarot" className={LINK_CLASS}>
              {limitReady && locked ? t("sanctuary.today.doneLink") : t("sanctuary.today.link")}
            </Link>
          }
        />

        <SanctuaryCard
          index={1}
          eyebrow={t("sanctuary.lastReading.eyebrow")}
          title={last ? last.spread : t("sanctuary.lastReading.emptyTitle")}
          description={last ? undefined : t("sanctuary.lastReading.emptyBody")}
          footer={
            <Link to={last ? "/kronika/refleksje" : "/tarot"} className={LINK_CLASS}>
              {last ? t("sanctuary.lastReading.link") : t("sanctuary.today.link")}
            </Link>
          }
        >
          {last ? (
            <div className="grid gap-4">
              <p className="text-[0.7rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/45">
                {formatChronicleDateTime(last.readingAt, language)}
              </p>
              <p className="text-sm leading-relaxed text-foreground/55">
                {last.cards.map((card) => card.name).join(" · ")}
              </p>
              {last.heard ? (
                <p className="border-l border-border pl-5 font-display text-lg leading-relaxed text-foreground/75">
                  „{last.heard}”
                </p>
              ) : null}
            </div>
          ) : null}
        </SanctuaryCard>

        <SanctuaryCard
          index={2}
          eyebrow={t("sanctuary.chronicle.eyebrow")}
          title={t("sanctuary.chronicle.title")}
          description={t("sanctuary.chronicle.body")}
          footer={
            <Link to="/kronika" className={LINK_CLASS}>
              {t("sanctuary.chronicle.link")}
            </Link>
          }
        />

        <SanctuaryCard
          index={3}
          eyebrow={t("sanctuary.history.eyebrow")}
          title={t("sanctuary.history.title")}
          description={ready && history.length === 0 ? t("sanctuary.history.empty") : undefined}
          footer={
            <Link to="/kronika/refleksje" className={LINK_CLASS}>
              {t("sanctuary.history.link")}
            </Link>
          }
        >
          {history.length > 0 ? (
            <ul className="grid gap-6">
              {history.map((entry) => (
                <li key={entry.id} className="border-l border-border pl-5">
                  <p className="text-[0.65rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/45">
                    {formatChronicleDateTime(entry.readingAt, language)}
                  </p>
                  <p className="mt-2 text-sm leading-[1.9] text-foreground/70">
                    {entry.heard || entry.taking || entry.leaving}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </SanctuaryCard>

        <SanctuaryCard
          index={4}
          className="lg:col-span-2"
          eyebrow={t("sanctuary.session.eyebrow")}
          title={t("sanctuary.session.title")}
          description={t("sanctuary.session.body")}
          footer={
            <Link to="/rezerwacja" className={LINK_CLASS}>
              {t("sanctuary.session.link")}
            </Link>
          }
        />
      </div>
    </div>
  );
}
