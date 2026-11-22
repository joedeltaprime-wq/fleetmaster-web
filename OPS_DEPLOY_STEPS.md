# OPS Cloudflare staging deployment

This is a staging build: configured Worker name `ops-staging`, NOT the existing production `kk-dashboard`. DO NOT rename to production until Google OAuth authentication and access permissions are implemented and verified.

1. Extract this archive. Open CMD within the extracted root directory.
2. `npm install`
3. `npm run build`
4. `npm run cf:build`
5. `npx wrangler login` (if required)
6. `npx wrangler deploy --dry-run`

Do not `npm run cf:deploy` yet if Google Sheets is connected: auth is NOT integrated.

To set live tire data later securely: `npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_JSON_B64` on a password-protected authenticated worker only. Never place credentials in frontend source or share them here.

## What is ready
- New Vercel UI, Tire Intelligence, Unit History, independent Dashboard, Inspections and Costs pages.
- Tire adapter with optional Google Sheets service account configuration. No fabricated demo records if not configured.

## What is not ready
- Google Login / Google role access management; Overview, Inspections and Costs data adapters and calculations.
- End-to-end build validation and live integration tests must succeed before production replacement.
- The existing production Worker can be backed up before updating. D1 data is not deleted by deploying this ZIP.
