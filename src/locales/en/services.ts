import type { services as Plservices } from "../pl/services";

export const services: typeof Plservices = {
  meta: {
    title: "Tarot & astrology consultation services and pricing | Liora Ylva",
    description:
      "Individual consultation, relationship analysis and an annual astrological chart. Clear pricing, duration and scope for every session.",
  },
  breadcrumbs: {
    home: "Home",
    services: "Services",
  },
  hero: {
    eyebrow: "Pricing",
    title: "Services",
  },
  tryNowButton: "Try now",
  states: {
    loading: "Loading the offer…",
    error: "The offer could not be loaded.",
    empty: "No services are available in this language.",
  },
  bookButton: "Book a session",
  items: {
    threeCardReading: {
      title: "Three-card reading",
      duration: "instant, online",
      summary:
        "A free spread available directly on the site. Three Major Arcana cards with a full description of the upright and reversed position.",
      includes: [
        "Draw without repeats from 22 cards",
        "Description of each position: past, present, direction",
        "Option to order an extended interpretation",
      ],
    },
    individualConsultation: {
      title: "Individual consultation",
      duration: "60 minutes",
      summary:
        "A one-on-one conversation centred on a single, specific question. Tarot as a tool for diagnosis, not prediction.",
      includes: [
        "Initial questionnaire and question framing",
        "60-minute audio or video call",
        "Summary note within 48 hours",
      ],
    },
    relationshipAnalysis: {
      title: "Relationship analysis",
      duration: "90 minutes",
      summary:
        "An extended spread covering both sides of a relationship: expectations, blocks, the real ground for understanding, and boundaries.",
      includes: [
        "Two-sided spread (12 cards)",
        "90-minute conversation",
        "Written summary with recommendations",
      ],
    },
    astrologicalPortrait: {
      title: "Astrological portrait",
      duration: "document + 60 minutes",
      summary:
        "A complete birth chart analysis together with transits for the coming year, discussed in a follow-up conversation.",
      includes: [
        "Birth chart accurate to the minute of birth",
        "PDF document (25–35 pages)",
        "One-hour discussion and Q&A session",
      ],
    },
    quarterlyCare: {
      title: "Quarterly care",
      duration: "3 months",
      summary:
        "Ongoing support for those navigating career or life decisions. A limited number of places per quarter.",
      includes: [
        "Three 60-minute sessions",
        "Asynchronous contact between sessions",
        "Individually prepared transit calendar",
      ],
    },
  },
};
