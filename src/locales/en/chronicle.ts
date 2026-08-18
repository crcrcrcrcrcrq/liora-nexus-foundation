import type { chronicle as Plchronicle } from "../pl/chronicle";
export const chronicle: typeof Plchronicle = {
  privacy: {
    line1: "This place belongs to you alone.",
    line2: "Your reflections remain private.",
  },
  reflections: {
    eyebrow: "Chronicle of the Soul",
    title: "Reflection history",
    lead: "Your own sentences.",
    description:
      "The words you left behind after your readings. You can return to them and add to them whenever you wish.",
    empty: "Your first reflection will appear here once a Tarot reading is complete.",
    timelineAria: "Timeline of your reflections",
    entry: {
      edit: "Add to this entry",
      interpretation: "Reading interpretation",
      language: "Reading language",
    },
    form: {
      aria: "Reflection written after the reading",
      eyebrow: "Chronicle of the Soul",
      title: "Hold on to what you have just heard.",
      heard: "What did you hear today?",
      leaving: "What are you leaving behind today?",
      taking: "What are you taking with you?",
      placeholder: "One sentence is enough.",
      save: "Keep it in the Chronicle",
      update: "Keep the changes",
      cancel: "Leave it as it is",
      note: "This place belongs to you alone. Your reflections remain private.",
      savedTitle: "Kept in your Chronicle.",
      savedBody:
        "The date, the cards and the interpretation were saved alongside your words. Return to this entry whenever you like.",
      savedLink: "Open the reflection history",
    },
  },
  nav: {
    aria: "Chronicle of the Soul sections",
  },
  sections: {
    home: {
      label: "Last ritual",
      description:
        "The freshest trace of your practice — the spread, the date, and the reflection.",
    },
    rituals: {
      label: "Ritual traces",
      description:
        "The whole path: tarot spreads and astrological readings, in the order they unfolded.",
    },
    consultations: {
      label: "Your sessions",
      description: "Appointment times for individual conversations and the summaries that follow.",
    },
    notes: {
      label: "My notes",
      description: "Private notes that accompany your path.",
    },
    reflections: {
      label: "Reflection history",
      description: "Your own sentences, written after your readings.",
    },
    profile: {
      label: "My profile",
      description: "Birth details, contact preferences, and consents.",
    },
  },
  reports: {
    eyebrow: "Quarterly summaries",
    description: "A calm glance at what unfolded across the quarters of your path.",
    title: "Summary — Q{{quarterNumber}} {{year}}",
    summary: "Rituals: {{rituals}} · Sessions: {{consultations}}",
    empty: "A quarterly summary will appear here once you leave the first trace of your path.",
  },
  home: {
    eyebrowWithName: "Chronicle — {{name}}",
    eyebrow: "Chronicle of the Soul",
    title: "Welcome back.",
    lead: "This place remembers your path.",
    description:
      "Every reflection leaves a trace. You can return to earlier experiences at any time.",
    sampleNote: "Sample entry — your own traces will appear here.",
    timelineEyebrow: "Timeline",
    backLink: "Return to earlier experiences",
  },
  rituals: {
    eyebrow: "Chronicle of the Soul",
    title: "Ritual traces",
    lead: "Everything behind you.",
    description:
      "A timeline of your tarot spreads and astrological readings. Each entry keeps the date, the intention, and the insights.",
    sampleNote: "Sample entry — your traces will appear here.",
    emptyNote: "Entries will appear here once you complete your first ritual in your Chronicle.",
  },
  consultations: {
    eyebrow: "Chronicle of the Soul",
    title: "Your sessions",
    lead: "Conversations that last longer than the meeting itself.",
    description:
      "Appointment times, their statuses, and the summaries prepared after each session.",
    sampleNote: "Sample entry — your sessions will appear here.",
    upcomingEyebrow: "Upcoming sessions",
    upcomingEmpty:
      "Once your booking is confirmed, you will see the date, the format of the meeting, and the status of preparations here.",
    pastEyebrow: "Saved sessions",
    pastEmpty: "Records of past sessions, along with their summaries, will be kept here.",
    status: {
      upcoming: "Upcoming",
      completed: "Saved",
      cancelled: "Cancelled",
    },
    viewRecord: "View record",
  },
  notes: {
    eyebrow: "Chronicle of the Soul",
    title: "My notes",
    lead: "Notes meant only for you.",
    description:
      "Private notes that accompany your path. Your notes are kept privately in your Chronicle and visible only to you.",
    cardTitle: "Notes",
    empty: "A place for your reflections. Your first note will appear here once you save it.",
    form: {
      cardTitle: "New note",
      label: "Your note",
      placeholder: "Write down what you want to keep.",
      save: "Save note",
      update: "Save changes",
      cancel: "Cancel",
    },
    actions: {
      edit: "Edit",
      delete: "Delete",
    },
  },
  profile: {
    eyebrow: "Chronicle of the Soul",
    title: "My profile",
    lead: "Only what is needed.",
    description: "A few details so the Chronicle knows whom it is welcoming back.",
    rows: {
      name: "Name",
      email: "Email address",
      joinedAt: "In the Chronicle since",
    },
    endSession: {
      title: "End session",
      description:
        "You can close the Chronicle on this device at any time. Your history remains safe and waits for your next return.",
      button: "Close Chronicle",
    },
  },
  ritualKind: {
    tarot: "Tarot",
    astrology: "Astrology",
    note: "Note",
  },
  timeline: {
    emptyNote: "Your first trace will appear here after your next ritual.",
    expand: "Expand entry",
    collapse: "Collapse entry",
  },
  reflection: {
    defaultSource: "Today's reflection",
    defaultBody:
      "Pause for a moment. What you notice today will become part of your path tomorrow.",
  },
  lastRitual: {
    eyebrow: "Last ritual",
    emptyTitle: "Your Chronicle awaits its first trace.",
    emptyDescription:
      "Once you complete your first ritual, its record will live here — with the date, the intention, and a reflection you can return to.",
    backToInterpretation: "Back to interpretation",
  },
  sampleNotice: {
    loading: "Opening your traces…",
  },
  format: {
    dateTimeConnector: "at",
    empty: "—",
  },
  sample: {
    profileEmail: "—",
    ritual1: {
      title: "Three Paths Spread",
      reflection:
        "The choice you keep postponing is ripening in silence. You don't need to rush it.",
      details:
        "The cards gathered around patience. The first path spoke of returning to an abandoned practice, the second of a conversation you avoid, the third of rest without guilt.",
    },
    timelineRitual1: {
      title: "Three Paths Spread",
      reflection: "The choice you keep postponing is ripening in silence.",
      details:
        "The cards gathered around patience — a return to practice, a postponed conversation, and rest without guilt.",
    },
    ritual2: {
      title: "Natal Chart Analysis",
      reflection: "Your sensitivity is not a weakness — it is a tool for orientation.",
      details:
        "The arrangement of lights pointed to a need for rhythm: working in waves rather than a straight line. The insights returned in later rituals.",
    },
    ritual3: {
      title: "Evening note",
      reflection: "The day you stopped justifying your rest.",
    },
    consultation1: {
      type: "Individual consultation",
      summary: "Online meeting, 60 minutes. Topic: a professional decision.",
    },
    consultation2: {
      type: "In-depth tarot session",
      summary: "The summary and recommendations have been saved in your Chronicle.",
    },
    reflection: {
      body: "Not everything important requires an immediate answer. Today it is enough to notice what is shifting within you.",
      source: "Reflection of the day",
    },
  },
  meta: {
    layout: {
      title: "Chronicle of the Soul",
      description: "A private space for reflection at LIORA.",
    },
    home: {
      title: "Welcome back",
    },
    rituals: {
      title: "Ritual traces",
    },
    consultations: {
      title: "Your sessions",
    },
    notes: {
      title: "My notes",
    },
    reflections: {
      title: "Reflection history",
    },
    profile: {
      title: "My profile",
    },
  },
};
