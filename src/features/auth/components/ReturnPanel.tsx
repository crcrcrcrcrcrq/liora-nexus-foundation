import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@/components/i18n/LocaleLink";
import { motion } from "motion/react";
import { AuthCard } from "./AuthCard";
import { MagicLinkForm } from "./MagicLinkForm";
import { MagicLinkSent } from "./MagicLinkSent";
import { useMagicLink } from "../hooks/useMagicLink";
import { useIdentity } from "@/features/identity/context/identity-context";
import { homePathForRole } from "@/features/identity/model/roles";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * Kontener ekranu powrotu: łączy formularz, potwierdzenie i weryfikację
 * tokenu z adresu. Cała logika bezpieczeństwa pozostaje po stronie backendu.
 */
export function ReturnPanel({
  token,
  authError,
}: {
  token?: string | undefined;
  authError?: boolean;
}) {
  const { t } = useLanguage();
  const { status, send, verify, error, session, reset } = useMagicLink();
  const { adoptSession, isAuthenticated, role } = useIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) void verify(token);
  }, [token, verify]);

  useEffect(() => {
    if (session) adoptSession(session);
  }, [session, adoptSession]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void navigate({ to: homePathForRole(role), replace: true });
  }, [isAuthenticated, role, navigate]);

  const verifying = status === "verifying";
  const formError =
    status === "error" ? error : authError ? t("auth.magicLink.errors.verifyFailed") : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {verifying ? (
        <AuthCard
          eyebrow={t("auth.card.eyebrow")}
          title={t("auth.magicLink.verifying.title")}
          description={t("auth.magicLink.verifying.description")}
        />
      ) : status === "sent" ? (
        <AuthCard
          eyebrow={t("auth.card.eyebrow")}
          title={t("auth.magicLink.sent.title")}
          description={t("auth.magicLink.sent.description")}
          footer={
            <p className="text-xs leading-relaxed text-foreground/55">
              {t("auth.magicLink.sent.footer.question")}{" "}
              <Link to="/kontakt" className="text-gold underline-offset-4 hover:underline">
                {t("auth.magicLink.sent.footer.cta")}
              </Link>
              .
            </p>
          }
        >
          <MagicLinkSent onAgain={reset} />
        </AuthCard>
      ) : (
        <AuthCard
          eyebrow={t("auth.card.eyebrow")}
          title={t("auth.magicLink.form.title")}
          description={t("auth.magicLink.form.description")}
          footer={
            <p className="text-xs leading-relaxed text-foreground/55">
              {t("auth.magicLink.form.footer.question")}{" "}
              <Link to="/tarot" className="text-gold underline-offset-4 hover:underline">
                {t("auth.magicLink.form.footer.cta")}
              </Link>
              .
            </p>
          }
        >
          <MagicLinkForm onSubmit={send} isSending={status === "sending"} error={formError} />
        </AuthCard>
      )}
    </motion.div>
  );
}
