import type { legal as PlLegal } from "../pl/legal";

export const legal: typeof PlLegal = {
  terms: {
    meta: {
      title: "Terms of Service | Liora Ylva",
      description:
        "Terms governing tarot and astrology consultations: scope of services, booking, cancellations, complaints and the limits of liability.",
    },
    page: {
      eyebrow: "Documents",
      title: "Terms of Service",
    },
    sections: {
      scope: {
        title: "1. Scope of services",
        body: "Consultations are developmental and supportive in nature. They do not constitute medical, psychotherapeutic, legal or financial advice.",
      },
      nature: {
        title: "2. Nature of the practice",
        body: "Tarot and astrology are used here as tools for reflection and for ordering your own decisions. They guarantee no specific events or outcomes and do not replace professional specialist support.",
      },
      siteUse: {
        title: "3. Using the site",
        body: "The free tarot spread and the preliminary astrological analysis are available without an account. An account (email link sign-in) exists solely to keep your Soul Chronicle and to review your own bookings. Using the site in a way that disrupts its operation is not permitted.",
      },
      booking: {
        title: "4. Booking",
        body: "Bookings are made through the form on the site. A request is not yet a confirmed date — the date becomes binding only once I confirm it by email.",
      },
      payment: {
        title: "5. Payments",
        body: "The site does not process online payments — the prices shown are informational. The method and timing of payment are agreed individually when the booking is confirmed. [TO BE COMPLETED: final payment terms, accepted methods and transfer details.]",
      },
      cancellation: {
        title: "6. Cancelling a session",
        body: "A session may be rescheduled at no cost up to 48 hours before it begins by writing to {{email}}. Later cancellations forfeit the slot unless we agree otherwise.",
      },
      sessionFlow: {
        title: "7. Session flow",
        body: "Sessions take place online or in person, as agreed. An audio recording is made only with the consent of both parties and is shared with the client.",
      },
      userObligations: {
        title: "8. Your rights and obligations",
        body: "You provide accurate contact details, use the site lawfully and respect the other party's privacy. You may delete your Soul Chronicle entries at any time and request deletion of your account.",
      },
      liability: {
        title: "9. Liability",
        body: "Decisions made after a consultation remain your decisions. I am not liable for the consequences of actions taken on their basis, nor for short technical interruptions in the availability of the site.",
      },
      complaints: {
        title: "10. Complaints",
        body: "Complaints are accepted at {{email}} within 14 days of the session. A reply is sent within 14 business days.",
      },
      age: {
        title: "11. Participant age",
        body: "Consultations are available to adults only.",
      },
      changes: {
        title: "12. Changes to these terms",
        body: "These terms may be updated. Changes take effect once published on this page and do not apply retroactively to bookings already confirmed.",
      },
      contact: {
        title: "13. Contact",
        body: "For questions about these terms and about consultations: {{email}}.",
      },
    },
  },
  privacy: {
    meta: {
      title: "Privacy Policy | Liora Ylva",
      description:
        "What data is collected through the booking, contact and newsletter forms, for what purpose it is processed and how long it is retained.",
    },
    page: {
      eyebrow: "Documents",
      title: "Privacy Policy",
    },
    sections: {
      controller: {
        title: "1. Data controller",
        body: "The data controller is {{legalName}}. For matters concerning your data, contact {{email}}. [TO BE COMPLETED: full registration details and postal address of the controller.]",
      },
      scope: {
        title: "2. Data collected",
        body: "I collect only the data you provide in the forms and the data needed to run your account: name, email address, chosen service, preferred date, message content, and whatever you yourself write in the Soul Chronicle.",
      },
      purpose: {
        title: "3. Purpose of processing",
        body: "Data is used solely to arrange and deliver consultations, to answer your message, to run your account and Soul Chronicle, and to send the newsletter if you ask for it.",
      },
      legalBasis: {
        title: "4. Legal basis",
        body: "Article 6(1)(b) GDPR (performance of a contract) for bookings and accounts, Article 6(1)(f) (legitimate interest) for correspondence, Article 6(1)(a) (consent) for the newsletter.",
      },
      bookings: {
        title: "5. Bookings",
        body: "The booking form collects your name, email, chosen service, preferred date and the content of your question. This data is stored in the site's database and used only to arrange and hold the consultation.",
      },
      contactForms: {
        title: "6. Contact forms",
        body: "The contact form collects your name, email, subject and message so that I can reply. The newsletter collects only your email address, based on your consent, which you may withdraw at any time.",
      },
      email: {
        title: "7. Email communication",
        body: "Booking confirmations and replies are sent by email through an external delivery provider. Only the data needed to handle your request is included in those messages.",
      },
      accounts: {
        title: "8. User accounts",
        body: "Sign-in uses a link sent to your email address — no passwords are stored. An account holds your email address, an optional display name and your preferred language.",
      },
      chronicle: {
        title: "9. Soul Chronicle",
        body: "Ritual records, notes and reflections in the Soul Chronicle are private and visible only to you once signed in. You can edit and delete them yourself.",
      },
      browserStorage: {
        title: "10. Browser storage",
        body: "The site uses your browser's local storage to remember your language choice, your sign-in session, the daily limit of the free spread and reflection drafts. These are not advertising cookies and the data is not shared with third parties.",
      },
      analytics: {
        title: "11. Analytics",
        body: "The site uses no analytics tools and no advertising tracking. The free tarot spread and the preliminary astrological analysis are calculated locally in your browser.",
      },
      retention: {
        title: "12. Retention period",
        body: "Booking data is retained for the period required by accounting regulations. Correspondence is deleted after 24 months. Account and Chronicle data is kept until the account is deleted. Newsletter records are kept until you unsubscribe.",
      },
      recipients: {
        title: "13. Recipients of data",
        body: "Data is shared only with the providers required to run the site: application hosting, the database and authentication provider, and the email delivery provider. Data is never sold, and users are not profiled.",
      },
      security: {
        title: "14. Security",
        body: "Access to data is restricted at the database level by row-level security policies: you see only your own data once signed in, and administrative content requires a staff role verified on the server. The connection to the site is encrypted (HTTPS).",
      },
      rights: {
        title: "15. Your rights",
        body: "You have the right to access, rectify, erase and restrict processing of your data, as well as the right to data portability, objection, and to lodge a complaint with the President of the Personal Data Protection Office.",
      },
      changes: {
        title: "16. Changes to this policy",
        body: "This policy may be updated when the way the site works changes. The current version is always available on this page.",
      },
      contact: {
        title: "17. Contact",
        body: "For matters concerning personal data, write to {{email}}.",
      },
    },
  },
};
