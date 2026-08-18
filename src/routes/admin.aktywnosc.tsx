import { createFileRoute } from "@tanstack/react-router";
import { AdminCard, AdminHeader } from "@/features/admin/components/AdminShell";
import { adminHead } from "@/features/admin/lib/head";
import { ProtectedRoute } from "@/features/identity/components/ProtectedRoute";
import { Timeline } from "@/features/experience/components/Timeline";
import { EmptyState, ErrorState, LoadingState } from "@/components/state/States";
import { useAdminBookings } from "@/features/admin/hooks/useAdminData";
import { toTimeline } from "@/features/admin/lib/projection";
import { serviceTitle } from "@/features/admin/lib/service-title";
import { formatHour } from "@/features/experience/lib/format";
import { useLanguage } from "@/hooks/useLanguage";
import { translate as t } from "@/lib/i18n";

export const Route = createFileRoute("/admin/aktywnosc")({
  head: () => adminHead(t("experience.activity.title")),
  component: GuardedActivity,
});

function GuardedActivity() {
  return (
    <ProtectedRoute permission="activity:read">
      <Activity />
    </ProtectedRoute>
  );
}

/** Historia dnia z realnych rezerwacji. Cisza jest tu poprawnym stanem. */
function Activity() {
  const { t, language } = useLanguage();
  const bookings = useAdminBookings();

  const events = toTimeline(
    bookings.data ?? [],
    (row) =>
      t("experience.timeline.booking", {
        id: row.lioraId,
        service: serviceTitle(row.serviceSlug),
      }),
    (iso) => formatHour(iso, language),
  );

  return (
    <div className="grid gap-8">
      <AdminHeader
        title={t("experience.activity.title")}
        description={t("experience.activity.description")}
      />
      <AdminCard title={t("experience.activity.todayLabel")}>
        {bookings.isPending ? (
          <LoadingState />
        ) : bookings.isError ? (
          <ErrorState onRetry={() => void bookings.refetch()} />
        ) : events.length === 0 ? (
          <EmptyState title={t("experience.activity.quiet")} />
        ) : (
          <Timeline events={events} />
        )}
      </AdminCard>
    </div>
  );
}
