# Deployment — required environment variables

Most "it works locally but fails in production" issues on this app are **missing
environment variables on Netlify**. `.env.local` is your machine only; Netlify
never sees it. Set every variable below in **Netlify → Site configuration →
Environment variables**, then **redeploy** (env changes don't apply to existing
deploys — use "Trigger deploy → Clear cache and deploy site").

## Required variables

| Variable | Used by | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase (client + server) | e.g. `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase (browser) | public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | payments, ticket/pass downloads | **secret** — Supabase → Settings → API → `service_role`. Never expose to the browser. |
| `CLOUDINARY_CLOUD_NAME` | image uploads (`/api/upload`) | from Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | image uploads | |
| `CLOUDINARY_API_SECRET` | image uploads | **secret** |
| `MYFATOORAH_API_KEY` | payment gateway | sandbox or live token |
| `MYFATOORAH_BASE_URL` | payment gateway | `https://apitest.myfatoorah.com` (sandbox) or `https://api-qa.myfatoorah.com` (live, Qatar) |
| `NEXT_PUBLIC_SITE_URL` | payment callbacks | your prod URL, **no trailing slash**, HTTPS, e.g. `https://your-site.netlify.app` |

## Symptoms when a variable is missing

| Symptom in production | Missing variable(s) |
|---|---|
| "Upload failed. Check that Cloudinary env vars are set" on image upload | `CLOUDINARY_*` |
| "Payment could not be started: Missing environment variables: …" | whatever the toast names |
| Checkout redirects nowhere / callback fails | `NEXT_PUBLIC_SITE_URL` |
| "No file available" when downloading a ticket/pass | `SUPABASE_SERVICE_ROLE_KEY`, **or** the order/booking isn't `payment_status = 'paid'` yet |

## MyFatoorah key ↔ base URL must match

- Sandbox key only works with `https://apitest.myfatoorah.com`.
- Live (Qatar) key only works with `https://api-qa.myfatoorah.com`.

Mixing them returns an auth error from MyFatoorah (now surfaced in the toast).

## MyFatoorah portal settings (after env vars are set)

1. **Webhook URL**: `https://<your-site>/api/payments/webhook` — this is the
   authoritative confirmation. Without it, an order can stay `unpaid` if the
   user closes the tab before the redirect.
2. The payment **callback** URL is derived automatically from
   `NEXT_PUBLIC_SITE_URL`, so no separate portal setting is needed for it.

## Receipts / tickets / passes

Downloads are **payment-gated**: the `/api/tickets/order/[id]` and
`/api/tickets/booking/[id]` routes only return a PDF when
`payment_status = 'paid'`. So a ticket becomes downloadable only after the
MyFatoorah webhook (or callback) confirms payment. If the gateway isn't working
yet, downloads will correctly say the file isn't available.

## Node version

Build on Node 18+ (Netlify is pinned to Node 20 in `netlify.toml`). The repo's
local toolchain may default to an older Node; use `nvm use 20` before running
`npm install` locally.

## SQL migrations to apply (Supabase → SQL Editor)

Run any not-yet-applied files from `supabase/migrations/` in date order. The
most recent ones relevant to current features:

- `20260617_payments.sql` — payment columns
- `20260617_slots_decremented.sql` — prevents double-decrement of ticket stock
- `20260616_categories.sql` — categories table
- `20260615_admin_rls.sql` — admin write policies + `is_admin()`
