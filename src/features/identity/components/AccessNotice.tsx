import type { ReactNode } from "react";
import { Link } from "@/components/i18n/LocaleLink";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * Spokojny komunikat zamiast twardego błędu dostępu.
 * Jedna odpowiedzialność: prezentacja stanu granicy dostępu.
 */
export function AccessNotice({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col justify-center px-6 py-24 text-center">
      <p className="eyebrow text-foreground/55">{eyebrow}</p>
      <h1 className="mt-6 font-display text-3xl text-foreground sm:text-4xl">{title}</h1>
      <p className="mt-4 text-sm leading-relaxed text-foreground/55">{description}</p>
      {action ? <div className="mt-10 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function InvitationNotice() {
  const { t } = useLanguage();
  return (
    <AccessNotice
      eyebrow={t("auth.access.invitation.eyebrow")}
      title={t("auth.access.invitation.title")}
      description={t("auth.access.invitation.description")}
      action={
        <Button asChild variant="gold" size="lg">
          <Link to="/powrot">{t("auth.access.invitation.cta")}</Link>
        </Button>
      }
    />
  );
}

export function RestrictedNotice() {
  const { t } = useLanguage();
  return (
    <AccessNotice
      eyebrow={t("auth.access.restricted.eyebrow")}
      title={t("auth.access.restricted.title")}
      description={t("auth.access.restricted.description")}
      action={
        <Button asChild variant="outline">
          <Link to="/">{t("auth.access.restricted.cta")}</Link>
        </Button>
      }
    />
  );
}

export function IdentityPending() {
  const { t } = useLanguage();
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[60vh] items-center justify-center px-6"
    >
      <p className="eyebrow animate-pulse text-foreground/55">{t("auth.access.pending")}</p>
    </div>
  );
}
