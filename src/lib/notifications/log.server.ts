/**
 * LIORA P0.30 — bezpieczne logowanie powiadomień.
 *
 * Log serwerowy nigdy nie zawiera pełnego adresu, wiadomości klienta, tokenów
 * ani payloadu osobowego. Wystarczy: referencja rezerwacji, zdarzenie, kanał,
 * typ odbiorcy, wynik i zamaskowany adres.
 */

export type NotificationRecipient = "client" | "staff";
export type NotificationOutcome = "sent" | "failed" | "not_configured" | "invalid_recipient";

/** `anna.kowalska@example.com` → `a***@example.com`. */
export function maskEmail(value: string): string {
  const trimmed = value.trim();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0) return "***";
  return `${trimmed[0]}***${trimmed.slice(at)}`;
}

export function logNotification(entry: {
  reference: string;
  event: string;
  channel: string;
  recipient: NotificationRecipient;
  address: string;
  result: NotificationOutcome;
}): void {
  console.info(
    `[notifications] ${new Date().toISOString()} ${entry.event} channel=${entry.channel} ` +
      `recipient=${entry.recipient} to=${maskEmail(entry.address)} ` +
      `ref=${entry.reference} result=${entry.result}`,
  );
}
