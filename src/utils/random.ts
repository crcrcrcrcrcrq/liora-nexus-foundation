/** Kryptograficznie bezpieczna liczba całkowita z zakresu [0, max). */
export function randomInt(max: number): number {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return (buf[0] ?? 0) % max;
  }
  return Math.floor(Math.random() * max);
}

/** Tasowanie Fisher–Yates na kopii tablicy. */
export function shuffle<T>(input: readonly T[]): T[] {
  const items = [...input];
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    const a = items[i]!;
    const b = items[j]!;
    items[i] = b;
    items[j] = a;
  }
  return items;
}
