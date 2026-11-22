# OPS / FleetMaster Project Overview

**Canonical project document.** OPS is the Next.js/OpenNext application on `ops-staging`. The legacy K&K Worker is a read-only migration reference, not a second application to deploy. This audit did not access or modify production D1, secrets, or deployments.

## Audit: PASS / MISSING / MIGRATE

| Feature | Legacy K&K | Current OPS | Assessment |
|---|---|---|---|
| Google Login | **PASS** — Google Identity credential verification, CSRF check, and private login UI. | **PASS — Phase 2A** — public `/login` and `/auth/google`; verifies Google JWT signature/claims and the `g_csrf_token` double-submit value. Runtime OAuth values are not configured in source. | **MIGRATE** completed for staging code; configure the approved staging OAuth client and redirect origin before sign-in testing. |
| D1 sessions | **PASS** — D1 `users`, `sessions`, `access_requests`, and `audit_log`; random session cookie with only its hash stored. | **PASS — Phase 2A** — compatible D1 adapter, hashed `kk_session` cookie, expiry/revocation checks, and matching auth schema. Phase 2A used local D1; the current `ops-auth-staging` binding has not been verified against Cloudflare. | **MIGRATE** existing identities only into an isolated staging D1 after approval; production remains untouched. |
| User approval | **PASS** — users can request access; owners approve, decline, add, or revoke access. | **PASS — Phase 2A** — `/access` owner UI and guarded APIs include approval, add, revoke, and audit events. | **MIGRATE** workflow code completed; seed/retain authorized records only in an explicitly approved staging database. |
| Role permissions | **PASS, limited** — `owner` and `user`; owner-only administration, active users can use the dashboard. | **PASS — Phase 2A** — server guards enforce active-user and owner-only access; UI identities come from the validated session, not sample users. | **MIGRATE** completed for current routes; retain server checks on future private APIs and data access. |
| Google Sheets | **PASS** — read-only service-account access for inspection records and truck/trailer tire maps. | **PARTIAL** — Tire Intelligence still uses its existing adapter; Phase 3A added a protected, read-only runtime-binding adapter for OPERATION, but staging Sheets bindings are not configured or live-verified. | **MIGRATE** the remaining adapters to runtime bindings and keep mappings source-verified. |
| Dashboard | **PASS** — live inspection metrics, trends, comparisons, and recent records from Sheets. | **PARTIAL — Phase 3A** — `/overview` derives fleet KPIs from the user-confirmed OPERATION layout when configured. Missing bindings show `N/A`; Broken Trucks remains unavailable. | **MIGRATE** further only after staging Sheet access and live parity are verified. |
| Inspections | **PASS** — parsed inspection details, filters, and safety summaries. | **MISSING** — `/safety` is a placeholder, not a connected inspection view. | **MIGRATE** the parser and calculations into the OPS safety workspace. |
| Tire Map / Tire Intelligence | **PASS** — legacy `/tire-map` reads tire logs and calculates costs, counts, positions, and unit rankings. | **PARTIAL** — `/tires` and `/units` have a live tire adapter, but are not yet authenticated or verified against the legacy results. `/live-map` is a different, geographic map. | **MIGRATE** legacy tire analytics into `/tires`; do not confuse it with the geographic map or add GPS integrations. |
| Time Zones | **PASS** — browser-local and U.S. zone clocks with daylight-saving handling. | **MISSING** — `/time-zones` is marked “Soon”; no route exists. | **MIGRATE** as a small client-side OPS page. |
| One-site experience | **PASS in OPS deployment structure** — current OPS is one Next.js app. | **PASS for authentication** — existing routes now live under one protected route group without URL changes; both existing shells receive the validated session. | **MIGRATE** remaining legacy feature views into the OPS shell only as separately verified phases. |

### Mocked, duplicated, and unconnected areas

- Several older OPS screens use fixed records from `lib/fleet-data.ts` or `lib/truck-data.ts`. In particular, `/live-map` is titled as real-time but its markers come from local sample data; it is **not a live GPS feed**. The old sidebar's sample users/roles have been removed from the authenticated UI. Other fixtures must still be clearly marked as demo/offline or replaced with verified data before being presented as live.
- `lib/data/sample-data.ts` and the legacy `src/demo-data.js` contain fixtures; neither is used by the current live data adapter. The legacy tire-map script also contains sample/snapshot code. Keep all such data explicitly non-live and do not use it as production records.
- Current `/costs`, `/overview`, and `/safety` OPS pages are no-data placeholders. Older `/cost-center`, `/truck-costs`, `/trailer-costs`, shops, and operations screens contain fixed data rather than connected operational sources.
- The legacy Worker serves duplicated HTML aliases (dashboard, inspections, time zone, access) and client scripts. These are one legacy Worker with duplicate assets, not a reason to run a second production app. Port behavior into Next routes rather than copying the static site wholesale.
- The current `wrangler.jsonc` names the Worker `ops-staging` and declares `DB` as `ops-auth-staging` with a nonzero ID. This repository view does not confirm the remote database's account or environment; verify isolation in Cloudflare before any remote operation. The legacy config is separate and production-facing; do not copy its resource identifiers or secret values into OPS.

## Safe authentication and data migration

1. Keep the legacy Worker and production D1 untouched. Do not run legacy DDL, reset/import a database, or change production secrets as part of staging work.
2. Verify the legacy auth schema read-only, then use an isolated staging D1 binding. Apply only additive, idempotent schema changes there; preserve existing users, approvals, audit history, and session rows. Before any separately approved production cutover, compare schema and record counts and take a recoverable backup. No production migration is authorized by this plan.
3. Read Cloudflare D1 and secret bindings at request runtime through the supported OpenNext context; do not bake credentials into build-time `process.env`, source, or client bundles. Keep existing production secret values unchanged. Configure only staging secrets when approved; do not copy values into this repository.
4. Preserve Google Identity claim validation, CSRF protection, session expiry, hashed session tokens, HttpOnly/SameSite/Secure cookie behavior, and owner-only authorization. Enforce access in server layouts and every data/API handler, not just navigation or client-side redirects. Protect data reads before fetching Google Sheets.
5. Test sign-in, pending/approved/declined access, owner/user permissions, session expiry/revocation, and authenticated Sheets reads on staging. Confirm old routes and equivalent new views against live-source results before any cutover. Keep old files until replacement tests pass.
6. Keep the final product as one OPS Next.js/OpenNext site. Do not add Motive, GPS, or another production app. A new staging OAuth redirect/origin may need explicit Google configuration approval; do not change production secrets.

## Phase 2A implementation status

- Implemented the Cloudflare-runtime D1 adapter and a schema matching legacy `users`, `access_requests`, `sessions`, and `audit_log`. The migration was applied and inspected only against Wrangler's local D1; no remote or production database was accessed.
- Implemented Google Identity JWT validation, Google GIS CSRF double-submit validation, session creation/lookup/logout, access requests, owner administration, and audit logging. Session tokens remain opaque in the browser and SHA-256 hashed in D1.
- Protected every existing Next page using a route group while preserving URL paths. The OPS shell checks authorization before loading its data source; each private API performs its own server-side guard. `/login` remains public.
- Replaced the old sidebar's fake user switching/management with the validated identity and a link to the real owner-only access page.
- `npm run test:auth`, `npm run build`, `npm run cf:build`, local D1 migration/schema verification, and `npx wrangler deploy --dry-run` passed. A local Worker check returned a login redirect for `/overview`, `401` for `/api/admin/users`, and an unauthenticated result for `/api/me`.
- No commit, push, deploy, production D1 operation, secret change, or legacy-file deletion was performed.

## Phase 2B — authentication staging readiness audit

**Audit date:** 2026-11-22. This was a read-only review of the Phase 2A implementation and Cloudflare configuration, followed by local tests/builds. No Cloudflare account, production Worker, remote D1, or secret values were accessed.

### Verified security and compatibility

- Every existing application page is under `app/(protected)/` except the public `/login` page. The protected layout validates the D1 session before rendering; the OPS nested layout validates again before loading `dataSource`. `/access` additionally requires the `owner` role.
- All private data/administration APIs check the session server-side. User/approval administration requires an active owner. `/api/me` is intentionally a public current-session status endpoint; `/api/logout` only deletes the caller's session; `/auth/google` is a public sign-in callback protected by Google GIS CSRF validation and signed-token verification.
- This is Google Identity Services redirect UX, not a separate OAuth authorization-code flow: the callback compares the `g_csrf_token` form value and cookie using a constant-time comparison. It does not use a separate OAuth `state` query parameter. ID-token verification checks the RS256 signature, Google signing key, issuer, audience, expiry, and verified email.
- `kk_session` is an opaque random token; only its SHA-256 hash is stored in D1. The cookie is `HttpOnly`, `SameSite=Lax`, path `/`, and receives `Secure` on HTTPS requests. Session expiry defaults to 12 hours and is checked on each request; revoked users are denied and revocation deletes their sessions.
- The legacy `owner`/`user` roles and active/revoked access behavior are retained. The configured `OWNER_EMAIL` is granted owner status; set it only to the intended staging test owner.
- Phase 2A authentication tests used local D1. The current checked-in `wrangler.jsonc` names the `DB` database `ops-auth-staging` and has a nonzero ID; repository inspection alone cannot verify the Cloudflare resource or prove it is isolated from production. Do not run remote migrations until the `ops-staging` binding is confirmed in Cloudflare.
- The Next app currently has no configured equivalent of the legacy Worker response headers (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`). Add and validate compatible headers before broader exposure; the CSP must permit the Google Identity Services endpoints used by the login page.

### Phase 2B validation performed

- `npm run test:auth` — passed, 7 tests covering unauthorized access, active/revoked users, owner-only checks, session creation/logout/expiry, signed Google tokens, CSRF comparison, and same-origin mutation checks.
- `npm run build` — passed.
- `npm run cf:build` — passed.
- `npx wrangler deploy --dry-run` — passed as a bundle check only at the time of the Phase 2B audit; it is **not** evidence that the current D1 binding is isolated or staging-ready. No deploy was performed.
- Local Worker smoke checks returned `200` for `/login`, a login redirect for protected pages, and `401` for owner APIs without a session. The D1 migration/schema was tested only with local D1 in Phase 2A.

### Values and URLs required

Configure these only on the staging Worker:

| Name | Type / use |
|---|---|
| `DB` | Cloudflare D1 binding. Verify the current `ops-auth-staging` configuration points to an isolated staging D1 before any remote migration. |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 Web application client ID for staging. It is intentionally sent to the login page; it is not a client secret. |
| `OWNER_EMAIL` | Exact Google account email to bootstrap as the staging owner. Keep server-side; do not put a real value in the repository. |
| `SESSION_TTL_HOURS` | Optional session lifetime in hours. Defaults to `12`. |
| `GOOGLE_SHEET_ID` | Staging spreadsheet ID used by the OPERATION dashboard. Configure as a server-side Worker variable. |
| `GOOGLE_SERVICE_ACCOUNT_JSON_B64` | Optional preferred Cloudflare secret containing the base64-encoded service-account JSON; alternatively configure both `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY` as server-side bindings. Use a Sheets read-only service account and share only the staging sheet with it. |

For the selected HTTPS staging hostname, configure both:

```text
Authorized JavaScript origin: https://<OPS_STAGING_HOST>
Authorized redirect URI:      https://<OPS_STAGING_HOST>/auth/google
```

The code constructs the callback as `window.location.origin + "/auth/google"`. Use the actual host assigned to the staging Worker/custom domain; do not substitute the production host. For intentional localhost sign-in only, the corresponding values are `http://localhost:3000` and `http://localhost:3000/auth/google`. Google’s [GIS client-ID setup](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid) describes the origin and redirect URI configuration.

### Manual setup before the first real staging login

1. **Create a separate Google staging client.** In Google Cloud Console, select an approved staging project (not the production project if a separate project is available), open **Google Auth Platform → Clients**, and create an **OAuth 2.0 Client ID → Web application**. Add the exact staging origin and `/auth/google` redirect URI above. Configure the app branding/authorized domain and testing audience; if the audience is in testing mode, add the owner and test accounts as test users. Keep the default sign-in scopes (`openid`, `email`, `profile`); this flow does not need a Google client secret.
2. **Verify an isolated staging D1.** Confirm the active Cloudflare account and inspect the `ops-staging` Worker binding. The repository currently names its D1 `ops-auth-staging`, but that name alone does not prove it is separate from production. If isolation cannot be confirmed, create a new staging-only D1; do not select, clone, import, or reuse production data.
3. **Verify the staging binding.** Confirm the `DB` binding in `wrangler.jsonc` and in Cloudflare's `ops-staging` Worker points to the same verified isolated staging D1. Do not replace the configured database ID blindly.
4. **Apply the schema only to that verified staging database.** This readiness pass did not run a remote migration. After checking the database name and ID again, apply `migrations/0001_auth.sql` to staging with `npx wrangler d1 migrations apply ops-staging-auth --remote` (use the actual database name if different). Never run this command against production.
5. **Set staging Worker variables.** In Cloudflare Workers & Pages, open only `ops-staging` → **Settings → Variables and Secrets**. Set `GOOGLE_CLIENT_ID` to the staging Web client ID and `OWNER_EMAIL` to the intended test owner’s exact Google email. Set `SESSION_TTL_HOURS` to `12` or leave it unset for the default. Do not copy production values or add a Google client secret.
6. **Use HTTPS and verify the host.** Attach/confirm the HTTPS staging hostname, then ensure its exact origin and callback are present in the Google client configuration. Secure session cookies are only issued for HTTPS requests.
7. **Deploy only after separate staging approval.** This task did not deploy. Before a future staging deploy, confirm the Worker target is `ops-staging`, the configured D1 ID is the new staging ID, and no production binding/value is present. Build and deploy staging only after that review.
8. **Run the first login test.** Sign in using the configured owner account; the owner record is bootstrapped from `OWNER_EMAIL`. Verify `/api/me` reports the owner role, then use a disposable staging test account to exercise access request, approval, and revocation in `/access`. Do not copy production user/session data into staging for this test.

**Readiness decision:** Phase 2A code and local checks are ready for staging configuration review. Real Google sign-in is **not yet ready**: the staging D1 binding must be verified in Cloudflare, and a staging Google client, Worker variables, HTTPS host, and staging deployment are still required. The response-header hardening item should also be resolved before opening the staging site to a wider audience.

## Phase 3A — OPERATION dashboard integration

**Status: implemented from the user-confirmed staging schema; live Sheet access and current counts have not been independently verified.**

- Legacy `src/worker.js` routes `/api/dashboard` to `fetchLiveInspections()`. That function reads the configured inspection tab, defaulting to `My_Daily_Mistakes`; `src/google-sheets.js` maps inspection fields and separately reads `Truck_Tire_Map` and `Trailer_Tire_Map`. The only legacy `OPERATION` reference is a warning that a copied spreadsheet URL's `gid` may point to a different tab; the configured inspection-tab title takes precedence.
- Legacy `public/dashboard-page` and `public/app.js` show inspection totals, clean/violation trends, points, citations, inspection OOS, and recent inspections. They do not show fleet totals, home time, or operational truck status.
- The user confirmed the sheet layout: row 1 is a title, row 2 contains summaries, row 3 is blank, and records start at row 4. Column B is Truck Unit, C is Status, D is Driver, and E is Truck Model. No header row is present.
- The confirmed mappings are unique, nonempty Truck Unit values for Total Trucks; `ON DUTY` for Active Trucks; `Need a Driver` as inactive; and the numeric count parsed from E2 in the form `HOME TIME: <count>`. The user supplied a snapshot of 113 unique trucks (84 ON DUTY, 29 Need a Driver); the application computes these values from live rows and does not hardcode the snapshot.
- The user confirmed that no Home Time, Broken, In Shop, Accident, or Total Lost status currently appears in column C. Home Time is therefore read only from E2, and Broken Trucks is displayed as `N/A`; inspection OOS and demo statuses are not used to infer truck condition. Unexpected status values or conflicting statuses for one Truck Unit cause an explicit data error rather than a guessed count.
- Added `lib/data/operation-sheet.ts` to fetch `'OPERATION'!E2` and `'OPERATION'!B4:C` server-side from Cloudflare runtime bindings with the read-only Sheets scope and no-store requests. The existing Tire Intelligence data adapter was not otherwise changed. `wrangler.jsonc` has no Google Sheets bindings configured, and no remote Sheet was queried.
- OPS `lib/fleet-data.ts` remains explicitly demo data; its sample statuses and the older `/operations` fixed KPI values are not used by `/overview`.

| Requested metric | OPERATION mapping |
|---|---|
| Total Trucks | Unique nonempty Truck Unit values in column B from row 4 onward. |
| Active Trucks | Unique trucks with column C status `ON DUTY`. |
| Home Time | Numeric count parsed from cell E2 (`HOME TIME: <count>`); not calculated from truck statuses. |
| Broken Trucks | `N/A` until an authoritative broken status/source is confirmed. |

`npm run test:auth` (7 tests), `npm run test:data` (3 tests), `npm run build`, and `npm run cf:build` passed. The data tests verify the positional parser against the user-provided 113/84/29 snapshot, deduplication, conflicting duplicate rejection, unmapped statuses, and unavailable Home Time formatting. This validates parser behavior, not the live staging spreadsheet. Before the first real staging read, configure `GOOGLE_SHEET_ID` and a read-only service-account binding on the staging Worker only; do not add credentials to source or connect to production.

No production Worker, D1, or secrets were accessed or changed. No remote Google Sheet was queried or deployment performed. Authentication, D1, Tire Intelligence, and existing OPS pages were preserved.

## Ordered implementation plan — authentication first

1. **Auth foundation and isolated schema — completed**
   - Added request-time OpenNext bindings, Google credential and CSRF validation, D1-backed hashed sessions, server guards, focused tests, and an auth migration. Verify the current D1 binding is isolated before any remote test or migration.
2. **Auth endpoints and protected pages/data — completed**
   - Added `/auth/google`, `/api/me`, `/api/logout`, `/api/access/request`, and owner-only `/api/admin/*` handlers.
   - Guarded all existing routes before protected content/data access while preserving URLs; `/login` remains public. Keep independent guards on future private APIs.
3. **Approval and role UI — completed**
   - Added login and owner access-management pages/components. Shell identity and access links now reflect the server-validated session.
4. **Protected Google Sheets data**
   - Phase 3A connected OPERATION metrics to `/overview` through runtime Cloudflare bindings. Remaining work: migrate the Tire Intelligence adapter off build-time `process.env` and its checked-in spreadsheet-ID fallback, add the legacy inspection adapter, and verify live staging results. Keep reads read-only and unavailable states explicit.
5. **Feature routes within the same OPS site**
   - Implement inspection/dashboard data in the protected `/overview` and `/safety` routes; reconcile legacy tire calculations in `/tires` and `/units`; implement `/time-zones`; add compatibility redirects for legacy paths only after their replacements are tested.
   - Keep `/live-map` clearly non-live unless a verified existing source is connected; do not introduce a GPS provider.
6. **Unified shell and verification**
   - Fold remaining legacy pages into `components/shell/app-shell.tsx` and `components/shell/app-sidebar.tsx`, preserving existing feature behavior. Add route/API authorization tests, D1 migration tests on a disposable staging database, and UI/data parity checks. Remove or retire old duplicates only after those checks pass.

**Next implementation step:** configure the staging-only Google Sheets bindings and verify `/overview` against the staging tab, then validate real sign-in, approval, and revocation without changing production. Do not connect production D1 or change production secrets.
