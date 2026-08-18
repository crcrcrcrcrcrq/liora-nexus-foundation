import type { Dictionary } from "../pl";

/** Experience Center — English mirror of the Polish source of truth. */
export const experience: Dictionary["experience"] = {
  sampleNotice: "Sample record — real traces appear once the Chronicle is connected.",
  timeline: {
    booking: "{{id}} asked for a conversation: {{service}}.",
  },
  time: {
    today: "today",
    yesterday: "yesterday",
  },
  overview: {
    greeting: "Good morning, Liora.",
    lines: {
      returned: "{{count}} people came back to you today.",
      awaiting: "{{count}} conversations are waiting for your word.",
      scheduled: "{{count}} consultations are confirmed.",
    },
    todayTitle: "What happened today",
    todayLink: "See the whole day",
  },
  people: {
    title: "Presences",
    description:
      "People who left a trace with you. Everyone carries a private LIORA identifier — no system numbers here.",
    listTitle: "Who is present",
    empty: {
      title: "No one has left a trace yet.",
    },
    visits: "{{count}} visits",
    tiers: {
      guest: "Guest",
      member: "Presence",
      premium: "Inner circle",
    },
    contact: {
      calm: "Quiet",
      awaiting: "Awaiting your word",
      answered: "Answered",
    },
  },
  chronicle: {
    title: "Personal chronicle",
    visits: "Visits",
    rituals: "Rituals",
    interpretations: "Interpretations",
    lastActivity: "Last trace",
    marksTitle: "Traces",
    unavailable: {
      title: "The Chronicle stays private",
      description:
        "Chronicle entries are visible only to their author. No panel role has a read path to someone else's reflections, rituals or notes.",
    },
    readOnly: "The Chronicle is a record of history — this space reads it, never rewrites it.",
    kinds: {
      tarot: "Tarot",
      astrology: "Astrology",
      consultation: "Consultation",
      interpretation: "Interpretation",
      note: "Note",
    },
  },
  consultations: {
    title: "Consultations",
    description: "Five calm states of a conversation. No sales funnel, no rush.",
    all: "All",
    advance: "Move onward",
    readOnly:
      "A reading view — the state of a conversation is changed by the person who asked for it.",
    requested: "Asked {{when}}",
    scheduledFor: "Set for {{when}}",
    stages: {
      new: "New",
      awaiting: "Awaiting reply",
      scheduled: "Scheduled",
      completed: "Held",
      closed: "Closed",
    },
  },
  activity: {
    title: "Activity",
    description: "The day told in sentences, not in log entries.",
    todayLabel: "Today",
    quiet: "Still quiet today.",
  },
  privacy: {
    title: "Privacy",
    identifiers: "People are visible only under their private LIORA identifier.",
    encryption: "Personal data is stored encrypted; decryption happens on the server only.",
    moderator: "A moderator has no path that leads to personal data.",
    adminScope: "Your role may see personal data once the backend is connected.",
    maskedScope: "Your role sees LIORA identifiers only.",
  },
  telegram: {
    title: "Telegram",
    description:
      "The notification architecture is ready. The external API arrives in the next stage.",
    adapterTitle: "Adapter",
    transportLabel: "Transport",
    stateLabel: "State",
    stateReady: "Connected",
    statePending: "Prepared, inactive",
    secretsLabel: "Secrets",
    secretsValue: "Outside the code, server side",
    adapterNote:
      "The adapter knows signals and wording, not Telegram. Connecting the API means swapping one transport.",
    signalsTitle: "Signals",
    signals: {
      consultation_new: "New consultation",
      interpretation_ordered: "Interpretation ordered",
      member_premium: "New person in the inner circle",
      system_issue: "Technical signal",
    },
    messages: {
      consultation: "{{id}} asks for a conversation: {{subject}}.",
      interpretation: "{{id}} ordered an interpretation: {{subject}}.",
      premium: "{{id}} joined the inner circle.",
      system: "Attention needed: {{detail}}.",
    },
    anonymous: "Person without an identifier",
    unspecified: "no description",
    previewSubject: "a conversation about direction",
    previewDetail: "the notification channel is not connected yet",
    privacyTitle: "What is sent",
    privacyNote:
      "A notification carries only the LIORA identifier and a short description. Names, email addresses and conversation content never leave the system through this channel.",
  },
  sample: {
    consultations: {
      first: "a conversation about changing direction",
      second: "a question about the new moon ritual",
      third: "preparing for a move",
      fourth: "closing the year",
      fifth: "a conversation that ended calmly",
    },
    timeline: {
      first: "Someone returned after three weeks of silence.",
      second: "A new tarot spread was laid out.",
      third: "A conversation was requested and awaits your word.",
      fourth: "An astrological interpretation was ordered.",
      fifth: "Someone from the inner circle looked in for the twenty-fourth time.",
      sixth: "The evening full moon ritual was written into the Chronicle.",
    },
    interpretations: {
      first: "Birth chart interpretation",
      second: "Personal year — a record",
    },
    marks: {
      first: "A spread of three cards",
      second: "Birth chart interpretation",
      third: "Full moon ritual",
      fourth: "A conversation about direction",
    },
  },
};
