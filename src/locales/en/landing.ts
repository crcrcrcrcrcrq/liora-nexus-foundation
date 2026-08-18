import type { landing as PlLanding } from "../pl/landing";

export const landing: typeof PlLanding = {
  meta: {
    title: "Liora Ylva — tarot and astrology as decision-making tools",
    description:
      "Tarot and astrology consultations rooted in depth psychology. A free three-card reading online, individual consultations and astrological portraits.",
  },
  hero: {
    eyebrow: "Private practice · since {{year}}",
    title: "Tarot and astrology as <gold>decision-making tools</gold>, not fortune-telling",
    description:
      "I offer consultations grounded in depth psychology and archetypes. Instead of promises, you get a named arrangement of forces, the cost of each option, and one concrete next step.",
    bookButton: "Book a session",
    freeReadingButton: "Free reading",
  },
  tarotSection: {
    eyebrow: "Three-card spread",
    title: "Pick three cards from the Major Arcana",
    description:
      "The draw happens in your browser, without repeats. Each card comes with a description of its meaning upright and reversed.",
    fullReadingButton: "Try the full tarot",
  },
  servicesSection: {
    eyebrow: "Services",
    title: "Three ways to work together",
    description:
      "Each one begins with narrowing the question. Without that, a spread is only a story.",
    fullPriceListButton: "See full pricing",
  },
  blogSection: {
    eyebrow: "Library of Reflections",
    title: "Latest texts",
    readJournalButton: "Enter the Library",
  },
};
