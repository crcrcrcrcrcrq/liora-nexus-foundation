import { createFileRoute } from "@tanstack/react-router";
import { AdminCard, AdminHeader } from "@/features/admin/components/AdminShell";
import { adminHead } from "@/features/admin/lib/head";
import { ErrorState, LoadingState } from "@/components/state/States";
import { ProtectedRoute } from "@/features/identity/components/ProtectedRoute";
import { useAdminSummary } from "@/features/admin/hooks/useAdminData";
import { useLanguage } from "@/hooks/useLanguage";
import { translate as t } from "@/lib/i18n";

export const Route = createFileRoute("/admin/stats")({
  head: () => adminHead(t("admin.meta.stats.title")),
  component: AdminStats,
});

/** Statystyki są sumą realnych rekordów — nie ma tu wartości poglądowych. */
function AdminStats() {
  const { t } = useLanguage();
  const summary = useAdminSummary();

  const metrics = summary.data
    ? ([
        ["people", summary.data.people],
        ["bookings", summary.data.bookingsTotal],
        ["awaiting", summary.data.awaiting],
        ["confirmed", summary.data.confirmed],
      ] as const)
    : [];

  return (
    <ProtectedRoute permission="stats:read">
      <div className="grid gap-8">
        <AdminHeader title={t("admin.stats.title")} description={t("admin.stats.description")} />
        <AdminCard>
          {summary.isPending ? (
            <LoadingState />
          ) : summary.isError ? (
            <ErrorState onRetry={() => void summary.refetch()} />
          ) : (
            <dl className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map(([key, value]) => (
                <div key={key} className="grid gap-2">
                  <dt className="text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
                    {t(`admin.stats.metrics.${key}`)}
                  </dt>
                  <dd className="font-display text-3xl text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </AdminCard>
      </div>
    </ProtectedRoute>
  );
}
