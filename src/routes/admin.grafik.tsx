import { createFileRoute } from "@tanstack/react-router";
import { adminHead } from "@/features/admin/lib/head";
import { ScheduleManager } from "@/features/admin/components/ScheduleManager";
import { translate as t } from "@/lib/i18n";

/** Zachowany adres z P0.11 — panel żyje pod /admin/schedule. */
export const Route = createFileRoute("/admin/grafik")({
  head: () => adminHead(t("admin.meta.schedule.title")),
  component: ScheduleManager,
});
