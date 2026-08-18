/**
 * Model domenowy modułu Auth (powrót do Kroniki linkiem jednorazowym).
 * Tożsamość i role opisuje moduł Identity — tutaj tylko aliasy zgodności.
 */
import type { IdentitySession, IdentityUser, Role } from "@/features/identity/model/types";

export type AdminRole = Role;
export type AdminUser = IdentityUser;
export type MagicLinkSession = IdentitySession;
