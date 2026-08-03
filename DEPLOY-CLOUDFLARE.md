# Deploying to Cloudflare Workers (server build)

The site now builds as a **Cloudflare Worker**, not a static export, so Printful
sync, webhooks, shipping rates and orders all work on your own domain.

`npm run build` produces:
- `dist/client` — static assets (served by the Worker's ASSETS binding)
- `dist/server` — the Worker + a generated `wrangler.json`

## 1. Turn off the old Pages project
In Cloudflare → Workers & Pages, remove the domain from the old **Pages**
project (or delete it). The GitHub Pages workflow has been deleted.

## 2. GitHub repo secrets
Settings → Secrets and variables → Actions → New repository secret:

| Secret | Value |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare token with "Edit Cloudflare Workers" |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → right sidebar |
| `VITE_SUPABASE_URL` / `SUPABASE_URL` | backend URL (from the project `.env`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_PUBLISHABLE_KEY` | publishable key (from `.env`) |
| `VITE_SUPABASE_PROJECT_ID` | project id (from `.env`) |
| `BACKEND_DB_SECRET` | backend access secret (I generated it; ask me for the value) |
| `PRINTFUL_API_KEY` | your Printful all-stores token |
| `PRINTFUL_WEBHOOK_TOKEN` | the webhook token used by the webhook route |

## 3. Push to `main`
`.github/workflows/deploy-worker.yml` builds and deploys the Worker
(`hella-hoodys`) and uploads the runtime secrets on every deploy.

## 4. Attach your domain
Worker → Settings → Domains & Routes → **Add custom domain** → your Network
Solutions domain (its nameservers must already point at Cloudflare).

## 5. Point Printful's webhook at the new domain
Printful → Settings → Webhooks → URL:
`https://<your-domain>/api/public/printful-webhook`

After that, anything published in any connected Printful store appears on the
live site automatically — instantly via the webhook, otherwise within a few
minutes via the background refresh.
