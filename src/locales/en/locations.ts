import type { locations as PlLocations } from "../pl/locations";

export const locations: typeof PlLocations = {
  meta: {
    title: "Where I work — online consultations and in-person meetings | Liora Ylva",
    description:
      "Online sessions in Polish and English, along with in-person meetings in select cities. See the available consultation formats.",
  },
  breadcrumbs: {
    home: "Home",
    locations: "Where I work",
  },
  page: {
    eyebrow: "Reach",
    title: "Where I work",
  },
  items: {
    online: {
      city: "Online",
      country: "Worldwide",
      format: "Audio & video sessions",
      description:
        "The primary way of working. Encrypted connection, no recording, scheduled around your time zone.",
    },
    zurich: {
      city: "Zurich",
      country: "Switzerland",
      format: "Private meetings",
      description:
        "In-person sessions at a rented office, two weeks per quarter. Dates are announced to returning clients only.",
    },
    vienna: {
      city: "Vienna",
      country: "Austria",
      format: "Studio",
      description:
        "Individual consultations and astrological portraits discussed on site. Booking required at least two weeks in advance.",
    },
    warsaw: {
      city: "Warsaw",
      country: "Poland",
      format: "Quarterly sessions",
      description:
        "Four blocks of meetings per year. Priority is given to those in the quarterly care programme.",
    },
  },
};
