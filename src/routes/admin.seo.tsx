import { createFileRoute } from "@tanstack/react-router";
import { AdminCard, AdminHeader } from "@/features/admin/components/AdminShell";
import { adminHead } from "@/features/admin/lib/head";
import { useLanguage } from "@/hooks/useLanguage";
import { translate as t } from "@/lib/i18n";

export const Route = createFileRoute("/admin/seo")({
  head: () => adminHead(t("admin.meta.seo.title")),
  component: AdminSeo,
});

const CHECK_KEYS = [
  "titleDescription",
  "openGraph",
  "structuredData",
  "canonical",
  "sitemap",
  "robots",
] as const;

function AdminSeo() {
  const { t } = useLanguage();
  return (
    <div className="grid gap-8">
      <AdminHeader title={t("admin.seo.title")} description={t("admin.seo.description")} />

      <AdminCard>
        <ul className="grid gap-4">
          {CHECK_KEYS.map((key) => (
            <li
              key={key}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4"
            >
              <span className="text-sm text-foreground">{t(`admin.seo.checks.${key}.label`)}</span>
              <span className="text-xs text-foreground/55">
                {t(`admin.seo.checks.${key}.status`)}
              </span>
            </li>
          ))}
        </ul>
      </AdminCard>

      <AdminCard title={t("admin.seo.overridesTitle")}>
        <p className="text-sm leading-relaxed text-foreground/55">
          {t("admin.seo.overridesDescription")}
        </p>
      </AdminCard>
    </div>
  );
}
