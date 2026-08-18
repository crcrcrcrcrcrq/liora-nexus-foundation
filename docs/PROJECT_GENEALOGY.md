# LIORA PREMIUM — PROJECT GENEALOGY

Single lineage record. Each stage builds on the previous one; nothing is
rebuilt from scratch and no stage is deleted from the record.

Detailed narrative for stages P0.1–P0.34 lives in the history archive
(`LIORA_PROJECT_HISTORY_ARCHIVE_2026-08-09.zip` →
`01_MASTER_DOCS/PROJECT_HISTORY_MASTER.md`, `P0_STATUS_MATRIX.md`,
`SNAPSHOT_INDEX.md`) together with 35 source snapshots in
`02_SOURCE_SNAPSHOTS/`. That archive is reference material only and is never
merged into the working source.

---

## Lineage

| Stage | Theme | Status |
|-------|-------|--------|
| RC0.x → P0.1 | Foundation: TanStack Start + Vite + SSR, design system, first PL routes | superseded |
| P0.2 – P0.9 | Locale architecture (URL as the only source of truth), PL/EN route map, canonical + hreflang, core public pages | superseded |
| P0.10 – P0.19 | Services, Tarot, Booking flow, Schedule, Supabase persistence + RLS, identity and role matrix | superseded |
| P0.20 – P0.28 | CMS, Blog/Library, Theme Manager (SSR `data-theme`), Admin surface, notification event contract | superseded |
| P0.29 – P0.31 | Analytics model (no IP, allowlisted metadata, rotating pseudonymous key), Telegram Statistics bot | superseded |
| P0.32 | Telegram Admin bot, webhook secret verification, per-command DB role re-check | superseded |
| P0.33 | Consolidation and audit hardening | superseded |
| P0.34 | Production Operations Layer, Operations Status panel — closed **AMBER** (backend/integrations unverified in that environment) | superseded |
| P0.35 | Continuation / full production audit — closed **AMBER** (backend not provisioned) | superseded |
| P0.36 | Backend provisioning + real production verification — closed **AMBER** (backend now real) | superseded |
| P0.37 | Authenticated runtime verification (real staff + client sessions) — closed **GREEN** with declared NOT VERIFIED items | superseded |
| **P0.38** | **S3 Storage Foundation + LIORA Control Plane foundation — this stage** | **current, AMBER** |

---

## P0.35 — Continuation / Full Production Audit (superseded by P0.36)

**Date:** 2026-08-09
**Parent:** P0.34 (Production Operations Layer, AMBER)
**Source of truth:** `tele-insight-stream-main.zip`, installed verbatim.
**History used:** `LIORA_PROJECT_HISTORY_ARCHIVE_2026-08-09.zip`, read only —
no snapshot merged, no historical file restored.

**Mandate:** audit → fix → verify → document. No rebuild, no redesign, no new
subsystem, no parallel implementation.

**Decisions preserved (explicitly re-verified, not re-litigated):**
URL-based locale with no cross-language fallback; PL/EN content isolation;
CMS-driven content architecture; Theme Manager applied through SSR
`data-theme`; separation of the Telegram Admin bot from the Telegram
Statistics bot; roles stored in a dedicated `user_roles` table and re-checked
server-side on every privileged call; analytics without IP storage or
fingerprinting.

**Changed:**
- `src/lib/site-url.server.ts` (new) — absolute base-URL resolver.
- `src/routes/robots[.]txt.ts` (new) — dynamic robots.txt with an absolute
  `Sitemap:` directive and the private Sanctuary area disallowed.
- `src/routes/sitemap[.]xml.ts` — absolute `<loc>` and `hreflang` URLs.
- `src/lib/booking.functions.ts` — server-side format/length validation on the
  public booking write path.
- `public/robots.txt` (deleted) — superseded by the route.

**Not changed:** every other module, all 28 migrations, all RLS policies, all
dependencies, the design system, and the route map.

**Verified:** build GREEN, typecheck GREEN, lint 0 errors, 28 PL/EN routes at
390×844 all HTTP 200 with no horizontal overflow and no console errors,
sitemap 32 absolute entries, robots.txt correct.

**Not verified (environment blockers, not defects):** database and RLS at
runtime, authenticated Admin surface, e-mail delivery, both Telegram webhook
handshakes. Nothing about these was simulated or claimed.

**Closed as:** AMBER.
**Full report:** `docs/P0.35-CONTINUATION-AUDIT-REPORT.md`.

**Successor should start with:** provisioning the backend and applying the
existing migrations unchanged, then re-running the blocked verifications
(P0.36).

---

## P0.36 — Backend provisioning + real production verification (2026-08-09)

**Continuation of:** P0.35 (AMBER, backend not provisioned).

**Objective:** provision the existing backend and verify for real the surfaces
P0.35 had to leave blocked.

**Done:** Lovable Cloud enabled. Schema rebuilt **only** from the 28 migrations
already in the repository. Those files are not a linear chain — seven of them
are cumulative snapshots, so a verbatim replay in filename order aborts on the
second one (`type "app_role" already exists`). The final snapshot
`20260809044150` is fully idempotent and is the authoritative consolidated
baseline of the entire lineage; it was applied verbatim, preceded by
`20260807220709`/`220724`/`220842` and followed by `20260809111101`
(`analytics_events`). No SQL was re-authored; every historical file stays on
disk untouched.

**Live schema:** 12 tables, all RLS-enabled, with the original policies,
functions (`has_role`, `booked_dates`, `active_schedule_weekdays`,
`active_schedule_windows`, `bookings_validate_language`), triggers and the
`bookings_one_active_per_date` unique index. Seed data as defined: 5 services,
5 schedule windows, 1 settings row.

**Fixed (P1, new in P0.36):** `analytics_events` still carried Cloud's default
`anon` SELECT privilege (RLS returned no rows, so nothing leaked, but it broke
the project's least-privilege rule). Revoked, matching every other table.

**Verified:** schema and seed data in the live database; typecheck GREEN against
the regenerated types; build GREEN; PL/EN public routes GREEN; services rendered
from the database in both locales; SEO artefacts still absolute; anonymous RLS
probe — `bookings`, `profiles`, `user_roles`, `chronicle_notes`,
`analytics_events` all denied, `services`/`site_settings`/`blog_posts` public
exactly as intended.

**Accepted by design:** seven linter warnings for `SECURITY DEFINER` execution.
`has_role` powers every policy; the three availability functions expose dates
and time windows only and are what let anonymous visitors see free slots without
any read privilege on `bookings`.

**Still not verified (credential-dependent, nothing simulated):** authenticated
Admin runtime, booking end-to-end write, e-mail delivery, both Telegram
webhooks, live analytics collection.

**Closed as:** AMBER (upgraded — backend now real).
**Full report:** `docs/P0.36-BACKEND-PROVISIONING-VERIFICATION-REPORT.md`.

**Successor should start with:** a real signed-in session to verify Admin and
the booking write path, then e-mail transport and Telegram bot secrets.

## P0.37 — Authenticated runtime verification (2026-08-09) — GREEN (with declared NOT VERIFIED items)
Real sessions (staff + client) via Supabase magic-link; every result below observed at runtime, nothing simulated.
- Admin runtime: all 12 panel routes render with staff session; bookings list shows the real row (LIO-B501-28F1).
- Booking E2E (390x844, real client session): service -> day -> time -> data -> summary -> confirmation; row persisted with server-derived user_id, language `pl`, date+time.
- Status machine (server-side): new->done rejected (BOOKING_STATUS_TRANSITION_INVALID), new->confirmed OK, confirmed->confirmed rejected (UNCHANGED), confirmed->done OK, done->cancelled rejected.
- AuthZ: anonymous -> gate + "Unauthorized: no active session"; client role -> restricted screen + "Forbidden: staff role required" on admin/CMS functions.
- RLS with real client JWT: forged booking for another user 403, self-promotion to admin 403, CMS write 403, reads scoped to own rows.
- CMS: allowlist enforced (non-editable key rejected), oversize + unsupported locale rejected, save visible on public /pl, EN unaffected, empty value reverts to i18n default.
- Schedule: overlap rejected (SCHEDULE_OVERLAP), inverted range rejected by Zod.
- Blog: staff create/list OK (test draft removed afterwards).
- Telegram admin + stats webhooks: 401 without/with wrong secret; no transport configured.
- Analytics/GDPR: stored rows carry no IP, user-agent or e-mail; random visitor id, empty geo; aggregate reads require staff role.
- NOT VERIFIED (no credentials/transport): e-mail delivery for created/confirmed/cancelled/completed, real Telegram bot round-trip.

## P0.38 — S3 Storage Foundation + LIORA Control Plane foundation (2026-08-10) — AMBER

**Parent:** P0.37 (authenticated runtime verification, GREEN with declared gaps).
**Scope:** foundation only. No business module rewritten, no second LIORA, no
second backend, no second data model, no third Telegram bot, no migration
removed, no change to RLS / Auth / Booking / Tarot / CMS / Analytics.

**Added:** server-only S3 adapter (SigV4 via Web Crypto + `fetch`, no AWS SDK,
Workers-compatible, path-style, typed errors); the logical namespace
`liora/{backups,releases,deployments,checkpoints,artifacts,logs}`; Backup
Manager (manifest + checksum + artifact upload, refuses credential-bearing
files); Release Manager with a closed status machine and `LIORA-YYYY.MM.DD-NNN`
ids; Checkpoint Manager for the ten declared checkpoints with metadata
sanitisation (secrets, IPs, e-mails stripped); Control Plane authorization that
delegates to the existing `requireStaffRole` / `resolveStaffIdentity` chain
(`Telegram ID → LIORA user → user_roles → permission`), so no second permission
system exists; one read-only server function and a status-only panel inside the
existing `/admin/integrations`.

**Zero new npm dependencies.**

**Verified:** `bun run build` GREEN (Nitro + Cloudflare artefacts generated),
`tsc --noEmit` GREEN, `eslint` 0 errors (39 pre-existing warnings, count
unchanged), `bun test` 18/18 pass; client bundle free of S3/service-role/
Telegram secrets and of every server-only symbol; signing code present only in
the SSR bundle; existing modules and all 28 migrations untouched.

**NOT VERIFIED (nothing simulated):** live S3 round-trip (no credentials —
storage reports `not_configured`), Cloudflare production deployment, e-mail
delivery, real Telegram round-trip, and the authenticated/DB-backed runtime in
*this* workspace, whose Supabase environment variables are absent (P0.37's
results are not re-claimed as P0.38 evidence).

**Closed as:** AMBER.
**Full report:** `docs/P0.38-S3-CONTROL-PLANE-REPORT.md`.

**Successor should start with:** S3 credentials as runtime secrets plus a real
put/get/list/delete round-trip and a first release + backup manifest, then the
Supabase environment for this workspace, then the deployment engine and rollback
on top of the checkpoint foundation, then the Telegram Mini App as a Control API
client only.
