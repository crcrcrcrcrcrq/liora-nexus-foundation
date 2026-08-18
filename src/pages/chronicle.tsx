import { Outlet } from "@tanstack/react-router";
import { definePage } from "@/lib/locale-route";
import { ProtectedRoute } from "@/features/identity/components/ProtectedRoute";
import { ChronicleShell } from "@/features/kronika/components/ChronicleShell";
import { chronicleHead } from "@/features/kronika/lib/head";

export const page = definePage({
  path: "/kronika",
  head: () => ({
    ...chronicleHead("chronicle.meta.layout.title"),
  }),
  component: ChronicleLayout,
});

function ChronicleLayout() {
  return (
    <ProtectedRoute roles={["client", "admin"]} permission="chronicle:read">
      <ChronicleShell>
        <Outlet />
      </ChronicleShell>
    </ProtectedRoute>
  );
}
