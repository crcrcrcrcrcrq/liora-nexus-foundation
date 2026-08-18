import { createFileRoute } from "@tanstack/react-router";
import { AdminCard, AdminHeader } from "@/features/admin/components/AdminShell";
import { adminHead } from "@/features/admin/lib/head";
import { useLanguage } from "@/hooks/useLanguage";
import { translate as t } from "@/lib/i18n";

export const Route = createFileRoute("/admin/cms")({
  head: () => adminHead(t("admin.meta.cms.title")),
  component: AdminCms,
});

const COLLECTION_KEYS = ["home", "services", "rituals", "faq", "locations"] as const;

function AdminCms() {
  const { t } = useLanguage();
  return (
    <div className="grid gap-8">
      <AdminHeader title={t("admin.cms.title")} description={t("admin.cms.description")} />

      <div className="grid gap-4 sm:grid-cols-2">
        {COLLECTION_KEYS.map((key) => (
          <AdminCard key={key} title={t(`admin.cms.collections.${key}.name`)}>
            <p className="text-sm leading-relaxed text-foreground/55">
              {t(`admin.cms.collections.${key}.description`)}
            </p>
            <p className="mt-4 text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
              {t("admin.cms.editHint")}
            </p>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
