import type { ReactNode } from "react";
import { useIdentity } from "../context/identity-context";
import type { Permission, Role } from "../model/types";
import { IdentityPending, InvitationNotice, RestrictedNotice } from "./AccessNotice";

interface ProtectedRouteProps {
  /** Role dopuszczone do tej gałęzi routingu. */
  roles?: readonly Role[];
  /** Dodatkowe zawężenie po uprawnieniu z macierzy ról. */
  permission?: Permission;
  children: ReactNode;
}

/**
 * Granica dostępu dla tras chronionych. Jedna odpowiedzialność: decyzja
 * „pokazać zawartość / zaproszenie do powrotu / komunikat o ograniczeniu”.
 * Ostateczną autoryzację wykona backend przy każdym żądaniu.
 */
export function ProtectedRoute({ roles, permission, children }: ProtectedRouteProps) {
  const { status, isAuthenticated, hasAnyRole, can } = useIdentity();

  if (status === "loading") return <IdentityPending />;
  if (!isAuthenticated) return <InvitationNotice />;
  if (roles && !hasAnyRole(roles)) return <RestrictedNotice />;
  if (permission && !can(permission)) return <RestrictedNotice />;

  return <>{children}</>;
}

/** Ukrywa fragment interfejsu, gdy rola nie posiada uprawnienia. */
export function PermissionGate({
  permission,
  children,
}: {
  permission: Permission;
  children: ReactNode;
}) {
  const { can } = useIdentity();
  if (!can(permission)) return null;
  return <>{children}</>;
}
