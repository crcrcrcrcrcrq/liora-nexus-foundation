/**
 * Experience Center — język przestrzeni, nie systemu.
 * Żaden komunikat nie zawiera słów „rekord”, „użytkownik”, „lead” ani „ID”.
 */
export const experience = {
  sampleNotice: "Zapis przykładowy — prawdziwe ślady pojawią się po podłączeniu Kroniki.",
  timeline: {
    booking: "{{id}} poprosił o rozmowę: {{service}}.",
  },
  time: {
    today: "dziś",
    yesterday: "wczoraj",
  },
  overview: {
    greeting: "Dzień dobry, Lioro.",
    lines: {
      returned: "Dziś wróciło do Ciebie {{count}} osób.",
      awaiting: "{{count}} rozmowy czekają na Twoje słowo.",
      scheduled: "{{count}} konsultacji jest już potwierdzonych.",
    },
    todayTitle: "Co wydarzyło się dziś",
    todayLink: "Zobacz cały dzień",
  },
  people: {
    title: "Obecności",
    description:
      "Ludzie, którzy zostawili u Ciebie ślad. Każda osoba ma prywatny identyfikator LIORA — nie widzisz numerów systemowych.",
    listTitle: "Kto jest obecny",
    empty: {
      title: "Jeszcze nikt nie zostawił śladu.",
    },
    visits: "{{count}} wizyt",
    tiers: {
      guest: "Gość",
      member: "Obecność",
      premium: "Krąg bliski",
    },
    contact: {
      calm: "Cisza",
      awaiting: "Czeka na słowo",
      answered: "Odpowiedziano",
    },
  },
  chronicle: {
    title: "Kronika osoby",
    visits: "Wizyty",
    rituals: "Rytuały",
    interpretations: "Interpretacje",
    lastActivity: "Ostatni ślad",
    marksTitle: "Ślady",
    unavailable: {
      title: "Kronika pozostaje prywatna",
      description:
        "Wpisy Kroniki widzi wyłącznie ich autor. Żadna rola w panelu nie ma ścieżki odczytu do cudzych refleksji, rytuałów ani notatek.",
    },
    readOnly: "Kronika jest zapisem historii — panel ją czyta, nigdy nie zmienia.",
    kinds: {
      tarot: "Tarot",
      astrology: "Astrologia",
      consultation: "Konsultacja",
      interpretation: "Interpretacja",
      note: "Notatka",
    },
  },
  consultations: {
    title: "Konsultacje",
    description: "Pięć spokojnych stanów rozmowy. Bez lejka sprzedaży, bez pośpiechu.",
    all: "Wszystkie",
    advance: "Przenieś dalej",
    readOnly: "Widok odczytu — stan rozmowy zmienia osoba, która o nią poprosiła.",
    requested: "Poproszono {{when}}",
    scheduledFor: "Umówiono na {{when}}",
    stages: {
      new: "Nowa",
      awaiting: "Czeka na odpowiedź",
      scheduled: "Umówiona",
      completed: "Odbyta",
      closed: "Zamknięta",
    },
  },
  activity: {
    title: "Aktywność",
    description: "Historia dnia opowiedziana zdaniami, nie wpisami w dzienniku.",
    todayLabel: "Dziś",
    quiet: "Dziś jeszcze cicho.",
  },
  privacy: {
    title: "Prywatność",
    identifiers: "Osoby są widoczne wyłącznie pod prywatnym identyfikatorem LIORA.",
    encryption:
      "Dane osobowe będą przechowywane w formie zaszyfrowanej; odszyfrowanie zachodzi tylko po stronie serwera.",
    moderator: "Moderator nie ma ścieżki prowadzącej do danych osobowych.",
    adminScope: "Twoja rola pozwala zobaczyć dane osobowe po podłączeniu backendu.",
    maskedScope: "Twoja rola widzi wyłącznie identyfikatory LIORA.",
  },
  telegram: {
    title: "Telegram",
    description:
      "Architektura powiadomień jest gotowa. Zewnętrzne API podłączamy w kolejnym etapie.",
    adapterTitle: "Adapter",
    transportLabel: "Transport",
    stateLabel: "Stan",
    stateReady: "Podłączony",
    statePending: "Przygotowany, nieaktywny",
    secretsLabel: "Sekrety",
    secretsValue: "Poza kodem, po stronie serwera",
    adapterNote:
      "Adapter nie zna Telegrama — zna sygnały i treść. Podłączenie API to wymiana jednego transportu.",
    signalsTitle: "Sygnały",
    signals: {
      consultation_new: "Nowa konsultacja",
      interpretation_ordered: "Zamówiona interpretacja",
      member_premium: "Nowa osoba w kręgu bliskim",
      system_issue: "Sygnał techniczny",
    },
    messages: {
      consultation: "{{id}} prosi o rozmowę: {{subject}}.",
      interpretation: "{{id}} zamówił interpretację: {{subject}}.",
      premium: "{{id}} dołączył do kręgu bliskiego.",
      system: "Wymagana uwaga: {{detail}}.",
    },
    anonymous: "Osoba bez identyfikatora",
    unspecified: "bez opisu",
    previewSubject: "rozmowa o kierunku",
    previewDetail: "kanał powiadomień nie jest jeszcze podłączony",
    privacyTitle: "Zakres treści",
    privacyNote:
      "Powiadomienie zawiera wyłącznie identyfikator LIORA i krótki opis zdarzenia. Imiona, adresy e-mail i treść rozmów nigdy nie opuszczają systemu tym kanałem.",
  },
  sample: {
    consultations: {
      first: "rozmowa o zmianie kierunku",
      second: "pytanie o rytuał nowiu",
      third: "przygotowanie do przeprowadzki",
      fourth: "podsumowanie roku",
      fifth: "rozmowa zakończona spokojnie",
    },
    timeline: {
      first: "Ktoś wrócił po trzech tygodniach ciszy.",
      second: "Rozłożono nowy układ tarota.",
      third: "Poproszono o rozmowę i czeka na Twoje słowo.",
      fourth: "Zamówiono interpretację astrologiczną.",
      fifth: "Osoba z kręgu bliskiego zajrzała po raz dwudziesty czwarty.",
      sixth: "Wieczorny rytuał pełni został zapisany w Kronice.",
    },
    interpretations: {
      first: "Interpretacja kosmogramu",
      second: "Rok osobisty — zapis",
    },
    marks: {
      first: "Układ trzech kart",
      second: "Interpretacja kosmogramu",
      third: "Rytuał pełni",
      fourth: "Rozmowa o kierunku",
    },
  },
};
