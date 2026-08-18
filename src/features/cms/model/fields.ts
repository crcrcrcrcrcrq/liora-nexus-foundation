/**
 * LIORA P0.19 — katalog edytowalnych treści (CMS Foundation).
 *
 * ŹRÓDŁO PRAWDY: słowniki i18n (`src/locales/{pl,en}/*`) pozostają wartością
 * domyślną każdej treści. CMS nie tworzy drugiego modelu treści — zapisuje
 * wyłącznie NADPISANIA pod tym samym kluczem i18n, per język.
 *
 * Ten plik jest jednocześnie ALLOWLISTĄ bezpieczeństwa: serwer przyjmuje zapis
 * wyłącznie dla kluczy wymienionych poniżej. Klient nie może wskazać dowolnego
 * klucza słownika ani nadpisać treści administracyjnych.
 */

export type CmsFieldKind = "text" | "textarea";

export interface CmsField {
  /** Klucz i18n, np. `landing.hero.title`. */
  key: string;
  kind: CmsFieldKind;
}

export interface CmsSection {
  id: string;
  /** Klucz i18n etykiety sekcji w panelu. */
  labelKey: string;
  /**
   * Ścieżka kanoniczna (PL) strony publicznej, której dotyczy sekcja.
   * Panel buduje z niej odnośnik „Podgląd” w wybranym języku edycji.
   * Brak wartości = sekcja bez pojedynczej strony (np. nawigacja, SEO).
   */
  previewPath?: string;
  fields: CmsField[];
}

const text = (key: string): CmsField => ({ key, kind: "text" });
const area = (key: string): CmsField => ({ key, kind: "textarea" });

const SERVICE_KEYS = [
  "threeCardReading",
  "individualConsultation",
  "relationshipAnalysis",
  "astrologicalPortrait",
  "quarterlyCare",
] as const;

const TAROT_SPREADS = ["threeCards", "decisionCross", "relationshipAnalysis"] as const;

const PRIVACY_SECTIONS = [
  "controller",
  "scope",
  "purpose",
  "legalBasis",
  "bookings",
  "contactForms",
  "email",
  "accounts",
  "chronicle",
  "browserStorage",
  "analytics",
  "retention",
  "recipients",
  "security",
  "rights",
  "changes",
  "contact",
] as const;

const TERMS_SECTIONS = [
  "scope",
  "nature",
  "siteUse",
  "booking",
  "payment",
  "cancellation",
  "sessionFlow",
  "userObligations",
  "liability",
  "complaints",
  "age",
  "changes",
  "contact",
] as const;

const FAQ_ITEMS = [
  "isTherapy",
  "howToPrepare",
  "birthTime",
  "freeSpread",
  "languages",
  "payment",
  "dataUsage",
  "refusedTopics",
] as const;

export const CMS_SECTIONS: CmsSection[] = [
  {
    id: "home",
    labelKey: "admin.content.sections.home",
    previewPath: "/",
    fields: [
      text("landing.hero.eyebrow"),
      text("landing.hero.title"),
      area("landing.hero.description"),
      text("landing.hero.bookButton"),
      text("landing.hero.freeReadingButton"),
      text("landing.tarotSection.eyebrow"),
      text("landing.tarotSection.title"),
      area("landing.tarotSection.description"),
      text("landing.tarotSection.fullReadingButton"),
      text("landing.servicesSection.eyebrow"),
      text("landing.servicesSection.title"),
      area("landing.servicesSection.description"),
      text("landing.servicesSection.fullPriceListButton"),
      text("landing.blogSection.eyebrow"),
      text("landing.blogSection.title"),
      text("landing.blogSection.readJournalButton"),
    ],
  },
  {
    id: "services",
    labelKey: "admin.content.sections.services",
    previewPath: "/uslugi",
    fields: [
      text("services.hero.eyebrow"),
      text("services.hero.title"),
      text("services.bookButton"),
      text("services.tryNowButton"),
      ...SERVICE_KEYS.flatMap((key) => [
        text(`services.items.${key}.title`),
        text(`services.items.${key}.duration`),
        area(`services.items.${key}.summary`),
      ]),
    ],
  },
  {
    id: "booking",
    labelKey: "admin.content.sections.booking",
    previewPath: "/rezerwacja",
    fields: [
      text("booking.page.eyebrow"),
      text("booking.page.title"),
      text("booking.form.nameLabel"),
      text("booking.form.emailLabel"),
      text("booking.form.serviceLabel"),
      text("booking.form.dateLabel"),
      area("booking.form.dateHint"),
      text("booking.form.messageLabel"),
      text("booking.form.submit"),
      area("booking.form.successMessage"),
      area("booking.form.errorMessage"),
      text("booking.notifications.client.subject"),
      text("booking.notifications.client.heading"),
      area("booking.notifications.client.nextStep"),
    ],
  },
  {
    id: "tarot",
    labelKey: "admin.content.sections.tarot",
    previewPath: "/tarot",
    fields: [
      text("tarot.hero.eyebrow"),
      text("tarot.hero.title"),
      text("tarot.methodSection.eyebrow"),
      text("tarot.methodSection.title"),
      area("tarot.methodSection.description"),
      text("tarot.deckSection.eyebrow"),
      text("tarot.deckSection.title"),
      area("tarot.deckSection.description"),
      text("tarot.ritual.shuffleButton"),
      text("tarot.result.ctaTitle"),
      area("tarot.result.ctaDescription"),
      text("tarot.result.ctaButton"),
      text("tarot.result.restartButton"),
      text("tarot.dailyLimit.title"),
      area("tarot.dailyLimit.description"),
      ...TAROT_SPREADS.flatMap((key) => [
        text(`tarot.spreads.${key}.name`),
        area(`tarot.spreads.${key}.description`),
      ]),
    ],
  },
  {
    id: "astrology",
    labelKey: "admin.content.sections.astrology",
    previewPath: "/astrologia",
    fields: [
      text("astrology.page.eyebrow"),
      text("astrology.page.title"),
      text("astrology.ritual.intro.eyebrow"),
      text("astrology.ritual.intro.title"),
      area("astrology.ritual.intro.description"),
      text("astrology.ritual.intro.cta"),
      text("astrology.ritual.form.eyebrow"),
      text("astrology.ritual.form.title"),
      area("astrology.ritual.form.description"),
      text("astrology.ritual.form.submit"),
      text("astrology.ritual.outcome.eyebrow"),
      text("astrology.ritual.outcome.title"),
      area("astrology.ritual.outcome.interpretation.description"),
      text("astrology.ritual.outcome.restart"),
    ],
  },
  {
    id: "chronicle",
    labelKey: "admin.content.sections.chronicle",
    previewPath: "/kronika",
    fields: [
      text("chronicle.home.eyebrow"),
      text("chronicle.home.title"),
      area("chronicle.home.lead"),
      area("chronicle.home.description"),
      area("chronicle.privacy.line1"),
      area("chronicle.privacy.line2"),
      text("chronicle.rituals.title"),
      area("chronicle.rituals.description"),
      text("chronicle.consultations.title"),
      area("chronicle.consultations.description"),
      text("chronicle.notes.title"),
      area("chronicle.notes.description"),
      text("chronicle.reflections.title"),
      area("chronicle.reflections.description"),
      text("chronicle.profile.title"),
      area("chronicle.profile.description"),
    ],
  },
  {
    id: "sanctuary",
    labelKey: "admin.content.sections.sanctuary",
    previewPath: "/sanktuarium",
    fields: [
      text("sanctuary.eyebrow"),
      text("sanctuary.title"),
      area("sanctuary.description"),
      text("sanctuary.today.title"),
      area("sanctuary.today.body"),
      text("sanctuary.chronicle.title"),
      area("sanctuary.chronicle.body"),
      text("sanctuary.session.title"),
      area("sanctuary.session.body"),
    ],
  },
  {
    id: "about",
    labelKey: "admin.content.sections.about",
    previewPath: "/o-mnie",
    fields: [
      text("about.hero.eyebrow"),
      text("about.hero.title"),
      area("about.intro.paragraph1"),
      area("about.intro.paragraph2"),
      text("about.principlesSection.eyebrow"),
      text("about.principlesSection.title"),
      text("about.principles.archetype.title"),
      area("about.principles.archetype.body"),
      text("about.principles.discretion.title"),
      area("about.principles.discretion.body"),
      text("about.principles.boundaries.title"),
      area("about.principles.boundaries.body"),
    ],
  },
  {
    id: "contact",
    labelKey: "admin.content.sections.contact",
    previewPath: "/kontakt",
    fields: [
      text("contact.page.eyebrow"),
      text("contact.page.title"),
      text("contact.page.emailLabel"),
      text("contact.page.languagesLabel"),
      text("contact.page.languagesValue"),
    ],
  },
  {
    id: "faq",
    labelKey: "admin.content.sections.faq",
    previewPath: "/faq",
    fields: [
      text("faq.page.eyebrow"),
      text("faq.page.title"),
      ...FAQ_ITEMS.flatMap((key) => [
        text(`faq.items.${key}.question`),
        area(`faq.items.${key}.answer`),
      ]),
    ],
  },
  {
    id: "nav",
    labelKey: "admin.content.sections.nav",
    fields: [
      text("nav.about"),
      text("nav.services"),
      text("nav.tarot"),
      text("nav.astrology"),
      text("nav.rituals"),
      text("nav.library"),
      text("nav.faq"),
      text("nav.contact"),
      text("nav.book"),
      text("layout.header.tagline"),
      text("layout.header.bookButton"),
    ],
  },
  {
    id: "footer",
    labelKey: "admin.content.sections.footer",
    fields: [
      text("layout.footer.copyright"),
      text("layout.footer.practiceSince"),
      text("layout.footerNav.groups.practice"),
      text("layout.footerNav.groups.tools"),
      text("layout.footerNav.groups.info"),
      text("layout.footerNav.items.servicesPricing"),
      text("layout.footerNav.items.locations"),
      text("layout.footerNav.items.tarotFree"),
      text("layout.footerNav.items.astrologyAnalysis"),
      text("layout.footerNav.items.newMoonCeremony"),
      text("layout.footerNav.items.fullMoonCeremony"),
      text("layout.footerNav.items.terms"),
      text("layout.footerNav.items.privacyPolicy"),
    ],
  },
  {
    id: "legalTerms",
    labelKey: "admin.content.sections.legalTerms",
    previewPath: "/regulamin",
    fields: [
      text("legal.terms.page.eyebrow"),
      text("legal.terms.page.title"),
      ...TERMS_SECTIONS.flatMap((key) => [
        text(`legal.terms.sections.${key}.title`),
        area(`legal.terms.sections.${key}.body`),
      ]),
    ],
  },
  {
    id: "legalPrivacy",
    labelKey: "admin.content.sections.legalPrivacy",
    previewPath: "/polityka-prywatnosci",
    fields: [
      text("legal.privacy.page.eyebrow"),
      text("legal.privacy.page.title"),
      ...PRIVACY_SECTIONS.flatMap((key) => [
        text(`legal.privacy.sections.${key}.title`),
        area(`legal.privacy.sections.${key}.body`),
      ]),
    ],
  },
  {
    id: "seo",
    labelKey: "admin.content.sections.seo",
    fields: [
      text("landing.meta.title"),
      area("landing.meta.description"),
      text("services.meta.title"),
      area("services.meta.description"),
      text("about.meta.title"),
      area("about.meta.description"),
      text("booking.meta.title"),
      area("booking.meta.description"),
      text("contact.meta.title"),
      area("contact.meta.description"),
      text("tarot.meta.title"),
      area("tarot.meta.description"),
      text("astrology.meta.title"),
      area("astrology.meta.description"),
      text("faq.meta.title"),
      area("faq.meta.description"),
      text("sanctuary.meta.title"),
      area("sanctuary.meta.description"),
      text("library.meta.listTitle"),
      area("library.meta.listDescription"),
      text("chronicle.meta.layout.title"),
      area("chronicle.meta.layout.description"),
      text("legal.privacy.meta.title"),
      area("legal.privacy.meta.description"),
      text("legal.terms.meta.title"),
      area("legal.terms.meta.description"),
    ],
  },
];

export const CMS_FIELDS: CmsField[] = CMS_SECTIONS.flatMap((section) => section.fields);

const ALLOWED = new Set(CMS_FIELDS.map((field) => field.key));

/** Jedyna dozwolona lista kluczy zapisu — egzekwowana po stronie serwera. */
export function isEditableKey(key: string): boolean {
  return ALLOWED.has(key);
}

/** Maksymalna długość pojedynczej wartości treści (walidacja serwerowa). */
export const CMS_VALUE_MAX_LENGTH = 4000;
