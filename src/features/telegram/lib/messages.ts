import { translate as t } from "@/lib/i18n";
import type { TelegramMessage, TelegramSignal, TelegramSignalPayload } from "../model/types";

/**
 * Redakcja komunikatów. Każdy tekst: jedno zdanie, bez wykrzykników,
 * bez danych osobowych, z prywatnym identyfikatorem LIORA jako jedynym kluczem.
 */

const TEMPLATE_KEY: Record<TelegramSignal, string> = {
  "consultation.new": "experience.telegram.messages.consultation",
  "interpretation.ordered": "experience.telegram.messages.interpretation",
  "member.premium": "experience.telegram.messages.premium",
  "system.issue": "experience.telegram.messages.system",
};

export function composeTelegramMessage(
  signal: TelegramSignal,
  payload: TelegramSignalPayload = {},
): TelegramMessage {
  const text = t(TEMPLATE_KEY[signal], {
    id: payload.lioraId ?? t("experience.telegram.anonymous"),
    subject: payload.subject ?? t("experience.telegram.unspecified"),
    detail: payload.detail ?? t("experience.telegram.unspecified"),
  });

  return {
    signal,
    text: text.trim(),
    createdAt: payload.at ?? new Date().toISOString(),
  };
}

/** Podgląd wszystkich komunikatów — używany w panelu do korekty tonu. */
export function previewTelegramMessages(): TelegramMessage[] {
  return (Object.keys(TEMPLATE_KEY) as TelegramSignal[]).map((signal) =>
    composeTelegramMessage(signal, {
      lioraId: "LIO-8F4A-29C1",
      subject: t("experience.telegram.previewSubject"),
      detail: t("experience.telegram.previewDetail"),
      at: "2026-08-05T09:31:00.000Z",
    }),
  );
}
