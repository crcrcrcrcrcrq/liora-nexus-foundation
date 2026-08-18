import type { TarotDictionary } from "../pl/tarot";

export const tarot: TarotDictionary = {
  meta: {
    title: "Free online tarot reading — 22 Major Arcana | Liora Ylva",
    description:
      "Choose three cards and discover the meaning of the upright and reversed positions. A past, present, direction spread drawn from the full deck of 22 Major Arcana.",
  },
  breadcrumbs: {
    home: "Home",
    tarot: "Tarot",
  },
  hero: {
    eyebrow: "Free tool",
    title: "Three-card reading",
  },
  methodSection: {
    eyebrow: "Method",
    title: "Available spreads",
    description:
      "Each spread has its own set of positions. New layouts are added over time, without changing how they are read.",
  },
  deckSection: {
    eyebrow: "Deck",
    title: "22 Major Arcana",
    description: "The full list of cards used in the spread, with their keywords.",
  },
  orientation: {
    upright: "upright",
    reversed: "reversed",
  },
  deckBrand: {
    name: "Liora",
    tagline: "Premium Tarot",
  },
  ritual: {
    lines: ["Listen to your intuition…", "Fate is preparing your reading…"],
    statusIdle: "The deck is closed and waiting. Shuffle it when you feel ready.",
    statusShuffling: "Shuffling the deck…",
    statusSpreading: "Laying out the cards…",
    statusSelecting_one: "Pick {{count}} card. Remaining: {{remaining}}.",
    statusSelecting_few: "Pick {{count}} cards. Remaining: {{remaining}}.",
    statusSelecting_many: "Pick {{count}} cards. Remaining: {{remaining}}.",
    statusSelecting_other: "Pick {{count}} cards. Remaining: {{remaining}}.",
    statusRevealing: "Revealing your cards…",
    statusFinished: "Your reading is ready — meanings below.",
    idleInstructionLine1: "Take a moment.",
    idleInstructionLine2: "Focus on your question.",
    idleInstructionLine3: "When you feel ready, shuffle the cards.",
    shuffleButton: "Shuffle cards",
    shufflingButton: "Shuffling…",
    captionSpreading: "Laying out the cards…",
    captionSelecting_one: "Pick {{count}} card — {{remaining}} left",
    captionSelecting_few: "Pick {{count}} cards — {{remaining}} left",
    captionSelecting_many: "Pick {{count}} cards — {{remaining}} left",
    captionSelecting_other: "Pick {{count}} cards — {{remaining}} left",
    captionRevealing: "Revealing your cards…",
    centerLabel: "Choose the three cards that draw you in most.",
    deckAriaLabel: "A deck of {{count}} cards laid out in a circle",
    cardAriaPicked: "Card {{index}} — chosen as {{order}} of {{limit}}",
    cardAriaPick: "Choose card {{index}} of {{total}}",
  },
  result: {
    cardLabel: "Card {{roman}} · {{position}}",
    interpretationEyebrow: "Reading interpretation",
    ctaTitle: "Discover the full interpretation of your situation.",
    ctaDescription:
      "The free reading points to a direction. The full interpretation sets it within your story, your question, and the decision ahead of you.",
    ctaButton: "Get the full interpretation",
    restartButton: "New reading",
  },
  dailyLimit: {
    title: "Today's ritual is complete.",
    description: "Let the cards rest. The next free reading opens after midnight.",
    nextLabel: "Next reading in",
  },
  interpretation: {
    axis: "The axis of this reading is formed by {{axis}}.",
    axisJoin: " and ",
    toneNone:
      "All the cards fall upright — the situation has a clear direction, and the resistance is external, not internal.",
    toneSome:
      "Some cards fall reversed: the direction is legible, but one of the forces is working against you and needs to be named.",
    toneMost:
      "Most of the cards fall reversed — the reading points to clear resistance and a matter that has been set aside until now.",
    toneAll:
      "The entire reading falls reversed: a sign that the question was raised in a different place than where the real issue lies.",
    keywords: "Shared themes to work through: {{keywords}}.",
    nextStep:
      "Next step: choose the one position that surprised you most, and consider what decision you are postponing in that exact area.",
  },
  cards: {
    fool: {
      name: "The Fool",
      keywords: ["beginning", "trust", "risk"],
      upright:
        "A clean start with no safety net. This card speaks of a decision made against the odds but in line with instinct. Your advantage now lies in inexperience — you have no patterns yet to hold you back.",
      reversed:
        "A move made without scouting the ground. Impulse has replaced judgment, and enthusiasm masks the absence of a plan. Before you act, check who bears the cost of this decision.",
    },
    magician: {
      name: "The Magician",
      keywords: ["will", "tools", "agency"],
      upright:
        "All your tools are in one place, and for the first time you see them at once. This is the card of conscious agency: intention becomes concrete action without intermediaries.",
      reversed:
        "Potential circling in place. The abilities are real but scattered across too many threads. There is a risk of manipulation — of yourself, or by someone else.",
    },
    highPriestess: {
      name: "The High Priestess",
      keywords: ["intuition", "stillness", "boundary"],
      upright:
        "The answer exists, but not in words. The High Priestess advises holding back declarations and letting the information mature. Silence here is a form of protecting your energy, not avoidance.",
      reversed:
        "A disconnection from your own voice. You are listening to outside opinions even though you know your own. Denial in place of introspection — a signal to return to facts, not assumptions.",
    },
    empress: {
      name: "The Empress",
      keywords: ["abundance", "body", "care"],
      upright:
        "Growth that requires only consistency. This card points to matter: the body, the home, finances, a relationship that nourishes. A good time to build, not to analyze.",
      reversed:
        "Care turned into control, or set aside altogether. Neglecting your physical needs is starting to cost more than the problem you are avoiding.",
    },
    emperor: {
      name: "The Emperor",
      keywords: ["structure", "authority", "boundaries"],
      upright:
        "Order as a tool of freedom. Set rules, deadlines, and areas of responsibility — the chaos you are fighting is a lack of structure, not a lack of strength.",
      reversed:
        "Rigidity, or dependence on someone else's authority. The rules have stopped serving their purpose and begun serving themselves. Check who is really making your decisions.",
    },
    hierophant: {
      name: "The Hierophant",
      keywords: ["learning", "tradition", "transmission"],
      upright:
        "A need for a mentor, a method, a proven path. Instead of reinventing everything, draw on the experience of someone who has already walked this road.",
      reversed:
        "A conflict with an imposed set of values. Loyalty to family or professional tradition has stopped being your own choice. Time to redefine your own principles.",
    },
    lovers: {
      name: "The Lovers",
      keywords: ["choice", "closeness", "coherence"],
      upright:
        "A decision that touches values, not only feelings. This card speaks of a conscious union of two separate wholes, and of agreement between what you feel and what you do.",
      reversed:
        "A gap between desire and commitment. Postponing the choice is already a choice. Notice which conversation you are avoiding, and since when.",
    },
    chariot: {
      name: "The Chariot",
      keywords: ["direction", "discipline", "drive"],
      upright:
        "Forward movement held together by will, not inspiration. Opposing forces can be steered if you hold one direction for longer than a few weeks.",
      reversed:
        "Momentum without direction, or braking just before the finish. Energy is going into defending position rather than progress. Define a goal that can be closed with a date.",
    },
    strength: {
      name: "Strength",
      keywords: ["composure", "gentleness", "persistence"],
      upright:
        "Mastery through gentleness, not force. Instinct is not the enemy — it needs to be tamed. The hardest part of this situation will yield to steady, calm pressure.",
      reversed:
        "A struggle with yourself. Suppressing emotion turns it into exhaustion. Return to the basics: sleep, food, daily rhythm — and only then to the decision.",
    },
    hermit: {
      name: "The Hermit",
      keywords: ["withdrawal", "discernment", "light"],
      upright:
        "A conscious withdrawal to regain perspective. This is not isolation born of fear, but a decision to work in silence. Clarity will come from limiting outside noise.",
      reversed:
        "A solitude that has stopped being productive. Withdrawal has turned into avoiding contact. One honest conversation will do more than a month of thinking.",
    },
    wheelOfFortune: {
      name: "Wheel of Fortune",
      keywords: ["cycle", "change", "timing"],
      upright:
        "An external change over which you have limited control, but full control over your response. The cycle is turning in your favor — use the window that is opening now.",
      reversed:
        "A repetition you cannot seem to leave. The same pattern in a new setting. Change one element of the arrangement, not the whole scene.",
    },
    justice: {
      name: "Justice",
      keywords: ["facts", "balance", "consequence"],
      upright:
        "A reckoning based on facts. This card asks for a clear-eyed look at your own part in the situation. A decision made honestly will last.",
      reversed:
        "An uneven balance, or a judgment made from one side only. Someone is bearing a cost that was never agreed. Check the agreements, the terms, and what has gone unsaid.",
    },
    hangedMan: {
      name: "The Hanged Man",
      keywords: ["suspension", "perspective", "surrender"],
      upright:
        "A pause that has meaning. The situation will not move until you change your point of view. Giving up control is a strategy here, not a defeat.",
      reversed:
        "Delay disguised as reflection. Waiting already costs more than the risk of moving would. Name a deadline and make the decision.",
    },
    death: {
      name: "Death",
      keywords: ["closure", "transformation", "threshold"],
      upright:
        "The end of a stage that has served its purpose. This is not about loss but about closure: what ends makes room and frees up energy. Do not try to revive it.",
      reversed:
        "Holding on to a form that no longer works. Fear of the emptiness that follows change. Close it symbolically — remove, give away, withdraw, end the conversation.",
    },
    temperance: {
      name: "Temperance",
      keywords: ["proportion", "integration", "patience"],
      upright:
        "Bringing opposites together into one workable whole. This is the card of slow, precise work: measure, dose, adjust. The result will last longer than a leap.",
      reversed:
        "Extremes instead of measure. Excess in one area compensates for a lack in another. Return to simple, everyday proportions.",
    },
    devil: {
      name: "The Devil",
      keywords: ["attachment", "contract", "shadow"],
      upright:
        "A dependency you help sustain. This card shows the real gain that comes from this dependency — until you name it, you will not leave it. The chain is fastened from within.",
      reversed:
        "The beginning of dismantling the pattern. You see the mechanism and stop excusing it. The first step is reclaiming one specific boundary.",
    },
    tower: {
      name: "The Tower",
      keywords: ["breakthrough", "truth", "reset"],
      upright:
        "A sudden revelation of what was structurally weak. The shock is abrupt, but it removes the illusion that was hard to build on. Save the foundation, not the facade.",
      reversed:
        "A crisis postponed, not resolved. Tension is building beneath the surface. A controlled dismantling costs less than a collapse.",
    },
    star: {
      name: "The Star",
      keywords: ["hope", "renewal", "direction"],
      upright:
        "A quiet recovery of strength after a difficult stretch. This card speaks of real, not wishful, hope: you already have evidence that you are moving the right way.",
      reversed:
        "A loss of faith in the process. Fatigue is distorting your judgment. Do not make strategic decisions from a place of exhaustion.",
    },
    moon: {
      name: "The Moon",
      keywords: ["ambiguity", "projection", "dream"],
      upright:
        "An area where information is missing, and imagination fills the gap. Before you react, separate fact from interpretation. Fear speaks louder than intuition here.",
      reversed:
        "The fog is lifting. Facts return, and so does the rhythm of sleep and clarity. A good moment to ask the question you were afraid of.",
    },
    sun: {
      name: "The Sun",
      keywords: ["openness", "vitality", "confirmation"],
      upright:
        "The situation comes into the light and turns out simpler than it appeared. A card of confirmation: what you are doing has meaning and visible results.",
      reversed:
        "Success without joy, or exposing yourself too soon. Check who this visibility is really for.",
    },
    judgement: {
      name: "Judgement",
      keywords: ["calling", "reckoning", "awakening"],
      upright:
        "A moment of reckoning and a clear calling. Something you have set aside for years is returning in the form of a decision. Answering this call will change your direction for years.",
      reversed:
        "Ignoring the signal, or judging yourself instead of drawing conclusions. Trade self-criticism for a list of facts.",
    },
    world: {
      name: "The World",
      keywords: ["closure", "integration", "wholeness"],
      upright:
        "The completion of a full cycle. Elements that functioned separately for a long time now come together into a coherent whole. Time to name the achievement and move on.",
      reversed:
        "A project left unfinished in its last stretch. The lack of closure is blocking the start of the next stage. Finish it, even imperfectly.",
    },
  },
  spreads: {
    threeCards: {
      name: "Three cards",
      description: "The foundation, the current balance of forces, and the most likely direction.",
      positions: {
        past: { label: "Past", hint: "The foundation of the situation — what shaped it." },
        present: {
          label: "Present",
          hint: "The current balance of forces and your real position.",
        },
        future: {
          label: "Direction",
          hint: "The most likely development given your current choices.",
        },
      },
    },
    decisionCross: {
      name: "Decision cross",
      description: "Two paths set against their cost and against what is really holding them back.",
      positions: {
        core: { label: "Core", hint: "The question distilled to a single axis." },
        optionA: { label: "Option A", hint: "The consequences of the first decision." },
        optionB: { label: "Option B", hint: "The consequences of the opposite decision." },
        cost: { label: "Cost", hint: "What you give up regardless of the choice." },
      },
    },
    relationshipAnalysis: {
      name: "Relationship analysis",
      description:
        "Five positions describing both sides, the block between them, and the common ground.",
      positions: {
        you: { label: "You", hint: "Your real position and what you expect." },
        them: { label: "The other side", hint: "The perspective you do not see directly." },
        bond: { label: "Bond", hint: "What actually connects you, not what is declared." },
        block: { label: "Block", hint: "The point where the conversation comes to a stop." },
        ground: { label: "Common ground", hint: "The area of possible agreement." },
      },
    },
  },
};
