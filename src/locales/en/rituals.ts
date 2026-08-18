import type { rituals as PlRituals } from "../pl/rituals";

export const rituals: typeof PlRituals = {
  meta: {
    listTitle: "New moon & full moon rituals — cyclical practices | Liora Ylva",
    listDescription:
      "Structured rituals for working with the lunar cycle: an intention at the new moon, closure at the full moon. Step-by-step instructions, no props and no theatrics.",
    detailTitle: "{{title}} — step-by-step ritual | Liora Ylva",
  },
  notFound: {
    title: "Ritual unavailable",
  },
  breadcrumbs: {
    home: "Home",
    rituals: "Rituals",
  },
  page: {
    eyebrow: "Cyclical practice",
    title: "Rituals",
    emptyTitle: "Rituals are in preparation",
    emptyDescription: "Come back soon — the first set will appear with the next cycle.",
    stepsCount: "{{count}} steps",
    backToAll: "← All rituals",
  },
  items: {
    nowiu: {
      title: "New moon ceremony",
      cycle: "New Moon — start of the cycle",
      summary:
        "An initiating practice: precisely formulating a single intention for the cycle and assigning it a first action with a date.",
      steps: {
        step1: {
          title: "Narrowing the intention",
          description:
            'Write one sentence in the present tense, without negation and without alternatives. If the sentence contains "and", split it and choose one part.',
        },
        step2: {
          title: "Cost and condition",
          description:
            "Add what you are genuinely giving up in return: time, comfort, a relationship, a habit. An intention without a cost remains a wish.",
        },
        step3: {
          title: "First step within 72 hours",
          description:
            "Set one action achievable within three days and assign it a specific date. This is the single element that determines the effectiveness of the whole practice.",
        },
        step4: {
          title: "Closing the record",
          description:
            "The record is set aside until the full moon. You do not return to it, modify it, or comment on it. Verification happens two weeks later.",
        },
      },
    },
    pelni: {
      title: "Full moon ceremony",
      cycle: "Full Moon — culmination of the cycle",
      summary:
        "A practice of reckoning: verifying the intention set at the new moon and closing one concrete matter in the physical world.",
      steps: {
        step1: {
          title: "Settling the intention",
          description:
            "Return to the record from the new moon and mark what has been done, what has been started, and what remained a declaration. No judgment — just three categories.",
        },
        step2: {
          title: "Naming resistance",
          description:
            'For unfinished items, add the specific factor that blocked them. Turn generalizations like "no time" into an actual fact.',
        },
        step3: {
          title: "One closure",
          description:
            "Choose one thing to finish this week: a conversation, an agreement, a subscription, a file, a contact. One per cycle, carried through to the end.",
        },
        step4: {
          title: "Regeneration",
          description:
            "Plan two days of reduced load. The phase after culmination serves reduction, not further beginnings.",
        },
      },
    },
    granice: {
      title: "Working with a boundary",
      cycle: "21-day cycle",
      summary:
        "A structured practice for reclaiming a single boundary in a professional or personal relationship, carried out over three weeks.",
      steps: {
        step1: {
          title: "Diagnosis",
          description:
            "Identify one situation after which you regularly feel drained. Write down its course in three sentences: the trigger, your reaction, the cost.",
        },
        step2: {
          title: "Formulation",
          description:
            "Prepare one sentence of refusal that you are ready to say without justifying it. A shorter sentence is more effective.",
        },
        step3: {
          title: "Repetition",
          description:
            "Use the same sentence in the same situation for 21 days. The goal is not conflict, but the predictability of your response.",
        },
        step4: {
          title: "Verification",
          description:
            "After three weeks, assess the change in costs, not in other people's emotions. That is the only reliable indicator.",
        },
      },
    },
  },
};
