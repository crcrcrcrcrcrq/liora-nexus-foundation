import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminCard } from "@/features/admin/components/AdminShell";
import { adminHead } from "@/features/admin/lib/head";
import { Greeting } from "@/features/experience/components/Greeting";
import { Timeline } from "@/features/experience/components/Timeline";
import { EmptyState, ErrorState, LoadingState } from "@/components/state/States";
import { useAdminBookings, useAdminSummary } from "@/features/admin/hooks/useAdminData";
import { toTimeline } from "@/features/admin/lib/projection";
import { formatHour } from "@/features/experience/lib/format";
import { serviceTitle } from "@/features/admin/lib/service-title";
import { useLanguage } from "@/hooks/useLanguage";
import { translate as t } from "@/lib/i18n";

export const Route = createFileRoute("/admin/")({
  head: () => adminHead(t("admin.meta.dashboard.title")),
  component: ExperienceOverview,
});

/**
 * Overview Experience Center. Po zalogowaniu administrator nie widzi tabeli
 * ani wskaźników — widzi zdanie powitalne i to, co dziś naprawdę się wydarzyło.
 *
 * P0.9: zdania i ślady dnia pochodzą z realnych rezerwacji. Gdy dzień jest
 * pusty, panel mówi „dziś jeszcze cicho” zamiast pokazywać przykład.
 */
function ExperienceOverview() {
  const { t, language } = useLanguage();
  const summary = useAdminSummary();
  const bookings = useAdminBookings();

  const timeline = toTimeline(
    bookings.data ?? [],
    (row) =>
      t("experience.timeline.booking", {
        id: row.lioraId,
        service: serviceTitle(row.serviceSlug),
      }),
    (iso) => formatHour(iso, language),
  ).slice(0, 3);

  return (
    <div className="grid gap-16">
      {summary.isPending ? (
        <LoadingState />
      ) : summary.isError ? (
        <ErrorState onRetry={() => void summary.refetch()} />
      ) : (
        <Greeting
          data={{
            returned: summary.data.todayPeople,
            awaiting: summary.data.awaiting,
            scheduled: summary.data.confirmed,
          }}
        />
      )}

      <AdminCard title={t("experience.overview.todayTitle")}>
        {bookings.isPending ? (
          <LoadingState />
        ) : bookings.isError ? (
          <ErrorState onRetry={() => void bookings.refetch()} />
        ) : timeline.length === 0 ? (
          <EmptyState title={t("experience.activity.quiet")} />
        ) : (
          <Timeline events={timeline} />
        )}
        <div className="mt-8">
          <Link
            to="/admin/aktywnosc"
            className="text-[0.7rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/55 transition-colors duration-500 hover:text-gold"
          >
            {t("experience.overview.todayLink")}
          </Link>
        </div>
      </AdminCard>
    </div>
  );
}
