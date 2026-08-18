/**
 * LIORA P0.30 — dyspozytor poleceń bota administracyjnego (server-only).
 *
 * Bot jest INTERFEJSEM, nie nowym systemem. Każde polecenie sprowadza się do
 * wywołania istniejącej funkcji z `@/lib/admin.server` albo `@/lib/schedule.server`
 * — te same reguły przejść statusów, ta sama autoryzacja roli, ten sam zapis
 * i te same powiadomienia co w panelu webowym. Nie ma tu drugiej logiki
 * biznesowej ani drugiej listy uprawnień.
 *
 * Prywatność: odpowiedzi używają znaku LIORA i nazwy usługi. Bot nigdy nie
 * wypisuje e-maila, telefonu, treści wiadomości klienta ani identyfikatorów
 * technicznych.
 */
import { toLioraId } from "@/features/experience/lib/liora-id";
import { isLioraId } from "@/features/experience/lib/liora-id";
import { translator } from "@/lib/i18n";
import { botLanguage } from "@/lib/telegram/config.server";
import { resolveStaffIdentity, type StaffIdentity } from "./auth.server";
import type { TelegramCommand } from "@/lib/telegram/update.server";
import type { AdminBookingRow } from "@/features/admin/model/types";
import type { BookingStatus } from "@/features/booking/model/types";

const WEEKDAYS = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "So"];

function t() {
  return translator(botLanguage());
}

function reference(row: AdminBookingRow): string {
  return toLioraId(row.id);
}

function when(row: AdminBookingRow): string {
  if (!row.preferredDate) return "—";
  return row.preferredTime
    ? `${row.preferredDate} ${row.preferredTime.slice(0, 5)}`
    : row.preferredDate;
}

function serviceLabel(row: AdminBookingRow): string {
  return row.serviceSlug;
}

function line(row: AdminBookingRow): string {
  return t()("telegram.admin.bookingLine", {
    reference: reference(row),
    service: serviceLabel(row),
    date: when(row),
    status: row.status,
  });
}

async function loadBookings(identity: StaffIdentity): Promise<AdminBookingRow[]> {
  const { listBookings } = await import("@/lib/admin.server");
  return listBookings(identity.supabase, identity.role);
}

function findByReference(
  rows: AdminBookingRow[],
  input: string | undefined,
): AdminBookingRow | null {
  if (!input) return null;
  const wanted = input.trim().toUpperCase();
  if (!isLioraId(wanted)) return null;
  return rows.find((row) => toLioraId(row.id) === wanted) ?? null;
}

async function changeStatus(
  identity: StaffIdentity,
  args: string[],
  next: BookingStatus,
  usage: string,
): Promise<string> {
  const translate = t();
  const rows = await loadBookings(identity);
  const target = findByReference(rows, args[0]);
  if (!args[0]) return translate("telegram.common.usage", { usage });
  if (!target) return translate("telegram.admin.notFound", { reference: args[0] });

  try {
    const { updateBookingStatus } = await import("@/lib/admin.server");
    const updated = await updateBookingStatus(identity.supabase, identity.role, target.id, next);
    return translate("telegram.admin.statusChanged", {
      reference: reference(updated),
      status: updated.status,
    });
  } catch {
    return translate("telegram.admin.statusRefused", {
      reference: reference(target),
      status: next,
    });
  }
}

function section(title: string, lines: string[], empty: string): string {
  return lines.length > 0 ? [title, "", ...lines].join("\n") : `${title}\n\n${empty}`;
}

async function handleAuthorized(identity: StaffIdentity, input: TelegramCommand): Promise<string> {
  const translate = t();

  switch (input.command) {
    case "/start":
      return translate("telegram.admin.welcome", { name: "LIORA" });

    case "/help":
      return translate("telegram.admin.help");

    case "/bookings": {
      const rows = (await loadBookings(identity)).filter((row) => row.status === "new");
      return section(
        translate("telegram.admin.bookingsTitle"),
        rows.slice(0, 15).map(line),
        translate("telegram.common.empty"),
      );
    }

    case "/today": {
      const today = new Date().toISOString().slice(0, 10);
      const rows = (await loadBookings(identity)).filter(
        (row) => row.preferredDate === today && row.status !== "cancelled",
      );
      return section(
        translate("telegram.admin.todayTitle"),
        rows.map(line),
        translate("telegram.common.empty"),
      );
    }

    case "/booking": {
      if (!input.args[0]) {
        return translate("telegram.common.usage", { usage: "/booking LIO-XXXX-XXXX" });
      }
      const target = findByReference(await loadBookings(identity), input.args[0]);
      if (!target) return translate("telegram.admin.notFound", { reference: input.args[0] });
      return translate("telegram.admin.bookingDetail", {
        reference: reference(target),
        service: serviceLabel(target),
        date: when(target),
        status: target.status,
        language: target.language.toUpperCase(),
      });
    }

    case "/confirm":
      return changeStatus(identity, input.args, "confirmed", "/confirm LIO-XXXX-XXXX");
    case "/cancel":
      return changeStatus(identity, input.args, "cancelled", "/cancel LIO-XXXX-XXXX");
    case "/done":
      return changeStatus(identity, input.args, "done", "/done LIO-XXXX-XXXX");

    case "/schedule": {
      const { listSchedule } = await import("@/lib/schedule.server");
      const entries = (await listSchedule(identity.supabase)).filter((entry) => entry.isActive);
      return section(
        translate("telegram.admin.scheduleTitle"),
        entries.map((entry) =>
          translate("telegram.admin.scheduleLine", {
            weekday: WEEKDAYS[entry.weekday] ?? String(entry.weekday),
            from: entry.fromTime.slice(0, 5),
            to: entry.toTime.slice(0, 5),
          }),
        ),
        translate("telegram.admin.scheduleEmpty"),
      );
    }

    case "/summary": {
      const { summarize } = await import("@/lib/admin.server");
      const summary = await summarize(identity.supabase);
      return [
        translate("telegram.admin.summaryTitle"),
        "",
        translate("telegram.admin.summaryLine", {
          pending: summary.awaiting,
          confirmed: summary.confirmed,
          today: summary.todayPeople,
        }),
      ].join("\n");
    }

    default:
      return translate("telegram.common.unknownCommand");
  }
}

/** Zwraca gotową treść odpowiedzi. NIGDY nie rzuca. */
export async function routeAdminCommand(input: TelegramCommand): Promise<string> {
  const translate = t();
  const identity = await resolveStaffIdentity(input.fromId);
  if (!identity) return translate("telegram.common.notAuthorized");

  try {
    return await handleAuthorized(identity, input);
  } catch {
    return translate("telegram.common.error");
  }
}
