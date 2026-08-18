# LIORA — P0.1 Production Deployment Foundation

Zakres: PRESERVE → CONNECT → HARDEN. Bez nowych funkcji, bez zmian UI, bez backendu.

## A. Runtime

- Stack: TanStack Start v1 + Vite + Nitro (target: Cloudflare Workers) — bez zmian.
- Wejście serwera: `src/server.ts` (wrapper SSR z obsługą błędów), podpięte przez
  `vite.config.ts` → `tanstackStart.server.entry = "server"`. Zweryfikowane.
- Build: `bun run build` / `npm run build` → bundle klienta + serwera (Nitro/Cloudflare).
- `wrangler.toml` NIE jest wymagany — deployment realizuje platforma Lovable na bazie
  wyjścia Nitro. Nie dodano konfiguracji „na pokaz”.

## B. Naprawione w P0.1

1. **Usunięto `public/_redirects`** (`/* /index.html 200`). Reguła SPA-fallback przechwytywała
   wszystkie ścieżki i omijała SSR oraz trasy serwerowe (`/sitemap.xml`, przyszłe `/api/*`).
   To był realny bloker wdrożenia — aplikacja jest renderowana serwerowo, nie SPA.
2. **Adres produkcyjny jest konfigurowalny** — `SITE.baseUrl` czyta `VITE_SITE_URL`
   (z obcięciem końcowego `/`). Bez zmiennej adresy kanoniczne/sitemap pozostają relatywne,
   jak dotąd. Brak zaszytych domen, adresów localhost i URL-i podglądu.
3. **Dodano skrypt `typecheck`** (`tsc --noEmit`) — walidacja wydania bez zgadywania wyniku.

## C. Zmienne środowiskowe

Klient (bezpieczne, prefiks `VITE_`):

| Zmienna             | Rola                                | Status                        |
| ------------------- | ----------------------------------- | ----------------------------- |
| `VITE_API_BASE_URL` | baza dla wywołań API (domyślnie `/api`) | opcjonalna                |
| `VITE_SITE_URL`     | publiczny adres witryny (canonical, sitemap, OG) | REQUIRED — NOT PROVIDED |

Serwer (nigdy z prefiksem `VITE_`, wyłącznie w menedżerze sekretów): patrz `.env.example`
(JWT\_\*, MAGIC*LINK*\*, MAIL_TRANSPORT_URL, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID).
Wszystkie mają status **REQUIRED — NOT PROVIDED** i należą do P0.2/P0.3.

Weryfikacja: w `src/` nie występuje żaden sekret ani `process.env` po stronie klienta;
jedyne odczyty env to `VITE_API_BASE_URL` i `VITE_SITE_URL`.

## D. Inwentarz kontraktów API

Katalog `src/routes/api/` **nie istnieje** — żaden kontrakt nie ma implementacji serwerowej.
Frontend wywołuje je przez `src/services/api.ts`; w produkcji zwrócą 404 obsłużone przez
warstwę `ApiResult` (komunikat błędu w UI, bez wycieku szczegółów).

| Obszar                              | Kontrakt | Implementacja | Status          |
| ----------------------------------- | -------- | ------------- | --------------- |
| Auth: magic link request/verify, session, sign-out | TAK | NIE | NOT IMPLEMENTED |
| Bookings: create, slots, list, status | TAK    | NIE           | NOT IMPLEMENTED |
| Contact                              | TAK     | NIE           | NOT IMPLEMENTED |
| Newsletter: subscribe/unsubscribe    | TAK     | NIE           | NOT IMPLEMENTED |
| Telegram: notify/status              | TAK     | NIE           | NOT IMPLEMENTED |
| Kronika: overview, notes             | TAK     | NIE           | NOT IMPLEMENTED |
| CMS: blocks, posts                   | TAK     | NIE           | NOT IMPLEMENTED |
| Astrologia: chart                    | TAK     | NIE           | NOT IMPLEMENTED |
| Sitemap `/sitemap.xml`               | TAK     | TAK (route serwerowy) | IMPLEMENTATION VERIFIED |

Świadomie **nie** dodano atrap endpointów ani sztucznych odpowiedzi sukcesu.

## E. Trasy, odświeżanie, zasoby

- Routing plikowy TanStack — bez zmian. Po usunięciu `_redirects` bezpośrednie wejście
  i odświeżenie dowolnej ścieżki obsługuje SSR.
- Statyka: `public/favicon.ico`, `public/robots.txt` (blokada `/admin`, `/kronika`, `/powrot`).
- Błędy: `src/server.ts` normalizuje błędy SSR do bezpiecznej strony 500 bez stack trace;
  szczegóły trafiają wyłącznie do logów serwera.

## F. Następny krok

`P0.2 — Supabase Foundation`.
