import { useCallback, useState } from "react";
import { requestMagicLink, verifyMagicLink } from "@/services/auth.service";
import type { MagicLinkSession } from "../model/types";
import { useLanguage } from "@/hooks/useLanguage";

export type MagicLinkStatus = "idle" | "sending" | "sent" | "verifying" | "verified" | "error";

interface MagicLinkState {
  status: MagicLinkStatus;
  isLoading: boolean;
  error: string | null;
  session: MagicLinkSession | null;
  send: (email: string) => Promise<void>;
  verify: (token: string) => Promise<void>;
  reset: () => void;
}

/**
 * Obsługa logowania linkiem jednorazowym. Token weryfikuje backend —
 * frontend przechowuje wyłącznie wynik operacji.
 */
export function useMagicLink(): MagicLinkState {
  const { t } = useLanguage();
  const [status, setStatus] = useState<MagicLinkStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<MagicLinkSession | null>(null);

  const send = useCallback(
    async (email: string) => {
      setStatus("sending");
      setError(null);
      const result = await requestMagicLink(email);
      if (result.ok) {
        setStatus("sent");
      } else {
        setError(result.error ?? t("auth.magicLink.errors.sendFailed"));
        setStatus("error");
      }
    },
    [t],
  );

  const verify = useCallback(
    async (token: string) => {
      setStatus("verifying");
      setError(null);
      const result = await verifyMagicLink(token);
      if (result.ok && result.data) {
        setSession(result.data);
        setStatus("verified");
      } else {
        setError(result.error ?? t("auth.magicLink.errors.verifyFailed"));
        setStatus("error");
      }
    },
    [t],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setSession(null);
  }, []);

  return {
    status,
    isLoading: status === "sending" || status === "verifying",
    error,
    session,
    send,
    verify,
    reset,
  };
}
