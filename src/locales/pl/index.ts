import { common } from "./common";
import { nav } from "./nav";
import { seo } from "./seo";
import { layout } from "./layout";
import { landing } from "./landing";
import { about } from "./about";
import { services } from "./services";
import { rituals } from "./rituals";
import { faq } from "./faq";
import { locations } from "./locations";
import { library } from "./library";
import { contact } from "./contact";
import { legal } from "./legal";
import { booking } from "./booking";
import { tarot } from "./tarot";
import { astrology } from "./astrology";
import { auth } from "./auth";
import { chronicle } from "./chronicle";
import { sanctuary } from "./sanctuary";
import { admin } from "./admin";
import { experience } from "./experience";
import { forms } from "./forms";
import { states } from "./states";
import { errors } from "./errors";
import { telegram } from "./telegram";

/**
 * Słownik języka polskiego — źródło prawdy dla wszystkich kluczy tłumaczeń.
 * Każda przestrzeń nazw żyje w osobnym pliku (`src/locales/pl/<namespace>.ts`).
 */
export const pl = {
  common,
  nav,
  seo,
  layout,
  landing,
  about,
  services,
  rituals,
  faq,
  locations,
  library,
  contact,
  legal,
  booking,
  tarot,
  astrology,
  auth,
  chronicle,
  sanctuary,
  admin,
  experience,
  forms,
  states,
  errors,
  telegram,
};

/** Kontrakt kluczy, który musi spełnić każdy kolejny język. */
export type Dictionary = typeof pl;
