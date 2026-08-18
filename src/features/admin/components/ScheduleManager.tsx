import { useEffect, useMemo, useState } from "react";
import { AdminCard, AdminHeader } from "@/features/admin/components/AdminShell";
import { ErrorState, LoadingState } from "@/components/state/States";
import { ProtectedRoute } from "@/features/identity/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { TextInput, SelectInput } from "@/components/forms/fields";
import {
  useBookingSchedule,
  useScheduleMutations,
  type ScheduleDraft,
} from "@/features/admin/hooks/useBookingSchedule";
import { useLanguage } from "@/hooks/useLanguage";

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0];

const EMPTY_DRAFT: ScheduleDraft = {
  weekday: 1,
  fromTime: "10:00",
  toTime: "18:00",
  isActive: true,
};

function sameDraft(a: ScheduleDraft, b: ScheduleDraft): boolean {
  return (
    a.weekday === b.weekday &&
    a.fromTime === b.fromTime &&
    a.toTime === b.toTime &&
    a.isActive === b.isActive
  );
}

/**
 * P0.29 — dwa aktywne przedziały tego samego dnia nie mogą na siebie zachodzić:
 * publiczna dostępność liczona z nakładek pokazywałaby terminy dwa razy.
 */
function overlaps(draft: ScheduleDraft, others: readonly ScheduleDraft[]): boolean {
  if (!draft.isActive) return false;
  return others.some(
    (other) =>
      other.id !== draft.id &&
      other.isActive &&
      other.weekday === draft.weekday &&
      draft.fromTime < other.toTime &&
      other.fromTime < draft.toTime,
  );
}

/**
 * LIORA P0.28 — panel grafiku dostępności (/admin/schedule).
 *
 * Grafik jest jedynym źródłem publicznej dostępności. Każdy zapis idzie przez
 * funkcje serwerowe: sesja SSR → rola personelu → RLS. Panel zna wyłącznie
 * dane widoku; rola nigdy nie pochodzi z frontendu.
 */
export function ScheduleManager() {
  const { t } = useLanguage();
  const schedule = useBookingSchedule();
  const { save, remove } = useScheduleMutations();
  const [drafts, setDrafts] = useState<Record<string, ScheduleDraft>>({});
  const [newEntry, setNewEntry] = useState<ScheduleDraft>(EMPTY_DRAFT);
  const [localError, setLocalError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const saved = useMemo(
    () =>
      (schedule.data ?? []).map<ScheduleDraft>((entry) => ({
        id: entry.id,
        weekday: entry.weekday,
        fromTime: entry.fromTime,
        toTime: entry.toTime,
        isActive: entry.isActive,
      })),
    [schedule.data],
  );

  const draftFor = (base: ScheduleDraft): ScheduleDraft => drafts[base.id!] ?? base;
  const dirty = saved.filter((base) => !sameDraft(draftFor(base), base));

  const patch = (base: ScheduleDraft, change: Partial<ScheduleDraft>) =>
    setDrafts((current) => ({ ...current, [base.id!]: { ...draftFor(base), ...change } }));

  const invalid = (draft: ScheduleDraft) => draft.toTime <= draft.fromTime;

  const current = saved.map(draftFor);

  // Ostrzeżenie przeglądarki: niezapisany grafik nie znika przy zamknięciu karty.
  useEffect(() => {
    if (dirty.length === 0) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty.length]);

  const saveAll = async () => {
    if (dirty.some(invalid)) {
      setLocalError(t("admin.schedule.invalidRange"));
      return;
    }
    if (dirty.some((base) => overlaps(draftFor(base), current))) {
      setLocalError(t("admin.schedule.overlap"));
      return;
    }
    setLocalError(null);
    for (const base of dirty) {
      await save.mutateAsync(draftFor(base));
    }
    setDrafts({});
    setSavedAt(Date.now());
  };

  const addEntry = async () => {
    if (invalid(newEntry)) {
      setLocalError(t("admin.schedule.invalidRange"));
      return;
    }
    if (overlaps(newEntry, current)) {
      setLocalError(t("admin.schedule.overlap"));
      return;
    }
    setLocalError(null);
    await save.mutateAsync(newEntry);
    setNewEntry(EMPTY_DRAFT);
    setSavedAt(Date.now());
  };

  const row = (draft: ScheduleDraft, onChange: (change: Partial<ScheduleDraft>) => void) => (
    <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
      <label className="grid gap-2 text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
        {t("admin.schedule.weekdayLabel")}
        <SelectInput
          value={String(draft.weekday)}
          onChange={(event) => onChange({ weekday: Number(event.target.value) })}
        >
          {WEEKDAYS.map((day) => (
            <option key={day} value={day} className="bg-surface">
              {t(`admin.schedule.weekdays.${day}`)}
            </option>
          ))}
        </SelectInput>
      </label>
      <label className="grid gap-2 text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
        {t("admin.schedule.from")}
        <TextInput
          type="time"
          value={draft.fromTime}
          onChange={(event) => onChange({ fromTime: event.target.value })}
        />
      </label>
      <label className="grid gap-2 text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
        {t("admin.schedule.to")}
        <TextInput
          type="time"
          value={draft.toTime}
          onChange={(event) => onChange({ toTime: event.target.value })}
        />
      </label>
      <label className="grid gap-2 text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
        {t("admin.schedule.active")}
        <SelectInput
          value={draft.isActive ? "1" : "0"}
          onChange={(event) => onChange({ isActive: event.target.value === "1" })}
        >
          <option value="1" className="bg-surface">
            {t("admin.schedule.active")}
          </option>
          <option value="0" className="bg-surface">
            {t("admin.schedule.inactive")}
          </option>
        </SelectInput>
      </label>
    </div>
  );

  return (
    <ProtectedRoute roles={["moderator", "admin"]}>
      <div className="grid w-full max-w-full gap-8 overflow-x-hidden">
        <AdminHeader
          title={t("admin.schedule.title")}
          description={t("admin.schedule.description")}
        />

        <AdminCard>
          {schedule.isPending ? (
            <LoadingState />
          ) : schedule.isError ? (
            <ErrorState onRetry={() => void schedule.refetch()} />
          ) : saved.length > 0 ? (
            <div className="grid gap-8">
              <ul className="grid gap-8">
                {saved.map((base) => (
                  <li
                    key={base.id}
                    className="grid gap-4 border-b border-border pb-8 last:border-0"
                  >
                    {row(draftFor(base), (change) => patch(base, change))}
                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="min-h-11"
                        disabled={remove.isPending}
                        onClick={() => remove.mutate(base.id!)}
                      >
                        {t("admin.schedule.remove")}
                      </Button>
                      {!sameDraft(draftFor(base), base) ? (
                        <span className="self-center text-xs text-gold">
                          {t("admin.schedule.unsaved")}
                        </span>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="gold"
                  size="sm"
                  className="min-h-11"
                  disabled={dirty.length === 0 || save.isPending}
                  onClick={() => void saveAll()}
                >
                  {save.isPending ? t("admin.schedule.saving") : t("admin.schedule.save")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-11"
                  disabled={dirty.length === 0 || save.isPending}
                  onClick={() => {
                    setDrafts({});
                    setLocalError(null);
                  }}
                >
                  {t("admin.schedule.discard")}
                </Button>
                {dirty.length > 0 ? (
                  <span className="text-xs text-gold">{t("admin.schedule.unsaved")}</span>
                ) : null}
              </div>
              {localError ? (
                <p role="alert" className="text-sm text-destructive">
                  {localError}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-2">
              <p className="font-display text-xl text-foreground">
                {t("admin.schedule.empty.title")}
              </p>
              <p className="text-sm text-foreground/50">{t("admin.schedule.empty.description")}</p>
            </div>
          )}
        </AdminCard>

        <AdminCard title={t("admin.schedule.add")}>
          <div className="grid gap-4">
            {row(newEntry, (change) => setNewEntry({ ...newEntry, ...change }))}
            <Button
              type="button"
              variant="gold"
              size="sm"
              className="min-h-11 justify-self-start"
              disabled={save.isPending}
              onClick={() => void addEntry()}
            >
              {save.isPending ? t("admin.schedule.saving") : t("admin.schedule.add")}
            </Button>
            {localError ? (
              <p role="alert" className="text-sm text-destructive">
                {localError}
              </p>
            ) : null}
            {save.isError ? (
              <p role="alert" className="text-sm text-destructive">
                {t("admin.schedule.saveError")}
              </p>
            ) : null}
            {savedAt && !save.isPending && !save.isError ? (
              <p role="status" className="text-sm text-foreground/60">
                {t("admin.schedule.saved")}
              </p>
            ) : null}
          </div>
        </AdminCard>
      </div>
    </ProtectedRoute>
  );
}
