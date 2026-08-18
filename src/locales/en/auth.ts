import type { auth as PlAuth } from "../pl/auth";

export const auth: typeof PlAuth = {
  meta: {
    title: "Return to your Soul Chronicle — Liora Ylva",
    description: "Return to your Soul Chronicle with a personal link sent to your email address.",
  },
  card: {
    eyebrow: "Soul Chronicle",
  },
  magicLink: {
    verifying: {
      title: "Opening your Chronicle",
      description: "We are opening your space. This will only take a moment.",
    },
    email: {
      label: "Email address",
      hint: "One message, one key to return. No passwords, no formalities.",
      placeholder: "name@example.com",
    },
    submit: {
      idle: "Return to your Soul Chronicle",
      sending: "Preparing your return key…",
    },
    sent: {
      title: "Invitation on its way",
      description:
        "If your address is part of our secure space, you will shortly receive a message with your personal return key.",
      note: "The message may take a moment to arrive. Feel free to close this page — the key will wait.",
      again: "Use a different address",
      footer: {
        question: "Don't have a Chronicle yet?",
        cta: "Write to us",
      },
    },
    form: {
      title: "Your story continues",
      description:
        "Enter the address your Chronicle is kept under. We will prepare your personal return key — no passwords, no formalities.",
      footer: {
        question: "Still getting to know LIORA?",
        cta: "Start with a free reading",
      },
    },
    errors: {
      sendFailed: "Could not prepare a return key right now. Please try again shortly.",
      verifyFailed: "This return key has expired. Request a new one — we'll prepare it right away.",
    },
  },
  access: {
    invitation: {
      eyebrow: "Soul Chronicle",
      title: "This space is waiting for you",
      description:
        "Your journey is kept in a secure Chronicle. Request your personal return key and we will open it for you.",
      cta: "Return to your Soul Chronicle",
    },
    restricted: {
      eyebrow: "Access",
      title: "This area remains closed",
      description:
        "This part of the space remains closed for now. If you feel it should be open to you, write to us — we will gladly look into it.",
      cta: "Back to start",
    },
    pending: "Opening your Chronicle…",
  },
  chronicleLink: {
    authenticated: "Soul Chronicle",
    guest: "Return to Chronicle",
  },
};
