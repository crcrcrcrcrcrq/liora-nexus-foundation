import { createFileRoute } from "@tanstack/react-router";
import { AdminCard, AdminHeader } from "@/features/admin/components/AdminShell";
import { adminHead } from "@/features/admin/lib/head";
import { EmptyState } from "@/components/state/States";
import { ProtectedRoute } from "@/features/identity/components/ProtectedRoute";
import { useLanguage } from "@/hooks/useLanguage";
import { translate as t } from "@/lib/i18n";

export const Route = createFileRoute("/admin/requests")({
  head: () => adminHead(t("admin.meta.requests.title")),
  component: AdminRequests,
});

const STATUS_KEYS = ["new", "inProgress", "waiting", "closed"] as const;

function AdminRequests() {
  const { t } = useLanguage();
  return (
    <ProtectedRoute permission="requests:manage">
      <div className="grid gap-8">
        <AdminHeader
          title={t("admin.requests.title")}
          description={t("admin.requests.description")}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STATUS_KEYS.map((key) => (
            <AdminCard key={key} title={t(`admin.requests.statuses.${key}`)}>
              <p className="font-display text-4xl text-foreground/55">—</p>
            </AdminCard>
          ))}
        </div>

        <AdminCard>
          <EmptyState
            title={t("admin.requests.empty.title")}
            description={t("admin.requests.empty.description")}
          />
        </AdminCard>
      </div>
    </ProtectedRoute>
  );
}
