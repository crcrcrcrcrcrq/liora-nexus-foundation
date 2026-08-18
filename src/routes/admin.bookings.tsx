import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminCard, AdminHeader } from "@/features/admin/components/AdminShell";
import { adminHead } from "@/features/admin/lib/head";
import { EmptyState, ErrorState, LoadingState } from "@/components/state/States";
import { serviceTitle } from "@/features/admin/lib/service-title";
import { useAdminBookings, useBookingStatusMutation } from "@/features/admin/hooks/useAdminData";
import { BookingDetailDrawer } from "@/features/admin/components/BookingDetailDrawer";
import { usePublicServices } from "@/features/services/hooks/useServices";
import { formatMoment } from "@/features/experience/lib/format";
import { Button } from "@/components/ui/button";
import { TextInput, SelectInput } from "@/components/forms/fields";
import {
  ALLOWED_TRANSITIONS,
  STATUS_BY_KEY,
  STATUS_KEY,
  isBookingStatus,
  isDestructive,
} from "@/features/booking/model/status";
import type { BookingStatus } from "@/features/booking/model/types";
import type { AdminBookingRow } from "@/features/admin/model/types";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { translate as t } from "@/lib/i18n";

export const Route = createFileRoute("/admin/bookings")({
  head: () => adminHead(t("admin.meta.bookings.title")),
  component: AdminBookings,
});

const FILTER_KEYS = ["all", "new", "confirmed", "completed", "cancelled"] as const;
const LANGUAGE_KEYS = ["all", "pl", "en"] as const;
const SORT_KEYS = ["updated", "created", "date"] as const;

type FilterKey = (typeof FILTER_KEYS)[number];
type LanguageKey = (typeof LANGUAGE_KEYS)[number];
type SortKey = (typeof SORT_KEYS)[number];

/** Etykieta stanu: zawsze tekst, nigdy sam kolor (a11y). */
function statusLabel(status: string, translateKey: (key: string) => string): string {
  if (!isBookingStatus(status)) return status;
  return translateKey(`admin.bookings.filters.${STATUS_KEY[status]}`);
}

/** Sortowanie: brak terminu ląduje na końcu, nie na początku listy. */
function compareRows(a: AdminBookingRow, b: AdminBookingRow, sort: SortKey): number {
  if (sort === "date") {
    const left = a.preferredDate ?? "";
    const right = b.preferredDate ?? "";
    if (!left && !right) return 0;
    if (!left) return 1;
    if (!right) return -1;
    return left.localeCompare(right);
  }
  const key = sort === "created" ? "createdAt" : "updatedAt";
  return b[key].localeCompare(a[key]);
}

/**
 * Rezerwacje — realne zgłoszenia z tabeli `bookings`, czytane pod RLS.
 * Osoba jest widoczna wyłącznie pod identyfikatorem LIORA; imię, e-mail i
 * wiadomość dołącza serwer tylko dla roli `admin`.
 *
 * P0.29: filtry (stan, dzień, usługa, język), sortowanie, panel szczegółów
 * i zmiana statusu przez jedną bezpieczną mutację serwerową.
 */
function AdminBookings() {
  const { t, language } = useLanguage();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [date, setDate] = useState("");
  const [service, setService] = useState("all");
  const [bookingLanguage, setBookingLanguage] = useState<LanguageKey>("all");
  const [sort, setSort] = useState<SortKey>("updated");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [pendingCancel, setPendingCancel] = useState<string | null>(null);
  const bookings = useAdminBookings();
  const status = useBookingStatusMutation();
  const { offers } = usePublicServices();

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (bookings.data ?? [])
      .filter((row) => {
        if (filter !== "all" && row.status !== STATUS_BY_KEY[filter]) return false;
        if (date && row.preferredDate !== date) return false;
        if (service !== "all" && row.serviceSlug !== service) return false;
        if (bookingLanguage !== "all" && row.language !== bookingLanguage) return false;
        if (!needle) return true;
        return [row.lioraId, row.name, row.email, row.serviceSlug]
          .filter((value): value is string => typeof value === "string")
          .some((value) => value.toLowerCase().includes(needle));
      })
      .sort((a, b) => compareRows(a, b, sort));
  }, [bookings.data, filter, date, service, bookingLanguage, search, sort]);

  const openRow = useMemo(() => rows.find((row) => row.id === openId) ?? null, [rows, openId]);

  const act = (row: AdminBookingRow, next: BookingStatus) => {
    if (isDestructive(next) && pendingCancel !== row.id) {
      setPendingCancel(row.id);
      return;
    }
    setPendingCancel(null);
    status.mutate({ id: row.id, status: next });
  };

  const actions = (row: AdminBookingRow) => {
    if (!isBookingStatus(row.status)) return null;
    const next = ALLOWED_TRANSITIONS[row.status];
    if (next.length === 0) return null;
    return (
      <div className="flex flex-wrap items-center gap-2">
        {next.map((target) => (
          <Button
            key={target}
            type="button"
            size="sm"
            className="min-h-11"
            variant={isDestructive(target) ? "ghost" : "gold"}
            disabled={status.isPending}
            onClick={() => act(row, target)}
          >
            {isDestructive(target) && pendingCancel === row.id
              ? t("admin.bookings.actions.confirmCancel")
              : t(`admin.bookings.actions.${STATUS_KEY[target]}`)}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div className="grid w-full max-w-full gap-8 overflow-x-hidden">
      <AdminHeader
        title={t("admin.bookings.title")}
        description={t("admin.bookings.description")}
      />

      <AdminCard title={t("admin.bookings.filtersTitle")}>
        <div className="grid gap-4">
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label={t("admin.bookings.columns.status")}
          >
            {FILTER_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                aria-pressed={filter === key}
                className={cn(
                  "min-h-11 rounded-sm border px-3 py-1.5 text-xs uppercase tracking-[var(--tracking-luxe)] transition-colors duration-500",
                  filter === key
                    ? "border-gold/40 text-gold"
                    : "border-border text-foreground/55 hover:text-foreground/80",
                )}
              >
                {t(`admin.bookings.filters.${key}`)}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="grid gap-2 text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
              {t("admin.bookings.columns.date")}
              <TextInput
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>
            <label className="grid gap-2 text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
              {t("admin.bookings.columns.type")}
              <SelectInput value={service} onChange={(event) => setService(event.target.value)}>
                <option value="all" className="bg-surface">
                  {t("admin.bookings.filters.all")}
                </option>
                {offers.map((item) => (
                  <option key={item.offer.slug} value={item.offer.slug} className="bg-surface">
                    {item.offer.title}
                  </option>
                ))}
              </SelectInput>
            </label>
            <label className="grid gap-2 text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
              {t("admin.bookings.detail.language")}
              <SelectInput
                value={bookingLanguage}
                onChange={(event) => setBookingLanguage(event.target.value as LanguageKey)}
              >
                {LANGUAGE_KEYS.map((key) => (
                  <option key={key} value={key} className="bg-surface">
                    {key === "all"
                      ? t("admin.bookings.filters.all")
                      : t(`admin.bookings.languages.${key}`)}
                  </option>
                ))}
              </SelectInput>
            </label>
            <label className="grid gap-2 text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
              {t("admin.bookings.sortLabel")}
              <SelectInput
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
              >
                {SORT_KEYS.map((key) => (
                  <option key={key} value={key} className="bg-surface">
                    {t(`admin.bookings.sort.${key}`)}
                  </option>
                ))}
              </SelectInput>
            </label>
            <label className="grid gap-2 text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/55 sm:col-span-2 lg:col-span-1">
              {t("admin.bookings.searchLabel")}
              <TextInput
                type="search"
                value={search}
                placeholder={t("admin.bookings.searchPlaceholder")}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>
        </div>
      </AdminCard>

      <AdminCard>
        <div>
          {bookings.isPending ? (
            <LoadingState />
          ) : bookings.isError ? (
            <ErrorState onRetry={() => void bookings.refetch()} />
          ) : rows.length === 0 ? (
            <EmptyState
              title={t("admin.bookings.empty.title")}
              description={t("admin.bookings.empty.description")}
            />
          ) : (
            <div className="grid gap-4">
              <p role="status" className="text-xs text-foreground/50">
                {t("admin.bookings.resultsCount").replace("{{count}}", String(rows.length))}
              </p>
              <ul className="grid gap-4">
                {rows.map((row) => (
                  <li
                    key={row.id}
                    className="grid min-w-0 gap-3 border-b border-border pb-4 text-sm text-foreground/60 last:border-0"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <span className="min-w-0 break-all font-mono text-xs tracking-[0.12em] text-gold">
                        {row.name ? `${row.lioraId} · ${row.name}` : row.lioraId}
                      </span>
                      <span
                        className={cn(
                          "rounded-sm border px-2 py-1 text-[0.7rem] uppercase tracking-[var(--tracking-luxe)]",
                          row.status === "new"
                            ? "border-gold/40 text-gold"
                            : "border-border text-foreground/55",
                        )}
                      >
                        {statusLabel(row.status, t)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-foreground/50">
                      <span className="break-words">{serviceTitle(row.serviceSlug)}</span>
                      <span>
                        {row.preferredDate ?? t("admin.bookings.noDate")}
                        {row.preferredTime ? ` · ${row.preferredTime.slice(0, 5)}` : ""}
                      </span>
                      <span>{formatMoment(row.createdAt, language)}</span>
                      <span className="uppercase tracking-[var(--tracking-luxe)]">
                        {t(`admin.bookings.languages.${row.language === "en" ? "en" : "pl"}`)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="min-h-11"
                        onClick={() => {
                          setPendingCancel(null);
                          setOpenId(row.id);
                        }}
                      >
                        {t("admin.bookings.detail.show")}
                      </Button>
                      {actions(row)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {status.isError ? (
            <p role="alert" className="mt-6 text-sm text-destructive">
              {t("admin.bookings.actions.error")}
            </p>
          ) : null}
        </div>
      </AdminCard>

      <BookingDetailDrawer
        row={openRow}
        pendingCancelId={pendingCancel}
        isPending={status.isPending}
        onAct={act}
        onClose={() => {
          setPendingCancel(null);
          setOpenId(null);
        }}
      />

      <AdminCard title={t("admin.bookings.servicesTitle")}>
        <ul className="grid gap-3">
          {offers.map(({ offer }) => (
            <li
              key={offer.slug}
              className="flex items-center justify-between border-b border-border pb-3 text-sm text-foreground/60"
            >
              <span>{offer.title}</span>
              <span className="text-xs text-foreground/55">{offer.duration}</span>
            </li>
          ))}
        </ul>
      </AdminCard>
    </div>
  );
}
