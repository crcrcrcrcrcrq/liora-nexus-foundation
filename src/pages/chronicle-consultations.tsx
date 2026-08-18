import { definePage } from "@/lib/locale-route";
import {
  ChronicleHeader,
  ChroniclePlaceholder,
} from "@/features/kronika/components/ChronicleShell";
import { ConsultationCard } from "@/features/kronika/components/ConsultationCard";
import { SampleNotice } from "@/features/kronika/components/SampleNotice";
import { useChronicle } from "@/features/kronika/hooks/useChronicle";
import { chronicleHead } from "@/features/kronika/lib/head";
import { useLanguage } from "@/hooks/useLanguage";

export const page = definePage({
  path: "/kronika/konsultacje",
  head: () => ({
    ...chronicleHead("chronicle.meta.consultations.title"),
  }),
  component: ChronicleConsultations,
});

function ChronicleConsultations() {
  const { t } = useLanguage();
  const { chronicle, isSample, isLoading } = useChronicle();
  const upcoming = chronicle.consultations.filter((item) => item.status === "upcoming");
  const past = chronicle.consultations.filter((item) => item.status !== "upcoming");

  return (
    <div className="grid gap-14">
      <ChronicleHeader
        eyebrow={t("chronicle.consultations.eyebrow")}
        title={t("chronicle.consultations.title")}
        lead={t("chronicle.consultations.lead")}
        description={t("chronicle.consultations.description")}
      />
      {isSample ? (
        <SampleNotice note={t("chronicle.consultations.sampleNote")} isLoading={isLoading} />
      ) : null}

      <section className="grid gap-6">
        <p className="eyebrow text-foreground/55">{t("chronicle.consultations.upcomingEyebrow")}</p>
        {upcoming.length > 0 ? (
          upcoming.map((item) => <ConsultationCard key={item.id} consultation={item} />)
        ) : (
          <ChroniclePlaceholder note={t("chronicle.consultations.upcomingEmpty")} />
        )}
      </section>

      <section className="grid gap-6">
        <p className="eyebrow text-foreground/55">{t("chronicle.consultations.pastEyebrow")}</p>
        {past.length > 0 ? (
          past.map((item) => <ConsultationCard key={item.id} consultation={item} />)
        ) : (
          <ChroniclePlaceholder note={t("chronicle.consultations.pastEmpty")} />
        )}
      </section>
    </div>
  );
}
