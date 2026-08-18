import { Link } from "@/components/i18n/LocaleLink";
import { cn } from "@/lib/utils";
import { useIdentity } from "../context/identity-context";
import { homePathForRole } from "../model/roles";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * Jedna odpowiedzialność: pokazać właściwe wejście do przestrzeni prywatnej
 * zależnie od stanu tożsamości (gość → zaproszenie do powrotu).
 */
export function ChronicleLink({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const { status, isAuthenticated, role } = useIdentity();
  const { t } = useLanguage();
  if (status === "loading") return null;

  const to = isAuthenticated ? homePathForRole(role) : "/powrot";
  const label = isAuthenticated
    ? t("auth.chronicleLink.authenticated")
    : t("auth.chronicleLink.guest");

  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={cn(
        "rounded-sm text-[0.7rem] uppercase tracking-[var(--tracking-luxe)] text-foreground/70 outline-none transition-colors duration-500 ease-[var(--ease-luxe)] hover:text-gold focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background",
        className,
      )}
      activeProps={{ className: "text-gold", "aria-current": "page" }}
    >
      {label}
    </Link>
  );
}
