import { createFileRoute } from "@tanstack/react-router";
import { AdminCard, AdminHeader } from "@/features/admin/components/AdminShell";
import { adminHead } from "@/features/admin/lib/head";
import { SITE } from "@/config/site";
import { ProtectedRoute } from "@/features/identity/components/ProtectedRoute";
import { useLanguage } from "@/hooks/useLanguage";
import { translate as t } from "@/lib/i18n";

export const Route = createFileRoute("/admin/settings")({
  head: () => adminHead(t("admin.meta.settings.title")),
  component: GuardedSettings,
});

function GuardedSettings() {
  return (
    <ProtectedRoute permission="settings:manage">
      <AdminSettings />
    </ProtectedRoute>
  );
}

function AdminSettings() {
  const { t } = useLanguage();
  return (
    <div className="grid gap-8">
      <AdminHeader
        title={t("admin.settings.title")}
        description={t("admin.settings.description")}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCard title={t("admin.settings.practiceTitle")}>
          <dl className="grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-foreground/55">{t("admin.settings.fields.name")}</dt>
              <dd className="text-foreground/70">{SITE.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-foreground/55">{t("admin.settings.fields.email")}</dt>
              <dd className="text-foreground/70">{SITE.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-foreground/55">{t("admin.settings.fields.languages")}</dt>
              <dd className="text-foreground/70">{SITE.languages.join(", ")}</dd>
            </div>
          </dl>
        </AdminCard>

        <AdminCard title={t("admin.settings.accessTitle")}>
          <p className="text-sm leading-relaxed text-foreground/55">
            {t("admin.settings.accessDescription")}
          </p>
        </AdminCard>

        <AdminCard title={t("admin.settings.secretsTitle")} className="lg:col-span-2">
          <p className="text-sm leading-relaxed text-foreground/55">
            {t("admin.settings.secretsDescription")}
          </p>
        </AdminCard>
      </div>
    </div>
  );
}
