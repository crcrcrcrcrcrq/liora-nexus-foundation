import { definePage } from "@/lib/locale-route";
import { ChronicleCard, ChronicleHeader } from "@/features/kronika/components/ChronicleShell";
import { ProfileCard } from "@/features/kronika/components/ProfileCard";
import { useChronicle } from "@/features/kronika/hooks/useChronicle";
import { chronicleHead } from "@/features/kronika/lib/head";
import { useIdentity } from "@/features/identity/context/identity-context";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

export const page = definePage({
  path: "/kronika/profil",
  head: () => ({
    ...chronicleHead("chronicle.meta.profile.title"),
  }),
  component: ChronicleProfile,
});

function ChronicleProfile() {
  const { leave } = useIdentity();
  const { chronicle } = useChronicle();
  const { t } = useLanguage();

  return (
    <div className="grid gap-14">
      <ChronicleHeader
        eyebrow={t("chronicle.profile.eyebrow")}
        title={t("chronicle.profile.title")}
        lead={t("chronicle.profile.lead")}
        description={t("chronicle.profile.description")}
      />

      <ProfileCard profile={chronicle.profile} />

      <ChronicleCard title={t("chronicle.profile.endSession.title")}>
        <p className="text-sm leading-relaxed text-foreground/55">
          {t("chronicle.profile.endSession.description")}
        </p>
        <Button type="button" variant="outline" className="mt-6" onClick={leave}>
          {t("chronicle.profile.endSession.button")}
        </Button>
      </ChronicleCard>
    </div>
  );
}
