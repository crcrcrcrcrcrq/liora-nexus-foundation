import type { errors as Plerrors } from "../pl/errors";

export const errors: typeof Plerrors = {
  meta: {
    title: "Page not found",
    description: "This path does not exist on the Liora Ylva site.",
  },
  notFound: {
    eyebrow: "Unknown path",
    title: "This path doesn't exist",
    description:
      "This place has either moved or never existed. Feel free to return to the start — the way is waiting.",
    backHome: "Back to home",
  },
  boundary: {
    eyebrow: "A brief pause",
    title: "This page won't open right now",
    description:
      "Something stopped on our end. Try again or return to the start — nothing has been lost.",
    retry: "Try again",
    backHome: "Back to home",
  },
  api: {
    requestFailed: "This request could not be completed right now. Please try again shortly.",
    timeout: "The response didn't arrive in time. Please try again.",
    offline: "We currently have no connection. Check your network and try again.",
    connectionInterrupted: "Something interrupted the connection. Please try again in a moment.",
  },
};
