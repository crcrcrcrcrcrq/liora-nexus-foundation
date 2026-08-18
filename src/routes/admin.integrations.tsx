import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminCard, AdminHeader } from "@/features/admin/components/AdminShell";
import { TelegramIntegrationCards } from "@/features/admin/components/TelegramIntegrationCards";
import { OperationsStatusPanel } from "@/features/admin/components/OperationsStatusPanel";
import { ControlPlaneStatusPanel } from "@/features/admin/components/ControlPlaneStatusPanel";
import { adminHead } from "@/features/admin/lib/head";
import { ProtectedRoute } from "@/features/identity/components/ProtectedRoute";
import { useLanguage } from "@/hooks/useLanguage";
import { translate as t } from "@/lib/i18n";

export const Route = createFileRoute("/admin/integrations")({
  head: () => adminHead(t("admin.meta.integrations.title")),
  component: AdminIntegrations,
});

/** P0.34 — pozostały tu wyłącznie usługi, których w produkcie jeszcze nie ma. */
const INTEGRATION_KEYS = ["ephemeris", "payments"] as const;

function AdminIntegrations() {
  const { t } = useLanguage();
  return (
    <ProtectedRoute permission="integrations:manage">
      <div className="grid gap-8">
        <AdminHeader
          title={t("admin.integrations.title")}
          description={t("admin.integrations.description")}
          action={
            <Link
              to="/admin/telegram"
              className="text-xs uppercase tracking-[var(--tracking-luxe)] text-gold"
            >
              {t("admin.integrations.telegramLink")}
            </Link>
          }
        />
        {/* P0.34 — stan operacyjny wszystkich modułów (serwerowe źródło prawdy). */}
        <OperationsStatusPanel />
        {/* P0.38 — status Control Plane: Storage / Backup / Release / Deployment. */}
        <ControlPlaneStatusPanel />
        {/* P0.31 — status botów Telegrama liczony serwerowo (bez sekretów w kliencie). */}
        <TelegramIntegrationCards />
        <div className="grid gap-4 sm:grid-cols-2">
          {INTEGRATION_KEYS.map((key) => (
            <AdminCard key={key} title={t(`admin.integrations.items.${key}.name`)}>
              <p className="text-sm leading-relaxed text-foreground/55">
                {t(`admin.integrations.items.${key}.note`)}
              </p>
              <p className="mt-6 text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
                {t("admin.integrations.pendingConfig")}
              </p>
            </AdminCard>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
