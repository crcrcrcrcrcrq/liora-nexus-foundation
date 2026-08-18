/**
 * Model refleksji zapisywanej po odczycie Tarota.
 *
 * Refleksja jest wpisem pamiętnika, nie rekordem. Zapis pozostaje na
 * urządzeniu użytkownika — Kronika nie wysyła go nigdzie dalej.
 */

export interface ReflectionCard {
  /** Nazwa karty w brzmieniu z talii. */
  name: string;
  /** Etykieta pozycji w rozkładzie. */
  position: string;
  /** Ułożenie karty, już opisane słowem. */
  orientation: string;
}

export interface SoulReflection {
  id: string;
  /** Data i godzina odczytu (ISO 8601). */
  readingAt: string;
  /** Data ostatniej edycji wpisu (ISO 8601). */
  updatedAt: string;
  /** Język, w którym odczyt się wydarzył. */
  language: string;
  /** Nazwa rozkładu. */
  spread: string;
  cards: readonly ReflectionCard[];
  interpretation: string;
  /** Co dziś usłyszałaś/usłyszałeś? */
  heard: string;
  /** Co dziś zostawiasz? */
  leaving: string;
  /** Co zabierasz ze sobą? */
  taking: string;
}

/** Trzy pola, które użytkownik wypełnia samodzielnie. */
export type ReflectionAnswers = Pick<SoulReflection, "heard" | "leaving" | "taking">;

/** Kontekst odczytu zapisywany automatycznie. */
export type ReflectionContext = Omit<SoulReflection, "id" | "updatedAt" | keyof ReflectionAnswers>;
