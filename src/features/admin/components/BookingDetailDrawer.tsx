import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { serviceTitle, servicePriceLabel } from "@/features/admin/lib/service-title";
import { formatMoment } from "@/features/experience/lib/format";
import {
  ALLOWED_TRANSITIONS,
  STATUS_KEY,
  isBookingStatus,
  isDestructive,
} from "@/features/booking/model/status";
import type { BookingStatus } from "@/features/booking/model/types";
import type { AdminBookingRow } from "@/features/admin/model/types";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * LIORA P0.29 — panel szczegółów rezerwacji.
 *
 * Widok czyta wyłącznie to, co serwer zdecydował się przekazać: moderator
 * dostaje identyfikator LIORA, admin dodatkowo dane kontaktowe. Zmiana stanu
 * idzie tą samą, jedyną mutacją serwerową co lista.
 */
export function BookingDetailDrawer({
  row,
  pendingCancelId,
  isPending,
  onAct,
  onClose,
}: {
  row: AdminBookingRow | null;
  pendingCancelId: string | null;
  isPending: boolean;
  onAct: (row: AdminBookingRow, next: BookingStatus) => void;
  onClose: () => void;
}) {
  const { t, language } = useLanguage();
  if (!row) return null;

  const status = isBookingStatus(row.status) ? row.status : null;
  const transitions = status ? ALLOWED_TRANSITIONS[status] : [];

  const field = (label: string, value: string) => (
    <div className="grid gap-1">
      <dt className="eyebrow text-foreground/55">{label}</dt>
      <dd className="break-words text-sm text-foreground/75">{value}</dd>
    </div>
  );

  return (
    <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {t("admin.bookings.detail.title")}
          </DialogTitle>
          <DialogDescription className="font-mono text-xs tracking-[0.12em] text-gold">
            {row.name ? `${row.lioraId} · ${row.name}` : row.lioraId}
          </DialogDescription>
        </DialogHeader>

        <dl className="grid gap-4">
          {field(
            t("admin.bookings.columns.status"),
            status ? t(`admin.bookings.filters.${STATUS_KEY[status]}`) : row.status,
          )}
          {field(t("admin.bookings.columns.type"), serviceTitle(row.serviceSlug))}
          {/* P0.34 — cena z istniejącej oferty; brak pozycji = brak wiersza. */}
          {(() => {
            const price = servicePriceLabel(row.serviceSlug);
            if (price === null) return null;
            return field(
              t("admin.bookings.detail.price"),
              price === "0" ? t("admin.bookings.detail.priceFree") : price,
            );
          })()}
          {field(
            t("admin.bookings.columns.date"),
            `${row.preferredDate ?? t("admin.bookings.noDate")}${
              row.preferredTime ? ` · ${row.preferredTime.slice(0, 5)}` : ""
            }`,
          )}
          {field(t("admin.bookings.columns.requestedAt"), formatMoment(row.createdAt, language))}
          {field(t("admin.bookings.detail.updatedAt"), formatMoment(row.updatedAt, language))}
          {field(
            t("admin.bookings.detail.language"),
            t(`admin.bookings.languages.${row.language === "en" ? "en" : "pl"}`),
          )}
          {row.email ? field(t("admin.bookings.detail.contact"), row.email) : null}
          {row.message ? field(t("admin.bookings.detail.message"), row.message) : null}
        </dl>

        <div className="mt-2 flex flex-wrap gap-2">
          {transitions.map((target) => (
            <Button
              key={target}
              type="button"
              size="sm"
              className="min-h-11"
              variant={isDestructive(target) ? "ghost" : "gold"}
              disabled={isPending}
              onClick={() => onAct(row, target)}
            >
              {isDestructive(target) && pendingCancelId === row.id
                ? t("admin.bookings.actions.confirmCancel")
                : t(`admin.bookings.actions.${STATUS_KEY[target]}`)}
            </Button>
          ))}
          <Button type="button" size="sm" variant="outline" className="min-h-11" onClick={onClose}>
            {t("admin.bookings.detail.close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
