export const auth = {
  meta: {
    title: "Powrót do Kroniki Duszy — Liora Ylva",
    description:
      "Wróć do swojej Kroniki Duszy za pomocą osobistego linku wysłanego na Twój adres e-mail.",
  },
  card: {
    eyebrow: "Kronika Duszy",
  },
  magicLink: {
    verifying: {
      title: "Otwieramy Twoją Kronikę",
      description: "Otwieramy Twoją przestrzeń. To potrwa tylko chwilę.",
    },
    email: {
      label: "Adres e-mail",
      hint: "Jedna wiadomość, jeden klucz powrotu. Bez haseł i bez formalności.",
      placeholder: "imie@przyklad.pl",
    },
    submit: {
      idle: "Powróć do swojej Kroniki Duszy",
      sending: "Przygotowujemy Twój klucz powrotu…",
    },
    sent: {
      title: "Zaproszenie w drodze",
      description:
        "Jeżeli Twój adres znajduje się w naszej bezpiecznej przestrzeni, za chwilę otrzymasz wiadomość z osobistym kluczem powrotu.",
      note: "Wiadomość potrafi dotrzeć po chwili. Możesz spokojnie zamknąć tę stronę — klucz zaczeka.",
      again: "Podaj inny adres",
      footer: {
        question: "Nie masz jeszcze swojej Kroniki?",
        cta: "Napisz do nas",
      },
    },
    form: {
      title: "Twoja historia trwa",
      description:
        "Podaj adres, pod którym prowadzimy Twoją Kronikę. Przygotujemy osobisty klucz powrotu — bez haseł i bez formalności.",
      footer: {
        question: "Wciąż poznajesz LIORĘ?",
        cta: "Zacznij od bezpłatnego rozkładu",
      },
    },
    errors: {
      sendFailed: "Nie udało się teraz przygotować klucza powrotu. Spróbuj ponownie za chwilę.",
      verifyFailed:
        "Ten klucz powrotu stracił już ważność. Poproś o nowy — przygotujemy go od razu.",
    },
  },
  access: {
    invitation: {
      eyebrow: "Kronika Duszy",
      title: "Ta przestrzeń czeka na Ciebie",
      description:
        "Twoja droga jest zapisana w bezpiecznej Kronice. Poproś o osobisty klucz powrotu, a otworzymy ją dla Ciebie.",
      cta: "Powróć do swojej Kroniki Duszy",
    },
    restricted: {
      eyebrow: "Dostęp",
      title: "Ta część pozostaje zamknięta",
      description:
        "Ta część przestrzeni pozostaje jeszcze zamknięta. Jeśli ma być dla Ciebie otwarta, napisz — chętnie to ustalimy.",
      cta: "Wróć na początek",
    },
    pending: "Otwieramy Twoją Kronikę…",
  },
  chronicleLink: {
    authenticated: "Kronika Duszy",
    guest: "Powrót do Kroniki",
  },
};
