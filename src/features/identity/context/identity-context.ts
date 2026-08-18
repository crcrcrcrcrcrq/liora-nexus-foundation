import { createContext, useContext } from "react";
import type { IdentitySession, IdentityStatus, Permission, Role } from "../model/types";

export interface IdentityContextValue {
  /** Sesja klienta/moderatora/administratora albo `null` dla gościa. */
  session: IdentitySession | null;
  status: IdentityStatus;
  role: Role;
  isAuthenticated: boolean;
  permissions: readonly Permission[];
  can: (permission: Permission) => boolean;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: readonly Role[]) => boolean;
  /** Zapisuje sesję zwróconą przez backend po weryfikacji linku powrotnego. */
  adoptSession: (session: IdentitySession) => void;
  leave: () => void;
}

export const IdentityContext = createContext<IdentityContextValue | null>(null);

export function useIdentity(): IdentityContextValue {
  const context = useContext(IdentityContext);
  if (!context) throw new Error("useIdentity musi być użyty wewnątrz <IdentityProvider>.");
  return context;
}
