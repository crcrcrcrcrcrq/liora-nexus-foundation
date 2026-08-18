import type { library as PlLibrary } from "../pl/library";

export const library: typeof PlLibrary = {
  meta: {
    listTitle: "Library of Reflections — essays for a daily practice | Liora Ylva",
    listDescription:
      "A collection of essays on silence, the symbolism of the Major Arcana, keeping a Soul Chronicle, and the questions that keep returning.",
    postNotFoundTitle: "Text unavailable — Liora Ylva",
  },
  breadcrumbs: {
    home: "Home",
    library: "Library of Reflections",
  },
  page: {
    eyebrow: "Library of Reflections",
    title: "Texts for slow reading",
    description:
      "A short collection of essays that accompany the practice. No shortcuts, no promises. Read one at a time.",
    emptyTitle: "The library is still empty",
    emptyDescription: "The first text will appear with the next lunar cycle.",
    readingMinutes: "{{count}} min read",
    allPosts: "All texts",
    featured: "Opening text",
    author: "Liora Ylva",
    authorRole: "Tarot and astrology",
    related: "Related reflections",
    chronicleTitle: "Write down what stayed",
    chronicleBody:
      "The Soul Chronicle is a place for one sentence after reading. It stays with you and no one else sees it.",
    chronicleCta: "Go to the Soul Chronicle",
  },
  notFound: {
    eyebrow: "Not found",
    title: "This text doesn't exist",
    back: "Back to the Library",
  },
  posts: {
    "cisza-tez-potrafi-odpowiedziec": {
      title: "Silence Can Answer Too",
      category: "Practice",
      heroAlt: "A single candle burning in a dark interior",
      excerpt:
        "The absence of an answer is often the most precise answer. It only needs enough room.",
      lead: "Most people arrive for a sentence that will settle things. What they usually need is a few minutes in which nothing is settled at all.",
      quote:
        "Silence is not the absence of an answer. It is an answer that refuses to be repeated too quickly.",
      sections: {
        s1: {
          heading: "Why haste ruins the answer",
          p1: "A question asked under tension always demands an immediate reply. That is understandable: tension is expensive and we want it gone. The trouble is that the first answer to arrive almost never concerns the question — it concerns the tension.",
          p2: "That is why, in the practice I run, I say nothing for a moment after the cards are laid out. This is not a theatrical gesture. It is a way of checking what completes itself when no one is prompting.",
        },
        s2: {
          heading: "The three-minute practice",
          p1: "Choose one question you have been carrying for a while. Write it down in a single sentence. Then put the pen aside and do nothing for three minutes — no music, no phone, no attempt to solve anything.",
          p2: "After three minutes, add one sentence. Not an answer, only what you noticed. After a week of such notes it becomes clear whether the question is about a decision or about the fear of its consequences.",
        },
        s3: {
          heading: "When silence is not enough",
          p1: "Silence is a clarifying tool, not a healing one. If a crisis, exhaustion, or persistent anxiety stands behind the question, staying quiet only preserves it. What is needed then is a conversation — with a therapist, a doctor, someone with the right competence.",
          p2: 'I know the boundary of this method and consider it its greatest strength. A practice unable to say "not here" is not a practice, only an offer.',
        },
      },
    },
    "dlaczego-wracamy-do-tych-samych-pytan": {
      title: "Why We Return to the Same Questions",
      category: "Depth psychology",
      heroAlt: "Concentric ripples on dark, still water",
      excerpt:
        "A question that returns is rarely the same question. What changes is the person asking it.",
      lead: '"The same thing again" — I hear this sentence more often than any other. It is almost always untrue.',
      quote: "Repetition is not failure. It is information that the subject still matters to you.",
      sections: {
        s1: {
          heading: "Loop or spiral",
          p1: "A loop is the same level, the same perspective, the same arguments. A spiral looks similar from above, but with every turn you stand slightly higher and see a little more.",
          p2: "The distinction is testable. Write down your answer to the same question today and compare it with a note from six months ago. If the vocabulary changed, it is a spiral. If the sentences are identical, it is a loop — and worth asking what sustains it.",
        },
        s2: {
          heading: "What actually returns",
          p1: "Usually it is not the question that returns but the cost attached to the answer. People know perfectly well what they should do. They come back looking for a version in which no one has to pay for it.",
          p2: "Honest work means naming the price. Once the cost is said out loud, the decision stops being a riddle and becomes a choice — difficult, but possible to make.",
        },
        s3: {
          heading: "How to break the circuit",
          p1: 'Set a deadline. Not "someday", but a specific date until which you gather information. After that date you gather nothing more — you decide with what you have.',
          p2: "This single rule ends most of the loops people sit in for years. Not because it brings certainty, but because it strips postponement of its air of good sense.",
        },
      },
    },
    "tarot-jako-narzedzie-refleksji": {
      title: "Tarot as a Tool of Reflection",
      category: "Method",
      heroAlt: "Three cream cards face down on dark linen",
      excerpt:
        "A card decides nothing. It offers a vocabulary for what is hard to name on your own.",
      lead: "Tarot does not predict the future. It orders the present well enough that the future stops being fog.",
      quote:
        "A card does not say what will happen. It shows the position you are looking from — and that changes more.",
      sections: {
        s1: {
          heading: "An image instead of a diagnosis",
          p1: "Working with an image has one advantage over conversation: it bypasses rehearsed formulas. When you look at a scene on a card, you describe it in your own words — and the words you choose are the real material.",
          p2: "That is why interpretation in my practice is never a monologue. First I ask what you see. Only then do I add the context of a tradition the card has lived in for several hundred years.",
        },
        s2: {
          heading: "Three questions that work",
          p1: 'A good question to the cards begins with "what" or "how", not with "will". "Will he come back" closes the conversation into a bet; "what am I not seeing in this relationship" opens it onto something usable.',
          p2: "Three questions we most often start with: what do I not want to see today, what am I trying to control, and what can I do this week without anyone's permission.",
        },
        s3: {
          heading: "The boundary of the method",
          p1: "Tarot does not diagnose illness, locate missing persons, influence other people's will, or replace therapy. Each of those uses is either beyond the method or outright harmful.",
          p2: "What a method does not do says more about it than any promise. An offer that promises everything is accountable for nothing.",
        },
      },
    },
    "jak-prowadzic-kronike-duszy": {
      title: "How to Keep a Soul Chronicle",
      category: "Chronicle",
      heroAlt: "An open notebook and pen under a single lamp",
      excerpt:
        "Three sentences after each reading. Within months they form a map memory cannot reconstruct.",
      lead: "The Chronicle is not a diary. It is a short record of a conversation you had with yourself.",
      quote: "Memory smooths things over. A record does not let you pretend you knew all along.",
      sections: {
        s1: {
          heading: "Three fields and nothing more",
          p1: "What did you hear today. What are you leaving behind. What are you taking with you. Three sentences, one per field. The limit is deliberate — longer forms quickly turn into a story, and a story defends a thesis.",
          p2: "Write immediately after the reading, while the image is fresh. If a sentence refuses to form, leave the field empty. An empty field is information too.",
        },
        s2: {
          heading: "Rhythm instead of system",
          p1: "You do not need daily discipline. A note after each reading and one return to the Chronicle at the full moon is enough — twelve looks back a year.",
          p2: 'During that return, read only the "what you are leaving" field. It is the fastest way to check whether something was actually left behind or merely described well.',
        },
        s3: {
          heading: "The privacy of the record",
          p1: "The Chronicle only works if you write things you would not say out loud. That is why entries stay in your browser and are not sent anywhere.",
          p2: "You can edit or delete every entry. This place belongs to you alone.",
        },
      },
    },
    "symbolika-wielkich-arkanow": {
      title: "The Symbolism of the Major Arcana",
      category: "Symbolism",
      heroAlt: "Gilded astronomical symbols on dark parchment",
      excerpt:
        "Twenty-two cards are not a catalogue of meanings but a sequence. Sense appears in the order.",
      lead: "The Major Arcana are most often read like a dictionary. That is the least useful way to work with them.",
      quote:
        "A card gains meaning only once you know what came before it and what is meant to follow.",
      sections: {
        s1: {
          heading: "A sequence, not a set",
          p1: "From the Fool to the World runs a consistent line: departure, learning, crisis, revision, closure. This structure was described long before depth psychology, but it was Jung who gave it the language we use today.",
          p2: "When the Tower appears in a spread, I ask not about catastrophe but about what preceded it. A Tower without an earlier Chariot tells an entirely different story than a Tower after one.",
        },
        s2: {
          heading: "Four cards that get confused",
          p1: "The High Priestess is active silence, not avoidance. The Hermit is withdrawal with a deadline, not isolation. Death is the end of a form, not of a person. The Devil is a contract entered voluntarily, not external evil.",
          p2: "All four have a passive and an active version. The difference lies not in the card but in whether you are the author of the situation or a participant in it.",
        },
        s3: {
          heading: "Reading your card of the year",
          p1: "Add your birth day and month to the current year and reduce the result to a number between 1 and 22. The card you get is a theme, not a verdict — the question that returns more often this year than any other.",
          p2: "Write it in the Chronicle at the start of the year and come back to that note in December. It is the simplest exercise in symbolism I know, and one of the few with a verifiable result.",
        },
      },
    },
    "poranny-rytual-uwaznosci": {
      title: "A Morning Ritual of Attention",
      category: "Rituals",
      heroAlt: "Morning light passing through a linen curtain",
      excerpt:
        "Seven minutes, one card, one sentence. A ritual is worth keeping when it survives a bad day.",
      lead: "Rituals collapse not from lack of faith but from length. This one has been cut to the point below which it would stop working.",
      quote: "A ritual you cannot perform on the worst morning of the month is only decoration.",
      sections: {
        s1: {
          heading: "Seven minutes",
          p1: 'Two minutes of silence by the window. Three minutes with one card and the question "what do I have no energy for today". Two minutes to write one sentence. No phone within reach.',
          p2: "The order matters: silence before the card, the card before the note. Reversing it turns the practice into planning your day, which is a completely different tool.",
        },
        s2: {
          heading: "What to do on a worse day",
          p1: "On a day when seven minutes is unrealistic, the minimal version remains: one question, one sentence, thirty seconds. Continuity matters more than form.",
          p2: "A ritual interrupted for a week requires no restart and no catching up. You return exactly where you stopped, without settling accounts for the gap.",
        },
        s3: {
          heading: "What it is for",
          p1: "Morning practice does not improve your mood, and that is not its role. It gives you a few minutes in which you are not reacting — and most expensive decisions are made in reaction mode.",
          p2: "After a month the notes begin to form a pattern. That is the real effect of this ritual: not calm, but material you can see.",
        },
      },
    },
  },
};
