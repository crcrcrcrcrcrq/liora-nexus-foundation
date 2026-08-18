import { createFileRoute } from "@tanstack/react-router";
import { adminHead } from "@/features/admin/lib/head";
import { ScheduleManager } from "@/features/admin/components/ScheduleManager";
import { translate as t } from "@/lib/i18n";

export const Route = createFileRoute("/admin/schedule")({
  head: () => adminHead(t("admin.meta.schedule.title")),
  component: ScheduleManager,
});
