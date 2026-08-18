# LIORA — P0.2 Supabase Foundation

Zakres: PRESERVE → CONNECT → HARDEN. Bez nowych funkcji, bez zmian UI, bez modułów biznesowych.

## A. Połączenie

Backend jest zapewniony przez **Lovable Cloud** (Supabase pod spodem). Projekt został
podłączony automatycznie; klient `@supabase/supabase-js` zainstalowany przez integrację.
Warstwa integracyjna jest generowana i **nie wolno jej edytować ręcznie**:

| Plik                                           | Rola                                                                |
| ---------------------------------------------- | ------------------------------------------------------------------- |
| `src/integrations/supabase/client.ts`          | klient przeglądarkowy (klucz publiczny, sesja użytkownika, RLS)     |
| `src/integrations/supabase/client.server.ts`   | klient serwerowy service-role (RLS pomijane) — **wyłącznie serwer** |
| `src/integrations/supabase/auth-middleware.ts` | `requireSupabaseAuth` dla `createServerFn` (działa jako zalogowany) |
| `src/integrations/supabase/types.ts`           | typy generowane ze schematu                                         |

> P0.3.1-R1: `auth-attacher.ts` (dopinanie tokenu Bearer w przeglądarce) został
> usunięty — patrz sekcja „P0.3.1-R1”. `auth-middleware.ts` pozostaje w
> repozytorium jako plik generowany przez integrację, ale **nie jest używany**
> przez żadną funkcję serwerową; autorytetem jest `requireSupabaseSession`.

## B. Zmienne środowiskowe

Publiczne (bezpieczne w bundlu klienta): `VITE_SUPABASE_URL`,
`VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`.

Wyłącznie serwerowe (nigdy z prefiksem `VITE_`): `SUPABASE_URL`,
`SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PROJECT_ID`.

Zasady: `import.meta.env.VITE_*` w kodzie przeglądarki, `process.env.*` wyłącznie wewnątrz
handlerów serwerowych. Klucz service-role nie występuje w żadnym module klienckim.
`.env` nie jest wersjonowany; `.env.example` zawiera wyłącznie nazwy.

## C. Migracje

Katalog `supabase/migrations/` — każda zmiana schematu jest odtwarzalna z repozytorium.

| Migracja                            | Zawartość                                                                    |
| ----------------------------------- | ---------------------------------------------------------------------------- |
| `20260807220709_*_initial identity` | enum `app_role`, `profiles`, `user_roles`, `has_role`, RLS, triggery         |
| `20260807220724_*`                  | odebranie EXECUTE funkcjom wewnętrznym (`handle_new_user`, `set_updated_at`) |
| `20260807...._grants`               | least-privilege GRANT/REVOKE dla `anon` i `authenticated`                    |

Nie wprowadzono żadnych zmian wyłącznie przez panel.

## D. Schemat

```text
auth.users (zarządzane przez Supabase Auth — źródło prawdy o tożsamości)
   │ id (uuid)
   ├── public.profiles      id PK/FK → auth.users, email, display_name, locale, created_at, updated_at
   └── public.user_roles    id PK, user_id FK → auth.users, role app_role, created_at, UNIQUE(user_id, role)
```

- Brak haseł i danych uwierzytelniających w schemacie `public`.
- Identyfikatory: UUID. Znaczniki czasu: `timestamptz`.
- Indeks: `user_roles_user_id_idx` (uzasadniony — każde sprawdzenie roli filtruje po `user_id`).
- Brak tabel biznesowych (booking, contact, newsletter, CMS, Kronika, Tarot, Astrologia) —
  kontrakty API nie są wymaganiem schematu w P0.2.

## E. Model ról

Enum `app_role`: `guest`, `client`, `moderator`, `admin` — dokładnie jak
`src/features/identity/model/types.ts`. `guest` odpowiada brakowi sesji i nigdy nie jest
przyznawany; obecny w enumie wyłącznie dla zgodności reprezentacji z frontendem.

Rola **nigdy** nie jest przechowywana na `profiles`. Autorytatywnym źródłem jest
`public.user_roles`, czytane przez funkcję `public.has_role(uuid, app_role)`
(`SECURITY DEFINER`, `STABLE`, `search_path = public`) — bez rekurencji RLS.

Nowe konto otrzymuje automatycznie profil i rolę `client`
(trigger `on_auth_user_created` → `public.handle_new_user()`).

## F. Model RLS

RLS włączone na obu tabelach. Brak jakiejkolwiek polityki `USING (true)`.

`public.profiles`

| Polityka                | Operacja | Warunek                                       |
| ----------------------- | -------- | --------------------------------------------- |
| `profiles_select_own`   | SELECT   | `auth.uid() = id`                             |
| `profiles_select_staff` | SELECT   | `has_role(auth.uid(),'admin' \| 'moderator')` |
| `profiles_insert_own`   | INSERT   | `auth.uid() = id`                             |
| `profiles_update_own`   | UPDATE   | `auth.uid() = id` (USING i WITH CHECK)        |

Brak polityki i brak uprawnienia DELETE — profil znika wraz z kontem (`ON DELETE CASCADE`).
Tabela nie zawiera kolumny roli, więc edycja profilu nie może zmienić uprawnień.

`public.user_roles`

| Polityka                  | Operacja | Warunek                        |
| ------------------------- | -------- | ------------------------------ |
| `user_roles_select_own`   | SELECT   | `auth.uid() = user_id`         |
| `user_roles_select_admin` | SELECT   | `has_role(auth.uid(),'admin')` |
| `user_roles_insert_admin` | INSERT   | `has_role(auth.uid(),'admin')` |
| `user_roles_update_admin` | UPDATE   | `has_role(auth.uid(),'admin')` |
| `user_roles_delete_admin` | DELETE   | `has_role(auth.uid(),'admin')` |

Uprawnienia obiektowe (druga, niezależna warstwa):

```sql
-- anon: brak jakiegokolwiek dostępu do obu tabel
GRANT SELECT, INSERT, UPDATE ON public.profiles  TO authenticated;
GRANT SELECT                 ON public.user_roles TO authenticated;
GRANT ALL ON public.profiles, public.user_roles  TO service_role;
```

Skutek: nadawanie i odbieranie ról jest w P0.2 operacją **wyłącznie serwerową**
(service-role). Polityki administracyjne są już na miejscu na wypadek udostępnienia
tej operacji z panelu w późniejszej iteracji — wtedy wystarczy dodać GRANT.

Ostrzeżenie lintera „Signed-In Users Can Execute SECURITY DEFINER Function” dotyczy
`public.has_role` i jest **świadome**: polityki RLS wykonują tę funkcję w kontekście roli
`authenticated`, więc EXECUTE jest wymagane. Funkcja zwraca wyłącznie wartość logiczną
i nie ujawnia danych. `handle_new_user` i `set_updated_at` mają EXECUTE odebrane.

## G. Auth foundation

Supabase Auth jest przyszłym źródłem tożsamości. W P0.2 **nie** zaimplementowano
przepływu Magic Link ani żadnego logowania. Nietknięte pozostają:
`src/features/auth/*`, `IdentityProvider`, `ProtectedRoute`, `src/services/auth.service.ts`,
trasa `/powrot`, kontrakty `/api/auth/*`.

`src/start.ts` nie został zmieniony. Gdy P0.3 doda pierwszą funkcję serwerową
z `requireSupabaseAuth`, należy **dopisać** `attachSupabaseAuth` do
`functionMiddleware` (nie zastępować istniejących middleware CSRF/error).

## H. Storage

Przeskanowano kod: żaden istniejący kontrakt ani komponent nie wysyła plików.
**Nie utworzono żadnego bucketa.** Storage pozostaje poza zakresem P0.2.

## I. Kontrakty API — nadal NOT IMPLEMENTED

`/api/auth/magic-link`, `/api/auth/magic-link/verify`, `/api/auth/session`,
`/api/auth/sign-out`, `/api/bookings*`, `/api/contact`, `/api/newsletter*`,
`/api/telegram/*`, `/api/cms/*`, `/api/admin/*`, `/api/tarot/*`, `/api/astrology/*`,
Kronika. Nie utworzono atrap, nie podmieniono ich na wywołania Supabase.
Jedyna zaimplementowana trasa serwerowa nadal: `/sitemap.xml`.

## J. Rozwój lokalny

`bun install` → `bun run dev`. Zmienne backendu wstrzykiwane są przez środowisko
(plik `.env` generowany automatycznie, poza repozytorium). Nie jest wymagane lokalne
CLI Supabase — migracje aplikuje platforma.

## K. Następny krok

`P0.3 — Auth Flow` : podłączenie istniejącego UI Magic Link do Supabase Auth
(`IdentityProvider`, `/auth/session`, `/auth/sign-out`) przez `createServerFn`.

## P0.3 — Auth Flow (Magic Link)

### Przepływ

1. `MagicLinkForm` → `requestMagicLink()` → `supabase.auth.signInWithOtp({ email, options.emailRedirectTo })`.
2. Adres powrotny: `${SITE.baseUrl || window.location.origin}/powrot` — bez zaszytych domen.
3. Callback `/powrot`:
   - `?token_hash=…` → `supabase.auth.verifyOtp({ token_hash, type: "email" })`,
   - link zwracający sesję w hashu → przechwytuje SDK (`detectSessionInUrl`),
   - `?error=…` → spokojny komunikat „klucz stracił ważność”.
4. Sesją (odświeżanie tokenu) zarządza wyłącznie SDK Supabase, ale wyłącznie w pamięci
   dokumentu — patrz „Przechowywanie sesji (P0.3-R1)”.

5. `IdentityProvider` nasłuchuje `onAuthStateChange` i przy każdej sesji pyta serwer o tożsamość.

### Tożsamość i rola

`src/lib/identity.functions.ts` → `fetchIdentity` (serverFn + `requireSupabaseAuth`,
token dołącza `attachSupabaseAuth`). Serwer czyta `profiles` i `user_roles` przez sesję
użytkownika (RLS) i zwraca najwyższą rolę. Klient nigdy nie deklaruje roli.
Profil zakłada trigger `handle_new_user`; `fetchIdentity` uzupełnia go idempotentnie.

### Kontrakty API

`/api/auth/magic-link`, `/api/auth/magic-link/verify`, `/api/auth/session`, `/api/auth/sign-out`
zostały zastąpione bezpośrednią integracją z Supabase Auth (nigdy nie były zaimplementowane
po stronie serwera). Sygnatury funkcji w `src/services/auth.service.ts` pozostały bez zmian.

### Konfiguracja wymagana w projekcie Auth (CONFIGURATION REQUIRED)

- Site URL: adres produkcyjny (wartość `VITE_SITE_URL`).
- Redirect URLs: `<site>/powrot`, `<preview>/powrot`, `http://localhost:8080/powrot`.
- Nadawca e-mail / SMTP dla realnej wysyłki linków.

## P0.3.1-R1 — trwała sesja SSR (stan faktyczny)

### Architektura

```text
przeglądarka → Supabase Auth → @supabase/ssr → ciasteczko HttpOnly
  → runtime serwerowy TanStack Start → funkcje sesji → requireSupabaseSession
  → tożsamość / profil / rola → istniejące chronione UI
```

| Plik                                              | Rola                                                                |
| ------------------------------------------------- | ------------------------------------------------------------------- |
| `src/integrations/supabase/session.server.ts`     | klient `@supabase/ssr` związany z żądaniem; odczyt/zapis ciasteczek |
| `src/integrations/supabase/session-middleware.ts` | `requireSupabaseSession` — autoryzacja funkcji serwerowych          |
| `src/lib/session.functions.ts`                    | `establishSession`, `destroySession`, `currentSessionExpiry`        |
| `src/lib/identity.functions.ts`                   | `fetchIdentity` — profil i rola przez RLS jako zalogowany           |

### Ciasteczko sesji

`sb-<project-ref>-auth-token`, atrybuty: `HttpOnly`, `SameSite=Lax`, `Path=/`,
`Secure` wyłącznie poza localhost (`isSecureRequest()`). Zaobserwowane w realnej
przeglądarce na `http://localhost:8080`: `HttpOnly=true`, `SameSite=Lax`, `Path=/`,
`Secure=false` (poprawne dla HTTP). Atrybut `Secure=true` na HTTPS: **NOT VERIFIED**
(brak środowiska HTTPS w trakcie weryfikacji).

### Polityka magazynu przeglądarki

Klient przeglądarkowy Supabase używa ulotnego adaptera `storage` (Map w pamięci
modułu) i nie jest nosicielem sesji. Zweryfikowane w przeglądarce przed
logowaniem, po logowaniu i po wylogowaniu: `localStorage`, `sessionStorage`,
IndexedDB oraz `document.cookie` są **puste**. `IdentitySession` zawiera wyłącznie
`expiresAt` i dane tożsamości — żadnego tokenu dostępu ani odświeżania.

### Cykl życia sesji (zweryfikowany E2E)

| Etap                   | Zachowanie                                                          |
| ---------------------- | ------------------------------------------------------------------- |
| Prośba o link          | `signInWithOtp` → HTTP 200, neutralny komunikat                     |
| `/powrot?token_hash=…` | `establishSession` (serwer) → `verifyOtp` → ciasteczko → `/kronika` |
| Twarde przeładowanie   | sesja zachowana, strona chroniona nadal dostępna                    |
| Nowa karta / deep link | sesja zachowana                                                     |
| „ZAMKNIJ KRONIKĘ”      | `destroySession` → `signOut` + usunięcie ciasteczka; stan gościa    |
| Ponowne logowanie      | działa nowym linkiem                                                |

### Rola i profil

Bez zmian względem P0.2: profil i rolę `client` zakłada trigger
`handle_new_user`; `fetchIdentity` czyta `profiles` i `user_roles` przez RLS jako
zalogowany użytkownik i zwraca najwyższą rolę. Klient nigdy nie deklaruje roli.

### Granica RLS (zweryfikowana)

Anonimowe żądanie REST do `profiles` i `user_roles` → HTTP 401
`permission denied` (brak GRANT dla `anon`). Dostęp serwerowy jako zalogowany
użytkownik działa.

### Trasy chronione

`ProtectedRoute` bez zmian. Gość na `/kronika` → zaproszenie; `client` na
`/admin` → istniejący ekran „Ta część pozostaje zamknięta”.

### Znane ograniczenia

- `Secure` na HTTPS: NOT VERIFIED (weryfikacja prowadzona na localhost).
- Realna wysyłka e-mail: NOT VERIFIED (testy używają linków generowanych przez Auth Admin API).
- `src/integrations/supabase/auth-middleware.ts` pozostaje nieużywanym plikiem generowanym.

### Poza zakresem P0.3.1

Kontrakty API (Kronika, booking, CMS, Telegram, Tarot, Astrologia) pozostają
NOT IMPLEMENTED; Kronika nadal renderuje dane przykładowe.

---

## P0.3.1-R2 — weryfikacja HTTPS (wykonana 2026-08-08)

Środowisko testowe: produkcyjny build (`bun run build`) uruchomiony na
workerd (`wrangler dev`) za terminacją TLS; origin `https://localhost:8443`.

| Obszar                                                                | Status       | Dowód                                                                                                            |
| --------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------- |
| `bun run build`                                                       | PASS         | build zakończony sukcesem                                                                                        |
| `tsc --noEmit`                                                        | PASS         | brak błędów                                                                                                      |
| `eslint .`                                                            | PASS         | 0 errors, 7 istniejących warningów `react-refresh`                                                               |
| Brak bearer-tokenu w przeglądarce                                     | PASS         | brak `auth-attacher`/`attachSupabaseAuth` w kodzie; `src/start.ts` bez client middleware                         |
| Storage przeglądarki (gość, HTTPS)                                    | PASS         | `localStorage {}`, `sessionStorage` tylko `tsr-scroll-restoration-v1_3`, `indexedDB []`, `document.cookie ""`    |
| Brak sekretów w bundlu klienta                                        | PASS         | w `dist/client` wyłącznie literał `sb_publishable_`/`sb_secret_` (guard), brak kluczy                            |
| Klient przeglądarki bez trwałego magazynu tokenów                     | PASS         | w zbudowanym bundlu `auth.storage` to magazyn w pamięci (`Map`)                                                  |
| Trasy chronione dla gościa (HTTPS)                                    | PASS         | `/kronika` i `/admin` renderują ekran zaproszenia                                                                |
| Ciasteczko `sb-<ref>-auth-token`: HttpOnly / Secure / SameSite / Path | NOT VERIFIED | brak możliwości ukończenia realnego logowania Magic Link (brak dostępu do skrzynki testowej i do Auth Admin API) |
| Callback `/powrot`, reload, nowa karta, logout, re-login, RLS, rola   | NOT VERIFIED | zależne od realnej sesji Magic Link                                                                              |

Uwaga operacyjna: żądanie z celowo uszkodzonym/wygasłym ciasteczkiem sesji
kończy się odpowiedzią 500 zamiast degradacji do stanu gościa. Nie zmieniano
kodu w R2 (zakaz zmian spekulatywnych) — do rozpatrzenia w kolejnej iteracji.

---

## P0.3.1-R2 — powtórna weryfikacja (2026-08-08, workspace Lovable)

Środowisko: czysty workspace Lovable (bez lokalnego `.env`, bez powiązanego
projektu Lovable Cloud). Origin testowy: preview HTTPS
`https://<project>.lovableproject.com`.

| Obszar                                                                                                                | Status                         | Dowód                                                                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run build`                                                                                                       | PASS                           | build zakończony sukcesem (`dist/client`, `dist/server`)                                                                                                                                                                                                   |
| `eslint .`                                                                                                            | PASS                           | 0 errors, 7 istniejących warningów `react-refresh`                                                                                                                                                                                                         |
| `tsc --noEmit`                                                                                                        | FAIL (środowiskowe, poza Auth) | brak pakietów `react-day-picker`, `embla-carousel-react`, `recharts`, `cmdk`, `vaul`, `input-otp`, `react-resizable-panels` — nie występują w `package.json`, dotyczą nieużywanych plików `src/components/ui/*`. Nie modyfikowano `package.json` (§23/§29) |
| Brak aktywnego bearer-flow w przeglądarce                                                                             | PASS                           | `rg` po `src/`: `requireSupabaseAuth`, `attachSupabaseAuth`, `auth-attacher`, `Authorization: Bearer`, `access_token`, `refreshToken` — brak użycia runtime; `src/start.ts` bez client middleware                                                          |
| `src/integrations/supabase/auth-middleware.ts`                                                                        | INERT                          | plik generowany, zero importów w `src/` — pozostawiony bez zmian                                                                                                                                                                                           |
| Model `IdentitySession`                                                                                               | PASS                           | zawiera wyłącznie `expiresAt` + `user`; brak `accessToken`/`refreshToken`                                                                                                                                                                                  |
| Storage przeglądarki (gość, HTTPS)                                                                                    | PASS                           | `document.cookie` = "", `indexedDB` = [], `sessionStorage` = `tsr-scroll-restoration-v1_3`, `localStorage` = `liora.tarot.last-reading-day` (wpis nie-authowy, Tarot)                                                                                      |
| Trasa `/kronika` dla gościa (HTTPS)                                                                                   | PASS                           | odpowiedź 200 ze stanem gościa                                                                                                                                                                                                                             |
| `/powrot?token_hash=<nieprawidłowy>` (HTTPS)                                                                          | PASS (ścieżka błędu)           | serwer odrzuca klucz, UI pokazuje komunikat o wygaśnięciu, **żadne ciasteczko nie zostaje ustawione**                                                                                                                                                      |
| Magic Link E2E, cookie `Secure/HttpOnly/SameSite/Path`, reload, nowa karta, logout, re-login, RLS, rola, provisioning | NOT VERIFIED                   | w tym workspace **brak powiązanego backendu**: serwer zwraca `Missing Supabase environment variable(s): SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY`. Zgodnie z §19 nie tworzono nowego projektu Supabase                                                       |
| Migracje                                                                                                              | UNCHANGED                      | 4 pliki w `supabase/migrations/`, w tym `20260807231606_…` — nietknięte                                                                                                                                                                                    |
| `supabase/config.toml`                                                                                                | UNCHANGED                      | `project_id = "nelcrjuurltcmjyyoksc"`                                                                                                                                                                                                                      |
| Packaging                                                                                                             | PASS                           | `.env` w `.gitignore` i nieobecny w repo; `.env.example` obecny                                                                                                                                                                                            |

Wniosek: **NOT GREEN** — wymagane punkty HTTPS-cookie i Magic Link E2E
pozostają NOT VERIFIED, a `tsc --noEmit` w tym środowisku kończy się błędami
(przyczyna poza Auth). Kod aplikacji nie był zmieniany.

## P0.4 — Kronika persistence

Tabele (migracja `chronicle_reflections` + `chronicle_rituals`):

| Tabela                  | Zawartość                                                                                                   | Ownership                   |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------- |
| `chronicle_reflections` | `reading_at`, `language`, `spread`, `cards` (jsonb), `interpretation`, `heard`, `leaving`, `taking`         | `user_id` → `auth.users.id` |
| `chronicle_rituals`     | `kind` (`tarot`/`astrology`/`note`), `title`, `occurred_at`, `reflection`, `details`, `interpretation_path` | `user_id` → `auth.users.id` |

RLS: cztery polityki na tabelę (`select/insert/update/delete`), wyłącznie `TO authenticated`
z warunkiem `auth.uid() = user_id`. Brak dostępu dla `anon`. GRANT-y: `authenticated`
(CRUD) oraz `service_role` (ALL). Indeksy: `(user_id, occurred_at/reading_at DESC)`.
Trigger `set_updated_at` na obu tabelach.

Warstwa serwerowa: `src/lib/chronicle.functions.ts` — wszystkie funkcje przechodzą przez
`requireSupabaseSession` (ciasteczko HttpOnly → `getUser()`); `user_id` pochodzi wyłącznie
z `context.userId`, nigdy z payloadu. Martwy kontrakt REST `/api/chronicle/*` nie jest już
używany przez Kronikę.

`localStorage` (`liora.chronicle.reflections`) nie jest już warstwą trwałości —
`drainLocalReflections()` przenosi stare wpisy jednorazowo (tylko gdy Kronika użytkownika
jest pusta) i czyści klucz. Zalogowany użytkownik nigdy nie widzi zapisu przykładowego.

## P0.5 — Booking → Kronika (projekcja konsultacji)

**Source of truth: `public.bookings`.** Kronika nie posiada własnej tabeli konsultacji —
nie istnieje `chronicle_consultations` ani żadna kopia rezerwacji. `/kronika/konsultacje`
czyta rezerwacje i mapuje je na model prezentacyjny `ChronicleConsultation`.

Ścieżka danych:

```
/kronika/konsultacje → useChronicle → fetchChronicleOverview (server fn)
  → requireSupabaseSession() → getUser() → supabase.from("bookings") → RLS
  → bookingToChronicleConsultation() → ConsultationCard
```

Ownership: wyłącznie z sesji SSR. Zapytanie nie zawiera `user_id` — ogranicza je RLS
(`auth.uid() = user_id`), więc klient nie ma jak podstawić cudzej tożsamości.

Mapowanie statusów (`src/features/booking/lib/chronicle-projection.ts`):

| Booking     | Chronicle   | Uzasadnienie                               |
| ----------- | ----------- | ------------------------------------------ |
| `new`       | `upcoming`  | prośba o termin — spotkanie przed nami     |
| `confirmed` | `upcoming`  | termin potwierdzony — spotkanie przed nami |
| `done`      | `completed` | spotkanie się odbyło                       |
| `cancelled` | `cancelled` | odwołane                                   |

Pola: `id` → `id`, `service_slug` → `type` (tytuł usługi z katalogu `SERVICES`,
fallback: slug), `preferred_date` → `scheduledAt` (fallback `created_at`, gdy klient nie
podał terminu), `message` → `summary` (opcjonalne). `detailsPath` nie jest ustawiane —
Booking nie posiada zapisu konsultacji.

Zachowanie: gość widzi zapis przykładowy (podgląd kształtu Kroniki) za istniejącym
guest-state; zalogowany użytkownik widzi wyłącznie własne rezerwacje albo pusty stan —
zapis przykładowy nigdy nie jest fallbackiem dla zalogowanego.

Znane ograniczenia P0.5: tytuł usługi rozwiązywany po stronie serwera w języku domyślnym;
`preferred_date` jest tekstem (format zależy od formularza); `loadAvailability` nadal woła
nieistniejące zewnętrzne API (poza zakresem P0.5).

## P0.6 — Tarot & Astrology → Kronika

Warstwą persistence historii rytuałów pozostaje istniejąca tabela `chronicle_rituals`.
P0.6 nie tworzy żadnej tabeli ani migracji — istniejące kolumny (`kind`, `title`,
`occurred_at`, `reflection`, `details`, `interpretation_path`) wystarczają.

Przepływ:

```
Tarot / Astrologia (istniejący wynik w pamięci komponentu)
  → useRitualRecord() (minimalny adapter)
  → createRitual (server fn, P0.4)
  → requireSupabaseSession() → getUser() → user.id
  → INSERT chronicle_rituals → RLS
  → fetchChronicleOverview → Kronika
```

Mapowanie Tarot (`src/features/tarot/lib/chronicle-entry.ts`):

| Źródło                       | `chronicle_rituals` | Uzasadnienie                                    |
| ---------------------------- | ------------------- | ----------------------------------------------- |
| `spread.name`                | `title`             | istniejąca nazwa rozkładu                       |
| `reading.drawnAt`            | `occurred_at`       | moment losowania                                |
| `composeInterpretation()`    | `reflection`        | istniejąca interpretacja, bez generowania nowej |
| pozycje + karty + orientacja | `details`           | minimalny zapis wyniku                          |
| —                            | `kind = "tarot"`    | rodzaj rytuału                                  |

Mapowanie Astrologia (`src/features/astrology/lib/chronicle-entry.ts`):

| Źródło                          | `chronicle_rituals`  | Uzasadnienie                        |
| ------------------------------- | -------------------- | ----------------------------------- |
| `astrology.page.title`          | `title`              | istniejąca etykieta modułu          |
| moment wyniku                   | `occurred_at`        | zakończenie obliczenia              |
| `result.interpretation.summary` | `reflection`         | istniejąca interpretacja z backendu |
| data/godzina/miasto + ascendent | `details`            | minimalna identyfikacja kosmogramu  |
| —                               | `kind = "astrology"` | rodzaj rytuału                      |

Zapis astrologiczny wykonuje się wyłącznie przy `engineStatus === "ready"` (silnik
efemeryd faktycznie odpowiedział) — brak wyniku nie tworzy pustego wpisu.

Ownership: `user_id` pochodzi wyłącznie z sesji SSR (`requireSupabaseSession`), nigdy
z payloadu. RLS `chronicle_rituals` pozostaje bez zmian (owner-only SELECT/INSERT/
UPDATE/DELETE, brak dostępu dla anon).

Duplicate protection: `useRitualRecord` zapisuje raz na stabilny klucz —
`tarot:<drawnAt>` oraz `astrology:<data>T<godzina>:<miasto>`. Re-render, ponowne
zamontowanie i powrót do widoku nie tworzą drugiego wpisu; odświeżenie strony resetuje
wynik w pamięci, więc nie ma czego zdublować. Daily limit Tarota pozostaje nietknięty.

Gość: korzysta z Tarota/Astrologii jak dotąd, ale nie zapisuje niczego prywatnego.
Zalogowany: realne wpisy albo pusty stan — zapis przykładowy nigdy nie jest fallbackiem.

Błąd zapisu: wynik rytuału pozostaje widoczny, błąd trafia do konsoli/istniejącego
mechanizmu raportowania; nie powstaje fake record.

Status weryfikacji P0.6: BUILD/TYPECHECK/LINT = PASS. Testy runtime na zalogowanej
sesji oraz izolacja cross-user = NOT VERIFIED (brak sesji testowej w środowisku).

## P0.6-R1 — Runtime Verification

| Test | Wynik | Evidence / ograniczenie | Blocker |
| --- | --- | --- | --- |
| Inspekcja łańcucha P0.6 (useRitualRecord → createRitual → chronicle_rituals → RLS → Kronika) | PASS | Kod zgodny ze specyfikacją; brak nowych tabel/endpointów | — |
| Ownership: `user_id` wyłącznie z `requireSupabaseSession()` | PASS | `createRitual` ignoruje `user_id` z payloadu (inputValidator nie przyjmuje go) | — |
| RLS owner-only na `chronicle_rituals` (statycznie) | PASS | migracja 20260808014916 + 20260808031317: SELECT/INSERT/UPDATE/DELETE `auth.uid() = user_id`, tylko `authenticated` | — |
| Idempotencja zapisu (statycznie) | PASS | `useRitualRecord` — `Set` kluczy; `tarot:<drawnAt>`, `astrology:<data>T<godz>:<miasto>` | — |
| Zapis dopiero po zakończeniu rytuału | PASS | TarotDeck: `stage === "finished" && reading && interpretation`; AstrologyRitual: `stage === "outcome" && engineStatus === "ready"` | — |
| Daily limit Tarota nienaruszony | PASS | `dailyLimit` niezależny od persistence; brak zmian | — |
| Security: brak Bearer flow / attachSupabaseAuth | FAIL → naprawione | `src/start.ts` miał ponownie zarejestrowany generowany `attachSupabaseAuth`; usunięty (minimalna poprawka, 1 plik) | — |
| Brak service-role w bundlu klienta | PASS | `client.server` importowany wyłącznie po stronie serwera | — |
| Rytuały nie w localStorage | PASS | localStorage tylko dla daily limit / języka / starych refleksji (pre-P0.4) | — |
| BUILD | PASS | `bun run build` | — |
| TYPECHECK | PASS | `tsgo --noEmit` | — |
| LINT | PASS | 0 errors, 7 pre-istniejących warningów react-refresh | — |
| Tarot runtime draw + persistence | NOT VERIFIED | brak podłączonego backendu/sesji w środowisku wykonawczym tej iteracji | TESTING BLOCKER |
| Duplicate / refresh runtime | NOT VERIFIED | jw. | TESTING BLOCKER |
| Kronika runtime visibility | NOT VERIFIED | jw. | TESTING BLOCKER |
| Cross-user isolation / anonymous access (zapytania realne) | NOT VERIFIED | brak dostępu do bazy w środowisku | TESTING BLOCKER |
| Astrology runtime persistence | NOT VERIFIED | silnik efemeryd `not-connected` | PRODUCT DEPENDENCY |

## P0.7 — Reports → Kronika (derived quarterly read-model)

### Decyzja architektoniczna

Raport NIE jest bytem trwałym. `ChronicleReport` to **derived read-model** —
deterministyczna, kwartalna projekcja danych, które już istnieją.

DATABASE CHANGES: tabele dodane = 0, tabele zmienione = 0, migracje dodane = 0,
polityki RLS dodane/zmienione = 0. Tabela `chronicle_reports` NIE istnieje i nie
powstała.

### Source of truth

- `chronicle_rituals` — rytuały (tarot / astrology / note), pole `occurred_at`
- `bookings` — konsultacje, przez istniejącą projekcję P0.5
  (`bookingToChronicleConsultation`, `scheduledAt = preferred_date ?? created_at`)

Nie ma kopii, nie ma zapisu, nie ma drugiego magazynu danych.

### Reguły agregacji

- kwartał kalendarzowy, liczony w UTC: Q1 = I–III, Q2 = IV–VI, Q3 = VII–IX, Q4 = X–XII
- kwartał bez aktywności nie tworzy raportu (brak pustych okresów)
- jeden aktywny kwartał = dokładnie jeden `ChronicleReport`
- sortowanie malejąco po `period` (najnowszy kwartał pierwszy)
- niepoprawny/nieparsowalny timestamp jest pomijany, nie tworzy raportu
- brak losowości i brak `Date.now()` — ten sam wejściowy zestaw danych zawsze
  daje identyczny wynik

### Mapping

| Źródło | ChronicleReport | Reguła |
| --- | --- | --- |
| kwartał aktywności | `id` | `quarter:<YYYY-QN>` — klucz lokalny, nie zapisywany w bazie, bez `user_id` w DOM |
| kwartał aktywności | `period` | `YYYY-QN`, np. `2026-Q3` |
| kwartał + rok | `title` | i18n `chronicle.reports.title` (PL: „Podsumowanie — III kwartał 2026”, EN: „Summary — Q3 2026”) |
| max(`occurred_at`, `scheduledAt`) w kwartale | `issuedAt` | timestamp ostatniej uwzględnionej aktywności — nie czas serwera |
| liczba rytuałów + liczba konsultacji | `summary` | i18n `chronicle.reports.summary` (PL: „Rytuały: 2 · Spotkania: 1”) |

Model `ChronicleReport` nie został rozszerzony — brak `ritualCount`,
`consultationCount` i innych nowych pól.

### Przepływ serwerowy

```
fetchChronicleOverview()
  → requireSupabaseSession()   (cookie HttpOnly, getUser())
  → SELECT chronicle_rituals   (RLS: auth.uid() = user_id)
  → SELECT bookings            (RLS istniejące z P0.5)
  → buildQuarterlyReports(rituals, consultations)   [czysta funkcja]
  → ChronicleOverview.reports
```

Bez nowego endpointu (`/api/chronicle/reports` nie powstał), bez dodatkowych
zapytań — agregacja korzysta z danych już pobranych w tym samym żądaniu
(brak N+1). Tożsamość wyłącznie z sesji SSR; `user_id` z klienta nigdy nie jest
przyjmowany. Brak service-role, brak Bearer.

### Ownership i RLS

Ownership egzekwują istniejące polityki źródeł (`chronicle_rituals`,
`bookings`) — `auth.uid() = user_id`. Ponieważ raport nie ma własnej tabeli,
nie ma też własnego ownership ani własnego RLS. Użytkownik B nie zobaczy
raportów A, bo nie zobaczy wierszy źródłowych A.

### UI i i18n

- `src/features/kronika/components/ChronicleReports.tsx` — jedna sekcja na
  istniejącej stronie `/kronika`, zbudowana z istniejących `ChronicleCard`
  i `ChroniclePlaceholder` (bez nowej trasy, bez nowego modułu, bez redesignu)
- teksty: nowe klucze `chronicle.reports.*` w `src/locales/pl|en/chronicle.ts`
- komponent stosuje tę samą czystą projekcję co serwer, tylko z aktualnym
  językiem interfejsu (serwer wypełnia kontrakt `reports` w języku domyślnym)
- pusty stan: `chronicle.reports.empty`; brak sample reports dla zalogowanych

### Sample data

Polityka bez zmian: zapis przykładowy wyłącznie dla podglądu gościa
(`useChronicle` → `getSampleChronicle`). Dla zalogowanego użytkownika bez
aktywności lista raportów jest pusta — nigdy fallback do danych przykładowych.

### Status weryfikacji P0.7

| Test | Wynik | Evidence / ograniczenie |
| --- | --- | --- |
| BUILD | PASS | `bun run build` — built OK |
| TYPECHECK | PASS | `tsgo --noEmit` — 0 błędów |
| LINT | PASS | `eslint .` — 0 errors, 7 pre-istniejących warningów |
| Brak aktywności → `reports = []` | PASS | wykonany test funkcji projekcji |
| Rytuały → właściwy kwartał | PASS | jw. (`2026-08` i `2026-09` → `2026-Q3`) |
| Bookings → właściwy kwartał | PASS | jw. (`2025-11` → `2025-Q4`) |
| Rytuały + konsultacje → jeden raport na kwartał | PASS | jw. (`2026-Q3`: 2 rytuały + 1 spotkanie) |
| Wiele kwartałów → jeden raport na aktywny kwartał | PASS | jw. (3 raporty) |
| Najnowszy kwartał pierwszy | PASS | jw. (`2026-Q3`, `2026-Q1`, `2025-Q4`) |
| Determinizm (te same dane → ten sam wynik) | PASS | jw. — porównanie dwóch przebiegów identyczne |
| Granica kwartału (UTC) | PASS | `2026-03-31T23:00Z → Q1`, `2026-04-01T00:00Z → Q2` |
| i18n PL / EN | PASS | projekcja zwraca poprawne teksty w obu językach |
| Brak persistence raportów | PASS | brak INSERT/UPDATE/DELETE, brak storage przeglądarki |
| Brak nowych obiektów bazy | PASS | 0 migracji, 0 tabel, 0 polityk |
| Ownership: brak `user_id` z klienta | PASS | statycznie — `fetchChronicleOverview` bierze tożsamość z sesji |
| Runtime: zalogowany użytkownik widzi własne raporty | NOT VERIFIED | brak podłączonego backendu i sesji w środowisku |
| Runtime: refresh / deep-link / logout | NOT VERIFIED | jw. |
| Cross-user isolation (dwie realne sesje) | NOT VERIFIED | brak dwóch kont testowych |
| Anonymous access do źródeł | NOT VERIFIED | brak dostępu do bazy w tym środowisku |
| Responsywny rendering na realnej sesji | NOT VERIFIED | sekcja nie renderuje danych bez sesji |

Znane ograniczenia: te same co w P0.6 — środowisko wykonawcze nie ma
podłączonego backendu (`Missing Supabase environment variable(s)`), więc testy
E2E na realnej sesji pozostają NOT VERIFIED. Nie zastosowano fake auth, mock
backendu ani hardcoded `user_id`.

## P0.8 — Notes → Kronika (prywatne notatki użytkownika)

**Decyzja produktowa:** notatki to osobna dziedzina — nie refleksja (`chronicle_reflections`)
i nie rytuał `kind='note'`. Właścicielem jest użytkownik (`user_id`).

**Źródło prawdy:** tabela `public.chronicle_notes` (`id`, `user_id`, `body`, `created_at`, `updated_at`),
RLS owner-only (SELECT/INSERT/UPDATE/DELETE przez `auth.uid() = user_id`), GRANT wyłącznie dla
`authenticated` i `service_role` (brak dostępu dla `anon`), trigger `set_updated_at`.

**Warstwa serwerowa:** `listChronicleNotes`, `createChronicleNote`, `updateChronicleNote`,
`deleteChronicleNote` w `src/lib/chronicle.functions.ts` (middleware `requireSupabaseSession`).
`user_id` pochodzi wyłącznie z sesji SSR — payload klienta jest ignorowany.
`fetchChronicleOverview` zwraca `notes` z tego samego źródła (koniec `notes: []`).

**UI:** `/kronika/notatki` — formularz zapisu, lista, edycja i usuwanie (`useChronicleNotes`,
`NoteForm`). Poza sesją strona pozostaje w dotychczasowym trybie podglądu.

**Teksty:** usunięto nieprawdziwą deklarację o szyfrowaniu; obecnie „notatki są przechowywane
prywatnie w Twojej Kronice i widoczne wyłącznie dla Ciebie" (PL/EN).

**Martwy kod:** usunięto `CHRONICLE_ROUTES.notes` i nieużywany `createChronicleNote`
z `src/features/kronika/api/kronika.service.ts`.

**Weryfikacja:** BUILD PASS, TYPECHECK PASS, LINT PASS (0 błędów).
Runtime RLS (dwa realne konta, PostgREST): insert własnej notatki 201; próba zapisu z cudzym
`user_id` → 403 (42501); konto B nie widzi, nie edytuje i nie usuwa notatki konta A (0 wierszy);
anon → 401; właściciel edytuje i usuwa własną notatkę. Konta testowe usunięte po teście.

## P0.10 — Booking availability (IMPLEMENTED)

**Model.** Availability = weekly schedule − dates already taken.
- Schedule shape: `src/features/booking/model/schedule.ts` (`WeeklySchedule`: weekday + from/to, `capacityPerDay: 1`, horizon, lead time).
  `SAMPLE_WEEKLY_SCHEDULE` is explicitly flagged `isSample: true` — placeholder for a future admin-managed configuration. **No new table was created.**
- Pure computation: `src/features/booking/lib/availability.ts` (deterministic, no I/O, unit-tested).
- Server source of truth: `public.booked_dates(_from, _to)` — SECURITY DEFINER, returns only distinct dates of bookings with status `new`/`confirmed`. No PII. Executable by `anon` (availability is public by product decision).
- Server entry point: `getAvailability` server function in `src/lib/booking.functions.ts` → `src/lib/availability.server.ts` (publishable key, no service-role).
- The existing contract `fetchAvailability(serviceSlug) → ApiResult<string[]>` is preserved; only its data source changed. The dead external `/bookings/availability` call is gone from the active path.

**Status.** IMPLEMENTED + VERIFIED (build, typecheck, lint, unit tests, runtime call returning real server-computed dates).
**NOT VERIFIED.** Occupancy against real rows — the database currently has zero users and zero bookings, and inserting one requires a real `auth.users` identity.
**KNOWN LIMITATION.** No atomic slot locking: two clients can request the same day between availability read and `createBooking`. Existing model treats a booking as a request confirmed by email. Future hardening.

## P0.11 — Admin Schedule → Real Availability + Booking Concurrency

**Source of truth**
- `public.booking_schedule` — weekly schedule (one row per interval; multiple intervals per weekday allowed). Replaces the P0.10 `SAMPLE_WEEKLY_SCHEDULE`, which was removed.
- `public.bookings` — occupancy (`status IN ('new','confirmed')`).
- Availability is a computed read model — no cache table, nothing persisted.

**Schedule model**: `weekday` (0=Sunday … 6=Saturday, matching `Date.getUTCDay()`), `from_time`, `to_time` (`to_time > from_time` CHECK), `is_active`, timestamps + `set_updated_at` trigger. Capacity (1/day), horizon (60 days) and lead time (1 day) remain code constants in `SCHEDULE_RULES` — unchanged from P0.10. Dates are computed in UTC; `preferred_date` stays `TEXT` `YYYY-MM-DD`.

**RLS**: `booking_schedule` has RLS enabled with SELECT/INSERT/UPDATE/DELETE policies restricted to `has_role(auth.uid(),'admin'|'moderator')`. `anon` has no grant and no policy — an anonymous read returns `[]`, an anonymous write is rejected (42501).

**Public availability**: `public.active_schedule_weekdays()` (SECURITY DEFINER, `search_path=public`, EXECUTE granted to `anon`/`authenticated`) returns only the set of active weekday integers — no times, no ids, no PII. Combined with the existing `public.booked_dates()` (dates only) in `src/lib/availability.server.ts` using the publishable key (no service role, no bearer). Result contract stays `string[]`.

**Empty state**: no active schedule rows ⇒ availability returns `[]`. No hardcoded fallback schedule.

**Concurrency (capacity = 1)**: partial unique index `bookings_one_active_per_date` on `bookings(preferred_date) WHERE preferred_date IS NOT NULL AND status IN ('new','confirmed')`. `cancelled`/`done` free the date. `createBooking` pre-checks availability and maps unique violation `23505` to the code `BOOKING_DATE_TAKEN`, translated in the UI ("This date was just booked…"). No raw Postgres error reaches the client.

**Admin**: `/admin/grafik` (staff only) reading/writing through `src/lib/schedule.functions.ts` → `schedule.server.ts`. Identity and role come from the SSR session (`requireSupabaseSession` + `requireStaffRole`), never from the request payload.

## P0.12 — Booking/Admin Runtime Verification & Concurrency

**Zakres.** Wyłącznie weryfikacja stanu po P0.11. Zero zmian w kodzie produkcyjnym (0 plików zmodyfikowanych w `src/`). Architektura, kontrakty i UI bez zmian.

**Środowisko.** Projekt został odtworzony z przesłanego archiwum na ŚWIEŻYM backendzie Lovable Cloud. Schemat P0.1–P0.11 zaaplikowano jako jedną skonsolidowaną migrację (pliki historyczne w `supabase/migrations` zawierały nakładające się, kumulatywne snapshoty). Baza jest pusta: 0 użytkowników, 0 ról, 0 rezerwacji, 0 wpisów grafiku. Brak zalogowanej sesji administracyjnej (`LOVABLE_BROWSER_AUTH_STATUS` ≠ `injected`).

**Zweryfikowane (VERIFIED).**
- `public.booking_schedule` istnieje, RLS ENABLED, 4 polityki staff-only; `anon` nie ma SELECT/INSERT/UPDATE/DELETE.
- `public.bookings` — RLS ENABLED, 5 polityk (own + staff read), `anon` bez uprawnień.
- Partial unique index `bookings_one_active_per_date ON bookings(preferred_date) WHERE preferred_date IS NOT NULL AND status IN ('new','confirmed')` — obecny, dokładnie jeden, nie blokuje `done`/`cancelled`.
- Funkcje publiczne zwracają minimum: `active_schedule_weekdays()` (same numery dni), `booked_dates()` (same daty). Jawny `search_path`, brak PII.
- Ścieżka availability: `BookingForm → useBooking → fetchAvailability → getAvailability → availability.server → active_schedule_weekdays + booked_dates`. Brak requestu do `/bookings/availability`, brak `VITE_API_BASE_URL` w tej ścieżce (używa go wyłącznie `src/services/api.ts` dla innych, nieaktywnych endpointów).
- Mapowanie konfliktu `23505 → BOOKING_DATE_TAKEN → booking.form.dateTaken` (PL + EN) — obecne i poprawne; żaden szczegół SQL nie trafia do UI.
- Tożsamość i rola wyłącznie z sesji SSR (`requireSupabaseSession` + `requireStaffRole`); brak service-role w kliencie, brak bearer flow, brak client user_id/role.
- Runtime (mobile 390×844, bez logowania): `/`, `/rezerwacja`, `/tarot`, `/astrologia`, `/kronika`, `/uslugi`, `/kontakt`, `/biblioteka` renderują się bez crashy i bez błędów konsoli; `/admin` i `/admin/grafik` pokazują bramkę logowania (chronione).
- BUILD PASS, TYPECHECK PASS (`tsgo --noEmit`), LINT PASS (0 błędów, 7 istniejących ostrzeżeń react-refresh).

**NIEZWERYFIKOWANE (NOT VERIFIED).**
- Admin runtime test `/admin/grafik` (odczyt → zmiana → zapis → persistence) — brak zalogowanej sesji staff/admin. AUTH / RUNTIME TEST BLOCKED — NO AUTHENTICATED SESSION AVAILABLE.
- Concurrency runtime test (dwa równoczesne `createBooking` na ten sam dzień) — wymaga prawdziwej sesji; nie wykonano. Ochrona DB-level potwierdzona wyłącznie strukturalnie (istnienie indeksu), nie behawioralnie.
- Wpływ realnego grafiku na listę dostępnych dat — `booking_schedule` jest puste, więc availability zwraca `[]` (poprawny stan pusty, ale nie potwierdza ścieżki „aktywny dzień → data widoczna”).
- Testy jednostkowe availability — repozytorium nie zawiera runnera ani plików testowych; dodawanie Vitest było poza zakresem P0.12.
- Cross-user isolation przy realnych danych — brak użytkowników.

**Znany, akceptowany warning lintera.** `SECURITY DEFINER` z EXECUTE dla `anon`/`authenticated` na `booked_dates()` i `active_schedule_weekdays()` (oraz `has_role()` dla `authenticated`). Jawny `search_path`, minimalny zakres danych, brak PII — wzorzec intencjonalny, zgodny z decyzją z P0.10/P0.11. Nie zmieniamy architektury dla usunięcia warningu.

---

## P0.13 — Runtime verification & booking concurrency closure

Środowisko: Lovable Cloud (backend aktywny), realne konta testowe utworzone przez
Auth Admin API, logowanie realnym Magic Link (`/powrot?token_hash=…`).

| Test | Wynik | Dowód |
| --- | --- | --- |
| A. Sesja staff/admin (Magic Link → cookie SSR) | VERIFIED | `/admin`, `/admin/grafik`, `/admin/bookings` renderują się dla roli `admin`; brak błędów konsoli |
| B. Grafik — zapis i edycja | VERIFIED | pn 09:00–18:00 (edytowane z 10:00), wt nieaktywny, śr 10:00–18:00; stan utrwalony po reloadzie |
| C. Publiczna dostępność | VERIFIED | lista dat = wyłącznie pn/śr, od jutra, horyzont 60 dni (do 2026-10-07); payload zawiera wyłącznie daty (`YYYY-MM-DD`), zero PII |
| D. Realna rezerwacja klienta | VERIFIED | wiersz w `bookings` z `user_id` zalogowanego klienta, status `new`; data znika z publicznej dostępności |
| E. Konflikt terminu (UI) | VERIFIED | zajęty dzień nie występuje już na liście wyboru |
| F. Wyścig — dwie równoległe sesje, ten sam dzień | VERIFIED | jedna rezerwacja zapisana, druga odrzucona komunikatem „Ten termin został właśnie zarezerwowany…”; w bazie dokładnie 1 aktywny wiersz na dzień (indeks `bookings_one_active_per_date`) |
| G. Izolacja cross-user | VERIFIED | klient widzi w Kronice wyłącznie własne terminy; rezerwacja innego użytkownika niewidoczna |
| H. Dostęp anonimowy | VERIFIED | `/admin`, `/admin/grafik`, `/admin/bookings`, `/kronika` nie ujawniają żadnych danych bez sesji |
| Komunikat konfliktu w EN | NOT VERIFIED (runtime) | ciąg `booking.form.dateTaken` istnieje w `src/locales/en/booking.ts`; runtime potwierdzony tylko dla PL |
| Realna wysyłka e-mail | NOT VERIFIED | testy używają linków z Auth Admin API |

### Naprawiony realny błąd

`BookingForm` nie korzystał z serwerowej dostępności — pole terminu było natywnym
`input[type=date]`, więc użytkownik mógł wybrać dzień poza grafikiem lub już zajęty.
Poprawka (minimalna, wyłącznie prezentacja): formularz pobiera dostępność dla wybranej
usługi i renderuje listę wolnych dni; przy pustej liście zachowany jest dotychczasowy
input z komunikatem o braku terminów. Logika serwerowa, RLS i model biznesowy bez zmian.

Status P0.13: **GREEN** (poza pozycjami oznaczonymi wyżej jako NOT VERIFIED,
niezależnymi od kodu aplikacji).

## P0.14 — Booking Email Notifications

**Provider architecture.** Wbudowana infrastruktura e-mail Lovable
(`@lovable.dev/email-js`, `sendLovableEmail`). Brak własnego SMTP, brak drugiego backendu,
brak nowego API gateway. Warstwy: `src/lib/notifications/email.server.ts` (dostawa)
oraz `src/lib/notifications/booking-notifications.server.ts` (treść + odbiorcy).

**Przepływ.** `BookingForm → useBooking → createBooking` (sesja SSR → walidacja →
availability → INSERT + `bookings_one_active_per_date`) → **dopiero po skutecznym INSERT-cie**
dynamiczny import `notifyBookingCreated`. Persystencja rezerwacji nie została przeniesiona
do warstwy powiadomień; nie powstał drugi tor tworzenia rezerwacji.

**Wymagana konfiguracja (środowisko serwera, nigdy `VITE_*`):**

| Zmienna | Rola | Status |
| --- | --- | --- |
| `EMAIL_SENDER_DOMAIN` | zweryfikowana subdomena nadawcy (np. `notify.example.com`) | EXTERNAL CONFIGURATION REQUIRED |
| `EMAIL_SENDER_ADDRESS` | opcjonalny adres nadawcy; domyślnie `no-reply@<EMAIL_SENDER_DOMAIN>` | opcjonalne |
| `LOVABLE_API_KEY` | klucz platformy | VERIFIED (auto-provisioned) |
| `STAFF_NOTIFICATION_EMAIL` | odbiorca powiadomień personelu | EXTERNAL CONFIGURATION REQUIRED |

**Sender/domain.** Wysyłka wymaga domeny należącej do właściciela projektu,
skonfigurowanej przez mechanizm Lovable (Cloud → Emails). Domena NIE jest obecnie
skonfigurowana — integracja jest zaimplementowana do granicy providera i zwraca
`provider_not_configured`, bez udawania wysyłki.

**Reguły odbiorców.** Klient — wyłącznie adres z zapisanego wiersza `bookings`
(payload nie może wskazać innego odbiorcy). Personel — wyłącznie
`STAFF_NOTIFICATION_EMAIL` z konfiguracji serwera; brak zmiennej = brak wysyłki,
bez adresu zastępczego.

**Treść / i18n.** Klucze `booking.notifications.*` w PL i EN. Mail klienta: usługa,
termin, numer zgłoszenia, informacja o oczekiwaniu na potwierdzenie. Mail personelu:
wyłącznie minimum operacyjne. Brak danych administracyjnych, brak `user_id`, brak tokenów.

**Failure semantics.** Powiadomienie to efekt uboczny. Nieudana wysyłka: rezerwacja
pozostaje zapisana ze statusem `new`, kontrakt odpowiedzi bez zmian, aplikacja nie
twierdzi, że mail dotarł. Log serwera zawiera wyłącznie powód/kod (`provider_not_configured`,
`recipient_suppressed`, `provider_error`) — bez PII, sekretów i stack trace'ów.

**Privacy / security.** Sekrety wyłącznie w `process.env` w modułach `.server.ts`;
`dist/client` nie zawiera nazw zmiennych ani wywołań providera. Brak zmian w RLS,
własności rezerwacji, `requireSupabaseSession`, `requireStaffRole` i izolacji Kroniki.

**Exactly-once.** Nie utworzono outboxu ani tabeli powiadomień. Wykorzystano wyłącznie
`idempotency_key` providera (`booking-<id>-client|staff`). Formalnie:
**email delivery is best-effort; exactly-once delivery is not guaranteed in this iteration.**

**Runtime verification.**

| Element | Status |
| --- | --- |
| Implementacja, build, typecheck, lint | VERIFIED |
| Brak sekretów / wywołań providera w kliencie | VERIFIED |
| Rezerwacja + persystencja + concurrency (P0.13) | VERIFIED (bez zmian) |
| Realne wywołanie providera | NOT VERIFIED — ENVIRONMENT LIMITATION (brak domeny nadawcy) |
| Akceptacja wiadomości przez providera | NOT VERIFIED |
| Dostarczenie do skrzynki | NOT VERIFIED — brak dostępu do inboxa |

Status P0.14: **NOT GREEN — real provider delivery NOT VERIFIED (external configuration required).**

## P0.15 — Email Transport Abstraction / Cloudflare Readiness

Cel: przygotować warstwę e-mail do docelowej architektury **GitHub → Cloudflare →
Supabase → Email Transport**, bez wiązania logiki rezerwacji z Lovable ani z jednym
dostawcą poczty. Brak zmian w bazie, RLS, Auth, routingu i UI.

**Kierunek zależności.**

```text
BookingForm / useBooking
  → booking.functions.ts (createBooking)
    → notifications/booking-notifications.server.ts   (use-case)
      → notifications/email.server.ts                 (granica: sendEmail)
        → notifications/transport/resolve.server.ts   (wybór adaptera)
          → notifications/transport/lovable.server.ts (jedyny plik znający providera)
```

Żaden komponent UI, hook ani moduł domenowy nie importuje biblioteki dostawcy.
`rg "@lovable.dev/email-js" src` zwraca dokładnie jeden plik — adapter.

**Kontrakt (`transport/types.ts`).** `EmailMessage`: `to`, `subject`, `text`,
opcjonalnie `html`, `replyTo`, `idempotencyKey`. `EmailDeliveryResult`:
`delivered: true` albo `not_configured` / `recipient_suppressed` / `transport_error`.
Bez template engine, bez kolejki, bez outboxu, bez tabel e-mail.

**Konfiguracja (wyłącznie server-side, `process.env`).**
`EMAIL_TRANSPORT` (domyślnie `lovable`), `STAFF_NOTIFICATION_EMAIL`,
oraz zmienne wymagane przez adapter (`EMAIL_SENDER_DOMAIN`, `EMAIL_SENDER_ADDRESS`,
`LOVABLE_API_KEY`). Brak konfiguracji ⇒ `not_configured` — nie crash i nie fałszywy sukces.
Adres personelu nigdy nie pochodzi z requestu klienta.

**Wymiana transportu.** Nowy dostawca (SMTP/Gmail App Password, Resend, Brevo,
Postmark, dowolny Cloudflare-compatible) = nowy plik `transport/<nazwa>.server.ts`
implementujący `EmailTransport` + jedna gałąź w `resolveEmailTransport()`.
Logika rezerwacji pozostaje nietknięta.

**Cloudflare.** Nie dodano żadnej zależności; nie zakładamy dostępności `node:net`
/ `node:tls` ani pełnego runtime Node. Adapter SMTP celowo NIE został dopisany „na
zapas” — powstanie dopiero po potwierdzeniu biblioteki działającej w Workers/Edge.
Bez polyfilli i obejść.

**Failure semantics.** `BOOKING: SUCCESS | FAILURE` jest rozłączne z
`EMAIL: SENT | NOT CONFIGURED | FAILED`. Powiadomienie jest wywoływane wyłącznie po
udanym INSERT-cie, nie rzuca, nie cofa rezerwacji i nie zmienia kontraktu odpowiedzi.
Log serwerowy zawiera wyłącznie powód/kod — bez PII, sekretów i stack trace'ów.

**Runtime verification.**

| Element | Status |
| --- | --- |
| Abstrakcja transportu + niezależność od providera | VERIFIED (statycznie) |
| Server-side boundary (`.server.ts`, brak importów w kliencie) | VERIFIED |
| Brak sekretów w kliencie / bundle / repo / `VITE_*` | VERIFIED |
| Separacja booking ↔ email (brak rollbacku) | VERIFIED (przegląd kodu) |
| Recipient personelu z konfiguracji serwera | VERIFIED |
| Build / typecheck / lint / regresja tras | VERIFIED |
| Brak migracji, zmian tabel i RLS | VERIFIED (0/0/0/0) |
| Wybrany docelowy provider | NOT VERIFIED |
| Domena nadawcy | NOT VERIFIED — brak |
| Prawdziwe credentials | NOT VERIFIED — brak |
| Realna dostawa / inbox delivery | NOT VERIFIED |

Status P0.15: **NOT GREEN — EXTERNAL EMAIL PROVIDER CONFIGURATION PENDING.**
To nie jest błąd aplikacji, lecz świadomie odroczona konfiguracja transportu zewnętrznego.

## P0.16 — Real Email Provider / Cloudflare-Compatible Delivery

### ARCHITECTURE

Booking → `booking-notifications.server.ts` → `sendEmail()` → `resolveEmailTransport()`
→ adapter providera → HTTPS API → provider → inbox.

- Nowy adapter: `src/lib/notifications/transport/resend.server.ts` (Resend HTTP API).
- Wyłącznie globalny `fetch` + Web APIs — brak SDK, `node:net`, `node:tls`, SMTP socketów, polyfilli.
- Credentials wyłącznie server-side (`process.env`), odczyt w środku adaptera.
- Kontrakt `EmailTransport` z P0.15 bez zmian; provider jest szczegółem adaptera.
- Booking niezależny od e-maila: zapis rezerwacji nie jest cofany przy błędzie wysyłki.
- Domyślny transport: `EMAIL_TRANSPORT=resend`; `lovable` pozostaje jako legacy/fallback; `none` wyłącza wysyłkę.

### ENVIRONMENT (server-only)

`EMAIL_TRANSPORT`, `EMAIL_API_KEY`, `EMAIL_SENDER_ADDRESS`, `EMAIL_SENDER_NAME`,
`STAFF_NOTIFICATION_EMAIL`. Żadnego `VITE_*`. Nazwy w `.env.example`, bez wartości.

### VERIFIED

- Adapter kompiluje się i implementuje istniejący kontrakt (typecheck 0 błędów).
- Granica serwerowa: wysyłka wyłącznie w plikach `*.server.ts`.
- Brak sekretów, endpointu providera i adresu staff w bundlu klienta (skan `dist/client`; source maps nie są generowane).
- API zgodne z Cloudflare Workers (`fetch`/`Request`/`Response`).
- Booking / Auth / RLS / Kronika / UI bez zmian; regresja tras 200 dla `/`, `/rezerwacja`, `/tarot`, `/astrologia`, `/kronika`, `/admin`, `/admin/grafik`.
- Build, typecheck, lint (0 błędów, 7 pre-existing warningów `react-refresh`).
- Zmiany DB: 0 tabel, 0 migracji, 0 polityk RLS.

### NOT VERIFIED

- Realna dostawa do skrzynki — brak `EMAIL_API_KEY` w środowisku.
- Verified sender — brak `EMAIL_SENDER_ADDRESS` / domeny nadawcy.
- Odpowiedź providera w runtime — nie wykonano żadnego requestu do API (brak credentials; nie tworzono fake testu).

## P0.17 — Real Email Delivery Verification

Zakres: wyłącznie weryfikacja istniejącego transportu P0.15/P0.16. Zero zmian
architektury, Bookingu, Auth, RLS, DB i UI.

### IMPLEMENTATION VERIFIED

- Łańcuch `createBooking` → `notifyBookingCreated` → `sendEmail` → `resolveEmailTransport` → `resendTransport` (HTTPS `fetch`) potwierdzony w kodzie.
- Powiadomienie uruchamiane wyłącznie po skutecznym INSERT-cie; błąd e-maila nie cofa rezerwacji.
- Idempotency keys `booking-{id}-client` / `booking-{id}-staff` obecne, po jednej wiadomości na rezerwację.
- Recipient staff pochodzi wyłącznie z `STAFF_NOTIFICATION_EMAIL` (server-side), nigdy z payloadu klienta.
- Build PASS, typecheck PASS, lint PASS (0 błędów, 7 pre-existing warningów `react-refresh`).
- Security: skan `dist/client` — brak `EMAIL_API_KEY`, klucza `re_*`, adresu staff i `api.resend.com`.
- Cloudflare: wyłącznie `fetch`/`Request`/`Response`/`JSON`; brak `node:net`, `node:tls`, SMTP, SDK.
- DB: 0 tabel, 0 migracji, 0 polityk RLS.

### PROVIDER API VERIFIED — NIE

Brak `EMAIL_API_KEY` w środowisku serwera (sekrety projektu: tylko `LOVABLE_API_KEY`).
Żadnego requestu do `api.resend.com` nie wykonano — nie tworzono fake key ani fake odpowiedzi.

### BOOKING EMAIL FLOW VERIFIED — NIE

Bez credentials providera realny test end-to-end nie ma wartości dowodowej
(`sendEmail` zwróciłby `not_configured`).

### REAL INBOX DELIVERY VERIFIED — NIE

Brak zweryfikowanego nadawcy (`EMAIL_SENDER_ADDRESS`) i brak adresu odbiorcy
testowego (`STAFF_NOTIFICATION_EMAIL`).

### BLOCKER

Konfiguracja zewnętrzna: konto Resend (API key + verified sender) oraz adres
skrzynki testowej. Po ich dodaniu jako sekretów server-side test można wykonać
bez żadnej zmiany kodu.

---

## P0.21 — CMS EDITOR UX / OVERRIDES

Kontynuacja P0.19–P0.20. Bez nowego CMS, bez drugiego modelu treści,
bez zmian w architekturze i18n, bez nowych tabel i bez nowych endpointów.

### SEARCH

Lokalna wyszukiwarka w `/admin/content` (bez requestu na znak, bez requestu
przy filtrowaniu). Indeks: klucz i18n, id sekcji, etykieta sekcji (z i18n),
wartości domyślne PL/EN oraz aktualne wartości PL/EN (łącznie z niezapisanymi).
Case-insensitive, dopasowanie częściowe. Pusty wynik: `admin.content.searchEmpty`.

### SECTION FILTERS

Filtr „Wszystkie” + 15 istniejących sekcji z `CMS_SECTIONS`. Etykiety pochodzą
z i18n (`labelKey`), nie są hardcodowane. Zmiana filtra nie dotyka draftu.

### OVERRIDE STATES

Na pole i język: `DEFAULT` (brak wiersza w bazie), `OVERRIDE` (zapisane
nadpisanie), `UNSAVED` (zmiana w edytorze). Stan `UNSAVED` ma pierwszeństwo,
a po zapisie pole wraca do `OVERRIDE`. Nazwy tabel i RLS nie są pokazywane.

### RESET SEMANTICS

- Pole: `saveCmsContent` z wartością pustą → `writeEntries` usuwa wiersz
  (`site_content`), zgodnie z semantyką P0.19. Bez nowego endpointu.
- Sekcja: te same wywołania dla kluczy sekcji, które mają override w aktywnym
  języku panelu; paczki po 100 wpisów (limit walidatora: 200). Poprzedzone
  `AlertDialog` (focus trap, ESC, Enter — istniejący komponent).
- Reset globalny („wszystko”) świadomie NIE został dodany.

### PL/EN ISOLATION

Draft jest kluczowany `locale::key`; reset pola i reset sekcji przyjmują jeden
`locale`. Brak kopiowania PL→EN i EN→PL, brak fallbacku międzyjęzykowego.

### DIRTY STATE

Draft trzymany poza filtrem/sekcją/językiem — zmiana sekcji, filtra lub języka
panelu nie kasuje niezapisanych zmian. Licznik `unsaved` + jawne „Odrzuć zmiany”.

### THEME

Bez zmian: 4 presety (`obsidian`, `ivory`, `burgundy`, `emerald`), `data-theme`,
kolory w `src/styles.css`. Brak custom CSS / hex / HTML editora.

### SECURITY

Bez zmian w RLS i bez zmian w kontrakcie zapisu: staff-only write przez
`requireStaffRole`, payload zawiera wyłącznie `{locale, key, value}`
(brak `user_id`, `role`, `service_role`), allowlist + limit długości +
blokada `<`/`>` po stronie serwera. Brak `dangerouslySetInnerHTML`.

### DATABASE

Brak nowej tabeli i brak nowej migracji dla P0.21. Wykorzystano
`public.site_content` (unikat `locale,content_key`) i `public.site_settings`.

UWAGA (kontekst środowiskowy): backend Cloud został w tym cyklu ponownie
zainicjowany jako pusty, więc schemat P0.2–P0.20 (profiles, user_roles,
chronicle_*, bookings, booking_schedule, site_content, site_settings, funkcje
`has_role`, `booked_dates`, `active_schedule_weekdays`) został odtworzony
1:1 z istniejących plików `supabase/migrations`. To odtworzenie stanu, nie nowy
model danych.

### FILES

Dodane: brak.
Zmodyfikowane: `src/routes/admin.content.tsx`, `src/locales/pl/admin.ts`,
`src/locales/en/admin.ts`, `docs/supabase.md`.
Usunięte: brak.

### BUILD / TYPECHECK / LINT

- `bun run build` — PASS
- `tsgo --noEmit` — PASS
- `eslint` na zmienionych plikach — PASS (repo zawiera wcześniejsze,
  niezwiązane z tą iteracją uwagi `prettier/prettier` w innych plikach)

### TESTY

VERIFIED:
- Regresja tras (HTTP 200): `/`, `/uslugi`, `/rezerwacja`, `/tarot`,
  `/astrologia`, `/kontakt`, `/kronika`, `/sanktuarium`, `/faq`,
  `/polityka-prywatnosci`, `/regulamin`, `/admin`, `/admin/content`,
  `/admin/grafik`, `/admin/bookings`.
- Security (Data API, klucz publishable): anon READ `site_content` → 200,
  anon WRITE `site_content` → 401 `permission denied`.

NOT VERIFIED (brak realnej sesji personelu w środowisku — `signed_out`;
sesji NIE fabrykowano):
- search / filtr / statusy w działającym panelu,
- reset pola i reset sekcji end-to-end,
- persystencja po reload,
- odwracalność na stronie publicznej po save/reset,
- testy mobile 390×844 panelu admina,
- rozróżnienie staff vs non-staff w runtime.

### FINAL STATUS

Implementation COMPLETE. Status: NOT GREEN wyłącznie z powodu braku sesji
personelu w środowisku, która uniemożliwia runtime-testy panelu.

## P0.23 — CMS Editor UX / Preview Foundation

Rozszerzenie istniejącego CMS (P0.19) i routingu locale-aware (P0.22).
Bez migracji, bez zmian w `site_content` / `site_settings` / RLS, bez nowego
modelu treści i bez drugiego systemu i18n.

### IMPLEMENTED

- Sticky toolbar panelu treści: język edycji (PL / EN / OBA), Save, Discard,
  licznik niezapisanych zmian, zakres zapisu, odnośniki podglądu.
- Zakres locale jest wiążący: `Save` i `Discard` obejmują wyłącznie języki
  aktualnie wybrane; zmiany w drugim języku pozostają w edytorze i są
  raportowane jako „poza zakresem”.
- Brak automatycznego kopiowania i tłumaczenia wartości między PL i EN;
  każdy wpis draftu jest kluczowany przez `locale::key`.
- Hierarchia sekcji: lista sekcji (desktop) / poziomy pasek (mobile) z liczbą
  pól w zakresie, liczbą nadpisań (★) i liczbą niezapisanych zmian (•).
- Podgląd strony oparty o istniejący routing: `withLocalePrefix()` generuje
  wyłącznie adresy `/pl/...` i `/en/...` (nigdy adresów bez prefiksu). W trybie
  OBA panel pokazuje osobny odnośnik dla PL i dla EN — język nie pochodzi
  z localStorage. Sekcje bez własnej strony (Nawigacja, Stopka, SEO) nie mają
  podglądu. `previewPath` w `src/features/cms/model/fields.ts` jest jedynym
  miejscem mapowania sekcja → strona.
- Statusy pól: DEFAULT / OVERRIDE / UNSAVED, z priorytetem wizualnym UNSAVED.
  Semantyka backendu bez zmian: pusta wartość = usunięcie override.
- Wyszukiwarka nadal w pełni lokalna (brak requestów przy pisaniu); przeszukuje
  klucz, sekcję, etykietę, default, override i draft — wyłącznie w wybranych
  językach. Każde pole ma widoczną etykietę PL / EN.
- Potwierdzenia: zmiana sekcji lub języka przy niezapisanych zmianach oraz
  wyjście z panelu (`useBlocker` + `beforeunload`). Draft nie ginie przypadkowo.
- Theme: te same 4 presety (Obsidian, Ivory, Burgundy, Emerald) i szablon
  `premium-luxury`, wyłącznie przez `data-theme` / `data-template`; panel
  pokazuje jawnie aktywny motyw.
- Mobile: brak poziomego overflow (kontenery `min-w-0`, pola `w-full`, pasek
  sekcji z własnym scrollem), toolbar sticky nie zasłania treści edytora.

### VERIFIED

- `tsgo --noEmit` — PASS.
- `eslint` na zmienionych plikach — PASS.
- `bun run build` — PASS (exit 0).
- SSR smoke (HTTP 200): `/pl`, `/en`, `/pl/uslugi`, `/en/services`,
  `/pl/rezerwacja`, `/en/booking`, `/pl/tarot`, `/en/tarot`,
  `/pl/polityka-prywatnosci`, `/en/privacy-policy`, `/pl/regulamin`,
  `/en/terms`, `/admin/content`, `/sitemap.xml`.
- `<html lang>` zgodny z prefiksem adresu na stronach prawnych PL i EN.
- Anonimowy dostęp do `site_content` (klucz publishable): READ → 200,
  WRITE → 401. Model bezpieczeństwa bez zmian.

### NOT VERIFIED

Brak realnej sesji personelu w środowisku (`signed_out`) — sesji NIE
fabrykowano. Nie zweryfikowano w runtime:

- render panelu treści po zalogowaniu (staff), CMS search, filtr sekcji,
  selektor języka, statusy pól,
- reset pola i reset sekcji end-to-end oraz odwracalność na stronie publicznej,
- Save / Discard w zakresie locale i persystencja po reload,
- potwierdzenia przy zmianie sekcji / języka / wyjściu z panelu,
- wybór motywu zapisany w `site_settings`,
- pomiary mobile (390×844) wewnątrz panelu.

### KNOWN LIMITATIONS

- Podgląd otwiera opublikowaną treść CMS, nie draft. Preview niezapisanego
  draftu wymagałby przekazania tymczasowego stanu do renderu publicznego
  (osobny, uwierzytelniony kanał draftu) — świadomie NIE wprowadzono w P0.23.
  Extension point: `previewPath` w modelu sekcji + `applyContentOverrides()`
  w `src/features/cms/lib/overrides.ts` (jedno miejsce nakładania nadpisań).
- Sekcje bez pojedynczej strony (Nawigacja, Stopka, SEO) nie mają podglądu.
- Blokada wyjścia (`useBlocker`) dotyczy nawigacji routera i zamknięcia karty;
  nie obejmuje twardego przejścia przez `location.href` poza routerem.

### NEXT ITERATION

- Uwierzytelniony kanał draft-preview (podgląd niezapisanych zmian).
- Edycja kolekcji (Biblioteka Refleksji, rytuały) w tym samym panelu.
- Podgląd SEO (title/description) obok pól sekcji SEO.

### REGRESSIONS FOUND

Brak. Nie zmieniano Auth, SSR auth, RLS, Booking, Tarot, Kroniki, transportu
e-mail ani routingu P0.22.

## P0.25 — BLOG: INTEGRACJA PUBLICZNA

### CO ZOSTAŁO PODŁĄCZONE

- `src/pages/library.tsx` — lista Biblioteki Refleksji czyta wyłącznie
  `blog_posts` przez `fetchPublishedBlogPosts({ locale })`. Statyczny słownik
  `src/features/library/model/posts.ts` nie jest już źródłem stron publicznych.
- `src/pages/article.tsx` — artykuł czyta `fetchPublishedBlogPost(locale, slug)`.
  Brak rekordu, `status = draft` albo inny język → `notFound()` (HTTP 404).
- `src/components/library/PublicArticleTemplate.tsx` — skład treści z bazy.
  Treść jest tekstem: pusta linia = akapit, `## ` = śródtytuł. Brak HTML z bazy,
  brak `dangerouslySetInnerHTML`.
- `src/lib/locale-route.tsx` — loader i `head()` otrzymują `language` z adresu
  (URL pozostaje jedynym źródłem prawdy o języku). Nowa flaga `alternates: false`
  wyłącza hreflang dla treści istniejących niezależnie w każdym języku.
- `src/routes/sitemap[.]xml.ts` — wpisy artykułów pochodzą z bazy
  (`readPublishedPosts` dla każdego języka), mają `lastmod = published_at`
  i NIE mają hreflang między językami.

### IZOLACJA JĘZYKOWA

PL i EN to niezależne rekordy (`UNIQUE (locale, slug)`). Brak fallbacku,
brak tłumaczeń automatycznych, brak hreflang między artykułami.

### SEO

`seo_title` / `seo_description` z bazy mają priorytet nad `title` / `excerpt`.
Canonical wskazuje samą stronę (`/pl/biblioteka/...`, `/en/library/...`).
Brak `og:image` — artykuły nie mają obrazu w modelu danych, więc podgląd
społecznościowy zostaje po stronie hostingu.

### WERYFIKACJA

- `/pl/biblioteka` i `/en/library` — 200, wyłącznie artykuły własnego języka.
- `/pl/biblioteka/<slug-pl>`, `/en/library/<slug-en>` — 200, treść z bazy.
- `/pl/biblioteka/<slug-en>` — 404 (izolacja języka).
- `/pl/biblioteka/<slug-draftu>` — 404 (draft niewidoczny publicznie).
- `/biblioteka` — 301 na wersję językową (bez zmian z P0.22).
- `/sitemap.xml` — artykuły tylko opublikowane, po jednym wpisie na język.
- `tsgo --noEmit` — bez błędów.

### REGRESSIONS FOUND

Brak. Nie zmieniano Auth, RLS, Booking, Tarot, Kroniki, CMS ani panelu admina.

## P0.26 — THEME MANAGER

### PRESETY

Źródło prawdy: `src/features/cms/model/theme.ts` (`THEME_PRESETS`).
Każdy preset ma stabilne `id`, nazwę, opisy PL/EN, kolory podglądu i `dataTheme`:
`obsidian` (default), `ivory`, `burgundy`, `emerald`.
Szablon (`TEMPLATE_PRESETS`): `premium-luxury` (`dataTemplate`).
Wartości kolorów żyją WYŁĄCZNIE w `src/styles.css` pod `html[data-theme="<id>"]`.
Dodanie presetu = wpis w modelu + blok tokenów w arkuszu. Bez zmian w UI.

### SITE_SETTINGS

Jeden rekord `public.site_settings` (`id = 'default'`) z kolumnami
`theme_id` / `template_id`. W bazie zapisujemy tylko ID presetu — nigdy CSS,
HTML ani obiektu motywu. Brak nowej tabeli, brak nowej migracji w P0.26.
Rozdział zachowany: `site_content` = teksty, `site_settings` = wygląd.

### SERVER-SIDE AUTHORIZATION

Zapis idzie przez istniejące `saveSiteSettings` (`src/lib/cms.functions.ts`):
`inputValidator` odrzuca nieznane `themeId` / `templateId` (`isThemeId`,
`isTemplateId`), middleware sesyjne dostarcza tożsamość, a `requireStaffRole`
sprawdza rolę SERWEROWO. Payload nigdy nie zawiera `user_id`, `role`, `isAdmin`.
Anon i klient bez roli personelu nie zapiszą motywu (RLS + kontrola w funkcji).

### PREVIEW VS SAVE

`src/features/cms/components/ThemeManager.tsx`:
klik na preset ustawia lokalnie `document.documentElement.dataset.theme`
(podgląd w panelu, bez zapisu). Stan „Niezapisane zmiany motywu" + `Zapisz` /
`Odrzuć`. `Odrzuć` i opuszczenie panelu przywracają zapisany preset.
Wybór motywu nie dotyka draftów CMS ani `useBlocker` z P0.23.
Miniatura presetu rysuje się z danych modelu — bez `dangerouslySetInnerHTML`,
bez arbitrary CSS od administratora.

### PUBLIC RUNTIME

`src/routes/__root.tsx` — loader roota (`fetchSiteBundle`) dostarcza `settings`,
a `RootShell` renderuje `data-theme` / `data-template` na `<html>` już w SSR,
więc reload zachowuje wybór bez migania. Efekt klienta aktualizuje atrybuty po
nawigacji. Motyw nie ma wpływu na język — źródłem języka pozostaje URL (P0.22).

### FALLBACK

`readPublicBundle` nigdy nie rzuca; nieznane lub brakujące `theme_id`
sprowadza się do `DEFAULT_SITE_SETTINGS` (`obsidian` + `premium-luxury`)
zarówno na serwerze (`toSettings`), jak i w `RootShell`. Brak backendu = strona
nadal w pełni ostylowana.

### PL/EN INDEPENDENCE

Motyw jest globalny: jedna strona = jeden aktywny preset. Brak osobnego motywu
dla PL i EN; przełącznik języka w panelu nie wpływa na wybór motywu.

### WERYFIKACJA

- `/pl`, `/en`, `/pl/uslugi`, `/en/services`, `/pl/rezerwacja`, `/en/booking`,
  `/pl/tarot`, `/en/tarot`, `/pl/biblioteka`, `/en/library`,
  `/pl/polityka-prywatnosci`, `/en/privacy-policy`, `/pl/regulamin`,
  `/en/terms` — 200, `data-theme` i `data-template` obecne w HTML z serwera.
- `theme_id = 'burgundy'` w bazie → `<html data-theme="burgundy">` na `/pl`
  i `/en/library`; po przywróceniu `obsidian` atrybut wraca.
- Tokeny presetów różnią się realnie (`--background`, `--surface`, `--gold`).
- `tsgo --noEmit`, `bun run lint`, `bun run build` — PASS.
- Zapis motywu z panelu: NOT VERIFIED (brak sesji personelu w środowisku).

---

## P0.30 — Email Notifications (produkcyjna warstwa)

Przepływ (jeden, bez równoległych systemów):

```
mutacja DB → sukces → BookingEvent → dispatchBookingEvent()
  → emailProvider → resolveEmailTransport() → transport HTTPS
  → telegramProvider → NOT_CONFIGURED
```

### Obsługiwane zdarzenia

| Zdarzenie | Wywołanie | Odbiorcy |
| --- | --- | --- |
| `booking.created` | `createBooking` po skutecznym INSERT | klient + personel |
| `booking.confirmed` | `updateBookingStatus` (staff) po skutecznej zmianie | klient + personel |
| `booking.cancelled` | `updateBookingStatus` lub `cancelOwnBooking` po skutecznym UPDATE | klient + personel |
| `booking.completed` | `updateBookingStatus` po skutecznej zmianie | klient + personel |

### ENV (wyłącznie server-only, nigdy `VITE_*`)

| Zmienna | Rola | Wymagana |
| --- | --- | --- |
| `EMAIL_TRANSPORT` | wybór adaptera: `resend` (domyślny) \| `lovable` \| `none` | nie |
| `EMAIL_API_KEY` | klucz API providera (`resend`) | tak dla `resend` |
| `EMAIL_SENDER_ADDRESS` | zweryfikowany adres nadawcy | tak dla `resend` |
| `EMAIL_SENDER_NAME` | nazwa nadawcy w nagłówku `From` | nie |
| `EMAIL_SENDER_DOMAIN` | zweryfikowana subdomena (adapter `lovable`) | tak dla `lovable` |
| `STAFF_NOTIFICATION_EMAIL` | odbiorca powiadomień personelu | nie (brak = pomijamy staff) |

Sekrety żyją wyłącznie w menedżerze sekretów środowiska uruchomieniowego.
Walidacja konfiguracji odbywa się po stronie serwera; klient nigdy nie widzi
klucza, nadawcy ani adresu personelu.

### Zachowanie

- **Brak konfiguracji transportu** → `not_configured`, rezerwacja pozostaje zapisana.
- **Błąd providera** → `transport_error`, rezerwacja pozostaje zapisana.
- **Nieprawidłowy adres klienta** → brak próby wysyłki, kontrolowany wynik błędu.
- **Brak `STAFF_NOTIFICATION_EMAIL`** → wysyłka do personelu pomijana, klient dostaje wiadomość.
- **Błąd mutacji DB** → żadnego zdarzenia i żadnego e-maila.
- Dyspozytor NIGDY nie rzuca — powiadomienie nie może cofnąć operacji w bazie.

### PL / EN

Językiem wiadomości jest wyłącznie `bookings.language` (przenoszony do
`BookingEvent.locale`). Copy pochodzi z serwerowego `translator(locale)`
(`src/locales/{pl,en}/booking.ts`, klucze `booking.notifications.*`).
Język admina, przeglądarki i `localStorage` nie mają na to wpływu.

### Logowanie

`src/lib/notifications/log.server.ts` zapisuje wyłącznie: znacznik czasu,
zdarzenie, kanał, typ odbiorcy, zamaskowany adres (`a***@example.com`),
referencję LIO i wynik (`sent | failed | not_configured | invalid_recipient`).
Bez treści wiadomości, bez pełnych adresów, bez sekretów. Brak tabeli
`notification_logs` — świadomie.

### Realna dostawa

`REAL EMAIL DELIVERY — NOT VERIFIED`: środowisko nie posiada `EMAIL_API_KEY`
ani zweryfikowanego nadawcy.

---

## P0.31 — Telegram (status w Adminie) + analityka klienta

### Admin → Integrations

Karta statusu obu botów liczona jest **wyłącznie serwerowo**
(`src/lib/telegram/status.server.ts`, wystawione przez
`src/lib/integrations.functions.ts` dla personelu). Do przeglądarki trafiają
tylko flagi boolean i etykiety — nigdy token, sekret webhooka ani allowlista.

Pokazywane pola dla każdego bota (Admin i Statystyki osobno):

| Pole | Znaczenie |
| --- | --- |
| Konfiguracja | czy token bota jest ustawiony w środowisku |
| Autoryzacja | czy ustawiona jest allowlista / sekret webhooka |
| Transport | `Skonfigurowany` / `Niezweryfikowany` / `Brak konfiguracji` |
| Tryb | Admin = operacyjny, Statystyki = tylko odczyt |

Transport jest oznaczany jako **NIEZWERYFIKOWANY** dopóki nie wykonano realnego
handshake'u z Telegramem. Panel nigdy nie deklaruje „połączono” na podstawie
samej obecności zmiennych środowiskowych.

Separacja botów pozostaje nienaruszona: bot statystyk nie ma ścieżki zapisu,
bot admina nie dostaje nowych uprawnień poza istniejącymi funkcjami biznesowymi.

### ENV (server-only)

```
TELEGRAM_ADMIN_BOT_TOKEN
TELEGRAM_ADMIN_WEBHOOK_SECRET
TELEGRAM_ADMIN_ALLOWED_USER_IDS
TELEGRAM_STATS_BOT_TOKEN
TELEGRAM_STATS_WEBHOOK_SECRET
TELEGRAM_STATS_ALLOWED_USER_IDS
```

Brak którejkolwiek zmiennej = integracja raportowana jako nieskonfigurowana,
bez błędu i bez wpływu na resztę aplikacji.

### Analityka — model danych

Klient: `src/lib/analytics/client.ts`, hooki: `src/hooks/useAnalytics.ts`.

- Identyfikator odwiedzającego jest **pseudonimowy i rotowany co 30 dni**
  (losowy UUID w `localStorage`), sesja wygasa po 30 minutach bezczynności.
- **Bez PII**: nie zbieramy IP, User-Agenta jako odcisku, nazwisk, e-maili,
  treści pytań w Tarocie ani danych rezerwacji.
- **Bez fingerprintingu**: żadnego canvas/font/hardware probing.
- Metadane są allowlistowane — do bazy trafiają wyłącznie znane klucze
  o wartościach skalarnych (np. `service`, `spread`, `variant`, `locale`).
- Wysyłka jest *fire-and-forget* (idle callback + `keepalive`); błąd analityki
  nigdy nie przerywa rezerwacji, rytuału ani nawigacji.

### Instrumentowane zdarzenia

| Zdarzenie | Miejsce |
| --- | --- |
| `page_view` | globalnie, `src/routes/__root.tsx` |
| `cta_click` | Hero (rezerwacja, tarot), CTA w nagłówku |
| `booking_started` / `booking_completed` | `BookingForm` (wybór usługi / sukces) |
| `tarot_started` / `tarot_completed` | `TarotDeck` (start tasowania / koniec) |
| `language_selected` | przełącznik języka (locale z adresu URL) |
| `privacy_policy_view` / `terms_view` | strony prawne, raz na sesję |

### NOT VERIFIED

- Realny handshake z Telegram API (`getWebhookInfo`) — status transportu
  pozostaje deklaratywny do czasu weryfikacji w środowisku produkcyjnym.
- Wolumen zdarzeń analitycznych pod ruchem produkcyjnym.

## P0.34 — warstwa operacyjna (status modułów)

Źródło prawdy: `src/lib/ops/status.server.ts` (server-only), kontrakt typów
client-safe: `src/lib/ops/model/status.ts`, wejście: `fetchOperationsStatus`
w `src/lib/integrations.functions.ts` (sesja SSR → `requireStaffRole` → RLS).

Stany modułu: `ready`, `configured`, `not_configured`, `unavailable`, `error`.

| Moduł | Źródło stanu |
| --- | --- |
| Bookings | `bookings` (count, head) |
| Services | `services` |
| Schedule | `booking_schedule` |
| Blog | `blog_posts` |
| Content / CMS | `site_content` |
| Theme | `site_settings.id = 'default'` |
| Email | `isEmailTransportConfigured()` + `STAFF_NOTIFICATION_EMAIL` |
| Telegram Admin | token + webhook secret + allowlista (osobne zmienne) |
| Telegram Statistics | token + webhook secret + allowlista (osobne zmienne) |

Zasady:

- do przeglądarki trafiają wyłącznie stany, liczniki i flagi boolowskie —
  żadnych tokenów, sekretów, adresów ani danych klientów,
- `transportVerified` jest `false`, dopóki realny ruch nie potwierdzi
  transportu; e-mail i Telegram raportują wprost „Transport NIEZWERYFIKOWANY”,
- brak uprawnień do tabeli daje `unavailable`, a nie fałszywe „gotowe”.

### Grafik — walidacja serwerowa

`createScheduleEntry` / `updateScheduleEntry` odrzucają nakładające się aktywne
przedziały w tym samym dniu (`SCHEDULE_OVERLAP`). Panel waliduje to samo w UI,
ale autorytetem jest serwer — zapis z innego klienta również jest blokowany.
