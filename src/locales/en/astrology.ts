import type { astrology as PlAstrology } from "../pl/astrology";

export const astrology: typeof PlAstrology = {
  meta: {
    title: "Birth chart — astrological analysis | Liora Ylva",
    description:
      "The birth chart is a unique record of the sky's arrangement at the moment of your birth. Enter your date, time and place of birth to prepare an analysis.",
  },
  breadcrumb: {
    home: "Home",
    astrology: "Astrology",
  },
  page: {
    eyebrow: "Astrology",
    title: "Birth chart analysis",
  },
  service: {
    engineNotConnected:
      "The astrology module is ready for integration with a professional calculation engine.",
    fetchError: "Could not fetch the birth chart.",
    label: "Backend (ephemeris engine proxy)",
  },
  ritual: {
    intro: {
      eyebrow: "Ritual",
      title: "A record of the sky at the moment of your birth",
      description:
        "The birth chart is a unique record of the sky's arrangement at the moment of your birth.",
      cta: "Start the analysis",
    },
    form: {
      eyebrow: "Birth data",
      title: "Three details are enough",
      description:
        "This data is used solely to determine the arrangement of the sky. It is never shared with anyone.",
      dateLabel: "Date of birth",
      dateHint: "Determines the positions of the Sun and planets on the day of your birth.",
      timeLabel: "Time of birth",
      timeHint: "Determines the ascendant and the division of the chart into houses.",
      cityLabel: "City of birth",
      cityHint: "Determines the geographic coordinates and time zone used in the calculations.",
      cityPlaceholder: "e.g. Kraków",
      submit: "Prepare chart",
    },
    progress: {
      eyebrow: "Preparing",
      steps: {
        date: "Analyzing date of birth…",
        planets: "Calculating planet positions…",
        chart: "Preparing the chart…",
        interpretation: "Creating the interpretation…",
      },
      progressAriaLabel: "Chart preparation progress",
      counter: "{{current}} / {{total}}",
    },
    outcome: {
      eyebrow: "Preparation complete",
      title: "Your data has been received",
      readyMessage: "The engine responded — the chart is ready.",
      summary: {
        birthDate: "Date of birth",
        birthTime: "Time of birth",
        city: "City of birth",
      },
      chart: {
        title: "Chart",
        description:
          "The graphical arrangement of the planets and houses of your chart will appear here.",
        ascendant: "Ascendant: {{value}}",
      },
      interpretation: {
        title: "Interpretation",
        description: "A description prepared from the calculated positions will appear here.",
      },
      pending: "Chart in preparation",
      error: "The chart will not settle just now. Please try again shortly.",
      restart: "Enter data again",
    },
  },
};
