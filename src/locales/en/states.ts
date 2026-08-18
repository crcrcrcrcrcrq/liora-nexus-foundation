import type { states as Plstates } from "../pl/states";

export const states: typeof Plstates = {
  loading: {
    default: "Loading…",
  },
  error: {
    title: "This content won't open right now",
    eyebrow: "A brief pause",
    retry: "Try again",
  },
};
