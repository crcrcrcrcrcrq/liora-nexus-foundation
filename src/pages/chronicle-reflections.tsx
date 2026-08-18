import { definePage } from "@/lib/locale-route";
import { ChronicleHeader } from "@/features/kronika/components/ChronicleShell";
import { ReflectionTimeline } from "@/features/kronika/components/ReflectionTimeline";
import { useReflections } from "@/features/kronika/hooks/useReflections";
import { chronicleHead } from "@/features/kronika/lib/head";
import { useLanguage } from "@/hooks/useLanguage";

export const page = definePage({
  path: "/kronika/refleksje",
  head: () => ({
    ...chronicleHead("chronicle.meta.reflections.title"),
  }),
  component: ChronicleReflections,
});

function ChronicleReflections() {
  const { t } = useLanguage();
  const { entries, update } = useReflections();

  return (
    <div className="grid gap-14">
      <ChronicleHeader
        eyebrow={t("chronicle.reflections.eyebrow")}
        title={t("chronicle.reflections.title")}
        lead={t("chronicle.reflections.lead")}
        description={t("chronicle.reflections.description")}
      />
      <ReflectionTimeline entries={entries} onUpdate={update} />
    </div>
  );
}
