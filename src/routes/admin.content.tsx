import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useBlocker } from "@tanstack/react-router";
import { AdminCard, AdminHeader } from "@/features/admin/components/AdminShell";
import { adminHead } from "@/features/admin/lib/head";
import { useLanguage } from "@/hooks/useLanguage";
import { translate as t } from "@/lib/i18n";
import { SUPPORTED_LANGUAGES, type Language } from "@/config/i18n";
import { withLocalePrefix } from "@/config/routes";
import { CMS_SECTIONS, CMS_VALUE_MAX_LENGTH } from "@/features/cms/model/fields";
import { readDefaultValue } from "@/features/cms/lib/overrides";
import { ThemeManager } from "@/features/cms/components/ThemeManager";
import { fetchCmsAdminBundle, saveCmsContent } from "@/lib/cms.functions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/content")({
  head: () => adminHead(t("admin.content.title")),
  component: AdminContent,
});

type Draft = Record<string, string>;
/**
 * DEFAULT   — wartość pochodzi wyłącznie ze słownika i18n,
 * OVERRIDE  — istnieje zapisane nadpisanie w CMS,
 * UNSAVED   — istnieje lokalna zmiana w panelu (priorytet wizualny nad OVERRIDE).
 */
type FieldState = "default" | "override" | "unsaved";

const ALL_SECTIONS = "all";
/** Zakres języka edycji: jeden język albo oba, rozdzielone kolumnami. */
type EditLocale = Language | "both";
const EDIT_LOCALE_OPTIONS: EditLocale[] = ["pl", "en", "both"];

const draftKey = (locale: Language, key: string) => `${locale}::${key}`;

/** Odłożona zmiana zakresu panelu, gdy istnieją niezapisane zmiany. */
type PendingSwitch =
  { kind: "section"; sectionId: string } | { kind: "locale"; locale: EditLocale };

function AdminContent() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [sectionId, setSectionId] = useState<string>(ALL_SECTIONS);
  const [editLocale, setEditLocale] = useState<EditLocale>("both");
  const [draft, setDraft] = useState<Draft>({});
  const [query, setQuery] = useState("");
  const [pendingSwitch, setPendingSwitch] = useState<PendingSwitch | null>(null);

  const bundleQuery = useQuery({
    queryKey: ["cms", "admin"],
    queryFn: () => fetchCmsAdminBundle(),
    retry: false,
  });

  const section = useMemo(
    () => CMS_SECTIONS.find((item) => item.id === sectionId) ?? null,
    [sectionId],
  );

  const bundle = bundleQuery.data;

  /** Języki widoczne i zapisywane — wynikają wyłącznie z wyboru w panelu. */
  const editedLocales = useMemo<Language[]>(
    () => (editLocale === "both" ? [...SUPPORTED_LANGUAGES] : [editLocale]),
    [editLocale],
  );

  const stored = useCallback(
    (locale: Language, key: string) => bundle?.content[locale][key] ?? "",
    [bundle],
  );

  const current = useCallback(
    (locale: Language, key: string) => draft[draftKey(locale, key)] ?? stored(locale, key),
    [draft, stored],
  );

  const fieldState = useCallback(
    (locale: Language, key: string): FieldState => {
      const saved = stored(locale, key);
      const value = draft[draftKey(locale, key)];
      if (value !== undefined && value !== saved) return "unsaved";
      return saved.trim() === "" ? "default" : "override";
    },
    [draft, stored],
  );

  // Draft żyje poza filtrem, sekcją i językiem — przełączanie zakresu panelu
  // nigdy nie kasuje niezapisanych zmian.
  const dirtyEntries = useMemo(
    () =>
      Object.entries(draft)
        .map(([composite, value]) => {
          const [locale, key] = composite.split("::") as [Language, string];
          return { locale, key, value };
        })
        .filter((entry) => entry.value !== stored(entry.locale, entry.key)),
    [draft, stored],
  );

  /** Zapis i odrzucenie działają wyłącznie w aktualnym zakresie języka. */
  const scopedDirty = useMemo(
    () => dirtyEntries.filter((entry) => editedLocales.includes(entry.locale)),
    [dirtyEntries, editedLocales],
  );
  const outOfScopeDirty = dirtyEntries.length - scopedDirty.length;

  const saveContent = useMutation({
    mutationFn: () => saveCmsContent({ data: { entries: scopedDirty } }),
    onSuccess: (next) => {
      queryClient.setQueryData(["cms", "admin"], next);
      setDraft((prev) => {
        const rest = { ...prev };
        for (const entry of scopedDirty) delete rest[draftKey(entry.locale, entry.key)];
        return rest;
      });
    },
  });

  const discardScoped = useCallback(() => {
    setDraft((prev) => {
      const rest = { ...prev };
      for (const entry of scopedDirty) delete rest[draftKey(entry.locale, entry.key)];
      return rest;
    });
  }, [scopedDirty]);

  /**
   * Reset pojedynczego nadpisania: pusta wartość = usunięcie override
   * (semantyka P0.19). Dotyczy wyłącznie wskazanego języka.
   */
  const resetContent = useMutation({
    mutationFn: (input: { locale: Language; key: string }) =>
      saveCmsContent({ data: { entries: [{ ...input, value: "" }] } }),
    onSuccess: (next, input) => {
      queryClient.setQueryData(["cms", "admin"], next);
      setDraft((prev) => {
        const rest = { ...prev };
        delete rest[draftKey(input.locale, input.key)];
        return rest;
      });
    },
  });

  /** Nadpisania sekcji w językach aktualnie edytowanych w panelu. */
  const sectionOverrides = useMemo(() => {
    if (!section) return [];
    const entries: { locale: Language; key: string }[] = [];
    for (const locale of editedLocales) {
      for (const field of section.fields) {
        if (stored(locale, field.key).trim() !== "") entries.push({ locale, key: field.key });
      }
    }
    return entries;
  }, [section, stored, editedLocales]);

  /** Reset sekcji: tylko bieżąca sekcja i tylko wybrane języki edycji. */
  const resetSection = useMutation({
    mutationFn: async (input: { entries: { locale: Language; key: string }[] }) => {
      let next = bundle!;
      for (let i = 0; i < input.entries.length; i += 100) {
        next = await saveCmsContent({
          data: {
            entries: input.entries.slice(i, i + 100).map((entry) => ({ ...entry, value: "" })),
          },
        });
      }
      return next;
    },
    onSuccess: (next, input) => {
      queryClient.setQueryData(["cms", "admin"], next);
      setDraft((prev) => {
        const rest = { ...prev };
        for (const entry of input.entries) delete rest[draftKey(entry.locale, entry.key)];
        return rest;
      });
    },
  });

  const normalizedQuery = query.trim().toLowerCase();

  /** Wyszukiwanie działa wyłącznie lokalnie — bez żadnych zapytań do backendu. */
  const visibleFields = useMemo(() => {
    const sections = section ? [section] : CMS_SECTIONS;
    const matches: {
      field: (typeof CMS_SECTIONS)[number]["fields"][number];
      sectionLabelKey: string;
    }[] = [];

    for (const item of sections) {
      const sectionLabel = t(item.labelKey).toLowerCase();
      for (const field of item.fields) {
        if (!normalizedQuery) {
          matches.push({ field, sectionLabelKey: item.labelKey });
          continue;
        }
        const haystack = [
          field.key,
          item.id,
          sectionLabel,
          ...editedLocales.map((locale) => readDefaultValue(locale, field.key)),
          ...editedLocales.map((locale) => current(locale, field.key)),
        ]
          .join(" ")
          .toLowerCase();
        if (haystack.includes(normalizedQuery)) {
          matches.push({ field, sectionLabelKey: item.labelKey });
        }
      }
    }

    return matches;
  }, [normalizedQuery, section, current, t, editedLocales]);

  /** Liczby pól / nadpisań / zmian na sekcję — w aktualnym zakresie języka. */
  const sectionStats = useMemo(() => {
    const stats = new Map<string, { fields: number; overrides: number; unsaved: number }>();
    for (const item of CMS_SECTIONS) {
      let overrides = 0;
      let unsaved = 0;
      for (const locale of editedLocales) {
        for (const field of item.fields) {
          const saved = stored(locale, field.key);
          const value = draft[draftKey(locale, field.key)];
          if (value !== undefined && value !== saved) unsaved += 1;
          else if (saved.trim() !== "") overrides += 1;
        }
      }
      stats.set(item.id, { fields: item.fields.length * editedLocales.length, overrides, unsaved });
    }
    return stats;
  }, [editedLocales, stored, draft]);

  /** Opuszczenie panelu z niezapisanymi zmianami wymaga potwierdzenia. */
  const blocker = useBlocker({
    shouldBlockFn: () => dirtyEntries.length > 0,
    enableBeforeUnload: () => dirtyEntries.length > 0,
    withResolver: true,
  });

  const requestSection = (nextId: string) => {
    if (nextId === sectionId) return;
    if (scopedDirty.length > 0) {
      setPendingSwitch({ kind: "section", sectionId: nextId });
      return;
    }
    setSectionId(nextId);
  };

  const requestLocale = (nextLocale: EditLocale) => {
    if (nextLocale === editLocale) return;
    if (scopedDirty.length > 0) {
      setPendingSwitch({ kind: "locale", locale: nextLocale });
      return;
    }
    setEditLocale(nextLocale);
  };

  const applyPendingSwitch = () => {
    if (!pendingSwitch) return;
    if (pendingSwitch.kind === "section") setSectionId(pendingSwitch.sectionId);
    else setEditLocale(pendingSwitch.locale);
    setPendingSwitch(null);
  };

  if (bundleQuery.isLoading) {
    return (
      <div className="grid gap-8">
        <AdminHeader
          title={t("admin.content.title")}
          description={t("admin.content.description")}
        />
        <AdminCard>
          <p className="text-sm text-foreground/55">{t("admin.content.loading")}</p>
        </AdminCard>
      </div>
    );
  }

  if (bundleQuery.isError || !bundle) {
    return (
      <div className="grid gap-8">
        <AdminHeader
          title={t("admin.content.title")}
          description={t("admin.content.description")}
        />
        <AdminCard>
          <p className="text-sm text-destructive">{t("admin.content.unavailable")}</p>
        </AdminCard>
      </div>
    );
  }

  const badgeLabel: Record<FieldState, string> = {
    default: t("admin.content.badgeDefault"),
    override: t("admin.content.badgeOverridden"),
    unsaved: t("admin.content.badgeUnsaved"),
  };

  const badgeClass: Record<FieldState, string> = {
    default: "text-foreground/40",
    override: "text-gold",
    unsaved: "text-destructive",
  };

  const scopeLabel = editedLocales
    .map((locale) => t(`admin.content.languages.${locale}`))
    .join(" + ");

  return (
    <div className="grid min-w-0 gap-8">
      <AdminHeader title={t("admin.content.title")} description={t("admin.content.description")} />

      {/* Sticky toolbar: język edycji, stan zmian, Save / Discard, podgląd. */}
      <div className="sticky top-0 z-30 -mx-6 border-y border-border bg-surface/95 px-6 py-3 backdrop-blur lg:-mx-10 lg:px-10">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label={t("admin.content.languageLabel")}
          >
            <span className="text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
              {t("admin.content.languageLabel")}
            </span>
            {EDIT_LOCALE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={editLocale === option}
                onClick={() => requestLocale(option)}
                className={cn(
                  "rounded-sm border px-3 py-2 text-xs uppercase tracking-[var(--tracking-luxe)] transition-colors",
                  editLocale === option
                    ? "border-gold/50 bg-surface-raised text-gold"
                    : "border-border text-foreground/55 hover:text-foreground",
                )}
              >
                {option === "both"
                  ? t("admin.content.languageBoth")
                  : t(`admin.content.languages.${option}`)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={scopedDirty.length === 0 || saveContent.isPending}
              onClick={() => saveContent.mutate()}
              className="inline-flex h-11 items-center rounded-sm bg-gold px-5 text-xs uppercase tracking-[var(--tracking-luxe)] text-gold-foreground disabled:opacity-40"
            >
              {saveContent.isPending ? t("admin.content.saving") : t("admin.content.save")}
            </button>
            <button
              type="button"
              disabled={scopedDirty.length === 0}
              onClick={discardScoped}
              className="inline-flex h-11 items-center rounded-sm border border-border px-5 text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/70 disabled:opacity-40"
            >
              {t("admin.content.cancel")}
            </button>
          </div>

          <div className="flex min-w-0 flex-col gap-1 text-xs">
            <span
              className={cn(
                scopedDirty.length > 0 ? "text-destructive" : "text-foreground/55",
                "truncate",
              )}
            >
              {saveContent.isError || resetSection.isError || resetContent.isError
                ? t("admin.content.saveError")
                : scopedDirty.length > 0
                  ? t("admin.content.unsaved", { count: scopedDirty.length })
                  : saveContent.isSuccess
                    ? t("admin.content.saved")
                    : t("admin.content.noChanges")}
            </span>
            <span className="truncate text-foreground/40">
              {t("admin.content.saveScope", { language: scopeLabel })}
              {outOfScopeDirty > 0
                ? ` · ${t("admin.content.unsavedOutOfScope", { count: outOfScopeDirty })}`
                : ""}
            </span>
          </div>

          {/* Podgląd korzysta z istniejącego routingu locale-aware (/pl, /en). */}
          {section?.previewPath ? (
            <div className="flex flex-wrap items-center gap-2">
              {editedLocales.map((locale) => (
                <a
                  key={locale}
                  href={withLocalePrefix(section.previewPath!, locale)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center rounded-sm border border-gold/40 px-4 text-xs uppercase tracking-[var(--tracking-luxe)] text-gold transition-colors hover:bg-accent"
                >
                  {t("admin.content.previewIn", { locale: locale.toUpperCase() })}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Hierarchia sekcji: lista na desktopie, poziomy pasek na mobile. */}
        <nav
          aria-label={t("admin.content.sectionFilterLabel")}
          className="-mx-6 flex min-w-0 gap-2 overflow-x-auto px-6 pb-2 lg:mx-0 lg:grid lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0"
        >
          {[{ id: ALL_SECTIONS, labelKey: null as string | null }]
            .concat(CMS_SECTIONS.map((item) => ({ id: item.id, labelKey: item.labelKey })))
            .map((item) => {
              const stats = sectionStats.get(item.id);
              const active = item.id === sectionId;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => requestSection(item.id)}
                  className={cn(
                    "shrink-0 rounded-sm border px-3 py-2 text-left text-xs transition-colors lg:flex lg:w-full lg:items-center lg:justify-between lg:gap-2",
                    active
                      ? "border-gold/50 bg-surface-raised text-gold"
                      : "border-border text-foreground/55 hover:text-foreground",
                  )}
                >
                  <span className="uppercase tracking-[var(--tracking-luxe)]">
                    {item.labelKey ? t(item.labelKey) : t("admin.content.sectionAll")}
                  </span>
                  {stats ? (
                    <span className="ml-2 whitespace-nowrap text-[10px] text-foreground/40">
                      {stats.fields}
                      {stats.overrides > 0 ? ` · ${stats.overrides}★` : ""}
                      {stats.unsaved > 0 ? ` · ${stats.unsaved}•` : ""}
                    </span>
                  ) : null}
                </button>
              );
            })}
        </nav>

        <AdminCard
          title={section ? t(section.labelKey) : t("admin.content.sectionAll")}
          className="min-w-0 p-5 sm:p-8"
        >
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <label className="grid min-w-0 gap-2">
              <span className="text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
                {t("admin.content.searchLabel")}
              </span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("admin.content.searchPlaceholder")}
                aria-label={t("admin.content.searchLabel")}
                className="h-11 w-full rounded-sm border border-border bg-surface px-3 text-sm text-foreground"
              />
            </label>

            {section ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    disabled={sectionOverrides.length === 0 || resetSection.isPending}
                    className="h-11 rounded-sm border border-border px-4 text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/70 transition-colors hover:text-foreground disabled:opacity-40"
                  >
                    {resetSection.isPending
                      ? t("admin.content.resetting")
                      : t("admin.content.resetSection")}
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("admin.content.resetSectionTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("admin.content.resetSectionDescription", {
                        section: t(section.labelKey),
                        language: scopeLabel,
                      })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("admin.content.resetSectionCancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => resetSection.mutate({ entries: sectionOverrides })}
                    >
                      {t("admin.content.resetSectionConfirm")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap gap-4 text-xs text-foreground/55">
            {normalizedQuery ? (
              <span>{t("admin.content.searchResults", { count: visibleFields.length })}</span>
            ) : null}
            {section && sectionOverrides.length === 0 ? (
              <span>{t("admin.content.resetSectionEmpty")}</span>
            ) : null}
          </div>

          <div className="mt-8 grid gap-8">
            {visibleFields.length === 0 ? (
              <p className="text-sm text-foreground/55">{t("admin.content.searchEmpty")}</p>
            ) : null}
            {visibleFields.map(({ field, sectionLabelKey }) => (
              <div key={field.key} className="grid min-w-0 gap-3">
                <div className="flex flex-wrap items-baseline gap-3">
                  <p className="break-all font-mono text-[11px] text-foreground/45">{field.key}</p>
                  {!section || normalizedQuery ? (
                    <p className="text-[11px] uppercase tracking-[var(--tracking-luxe)] text-foreground/40">
                      {t(sectionLabelKey)}
                    </p>
                  ) : null}
                </div>
                <div className={cn("grid gap-4", editedLocales.length > 1 && "md:grid-cols-2")}>
                  {editedLocales.map((locale) => {
                    const value = current(locale, field.key);
                    const state = fieldState(locale, field.key);
                    const overridden = stored(locale, field.key).trim() !== "";
                    const fallback = readDefaultValue(locale, field.key);
                    const isResetting =
                      resetContent.isPending &&
                      resetContent.variables?.locale === locale &&
                      resetContent.variables?.key === field.key;
                    return (
                      <div
                        key={locale}
                        className="grid min-w-0 gap-2 rounded-sm border border-border/60 p-3 text-sm"
                      >
                        <label className="grid min-w-0 gap-2">
                          <span className="flex items-center justify-between gap-2 text-xs uppercase tracking-[var(--tracking-luxe)]">
                            <span className="rounded-sm border border-border px-2 py-0.5 text-foreground/70">
                              {locale.toUpperCase()}
                            </span>
                            <span className={badgeClass[state]}>{badgeLabel[state]}</span>
                          </span>
                          {field.kind === "textarea" ? (
                            <textarea
                              rows={4}
                              maxLength={CMS_VALUE_MAX_LENGTH}
                              value={value}
                              placeholder={fallback}
                              onChange={(event) =>
                                setDraft((prev) => ({
                                  ...prev,
                                  [draftKey(locale, field.key)]: event.target.value,
                                }))
                              }
                              className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm text-foreground"
                            />
                          ) : (
                            <input
                              type="text"
                              maxLength={CMS_VALUE_MAX_LENGTH}
                              value={value}
                              placeholder={fallback}
                              onChange={(event) =>
                                setDraft((prev) => ({
                                  ...prev,
                                  [draftKey(locale, field.key)]: event.target.value,
                                }))
                              }
                              className="h-11 w-full rounded-sm border border-border bg-surface px-3 text-sm text-foreground"
                            />
                          )}
                        </label>
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate text-[11px] text-foreground/40">
                            {t("admin.content.defaultPreview", { value: fallback })}
                          </span>
                          <button
                            type="button"
                            disabled={!overridden || resetContent.isPending}
                            onClick={() => resetContent.mutate({ locale, key: field.key })}
                            className="shrink-0 rounded-sm border border-border px-3 py-1 text-[11px] uppercase tracking-[var(--tracking-luxe)] text-foreground/70 transition-colors hover:text-foreground disabled:opacity-40"
                          >
                            {isResetting ? t("admin.content.resetting") : t("admin.content.reset")}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>

      {/* P0.26 — Theme Manager: preset + podgląd + zapis (site_settings). */}
      <ThemeManager settings={bundle.settings} />

      {/* Zmiana zakresu panelu z niezapisanymi zmianami — draft zostaje zachowany. */}
      <AlertDialog
        open={pendingSwitch !== null}
        onOpenChange={(open) => {
          if (!open) setPendingSwitch(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.content.switchTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.content.switchDescription", { count: scopedDirty.length })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.content.switchCancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={applyPendingSwitch}>
              {t("admin.content.switchConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Opuszczenie panelu z niezapisanymi zmianami. */}
      <AlertDialog open={blocker.status === "blocked"}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.content.leaveTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.content.leaveDescription", { count: dirtyEntries.length })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset?.()}>
              {t("admin.content.leaveCancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDraft({});
                blocker.proceed?.();
              }}
            >
              {t("admin.content.leaveConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
