/**
 * LIORA P0.29/P0.30 — kanał e-mail jako adapter zdarzeń rezerwacji.
 *
 * Adapter nie zna Supabase, nie czyta bazy i nie decyduje o statusie. Dostaje
 * gotowe zdarzenie (`BookingEvent`) i zamienia je na wiadomości. Wymiana
 * kanału = dodanie rodzeństwa tego pliku, bez dotykania domeny rezerwacji.
 *
 * Copy jest wyłącznie serwerowe i przypięte do `event.locale`
 * (= `bookings.language`). Nigdy nie zależy od języka admina ani przeglądarki.
 */
import { translator } from "@/lib/i18n";
import { sendEmail, staffRecipient } from "../email.server";
import { logNotification, type NotificationOutcome } from "../log.server";
import type { BookingEvent, NotificationProvider, NotificationResult } from "../model/events";
import type { EmailDeliveryResult } from "../transport/types";

type Translate = ReturnType<typeof translator>;

function statusKey(event: BookingEvent): "confirmed" | "cancelled" | "completed" | null {
  if (event.type === "booking.confirmed") return "confirmed";
  if (event.type === "booking.cancelled") return "cancelled";
  if (event.type === "booking.completed") return "completed";
  return null;
}

function factLines(event: BookingEvent, t: Translate): string[] {
  const when = event.date
    ? `${event.date}${event.time ? ` · ${event.time}` : ""}`
    : t("booking.notifications.client.dateUnset");
  return [
    `${t("booking.notifications.client.service")}: ${event.service.title}`,
    `${t("booking.notifications.client.date")}: ${when}`,
    `${t("booking.notifications.client.reference")}: ${event.reference}`,
  ];
}

function clientMessage(event: BookingEvent, t: Translate) {
  const service = event.service.title;
  const key = statusKey(event);
  if (!key) {
    return {
      subject: t("booking.notifications.client.subject", { service }),
      text: [
        t("booking.notifications.client.heading"),
        "",
        ...factLines(event, t),
        "",
        t("booking.notifications.client.received"),
        t("booking.notifications.client.nextStep"),
      ].join("\n"),
    };
  }
  return {
    subject: t(`booking.notifications.status.${key}.subject`, { service }),
    text: [t(`booking.notifications.status.${key}.heading`), "", ...factLines(event, t)].join("\n"),
  };
}

/** Personel widzi dane operacyjne: kontakt klienta, język i status. */
function staffMessage(event: BookingEvent, t: Translate) {
  const service = event.service.title;
  const key = statusKey(event);
  const heading = key
    ? t(`booking.notifications.status.${key}.heading`)
    : t("booking.notifications.staff.heading");
  return {
    subject: key
      ? t("booking.notifications.staff.statusSubject", { service })
      : t("booking.notifications.staff.subject", { service }),
    text: [
      heading,
      "",
      ...factLines(event, t),
      `${t("booking.notifications.staff.customer")}: ${event.customerName}`,
      `${t("booking.notifications.staff.contact")}: ${event.customerEmail}`,
      `${t("booking.notifications.staff.language")}: ${event.locale.toUpperCase()}`,
      `${t("booking.notifications.staff.status")}: ${event.status}`,
    ].join("\n"),
  };
}

function outcome(result: EmailDeliveryResult): NotificationOutcome {
  if (result.delivered) return "sent";
  if (result.reason === "not_configured") return "not_configured";
  if (result.code === "invalid_recipient") return "invalid_recipient";
  return "failed";
}

export const emailProvider: NotificationProvider = {
  id: "email",

  isConfigured() {
    // Konfigurację transportu rozstrzyga `email.server.ts`; tu tylko delegujemy.
    return true;
  },

  async notify(event: BookingEvent): Promise<NotificationResult> {
    const t = translator(event.locale);

    const client = await sendEmail({
      to: event.customerEmail,
      idempotencyKey: `${event.type}-${event.bookingId}-client`,
      ...clientMessage(event, t),
    });
    logNotification({
      reference: event.reference,
      event: event.type,
      channel: "email",
      recipient: "client",
      address: event.customerEmail,
      result: outcome(client),
    });

    const staffTo = staffRecipient();
    if (staffTo) {
      const staff = await sendEmail({
        to: staffTo,
        idempotencyKey: `${event.type}-${event.bookingId}-staff`,
        ...staffMessage(event, t),
      });
      logNotification({
        reference: event.reference,
        event: event.type,
        channel: "email",
        recipient: "staff",
        address: staffTo,
        result: outcome(staff),
      });
    }

    if (client.delivered) return { handled: true, provider: "email" };
    return {
      handled: false,
      provider: "email",
      reason: client.reason === "not_configured" ? "not_configured" : "error",
    };
  },
};
