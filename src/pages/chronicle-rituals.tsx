import { definePage } from "@/lib/locale-route";
import { ChronicleHeader } from "@/features/kronika/components/ChronicleShell";
import { ChronicleTimeline } from "@/features/kronika/components/ChronicleTimeline";
import { SampleNotice } from "@/features/kronika/components/SampleNotice";
import { useChronicle } from "@/features/kronika/hooks/useChronicle";
import { chronicleHead } from "@/features/kronika/lib/head";
import { useLanguage } from "@/hooks/useLanguage";

export const page = definePage({
  path: "/kronika/rytualy",
  head: () => ({
    ...chronicleHead("chronicle.meta.rituals.title"),
  }),
  component: ChronicleRituals,
});

function ChronicleRituals() {
  const { t } = useLanguage();
  const { chronicle, isSample, isLoading } = useChronicle();

  return (
    <div className="grid gap-14">
      <ChronicleHeader
        eyebrow={t("chronicle.rituals.eyebrow")}
        title={t("chronicle.rituals.title")}
        lead={t("chronicle.rituals.lead")}
        description={t("chronicle.rituals.description")}
      />
      {isSample ? (
        <SampleNotice note={t("chronicle.rituals.sampleNote")} isLoading={isLoading} />
      ) : null}
      <ChronicleTimeline rituals={chronicle.rituals} emptyNote={t("chronicle.rituals.emptyNote")} />
    </div>
  );
}
