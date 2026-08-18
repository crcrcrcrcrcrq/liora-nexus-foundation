export const booking = {
  meta: {
    title: "Rezerwacja sesji tarota i astrologii | Liora Ylva",
    description:
      "Zarezerwuj konsultację indywidualną, analizę relacji lub roczną mapę astrologiczną. Potwierdzenie terminu otrzymasz mailem.",
  },
  breadcrumb: {
    home: "Strona główna",
    booking: "Rezerwacja",
  },
  page: {
    eyebrow: "Rezerwacja",
    title: "Ustalmy termin",
  },
  form: {
    nameLabel: "Imię",
    emailLabel: "E-mail",
    serviceLabel: "Rodzaj spotkania",
    dateLabel: "Preferowany termin",
    dateHint: "Potwierdzenie dostępności przyjdzie mailem.",
    datePlaceholder: "Wybierz wolny dzień",
    dateEmpty: "Brak wolnych terminów w najbliższych tygodniach.",
    messageLabel: "Pytanie, z którym przychodzisz",
    submit: "Umów spotkanie",
    submitting: "Wysyłam…",
    successMessage:
      "Mam Twoją prośbę o spotkanie. Potwierdzenie terminu przyjdzie na podany adres.",
    errorMessage: "Prośba o termin nie dotarła tym razem. Spróbuj ponownie za moment.",
    dateTaken: "Ten termin został właśnie zarezerwowany. Wybierz inny dzień.",
    slotUnavailable: "Ta godzina nie jest już dostępna. Wybierz inną godzinę.",
    serviceUnavailable: "Ta usługa nie jest obecnie dostępna do rezerwacji.",
  },
  steps: {
    service: "Usługa",
    serviceHint: "Wybierz rodzaj spotkania.",
    date: "Dzień",
    time: "Godzina",
    details: "Dane",
    summary: "Podsumowanie",
    confirmation: "Potwierdzenie",
    back: "Wstecz",
    next: "Dalej",
  },
  states: {
    noServices: {
      title: "Brak usług do rezerwacji",
      description: "W tej chwili żadna usługa nie jest dostępna do umówienia.",
    },
    noDates: {
      title: "Brak wolnych dni",
      description: "W najbliższych tygodniach nie ma wolnych terminów. Zajrzyj później.",
    },
    noSlots: {
      title: "Brak wolnych godzin",
      description: "Dla tego dnia nie ma godzin w grafiku. Wybierz inny dzień.",
    },
    confirmed: {
      title: "Rezerwacja przyjęta",
    },
  },
  notifications: {
    client: {
      subject: "Nowa rezerwacja — {{service}}",
      heading: "Dziękuję — Twoja prośba o spotkanie dotarła.",
      service: "Rodzaj spotkania",
      date: "Preferowany termin",
      dateUnset: "do ustalenia",
      reference: "Numer zgłoszenia",
      received: "Zgłoszenie zostało przyjęte i czeka na potwierdzenie.",
      nextStep: "Szczegóły i ostateczne potwierdzenie terminu prześle Liora.",
    },
    status: {
      confirmed: {
        subject: "Rezerwacja potwierdzona — {{service}}",
        heading: "Twój termin został potwierdzony.",
      },
      cancelled: {
        subject: "Rezerwacja anulowana — {{service}}",
        heading: "Ta rezerwacja została odwołana.",
      },
      completed: {
        subject: "Rezerwacja zakończona — {{service}}",
        heading: "Spotkanie zostało zamknięte. Dziękuję za obecność.",
      },
    },
    staff: {
      subject: "Nowa rezerwacja — {{service}}",
      heading: "Wpłynęła nowa prośba o spotkanie.",
      statusSubject: "Zmiana statusu rezerwacji — {{service}}",
      customer: "Klient",
      contact: "Kontakt",
      language: "Język rezerwacji",
      status: "Status",
    },
  },
};
