import type { booking as PlBooking } from "../pl/booking";

export const booking: typeof PlBooking = {
  meta: {
    title: "Book a tarot or astrology session | Liora Ylva",
    description:
      "Book an individual consultation, a relationship analysis or an annual astrological chart. You will receive confirmation of the date by email.",
  },
  breadcrumb: {
    home: "Home",
    booking: "Booking",
  },
  page: {
    eyebrow: "Booking",
    title: "Let's set a date",
  },
  form: {
    nameLabel: "Name",
    emailLabel: "Email",
    serviceLabel: "Type of session",
    dateLabel: "Preferred date",
    dateHint: "Confirmation of availability will arrive by email.",
    datePlaceholder: "Choose an available day",
    dateEmpty: "No open dates in the coming weeks.",
    messageLabel: "The question you're bringing",
    submit: "Book a session",
    submitting: "Sending…",
    successMessage:
      "Your request has reached me. Confirmation of the date will be sent to the address you provided.",
    errorMessage:
      "The request for a date didn't get through this time. Please try again in a moment.",
    dateTaken: "This date was just booked. Please choose another day.",
    slotUnavailable: "This hour is no longer available. Please choose another one.",
    serviceUnavailable: "This service is currently not available for booking.",
  },
  steps: {
    service: "Service",
    serviceHint: "Choose the type of session.",
    date: "Day",
    time: "Hour",
    details: "Details",
    summary: "Summary",
    confirmation: "Confirmation",
    back: "Back",
    next: "Next",
  },
  states: {
    noServices: {
      title: "No services to book",
      description: "No service is available for booking at the moment.",
    },
    noDates: {
      title: "No open days",
      description: "There are no open dates in the coming weeks. Please check back later.",
    },
    noSlots: {
      title: "No open hours",
      description: "There are no hours in the schedule for this day. Please choose another day.",
    },
    confirmed: {
      title: "Booking received",
    },
  },
  notifications: {
    client: {
      subject: "New booking — {{service}}",
      heading: "Thank you — your session request has reached me.",
      service: "Type of session",
      date: "Preferred date",
      dateUnset: "to be arranged",
      reference: "Request number",
      received: "Your request has been received and is awaiting confirmation.",
      nextStep: "Liora will send the details and the final date confirmation.",
    },
    status: {
      confirmed: {
        subject: "Booking confirmed — {{service}}",
        heading: "Your date has been confirmed.",
      },
      cancelled: {
        subject: "Booking cancelled — {{service}}",
        heading: "This booking has been cancelled.",
      },
      completed: {
        subject: "Booking completed — {{service}}",
        heading: "The session has been closed. Thank you for being there.",
      },
    },
    staff: {
      subject: "New booking — {{service}}",
      heading: "A new session request has arrived.",
      statusSubject: "Booking status changed — {{service}}",
      customer: "Customer",
      contact: "Contact",
      language: "Booking language",
      status: "Status",
    },
  },
};
