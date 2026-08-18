import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminCard, AdminHeader } from "@/features/admin/components/AdminShell";
import { adminHead } from "@/features/admin/lib/head";
import { ProtectedRoute } from "@/features/identity/components/ProtectedRoute";
import { ConsultationFlow } from "@/features/experience/components/ConsultationFlow";
import { EmptyState, ErrorState, LoadingState } from "@/components/state/States";
import { useAdminBookings } from "@/features/admin/hooks/useAdminData";
import { toConsultations } from "@/features/admin/lib/projection";
import { serviceTitle } from "@/features/admin/lib/service-title";
import type { ConsultationStage } from "@/features/experience/model/types";
import { useLanguage } from "@/hooks/useLanguage";
import { translate as t } from "@/lib/i18n";

export const Route = createFileRoute("/admin/konsultacje")({
  head: () => adminHead(t("experience.consultations.title")),
  component: GuardedConsultations,
});

function GuardedConsultations() {
  return (
    <ProtectedRoute permission="consultations:manage">
      <Consultations />
    </ProtectedRoute>
  );
}

/**
 * Konsultacje to realne prośby o spotkanie (`bookings`) w istniejącym
 * słowniku stanów. Widok jest odczytem: personel nie ma w RLS ścieżki zapisu
 * do cudzej rezerwacji, więc panel nie udaje, że potrafi zmienić stan.
 */
function Consultations() {
  const { t } = useLanguage();
  const bookings = useAdminBookings();
  const [stage, setStage] = useState<ConsultationStage | "all">("all");

  const items = toConsultations(bookings.data ?? [], serviceTitle);

  return (
    <div className="grid gap-8">
      <AdminHeader
        title={t("experience.consultations.title")}
        description={t("experience.consultations.description")}
      />

      <AdminCard>
        {bookings.isPending ? (
          <LoadingState />
        ) : bookings.isError ? (
          <ErrorState onRetry={() => void bookings.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState title={t("admin.bookings.empty.title")} />
        ) : (
          <ConsultationFlow
            consultations={items}
            stage={stage}
            onStageChange={setStage}
            onAdvance={() => undefined}
            canManage={false}
          />
        )}
      </AdminCard>

      <p className="text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/35">
        {t("experience.consultations.readOnly")}
      </p>
    </div>
  );
}
