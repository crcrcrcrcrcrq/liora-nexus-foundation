/**
 * Treści dokumentów prawnych — wartość domyślna, którą CMS może nadpisać.
 *
 * ZASADA: nie deklarujemy tu funkcji, których aplikacja nie posiada
 * (płatności online, analityka, reklamowe cookie). Miejsca wymagające danych
 * rejestrowych właściciela są wyraźnie oznaczone jako [DO UZUPEŁNIENIA].
 */
export const legal = {
  terms: {
    meta: {
      title: "Regulamin konsultacji | Liora Ylva",
      description:
        "Zasady świadczenia konsultacji tarota i astrologii: zakres usług, rezerwacja, odwołania, reklamacje oraz zakres odpowiedzialności.",
    },
    page: {
      eyebrow: "Dokumenty",
      title: "Regulamin",
    },
    sections: {
      scope: {
        title: "1. Zakres usług",
        body: "Konsultacje mają charakter rozwojowy i wspierający. Nie stanowią porady medycznej, psychoterapeutycznej, prawnej ani finansowej.",
      },
      nature: {
        title: "2. Charakter usług",
        body: "Tarot i astrologia są tu narzędziami refleksji i uporządkowania własnych decyzji. Nie gwarantują konkretnych zdarzeń ani wyników i nie zastępują profesjonalnej pomocy specjalistycznej.",
      },
      siteUse: {
        title: "3. Korzystanie z serwisu",
        body: "Bezpłatny rozkład tarota i wstępna analiza astrologiczna są dostępne bez zakładania konta. Konto (logowanie linkiem e-mail) służy wyłącznie prowadzeniu Kroniki Duszy i podglądowi własnych rezerwacji. Zabronione jest korzystanie z serwisu w sposób zakłócający jego działanie.",
      },
      booking: {
        title: "4. Rezerwacja",
        body: "Rezerwację składa się przez formularz na stronie. Zgłoszenie nie jest jeszcze potwierdzeniem terminu — termin staje się wiążący dopiero po potwierdzeniu mailowym z mojej strony.",
      },
      payment: {
        title: "5. Płatności",
        body: "Serwis nie realizuje płatności online — ceny podane na stronie mają charakter informacyjny. Sposób i termin płatności ustalamy indywidualnie w potwierdzeniu rezerwacji. [DO UZUPEŁNIENIA: docelowe zasady płatności, formy rozliczenia, dane do przelewu.]",
      },
      cancellation: {
        title: "6. Odwołanie terminu",
        body: "Termin można przełożyć bez kosztów najpóźniej 48 godzin przed sesją, pisząc na adres {{email}}. Przy późniejszym odwołaniu termin przepada, chyba że ustalimy inaczej.",
      },
      sessionFlow: {
        title: "7. Przebieg sesji",
        body: "Sesja odbywa się online lub stacjonarnie, zgodnie z ustaleniami. Nagranie audio powstaje wyłącznie za zgodą obu stron i jest przekazywane klientowi.",
      },
      userObligations: {
        title: "8. Prawa i obowiązki użytkownika",
        body: "Użytkownik podaje prawdziwe dane kontaktowe, korzysta z serwisu zgodnie z prawem i szanuje prywatność drugiej strony. W każdej chwili może usunąć swoje wpisy w Kronice Duszy oraz poprosić o usunięcie konta.",
      },
      liability: {
        title: "9. Odpowiedzialność",
        body: "Decyzje podejmowane po konsultacji pozostają decyzjami użytkownika. Nie ponoszę odpowiedzialności za skutki działań podjętych na ich podstawie ani za krótkotrwałe przerwy techniczne w dostępności serwisu.",
      },
      complaints: {
        title: "10. Reklamacje",
        body: "Reklamacje przyjmuję na adres {{email}} w terminie 14 dni od sesji. Odpowiedź wysyłam w ciągu 14 dni roboczych.",
      },
      age: {
        title: "11. Wiek uczestnika",
        body: "Z konsultacji mogą korzystać osoby pełnoletnie.",
      },
      changes: {
        title: "12. Zmiany regulaminu",
        body: "Regulamin może być aktualizowany. Zmiany obowiązują od chwili publikacji na tej stronie i nie działają wstecz wobec już potwierdzonych rezerwacji.",
      },
      contact: {
        title: "13. Kontakt",
        body: "W sprawach dotyczących regulaminu i konsultacji: {{email}}.",
      },
    },
  },
  privacy: {
    meta: {
      title: "Polityka prywatności | Liora Ylva",
      description:
        "Jakie dane zbieram przez formularze rezerwacji, kontaktu i newslettera, w jakim celu je przetwarzam i jak długo je przechowuję.",
    },
    page: {
      eyebrow: "Dokumenty",
      title: "Polityka prywatności",
    },
    sections: {
      controller: {
        title: "1. Administrator danych",
        body: "Administratorem danych jest {{legalName}}. Kontakt w sprawach danych: {{email}}. [DO UZUPEŁNIENIA: pełne dane rejestrowe i adres korespondencyjny administratora.]",
      },
      scope: {
        title: "2. Zakres zbieranych danych",
        body: "Zbieram wyłącznie dane podane przez Ciebie w formularzach oraz dane niezbędne do prowadzenia konta: imię, adres e-mail, wybraną usługę, preferowany termin, treść wiadomości oraz treści, które sam(a) zapisujesz w Kronice Duszy.",
      },
      purpose: {
        title: "3. Cel przetwarzania",
        body: "Dane służą wyłącznie: ustaleniu i realizacji konsultacji, odpowiedzi na wiadomość, prowadzeniu Twojego konta i Kroniki Duszy oraz wysyłce newslettera, jeśli o niego poprosisz.",
      },
      legalBasis: {
        title: "4. Podstawa prawna",
        body: "Art. 6 ust. 1 lit. b RODO (wykonanie umowy) dla rezerwacji i konta, art. 6 ust. 1 lit. f (uzasadniony interes) dla korespondencji, art. 6 ust. 1 lit. a (zgoda) dla newslettera.",
      },
      bookings: {
        title: "5. Rezerwacje",
        body: "Formularz rezerwacji zbiera imię, e-mail, wybraną usługę, preferowany termin i treść pytania. Dane te zapisuję w bazie serwisu i wykorzystuję wyłącznie do ustalenia oraz przeprowadzenia konsultacji.",
      },
      contactForms: {
        title: "6. Formularze kontaktowe",
        body: "Formularz kontaktowy zbiera imię, adres e-mail, temat i treść wiadomości — po to, by móc odpowiedzieć. Newsletter zbiera wyłącznie adres e-mail, na podstawie Twojej zgody, którą możesz cofnąć w każdej chwili.",
      },
      email: {
        title: "7. Komunikacja e-mail",
        body: "Potwierdzenia rezerwacji i odpowiedzi wysyłam pocztą elektroniczną przez zewnętrznego dostawcę wysyłki. Do wiadomości trafiają tylko dane niezbędne do obsługi zgłoszenia.",
      },
      accounts: {
        title: "8. Konta użytkowników",
        body: "Logowanie odbywa się linkiem wysyłanym na e-mail — nie przechowuję haseł. Z kontem powiązane są: adres e-mail, opcjonalna nazwa wyświetlana oraz preferowany język.",
      },
      chronicle: {
        title: "9. Kronika Duszy",
        body: "Zapisy rytuałów, notatki i refleksje w Kronice Duszy są prywatne i widoczne wyłącznie dla Ciebie po zalogowaniu. Możesz je edytować i usuwać samodzielnie.",
      },
      browserStorage: {
        title: "10. Pamięć przeglądarki",
        body: "Serwis korzysta z pamięci lokalnej przeglądarki (localStorage), aby zapamiętać wybór języka, sesję logowania, dzienny limit bezpłatnego rozkładu oraz roboczą treść refleksji. Nie są to reklamowe pliki cookie i dane te nie trafiają do osób trzecich.",
      },
      analytics: {
        title: "11. Analityka",
        body: "Serwis nie korzysta z narzędzi analitycznych ani z reklamowego śledzenia użytkowników. Bezpłatny rozkład tarota i wstępna analiza astrologiczna liczą się lokalnie w Twojej przeglądarce.",
      },
      retention: {
        title: "12. Okres przechowywania",
        body: "Dane rezerwacji przechowuję przez okres wymagany przepisami rozliczeniowymi. Korespondencję usuwam po 24 miesiącach. Dane konta i Kroniki przechowuję do momentu usunięcia konta. Zapis newslettera trwa do momentu wypisania.",
      },
      recipients: {
        title: "13. Odbiorcy danych",
        body: "Dane trafiają wyłącznie do dostawców niezbędnych do działania serwisu: hostingu aplikacji, dostawcy bazy danych i uwierzytelniania oraz dostawcy wysyłki e-mail. Nie sprzedaję danych i nie profiluję użytkowników.",
      },
      security: {
        title: "14. Bezpieczeństwo",
        body: "Dostęp do danych jest ograniczony na poziomie bazy regułami dostępu (RLS): swoje dane widzisz tylko Ty po zalogowaniu, a treści administracyjne wymagają roli personelu weryfikowanej po stronie serwera. Połączenie ze stroną jest szyfrowane (HTTPS).",
      },
      rights: {
        title: "15. Twoje prawa",
        body: "Masz prawo dostępu do danych, sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia oraz sprzeciwu, a także prawo skargi do Prezesa UODO.",
      },
      changes: {
        title: "16. Zmiany polityki",
        body: "Politykę mogę aktualizować, gdy zmieni się sposób działania serwisu. Aktualna wersja jest zawsze dostępna na tej stronie.",
      },
      contact: {
        title: "17. Kontakt",
        body: "W sprawach dotyczących danych osobowych napisz na {{email}}.",
      },
    },
  },
};
