import type { Permission } from "@/features/identity/model/types";

export interface NavItem {
  labelKey: string;
  to: string;
}

export const MAIN_NAV: NavItem[] = [
  { labelKey: "nav.about", to: "/o-mnie" },
  { labelKey: "nav.services", to: "/uslugi" },
  { labelKey: "nav.tarot", to: "/tarot" },
  { labelKey: "nav.astrology", to: "/astrologia" },
  { labelKey: "nav.rituals", to: "/rytualy" },
  { labelKey: "nav.library", to: "/biblioteka" },
  { labelKey: "nav.faq", to: "/faq" },
  { labelKey: "nav.contact", to: "/kontakt" },
];

export const FOOTER_NAV: { titleKey: string; items: NavItem[] }[] = [
  {
    titleKey: "layout.footerNav.groups.practice",
    items: [
      { labelKey: "nav.about", to: "/o-mnie" },
      { labelKey: "layout.footerNav.items.servicesPricing", to: "/uslugi" },
      { labelKey: "layout.footerNav.items.locations", to: "/gdzie-dzialam" },
    ],
  },
  {
    titleKey: "layout.footerNav.groups.tools",
    items: [
      { labelKey: "layout.footerNav.items.tarotFree", to: "/tarot" },
      { labelKey: "layout.footerNav.items.astrologyAnalysis", to: "/astrologia" },
      { labelKey: "nav.rituals", to: "/rytualy" },
      { labelKey: "layout.footerNav.items.newMoonCeremony", to: "/rytualy/nowiu" },
      { labelKey: "layout.footerNav.items.fullMoonCeremony", to: "/rytualy/pelni" },
    ],
  },
  {
    titleKey: "layout.footerNav.groups.info",
    items: [
      { labelKey: "nav.library", to: "/biblioteka" },
      { labelKey: "nav.faq", to: "/faq" },
      { labelKey: "nav.contact", to: "/kontakt" },
      { labelKey: "layout.footerNav.items.terms", to: "/regulamin" },
      { labelKey: "layout.footerNav.items.privacyPolicy", to: "/polityka-prywatnosci" },
    ],
  },
];

/** Pozycja panelu wraz z uprawnieniem wymaganym do jej zobaczenia. */
export interface AdminNavItem {
  labelKey: string;
  to: string;
  permission: Permission;
}

/**
 * Experience Center. Kolejność jest narracją dnia: przegląd, ludzie, rozmowy,
 * historia — dopiero potem narzędzia. Etykiety nie używają języka CRM.
 */
export const ADMIN_NAV: AdminNavItem[] = [
  { labelKey: "admin.sidebar.dashboard", to: "/admin", permission: "requests:read" },
  { labelKey: "experience.people.title", to: "/admin/users", permission: "clients:read:masked" },
  {
    labelKey: "experience.consultations.title",
    to: "/admin/konsultacje",
    permission: "consultations:manage",
  },
  { labelKey: "experience.activity.title", to: "/admin/aktywnosc", permission: "activity:read" },
  { labelKey: "admin.sidebar.requests", to: "/admin/requests", permission: "requests:manage" },
  { labelKey: "admin.sidebar.bookings", to: "/admin/bookings", permission: "requests:manage" },
  { labelKey: "admin.sidebar.schedule", to: "/admin/schedule", permission: "requests:manage" },
  { labelKey: "admin.sidebar.cms", to: "/admin/content", permission: "content:publish" },
  { labelKey: "admin.sidebar.services", to: "/admin/services", permission: "content:publish" },
  { labelKey: "admin.sidebar.blog", to: "/admin/blog", permission: "blog:manage" },
  { labelKey: "admin.sidebar.seo", to: "/admin/seo", permission: "content:publish" },
  { labelKey: "admin.sidebar.stats", to: "/admin/stats", permission: "stats:read" },
  {
    labelKey: "admin.sidebar.integrations",
    to: "/admin/integrations",
    permission: "integrations:manage",
  },
  {
    labelKey: "experience.telegram.title",
    to: "/admin/telegram",
    permission: "integrations:manage",
  },
  { labelKey: "admin.sidebar.settings", to: "/admin/settings", permission: "settings:manage" },
];
