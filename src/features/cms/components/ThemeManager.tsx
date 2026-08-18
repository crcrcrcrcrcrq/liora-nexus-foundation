/**
 * LIORA P0.26 — Theme Manager.
 *
 * Administrator wybiera wyłącznie jeden z presetów zdefiniowanych w kodzie
 * (`THEME_PRESETS`). Klik = podgląd lokalny (atrybut `data-theme` na
 * `document.documentElement`), zapis = `saveSiteSettings` z serwerową
 * autoryzacją personelu. Nigdy nie wstrzykujemy CSS-a ani HTML-a.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminCard } from "@/features/admin/components/AdminShell";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { saveSiteSettings } from "@/lib/cms.functions";
import {
  THEME_PRESETS,
  TEMPLATE_PRESETS,
  getThemePreset,
  type SiteSettings,
  type ThemeId,
  type ThemePreset,
} from "@/features/cms/model/theme";

/** Podgląd wybranego presetu bez zapisu — działa tylko w przeglądarce. */
function applyPreview(themeId: ThemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset["theme"] = themeId;
}

function PresetSwatches({ preset }: { preset: ThemePreset }) {
  const entries: [string, string][] = [
    ["background", preset.preview.background],
    ["surface", preset.preview.surface],
    ["accent", preset.preview.accent],
    ["text", preset.preview.foreground],
  ];
  return (
    <span className="flex gap-1.5" aria-hidden="true">
      {entries.map(([name, color]) => (
        <span
          key={name}
          className="h-4 w-4 rounded-full"
          style={{ backgroundColor: color, border: `1px solid ${preset.preview.border}` }}
        />
      ))}
    </span>
  );
}

/** Miniatura strony w kolorach presetu — wyłącznie tokeny z modelu theme. */
function PresetPreview({ preset }: { preset: ThemePreset }) {
  const { background, surface, accent, foreground, border } = preset.preview;
  return (
    <span
      aria-hidden="true"
      className="block overflow-hidden rounded-sm"
      style={{ background, border: `1px solid ${border}` }}
    >
      <span className="flex items-center justify-between px-3 py-2" style={{ background: surface }}>
        <span
          className="block h-1.5 w-10 rounded-full"
          style={{ background: accent, opacity: 0.9 }}
        />
        <span className="flex gap-1">
          {[0.6, 0.4, 0.25].map((opacity) => (
            <span
              key={opacity}
              className="block h-1 w-3 rounded-full"
              style={{ background: foreground, opacity }}
            />
          ))}
        </span>
      </span>
      <span className="block px-3 pb-4 pt-5">
        <span className="block h-2.5 w-3/4 rounded-full" style={{ background: foreground }} />
        <span
          className="mt-2 block h-1.5 w-full rounded-full"
          style={{ background: foreground, opacity: 0.4 }}
        />
        <span
          className="mt-1.5 block h-1.5 w-2/3 rounded-full"
          style={{ background: foreground, opacity: 0.25 }}
        />
        <span className="mt-4 flex items-center gap-2">
          <span
            className="block h-5 w-16 rounded-sm"
            style={{ background: accent, border: `1px solid ${border}` }}
          />
          <span
            className="block h-5 w-12 rounded-sm"
            style={{ background: surface, border: `1px solid ${accent}` }}
          />
        </span>
      </span>
    </span>
  );
}

export function ThemeManager({ settings }: { settings: SiteSettings }) {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<ThemeId>(settings.themeId);
  const savedRef = useRef<ThemeId>(settings.themeId);

  // Zapisany motyw z bundla jest jedynym źródłem prawdy po zapisie/odświeżeniu.
  useEffect(() => {
    savedRef.current = settings.themeId;
    setSelected(settings.themeId);
    applyPreview(settings.themeId);
  }, [settings.themeId]);

  // Opuszczenie panelu z niezapisanym podglądem przywraca zapisany motyw.
  useEffect(() => () => applyPreview(savedRef.current), []);

  const dirty = selected !== settings.themeId;

  const save = useMutation({
    mutationFn: () =>
      saveSiteSettings({ data: { themeId: selected, templateId: settings.templateId } }),
    onSuccess: () => {
      savedRef.current = selected;
      void queryClient.invalidateQueries({ queryKey: ["cms", "admin"] });
    },
  });

  const discard = useCallback(() => {
    setSelected(settings.themeId);
    applyPreview(settings.themeId);
    save.reset();
  }, [settings.themeId, save]);

  const pick = useCallback((themeId: ThemeId) => {
    setSelected(themeId);
    applyPreview(themeId);
  }, []);

  const activePreset = getThemePreset(settings.themeId);
  const template = TEMPLATE_PRESETS.find((item) => item.id === settings.templateId);

  return (
    <AdminCard title={t("admin.content.sections.theme")}>
      <p className="text-sm leading-relaxed text-foreground/55">
        {t("admin.content.themeDescription")}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        <p className="text-xs uppercase tracking-[var(--tracking-luxe)] text-gold">
          {t("admin.content.themeActive", { theme: activePreset.labels[language] })}
        </p>
        <p
          aria-live="polite"
          className={cn("text-xs", dirty ? "text-destructive" : "text-foreground/45")}
        >
          {save.isError
            ? t("admin.content.themeSaveError")
            : dirty
              ? t("admin.content.themeUnsaved")
              : save.isSuccess
                ? t("admin.content.themeSaved")
                : t("admin.content.noChanges")}
        </p>
      </div>

      <p className="mt-6 text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
        {t("admin.content.themeSelectLabel")}
      </p>

      <div
        role="radiogroup"
        aria-label={t("admin.content.themeSelectLabel")}
        className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        {THEME_PRESETS.map((preset) => {
          const isSelected = preset.id === selected;
          const isSaved = preset.id === settings.themeId;
          return (
            <button
              key={preset.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${preset.labels[language]} — ${preset.descriptions[language]}`}
              disabled={save.isPending}
              onClick={() => pick(preset.id)}
              className={cn(
                "grid min-w-0 gap-3 rounded-sm border p-3 text-left transition-colors disabled:opacity-50",
                isSelected
                  ? "border-gold/60 bg-surface-raised"
                  : "border-border hover:border-gold/30",
              )}
            >
              <PresetPreview preset={preset} />
              <span className="grid min-w-0 gap-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-foreground">{preset.labels[language]}</span>
                  {isSaved ? (
                    <span className="rounded-sm border border-gold/50 px-2 py-0.5 text-[10px] uppercase tracking-[var(--tracking-luxe)] text-gold">
                      {t("admin.content.themeBadgeActive")}
                    </span>
                  ) : null}
                  {isSelected && !isSaved ? (
                    <span className="rounded-sm border border-destructive/50 px-2 py-0.5 text-[10px] uppercase tracking-[var(--tracking-luxe)] text-destructive">
                      {t("admin.content.themeBadgePreview")}
                    </span>
                  ) : null}
                </span>
                <span className="text-xs leading-relaxed text-foreground/50">
                  {preset.descriptions[language]}
                </span>
                <PresetSwatches preset={preset} />
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!dirty || save.isPending}
          onClick={() => save.mutate()}
          className="inline-flex h-11 items-center rounded-sm bg-gold px-5 text-xs uppercase tracking-[var(--tracking-luxe)] text-gold-foreground disabled:opacity-40"
        >
          {save.isPending ? t("admin.content.themeSaving") : t("admin.content.themeSave")}
        </button>
        <button
          type="button"
          disabled={!dirty || save.isPending}
          onClick={discard}
          className="inline-flex h-11 items-center rounded-sm border border-border px-5 text-xs uppercase tracking-[var(--tracking-luxe)] text-foreground/70 disabled:opacity-40"
        >
          {t("admin.content.themeDiscard")}
        </button>
        <span className="text-xs text-foreground/40">{t("admin.content.themePreviewHint")}</span>
      </div>

      <p className="mt-6 text-xs text-foreground/45">
        <span className="uppercase tracking-[var(--tracking-luxe)] text-foreground/55">
          {t("admin.content.template")}:
        </span>{" "}
        {template ? `${template.labels[language]} — ${template.descriptions[language]}` : "—"}
      </p>
    </AdminCard>
  );
}
