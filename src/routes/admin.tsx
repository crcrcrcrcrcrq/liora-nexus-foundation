import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { adminHead } from "@/features/admin/lib/head";
import { ProtectedRoute } from "@/features/identity/components/ProtectedRoute";
import { translate as t } from "@/lib/i18n";

export const Route = createFileRoute("/admin")({
  head: () => adminHead(t("admin.meta.layout.title")),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <ProtectedRoute roles={["moderator", "admin"]}>
      <AdminShell>
        <Outlet />
      </AdminShell>
    </ProtectedRoute>
  );
}
