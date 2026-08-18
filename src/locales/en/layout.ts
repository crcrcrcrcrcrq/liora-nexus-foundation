import type { layout as Pllayout } from "../pl/layout";

export const layout: typeof Pllayout = {
  skipToContent: "Skip to content",
  header: {
    homeAriaLabel: "{{name}} — home",
    tagline: "Tarot & Astrology",
    mainNavAriaLabel: "Main navigation",
    mobileNavAriaLabel: "Mobile navigation",
    bookButton: "Book a session",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  footer: {
    footerNavAriaLabel: "Footer navigation",
    copyright: "© {{year}} {{legalName}}",
    practiceSince: "Practicing since {{year}}",
  },
  footerNav: {
    groups: {
      practice: "Practice",
      tools: "Tools",
      info: "Information",
    },
    items: {
      servicesPricing: "Services & pricing",
      locations: "Where I work",
      tarotFree: "Free tarot reading",
      astrologyAnalysis: "Astrology analysis",
      newMoonCeremony: "New moon ceremony",
      fullMoonCeremony: "Full moon ceremony",
      terms: "Terms",
      privacyPolicy: "Privacy policy",
    },
  },
};
