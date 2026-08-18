export const tarot = {
  meta: {
    title: "Bezpłatny rozkład tarota online — 22 Wielkie Arkany | Liora Ylva",
    description:
      "Wskaż trzy karty i poznaj znaczenie pozycji prostej oraz odwróconej. Rozkład przeszłość, teraźniejszość, kierunek na pełnej talii 22 Wielkich Arkanów.",
  },
  breadcrumbs: {
    home: "Strona główna",
    tarot: "Tarot",
  },
  hero: {
    eyebrow: "Narzędzie bezpłatne",
    title: "Rozkład trzech kart",
  },
  methodSection: {
    eyebrow: "Metoda",
    title: "Dostępne rozkłady",
    description:
      "Każdy rozkład ma własny zestaw pozycji. Kolejne układy dokładam bez zmiany sposobu czytania.",
  },
  deckSection: {
    eyebrow: "Talia",
    title: "22 Wielkie Arkany",
    description: "Pełny spis kart używanych w rozkładzie wraz ze słowami kluczowymi.",
  },
  orientation: {
    upright: "pozycja prosta",
    reversed: "pozycja odwrócona",
  },
  deckBrand: {
    name: "Liora",
    tagline: "Premium Tarot",
  },
  ritual: {
    lines: ["Wsłuchaj się w swoją intuicję…", "Los przygotowuje Twój rozkład…"],
    statusIdle: "Talia czeka zamknięta. Potasuj ją, gdy poczujesz, że jesteś gotowy.",
    statusShuffling: "Tasuję talię…",
    statusSpreading: "Rozkładam karty…",
    statusSelecting_one: "Wskaż {{count}} kartę. Pozostało: {{remaining}}.",
    statusSelecting_few: "Wskaż {{count}} karty. Pozostało: {{remaining}}.",
    statusSelecting_many: "Wskaż {{count}} kart. Pozostało: {{remaining}}.",
    statusSelecting_other: "Wskaż {{count}} karty. Pozostało: {{remaining}}.",
    statusRevealing: "Odsłaniam wybrane karty…",
    statusFinished: "Rozkład gotowy — poniżej znaczenie każdej karty.",
    idleInstructionLine1: "Zatrzymaj się na chwilę.",
    idleInstructionLine2: "Skup się na swoim pytaniu.",
    idleInstructionLine3: "Gdy poczujesz, że jesteś gotowy, potasuj karty.",
    shuffleButton: "Tasuj karty",
    shufflingButton: "Tasuję…",
    captionSpreading: "Rozkładam karty…",
    captionSelecting_one: "Wskaż {{count}} kartę — pozostało {{remaining}}",
    captionSelecting_few: "Wskaż {{count}} karty — pozostało {{remaining}}",
    captionSelecting_many: "Wskaż {{count}} kart — pozostało {{remaining}}",
    captionSelecting_other: "Wskaż {{count}} karty — pozostało {{remaining}}",
    captionRevealing: "Odsłaniam wybrane karty…",
    centerLabel: "Wybierz trzy karty, które najbardziej Cię przyciągają.",
    deckAriaLabel: "Talia {{count}} kart ułożona w okrąg",
    cardAriaPicked: "Karta {{index}} — wybrana jako {{order}} z {{limit}}",
    cardAriaPick: "Wybierz kartę {{index}} z {{total}}",
  },
  result: {
    cardLabel: "Karta {{roman}} · {{position}}",
    interpretationEyebrow: "Interpretacja rozkładu",
    ctaTitle: "Poznaj pełną interpretację swojej sytuacji.",
    ctaDescription:
      "Bezpłatny rozkład pokazuje kierunek. Pełne czytanie osadza go w twojej historii, pytaniu i decyzji, przed którą stoisz.",
    ctaButton: "Poznaj pełną interpretację",
    restartButton: "Nowy rozkład",
  },
  dailyLimit: {
    title: "Dzisiejszy rytuał został zakończony.",
    description: "Daj kartom odpocząć. Kolejny bezpłatny rozkład otworzy się po północy.",
    nextLabel: "Następne losowanie za",
  },
  interpretation: {
    axis: "Oś tego rozkładu tworzą {{axis}}.",
    axisJoin: " i ",
    toneNone:
      "Wszystkie karty leżą prosto — sytuacja ma jasny kierunek, a opór jest zewnętrzny, nie wewnętrzny.",
    toneSome:
      "Część kart leży odwrotnie: kierunek jest czytelny, ale jedna z sił działa wbrew tobie i wymaga nazwania.",
    toneMost:
      "Większość kart leży odwrotnie — rozkład wskazuje na wyraźny opór i temat, który był dotąd odkładany.",
    toneAll:
      "Cały rozkład leży odwrotnie: to sygnał, że pytanie zostało postawione nie w tym miejscu, w którym leży rzeczywisty problem.",
    keywords: "Wspólne motywy do przepracowania: {{keywords}}.",
    nextStep:
      "Następny krok: wybierz jedną pozycję, która najbardziej cię zaskoczyła, i sprawdź, jaką decyzję odkładasz właśnie w tym obszarze.",
  },
  cards: {
    fool: {
      name: "Głupiec",
      keywords: ["początek", "zaufanie", "ryzyko"],
      upright:
        "Czysty początek bez zabezpieczeń. Karta mówi o decyzji podejmowanej wbrew statystyce, ale zgodnie z instynktem. Twoja przewaga leży teraz w braku doświadczenia — nie masz jeszcze schematów, które ograniczają.",
      reversed:
        "Ruch wykonany bez rozpoznania terenu. Impuls zastąpił rozeznanie, a entuzjazm maskuje brak planu. Zanim ruszysz, sprawdź, kto ponosi koszt tej decyzji.",
    },
    magician: {
      name: "Mag",
      keywords: ["wola", "narzędzia", "sprawczość"],
      upright:
        "Masz wszystkie narzędzia w jednym miejscu i po raz pierwszy widzisz je jednocześnie. To karta świadomej sprawczości: intencja przekłada się na konkretny czyn bez pośredników.",
      reversed:
        "Potencjał krążący w miejscu. Zdolności są realne, lecz rozproszone między zbyt wiele wątków. Ryzyko manipulacji — własnej wobec siebie lub cudzej wobec ciebie.",
    },
    highPriestess: {
      name: "Kapłanka",
      keywords: ["intuicja", "cisza", "granica"],
      upright:
        "Odpowiedź istnieje, ale nie w słowach. Kapłanka zaleca wstrzymanie deklaracji i pozwolenie, by informacja dojrzała. Milczenie jest tutaj formą ochrony energii, nie ucieczką.",
      reversed:
        "Odcięcie od własnego głosu. Słuchasz opinii z zewnątrz, choć wiesz swoje. Wyparcie zamiast introspekcji — sygnał, by wrócić do faktów, nie do domysłów.",
    },
    empress: {
      name: "Cesarzowa",
      keywords: ["obfitość", "ciało", "troska"],
      upright:
        "Wzrost, który wymaga jedynie regularności. Karta wskazuje na materię: ciało, dom, finanse, relację, która karmi. To dobry czas na budowanie, nie na analizowanie.",
      reversed:
        "Troska zamieniona w kontrolę lub całkowicie odłożona na później. Zaniedbanie własnych potrzeb fizycznych zaczyna kosztować więcej niż problem, od którego uciekasz.",
    },
    emperor: {
      name: "Cesarz",
      keywords: ["struktura", "autorytet", "granice"],
      upright:
        "Porządek jako narzędzie wolności. Ustal zasady, terminy i zakresy odpowiedzialności — chaos, z którym walczysz, jest brakiem struktury, nie brakiem siły.",
      reversed:
        "Sztywność lub zależność od cudzego autorytetu. Reguły przestały służyć celowi i zaczęły służyć same sobie. Sprawdź, kto naprawdę podejmuje twoje decyzje.",
    },
    hierophant: {
      name: "Kapłan",
      keywords: ["nauka", "tradycja", "przekaz"],
      upright:
        "Potrzeba mentora, metody i sprawdzonej ścieżki. Zamiast wymyślać wszystko od nowa, skorzystaj z doświadczenia kogoś, kto tę drogę już przeszedł.",
      reversed:
        "Konflikt z narzuconym systemem wartości. Lojalność wobec tradycji rodzinnej lub zawodowej przestała być twoim wyborem. Czas przeformułować własne zasady.",
    },
    lovers: {
      name: "Kochankowie",
      keywords: ["wybór", "bliskość", "spójność"],
      upright:
        "Decyzja, która dotyka wartości, nie tylko uczuć. Karta mówi o świadomym połączeniu dwóch osobnych całości i o zgodzie między tym, co czujesz, a tym, co robisz.",
      reversed:
        "Rozdźwięk między pragnieniem a zobowiązaniem. Odkładanie wyboru jest już wyborem. Sprawdź, jakiej rozmowy unikasz i od kiedy.",
    },
    chariot: {
      name: "Rydwan",
      keywords: ["kierunek", "dyscyplina", "napór"],
      upright:
        "Ruch do przodu utrzymany wolą, nie natchnieniem. Sprzeczne siły dają się prowadzić, jeśli trzymasz jeden kierunek dłużej niż kilka tygodni.",
      reversed:
        "Rozpęd bez kierunku albo hamowanie tuż przed celem. Energia idzie w obronę pozycji zamiast w postęp. Zdefiniuj cel, który da się zamknąć datą.",
    },
    strength: {
      name: "Siła",
      keywords: ["opanowanie", "łagodność", "wytrwałość"],
      upright:
        "Panowanie przez łagodność, nie przez przymus. Instynkt nie jest wrogiem — trzeba go oswoić. Najtrudniejszy element sytuacji ustąpi pod stałym, spokojnym naciskiem.",
      reversed:
        "Siłowanie się ze sobą. Tłumienie emocji zamienia je w wyczerpanie. Wróć do podstaw: sen, jedzenie, rytm dnia — dopiero potem do decyzji.",
    },
    hermit: {
      name: "Pustelnik",
      keywords: ["wycofanie", "rozeznanie", "światło"],
      upright:
        "Świadome wycofanie, by odzyskać perspektywę. To nie izolacja z lęku, a decyzja o pracy w ciszy. Jasność przyjdzie z ograniczenia bodźców.",
      reversed:
        "Samotność, która przestała być produktywna. Wycofanie zamieniło się w unikanie kontaktu. Jedna szczera rozmowa zrobi więcej niż miesiąc rozmyślań.",
    },
    wheelOfFortune: {
      name: "Koło Fortuny",
      keywords: ["cykl", "zmiana", "moment"],
      upright:
        "Zmiana zewnętrzna, na którą masz ograniczony wpływ, ale pełny wpływ na reakcję. Cykl obraca się na twoją korzyść — wykorzystaj okno, które właśnie się otwiera.",
      reversed:
        "Powtarzalność, z której nie wychodzisz. Ten sam wzorzec w nowej scenerii. Zmień jeden element układu, nie całą scenę.",
    },
    justice: {
      name: "Sprawiedliwość",
      keywords: ["fakty", "równowaga", "konsekwencja"],
      upright:
        "Rozliczenie oparte na faktach. Karta prosi o chłodne spojrzenie na własny udział w sytuacji. Decyzja podjęta uczciwie będzie trwała.",
      reversed:
        "Nierówny bilans lub ocena z jednej strony. Ktoś ponosi koszt, którego nie ustalił. Sprawdź umowy, ustalenia i to, co przemilczane.",
    },
    hangedMan: {
      name: "Wisielec",
      keywords: ["zawieszenie", "perspektywa", "oddanie"],
      upright:
        "Pauza, która ma sens. Sytuacja nie ruszy, dopóki nie zmienisz punktu widzenia. Rezygnacja z kontroli jest tu strategią, nie porażką.",
      reversed:
        "Zwłoka udająca refleksję. Czekanie kosztuje już więcej niż ryzyko ruchu. Nazwij termin i podejmij decyzję.",
    },
    death: {
      name: "Śmierć",
      keywords: ["domknięcie", "transformacja", "próg"],
      upright:
        "Koniec etapu, który wyczerpał swoją funkcję. Nie chodzi o stratę, a o domknięcie: to, co się kończy, zwalnia miejsce i energię. Nie reanimuj.",
      reversed:
        "Trzymanie formy, która już nie działa. Lęk przed pustką po zmianie. Domknij symbolicznie — usuń, oddaj, wypisz się, zakończ rozmowę.",
    },
    temperance: {
      name: "Umiarkowanie",
      keywords: ["proporcja", "scalanie", "cierpliwość"],
      upright:
        "Łączenie przeciwieństw w jedną, używalną całość. Karta pracy powolnej i precyzyjnej: dawkuj, mierz, koryguj. Efekt będzie trwalszy niż skok.",
      reversed:
        "Skrajności zamiast miary. Nadmiar w jednym obszarze rekompensuje brak w innym. Wróć do prostych proporcji dnia.",
    },
    devil: {
      name: "Diabeł",
      keywords: ["przywiązanie", "kontrakt", "cień"],
      upright:
        "Zależność, którą sam współtworzysz. Karta pokazuje realny zysk płynący z tej zależności — dopóki go nie nazwiesz, nie wyjdziesz. Łańcuch jest zapięty od środka.",
      reversed:
        "Początek rozbrojenia wzorca. Widzisz mechanizm i przestajesz go usprawiedliwiać. Pierwszy krok to odzyskanie jednej konkretnej granicy.",
    },
    tower: {
      name: "Wieża",
      keywords: ["przełom", "prawda", "reset"],
      upright:
        "Nagłe ujawnienie tego, co było konstrukcyjnie słabe. Wstrząs jest gwałtowny, ale usuwa iluzję, na której trudno budować. Ratuj fundament, nie elewację.",
      reversed:
        "Kryzys odłożony, nie rozwiązany. Napięcie narasta pod powierzchnią. Kontrolowana rozbiórka jest tańsza niż zawalenie.",
    },
    star: {
      name: "Gwiazda",
      keywords: ["nadzieja", "regeneracja", "kierunek"],
      upright:
        "Spokojne odzyskiwanie sił po trudnym etapie. Karta mówi o realnej, nie życzeniowej nadziei: masz już dowody, że idziesz w dobrą stronę.",
      reversed:
        "Utrata wiary w sens procesu. Zmęczenie zniekształca ocenę. Nie podejmuj strategicznych decyzji z pozycji wyczerpania.",
    },
    moon: {
      name: "Księżyc",
      keywords: ["niejasność", "projekcja", "sen"],
      upright:
        "Obszar, w którym brakuje danych, a wyobraźnia je uzupełnia. Zanim zareagujesz, odróżnij fakt od interpretacji. Lęk podpowiada tu głośniej niż intuicja.",
      reversed:
        "Mgła się przerzedza. Powracają fakty, wraca też rytm snu i jasność. Dobry moment na zadanie pytania, którego się bałaś.",
    },
    sun: {
      name: "Słońce",
      keywords: ["jawność", "witalność", "potwierdzenie"],
      upright:
        "Sytuacja wychodzi na światło i okazuje się prostsza, niż wyglądała. Karta potwierdzenia: to, co robisz, ma sens i widoczne efekty.",
      reversed:
        "Sukces bez radości albo eksponowanie się przed czasem. Sprawdź, dla kogo naprawdę jest ta widoczność.",
    },
    judgement: {
      name: "Sąd",
      keywords: ["wezwanie", "bilans", "przebudzenie"],
      upright:
        "Moment rozliczenia i wyraźnego wezwania. Coś, co odkładałaś latami, wraca w formie decyzji. Odpowiedź na to wezwanie zmienia kierunek na lata.",
      reversed:
        "Ignorowanie sygnału albo osądzanie siebie zamiast wyciągania wniosków. Zamień samokrytykę na listę faktów.",
    },
    world: {
      name: "Świat",
      keywords: ["domknięcie", "integracja", "pełnia"],
      upright:
        "Zamknięcie pełnego cyklu. Elementy, które długo funkcjonowały osobno, składają się w spójną całość. Czas nazwać osiągnięcie i ruszyć dalej.",
      reversed:
        "Projekt niedokończony w ostatnich pięciu procentach. Brak domknięcia blokuje start kolejnego etapu. Dokończ, nawet niedoskonale.",
    },
  },
  spreads: {
    threeCards: {
      name: "Trzy karty",
      description: "Fundament, aktualny układ sił i najbardziej prawdopodobny kierunek.",
      positions: {
        past: { label: "Przeszłość", hint: "Fundament sytuacji — to, co ją ukształtowało." },
        present: {
          label: "Teraźniejszość",
          hint: "Aktualny układ sił i twoja realna pozycja.",
        },
        future: {
          label: "Kierunek",
          hint: "Najbardziej prawdopodobny rozwój przy obecnych wyborach.",
        },
      },
    },
    decisionCross: {
      name: "Krzyż decyzji",
      description: "Dwie drogi zestawione z kosztem i z tym, co realnie je blokuje.",
      positions: {
        core: { label: "Sedno", hint: "Pytanie sprowadzone do jednej osi." },
        optionA: { label: "Wariant A", hint: "Konsekwencje pierwszej decyzji." },
        optionB: { label: "Wariant B", hint: "Konsekwencje decyzji przeciwnej." },
        cost: { label: "Koszt", hint: "To, co oddajesz niezależnie od wyboru." },
      },
    },
    relationshipAnalysis: {
      name: "Analiza relacji",
      description: "Pięć pozycji opisujących obie strony, blokadę i pole porozumienia.",
      positions: {
        you: { label: "Ty", hint: "Twoja realna pozycja i oczekiwanie." },
        them: { label: "Druga strona", hint: "Perspektywa, której nie widzisz wprost." },
        bond: { label: "Więź", hint: "To, co faktycznie łączy, nie to, co deklarowane." },
        block: { label: "Blokada", hint: "Miejsce, w którym rozmowa się zatrzymuje." },
        ground: { label: "Pole porozumienia", hint: "Obszar możliwego uzgodnienia." },
      },
    },
  },
};

export type TarotDictionary = typeof tarot;
