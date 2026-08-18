import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminCard, AdminHeader } from "@/features/admin/components/AdminShell";
import { adminHead } from "@/features/admin/lib/head";
import { ProtectedRoute } from "@/features/identity/components/ProtectedRoute";
import { useIdentity } from "@/features/identity/context/identity-context";
import { PresenceList } from "@/features/experience/components/PresenceList";
import { EmptyState, ErrorState, LoadingState } from "@/components/state/States";
import { useAdminPeople } from "@/features/admin/hooks/useAdminData";
import { redactPresences, canSeePersonalData } from "@/features/experience/lib/privacy";
import { useLanguage } from "@/hooks/useLanguage";
import { translate as t } from "@/lib/i18n";

export const Route = createFileRoute("/admin/users")({
  head: () => adminHead(t("experience.people.title")),
  component: GuardedPeople,
});

function GuardedPeople() {
  return (
    <ProtectedRoute permission="clients:read:masked">
      <People />
    </ProtectedRoute>
  );
}

/**
 * Obecności. Widok nie zna numerów ID ani danych osobowych — operuje wyłącznie
 * na identyfikatorze LIORA. Serwer w ogóle nie wysyła danych osobowych, a
 * `redactPresences` pozostaje drugą zaporą po stronie prezentacji.
 *
 * Kronika osoby nie jest tu pokazywana: wpisy Kroniki są prywatne i żadna
 * rola personelu nie ma do nich ścieżki odczytu w RLS.
 */
function People() {
  const { t } = useLanguage();
  const { role } = useIdentity();
  const query = useAdminPeople();
  const people = redactPresences(query.data ?? [], role);
  const [selected, setSelected] = useState<string>("");

  return (
    <div className="grid gap-8">
      <AdminHeader
        title={t("experience.people.title")}
        description={t("experience.people.description")}
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <AdminCard title={t("experience.people.listTitle")}>
          {query.isPending ? (
            <LoadingState />
          ) : query.isError ? (
            <ErrorState onRetry={() => void query.refetch()} />
          ) : people.length === 0 ? (
            <EmptyState title={t("experience.people.empty.title")} />
          ) : (
            <PresenceList people={people} selectedId={selected} onSelect={setSelected} />
          )}
        </AdminCard>

        <AdminCard title={t("experience.chronicle.title")}>
          <EmptyState
            title={t("experience.chronicle.unavailable.title")}
            description={t("experience.chronicle.unavailable.description")}
          />
        </AdminCard>
      </div>

      <AdminCard title={t("experience.privacy.title")}>
        <ul className="grid gap-3 text-sm leading-relaxed text-foreground/55">
          <li>{t("experience.privacy.identifiers")}</li>
          <li>{t("experience.privacy.encryption")}</li>
          <li>{t("experience.privacy.moderator")}</li>
          <li>
            {canSeePersonalData(role)
              ? t("experience.privacy.adminScope")
              : t("experience.privacy.maskedScope")}
          </li>
        </ul>
      </AdminCard>
    </div>
  );
}
