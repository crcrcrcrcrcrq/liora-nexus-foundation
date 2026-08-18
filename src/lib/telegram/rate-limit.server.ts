/**
 * LIORA P0.30 — best-effort limit tempa dla Telegrama (server-only).
 *
 * Świadome ograniczenie: workery są bezstanowe, więc licznik żyje w pamięci
 * jednej instancji. To NIE jest zabezpieczenie przed nadużyciem (tym jest
 * allowlista + sekret webhooka), tylko ochrona przed zalaniem API Telegrama
 * przez powtarzalne polecenia w tej samej instancji.
 */

const WINDOW_MS = 10_000;
const MAX_CALLS = 8;

const buckets = new Map<string, number[]>();

export function allowTelegramCall(key: string, now = Date.now()): boolean {
  const recent = (buckets.get(key) ?? []).filter((stamp) => now - stamp < WINDOW_MS);
  if (recent.length >= MAX_CALLS) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > 500) buckets.clear();
  return true;
}
