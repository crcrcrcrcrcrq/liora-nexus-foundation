import type { forms as Plforms } from "../pl/forms";

export const forms: typeof Plforms = {
  privacy: {
    contact: "Your details stay with me and serve only to answer this message.",
    booking: "What you share here is used only to arrange a date. It reaches no one but me.",
    newsletter: "I keep only your address. You can leave with one click, no questions asked.",
    magicLink: "Your address only prepares your return key. I build no marketing profile.",
    astrology:
      "Your birth date, time and place stay in my private space and serve only to calculate the chart.",
    tarot: "The spread happens in your browser. Nothing is stored or sent anywhere.",
    chronicle: "The chronicle stays private. Only you and I can see it — no one else.",
  },
  validation: {
    nameRequired: "Please enter your name.",
    emailInvalid: "Please enter a valid email address.",
    serviceRequired: "Please choose a type of session.",
    birthDateRequired: "Please enter your birth date.",
    birthDateInvalid: "Please enter a valid birth date.",
    birthDateFuture: "Birth date can't be in the future.",
    birthTimeRequired: "Please enter your birth time.",
    birthTimeInvalid: "Please enter time in 24-hour format, e.g. 14:30.",
    cityRequired: "Please enter your birth city.",
    topicRequired: "Please write what your message is about.",
    messageRequired: "Please write a bit more — I want to understand well.",
    consentRequired: "I need your consent to be able to reply.",
  },
  contact: {
    nameLabel: "Name",
    emailLabel: "Email",
    topicLabel: "Topic",
    messageLabel: "Message",
    consentLabel: "I consent to my data being processed in order to receive a reply to my enquiry.",
    formAriaLabel: "Contact form",
    submitIdle: "Continue",
    submitPending: "Sending…",
    successMessage:
      "Your message has reached me. I will reply within two business days — quietly and personally.",
    errorMessage:
      "The message didn't get through this time. Please try again shortly, or write directly to the address in the Contact section.",
  },
  newsletter: {
    emailLabel: "Email address",
    emailPlaceholder: "your@email.com",
    submitIdle: "Join",
    submitPending: "Just a moment…",
    successMessage: "You're with us. The first letter arrives with the next full moon.",
    errorMessage: "This address can't be signed up right now. Please try again shortly.",
  },
};
