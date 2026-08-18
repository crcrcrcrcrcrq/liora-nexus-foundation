export const astrology = {
  meta: {
    title: "Kosmogram urodzeniowy — analiza astrologiczna | Liora Ylva",
    description:
      "Kosmogram urodzeniowy jest unikalnym zapisem układu nieba w chwili Twoich narodzin. Wprowadź datę, godzinę i miejsce urodzenia, aby przygotować analizę.",
  },
  breadcrumb: {
    home: "Strona główna",
    astrology: "Astrologia",
  },
  page: {
    eyebrow: "Astrologia",
    title: "Analiza kosmogramu urodzeniowego",
  },
  service: {
    engineNotConnected:
      "Moduł astrologiczny jest przygotowany do integracji z profesjonalnym silnikiem obliczeniowym.",
    fetchError: "Nie udało się pobrać kosmogramu.",
    label: "Backend (proxy do silnika efemeryd)",
  },
  ritual: {
    intro: {
      eyebrow: "Rytuał",
      title: "Zapis nieba z chwili Twoich narodzin",
      description:
        "Kosmogram urodzeniowy jest unikalnym zapisem układu nieba w chwili Twoich narodzin.",
      cta: "Rozpocznij analizę",
    },
    form: {
      eyebrow: "Dane urodzeniowe",
      title: "Trzy informacje wystarczą",
      description: "Dane służą wyłącznie do wyznaczenia układu nieba. Nie są nikomu udostępniane.",
      dateLabel: "Data urodzenia",
      dateHint: "Wyznacza pozycje Słońca i planet w dniu Twoich narodzin.",
      timeLabel: "Godzina urodzenia",
      timeHint: "Decyduje o ascendencie i podziale kosmogramu na domy.",
      cityLabel: "Miasto urodzenia",
      cityHint: "Określa współrzędne geograficzne i strefę czasową obliczeń.",
      cityPlaceholder: "np. Kraków",
      submit: "Przygotuj kosmogram",
    },
    progress: {
      eyebrow: "Przygotowanie",
      steps: {
        date: "Analizowanie daty urodzenia…",
        planets: "Wyznaczanie pozycji planet…",
        chart: "Przygotowywanie kosmogramu…",
        interpretation: "Tworzenie interpretacji…",
      },
      progressAriaLabel: "Postęp przygotowania kosmogramu",
      counter: "{{current}} / {{total}}",
    },
    outcome: {
      eyebrow: "Przygotowanie zakończone",
      title: "Twoje dane zostały przyjęte",
      readyMessage: "Silnik obliczeniowy odpowiedział — kosmogram jest gotowy.",
      summary: {
        birthDate: "Data urodzenia",
        birthTime: "Godzina urodzenia",
        city: "Miasto urodzenia",
      },
      chart: {
        title: "Kosmogram",
        description: "Tutaj pojawi się graficzny układ planet i domów Twojego kosmogramu.",
        ascendant: "Ascendent: {{value}}",
      },
      interpretation: {
        title: "Interpretacja",
        description: "Tutaj pojawi się opis przygotowany na podstawie obliczonych pozycji.",
      },
      pending: "Kosmogram w przygotowaniu",
      error: "Kosmogram nie chce się teraz ułożyć. Spróbuj ponownie za chwilę.",
      restart: "Wprowadź dane ponownie",
    },
  },
};
