import type { LioraId } from "../model/types";

/**
 * Prywatny identyfikator LIORA.
 *
 * Zasada: w interfejsie nie pojawia się żaden identyfikator techniczny
 * (UUID, numer wiersza, e-mail). Panel zna wyłącznie `LIO-XXXX-XXXX`.
 *
 * Docelowo identyfikator wydaje backend i przechowuje go obok rekordu osoby.
 * Funkcja poniżej jest deterministyczną projekcją identyfikatora technicznego,
 * dzięki czemu ten sam rekord zawsze otrzymuje ten sam znak — i żaden widok
 * nie musi znać źródłowego ID.
 */

const ALPHABET = "0123456789ABCDEF";
const BLOCK = 4;

function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

function block(seed: number): string {
  let value = seed;
  let out = "";
  for (let index = 0; index < BLOCK; index += 1) {
    out += ALPHABET[value % ALPHABET.length];
    value = Math.floor(value / ALPHABET.length) + 7;
  }
  return out;
}

/** Deterministyczna projekcja identyfikatora technicznego na znak LIORA. */
export function toLioraId(technicalId: string): LioraId {
  const first = fnv1a(`liora:${technicalId}`);
  const second = fnv1a(`liora:${technicalId}:${first}`);
  return `LIO-${block(first)}-${block(second)}`;
}

const LIORA_ID_PATTERN = /^LIO-[0-9A-F]{4}-[0-9A-F]{4}$/;

export function isLioraId(value: string): value is LioraId {
  return LIORA_ID_PATTERN.test(value);
}

/** Zapis do interfejsu: cienkie spacje zamiast myślników w wersji ozdobnej. */
export function formatLioraId(id: LioraId): string {
  return id.replace(/-/g, " · ");
}
