import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getCurrentSession, signOut } from "@/services/auth.service";
import { IdentityContext, type IdentityContextValue } from "./identity-context";
import { permissionsForRole, roleHasPermission } from "../model/roles";
import type { IdentitySession, IdentityStatus, Permission, Role } from "../model/types";

/**
 * Jedyne źródło prawdy o sesji i tożsamości w całej aplikacji.
 *
 * P0.3.1: sesję prowadzi serwer (ciasteczko HttpOnly + `@supabase/ssr`).
 * Frontend nie posiada, nie dekoduje ani nie odświeża tokenu — profil i rolę
 * rozstrzyga serwer (`fetchIdentity`) przy każdym wejściu do aplikacji,
 * także po twardym przeładowaniu i w nowej karcie.
 */
export function IdentityProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<IdentitySession | null>(null);
  const [status, setStatus] = useState<IdentityStatus>("loading");

  useEffect(() => {
    let active = true;

    const resolve = async () => {
      const result = await getCurrentSession();
      if (!active) return;
      if (result.ok && result.data) {
        setSession(result.data);
        setStatus("authenticated");
      } else {
        setSession(null);
        setStatus("guest");
      }
    };

    void resolve();

    return () => {
      active = false;
    };
  }, []);

  /** Przyjmuje sesję rozstrzygniętą przez serwer po weryfikacji linku powrotnego. */
  const adoptSession = useCallback((next: IdentitySession) => {
    setSession(next);
    setStatus("authenticated");
  }, []);

  const leave = useCallback(() => {
    setSession(null);
    setStatus("guest");
    void signOut();
  }, []);

  const value = useMemo<IdentityContextValue>(() => {
    const role: Role = session?.user.role ?? "guest";
    const permissions: readonly Permission[] = permissionsForRole(role);
    return {
      session,
      status,
      role,
      isAuthenticated: status === "authenticated" && session !== null,
      permissions,
      can: (permission) => roleHasPermission(role, permission),
      hasRole: (expected) => role === expected,
      hasAnyRole: (roles) => roles.includes(role),
      adoptSession,
      leave,
    };
  }, [session, status, adoptSession, leave]);

  return <IdentityContext.Provider value={value}>{children}</IdentityContext.Provider>;
}
