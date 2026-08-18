/**
 * LIORA P0.19 / P0.26 — fundament Theme / Template.
 *
 * Theme NIE jest dowolnym CSS-em. Admin wybiera wyłącznie jeden z gotowych
 * presetów; wartości kolorów żyją w `src/styles.css` jako tokeny pod selektorem
 * `[data-theme="<id>"]`. Aplikacja ustawia tylko atrybut — nigdy nie wstrzykuje
 * stylów, nie używa `eval` ani `dangerouslySetInnerHTML`.
 *
 * P0.26: presety mają stabilne ID + metadane prezentacyjne (nazwa PL/EN, opis,
 * kolory podglądu). W bazie zapisujemy WYŁĄCZNIE ID presetu — nigdy CSS.
 * Dodanie kolejnego presetu = wpis w `THEME_PRESETS` + blok tokenów w styles.css.
 */
import type { Language } from "@/config/i18n";

export const THEME_IDS = ["obsidian", "ivory", "burgundy", "emerald"] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export const TEMPLATE_IDS = ["premium-luxury"] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export const DEFAULT_THEME: ThemeId = "obsidian";
export const DEFAULT_TEMPLATE: TemplateId = "premium-luxury";

export interface SiteSettings {
  themeId: ThemeId;
  templateId: TemplateId;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  themeId: DEFAULT_THEME,
  templateId: DEFAULT_TEMPLATE,
};

/**
 * Kolory podglądu presetu. To dane prezentacyjne panelu (statyczne, w kodzie),
 * lustro tokenów z `styles.css` — nie pochodzą z bazy i nigdy nie są CSS-em.
 */
export interface ThemePreview {
  background: string;
  surface: string;
  accent: string;
  foreground: string;
  border: string;
}

export interface ThemePreset {
  id: ThemeId;
  /** Nazwa techniczna, stabilna, niezależna od języka panelu. */
  name: string;
  labels: Record<Language, string>;
  descriptions: Record<Language, string>;
  preview: ThemePreview;
  dataTheme: ThemeId;
}

export const THEME_PRESETS: readonly ThemePreset[] = [
  {
    id: "obsidian",
    name: "Obsidian",
    labels: { pl: "Obsydian", en: "Obsidian" },
    descriptions: {
      pl: "Kanoniczny motyw LIORA: głęboka czerń i złoto.",
      en: "The canonical LIORA look: deep black with gold.",
    },
    preview: {
      background: "#0D0D0D",
      surface: "#171717",
      accent: "#C8A96A",
      foreground: "#F8F6F2",
      border: "#2A2622",
    },
    dataTheme: "obsidian",
  },
  {
    id: "ivory",
    name: "Ivory",
    labels: { pl: "Kość słoniowa", en: "Ivory" },
    descriptions: {
      pl: "Jasny, papierowy wariant ze stonowanym złotem.",
      en: "A light, paper-like variant with muted gold.",
    },
    preview: {
      background: "#F7F5F1",
      surface: "#EDE8DF",
      accent: "#9A7B3F",
      foreground: "#1A1713",
      border: "#D8D1C4",
    },
    dataTheme: "ivory",
  },
  {
    id: "burgundy",
    name: "Burgundy",
    labels: { pl: "Burgund", en: "Burgundy" },
    descriptions: {
      pl: "Ciemna czerwień wina z różowo-złotym akcentem.",
      en: "Dark wine red with a rose-gold accent.",
    },
    preview: {
      background: "#160A0E",
      surface: "#231016",
      accent: "#C4849A",
      foreground: "#F6EDF0",
      border: "#3A1C26",
    },
    dataTheme: "burgundy",
  },
  {
    id: "emerald",
    name: "Emerald",
    labels: { pl: "Szmaragd", en: "Emerald" },
    descriptions: {
      pl: "Nocna zieleń z chłodnym, jadeitowym akcentem.",
      en: "Night green with a cool jade accent.",
    },
    preview: {
      background: "#07120F",
      surface: "#0E1F1A",
      accent: "#7FBFA3",
      foreground: "#EEF6F2",
      border: "#16332B",
    },
    dataTheme: "emerald",
  },
];

export function getThemePreset(id: ThemeId): ThemePreset {
  return THEME_PRESETS.find((preset) => preset.id === id) ?? THEME_PRESETS[0]!;
}

/** Zgodność wstecz: prosta lista kolorów presetu. */
export const THEME_SWATCHES: Record<ThemeId, string[]> = THEME_PRESETS.reduce(
  (acc, preset) => {
    acc[preset.id] = [
      preset.preview.background,
      preset.preview.surface,
      preset.preview.accent,
      preset.preview.foreground,
    ];
    return acc;
  },
  {} as Record<ThemeId, string[]>,
);

export interface TemplatePreset {
  id: TemplateId;
  name: string;
  labels: Record<Language, string>;
  descriptions: Record<Language, string>;
  dataTemplate: TemplateId;
}

export const TEMPLATE_PRESETS: readonly TemplatePreset[] = [
  {
    id: "premium-luxury",
    name: "Premium Luxury",
    labels: { pl: "Premium Luxury", en: "Premium Luxury" },
    descriptions: {
      pl: "Obecna struktura strony: pełnoekranowe hero, sekcje editorial.",
      en: "The current page structure: full-bleed hero, editorial sections.",
    },
    dataTemplate: "premium-luxury",
  },
];

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && (THEME_IDS as readonly string[]).includes(value);
}

export function isTemplateId(value: unknown): value is TemplateId {
  return typeof value === "string" && (TEMPLATE_IDS as readonly string[]).includes(value);
}
