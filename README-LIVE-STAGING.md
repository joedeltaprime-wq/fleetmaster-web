# OPS / OPERATION — Source Code + Live Tire/Unit Integration (v2)

Main base: OPS-Cloudflare-Staging-v1 user-uploaded source. Keep `kk-dashboard` production untouched.

## What changed
- Preserved all `/overview`, `/tires`, `/units`, `/units/[unitId]`, `/costs`, and `/safety` routes and original design.
- Added `export const dynamic = 'force-dynamic'` to OPS layout and pages; avoids static rendering attempting Google OAuth during build.
- Read Truck_Tire_Map and Trailer_Tire_Map from row 2, not row 12.
- Matched actual sheet columns and graphic position IDs (including unknown positions).
- Real-data notices in Tires and Units; no demo-count claims.
- If credentials absent, display an empty state instead of fabricated metrics; source getMeta asOf is a valid date.
- Protected division by 0 for missing position counts.

## Data source
`GOOGLE_SERVICE_ACCOUNT_JSON_B64` is a **Cloudflare Secret**; never paste the service account JSON into source code or this ZIP. The service account needs `Viewer` permission on the Google Spreadsheet.
Optional: `GOOGLE_SHEET_ID` can override the existing spreadsheet id.
This code only reads the tire tabs. `/overview`, `/costs`, and `/safety` still show not-connected states and require separate adapters.

## Validation
Syntax/TSX parsing and static sheet-header mapping were checked offline. **A full Next.js / OpenNext build and live Cloudflare test have not been performed.** Numbers should be checked against the Google Sheet before relying on them.

## Local build (after backing up working ops-staging)
1. Extract project to a new directory, leaving the live source / existing worker untouched.
2. `npm install` (Node 22+ recommended), `npm run build`, `npm run cf:build`.
3. `npx wrangler deploy --dry-run` and review diff before any deployment.
4. Deploy only to protected `ops-staging` after confirming Google credential secret on that worker and after safeguarding the currently running deployment for rollback.
5. Do NOT deploy to `kk-dashboard` production: auth and access permissions are not ready.

## Spot checks after test deploy
- `/tires`: compare first records: Truck #3006 on 2026-06-12, Truck #3003 on 2026-06-15; verify amount and positions.
- `/units`: counts cover only units appearing in tire records, not entire OPERATION fleet.
- Verify all pages including `/overview`, `/costs`, `/safety` still render.
- Unknown position cells are only counted when explicitly marked. Some tire log rows may have costs with no count; cost-per-tire metrics then exclude unknown quantity in denominator.
