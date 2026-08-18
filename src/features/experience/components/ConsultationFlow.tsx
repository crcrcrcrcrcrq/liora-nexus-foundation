import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { formatMoment } from "../lib/format";
import { CONSULTATION_STAGES, type Consultation, type ConsultationStage } from "../model/types";

/**
 * Workflow konsultacji. Pięć spokojnych stanów, przejścia bez pośpiechu.
 * Widok prezentacyjny — zmiana stanu trafi do backendu w Sprincie F.
 */
export function ConsultationFlow({
  consultations,
  stage,
  onStageChange,
  onAdvance,
  canManage = false,
}: {
  consultations: readonly Consultation[];
  stage: ConsultationStage | "all";
  onStageChange: (stage: ConsultationStage | "all") => void;
  onAdvance?: (id: string) => void;
  canManage?: boolean;
}) {
  const { t, language } = useLanguage();
  const reduced = useReducedMotion();
  const visible = stage === "all" ? consultations : consultations.filter((c) => c.stage === stage);

  return (
    <div className="grid gap-8">
      <nav className="flex flex-wrap gap-2" aria-label={t("experience.consultations.title")}>
        {(["all", ...CONSULTATION_STAGES] as const).map((key) => {
          const active = key === stage;
          const count =
            key === "all"
              ? consultations.length
              : consultations.filter((item) => item.stage === key).length;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onStageChange(key)}
              className={cn(
                "rounded-sm border px-4 py-2 text-[0.7rem] uppercase tracking-[var(--tracking-luxe)] transition-colors duration-500 ease-[var(--ease-luxe)]",
                active
                  ? "border-gold/50 text-gold"
                  : "border-border text-foreground/45 hover:text-foreground/75",
              )}
            >
              {key === "all"
                ? t("experience.consultations.all")
                : t(`experience.consultations.stages.${key}`)}
              <span className="ml-2 text-foreground/35">{count}</span>
            </button>
          );
        })}
      </nav>

      <ul className="grid gap-3">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((item) => (
            <motion.li
              key={item.id}
              layout={!reduced}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 1 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-sm border border-border/70 px-5 py-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <span className="font-mono text-sm tracking-[0.12em] text-gold">
                  {item.lioraId}
                </span>
                <span className="text-sm text-foreground/75">{item.subject}</span>
                <StageMark stage={item.stage} />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-4 text-xs text-foreground/40">
                <span>
                  {t("experience.consultations.requested", {
                    when: formatMoment(item.requestedAt, language),
                  })}
                </span>
                {item.scheduledFor ? (
                  <span>
                    {t("experience.consultations.scheduledFor", {
                      when: formatMoment(item.scheduledFor, language),
                    })}
                  </span>
                ) : null}
                {canManage && onAdvance && item.stage !== "closed" ? (
                  <button
                    type="button"
                    onClick={() => onAdvance(item.id)}
                    className="rounded-sm text-[0.7rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55 transition-colors duration-500 hover:text-gold"
                  >
                    {t("experience.consultations.advance")}
                  </button>
                ) : null}
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

function StageMark({ stage }: { stage: ConsultationStage }) {
  const { t } = useLanguage();
  return (
    <span
      className={cn(
        "text-[0.7rem] uppercase tracking-[var(--tracking-luxe)]",
        stage === "new" || stage === "awaiting" ? "text-gold" : "text-foreground/40",
      )}
    >
      {t(`experience.consultations.stages.${stage}`)}
    </span>
  );
}

/** Kolejny krok w workflow — kierunek jest jednostajny i nieodwracalny w UI. */
export function nextStage(stage: ConsultationStage): ConsultationStage {
  const index = CONSULTATION_STAGES.indexOf(stage);
  return CONSULTATION_STAGES[Math.min(index + 1, CONSULTATION_STAGES.length - 1)]!;
}
