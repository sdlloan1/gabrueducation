# Gabru Education

Digital products store: website/app templates, AI prompt packs, complete code
files, courses, software, PDF books and setup services — with UPI checkout,
manual payment approval, a buyer library and an admin panel.

## What is in here

- `src/` — the React + Vite storefront (pages, components, cart, auth context).
- `server/` — the local API the storefront talks to: entities, auth, backend
  functions (`productContent`, `confirmOrder`, `rejectOrder`, `recalcRating`),
  file uploads and generated placeholder artwork.
- `base44/entities/*.jsonc` — the entity schemas the API implements.
- `src/api/base44-runtime.js` — provides the `db.*` client the app is written
  against, backed by `server/` over `/api`.

## Run it

The app runs through Docker Compose (see the environment setup notes in Base44):

```bash
docker compose -f docker-compose.base44.yml up -d
```

- Storefront: http://localhost:3000
- API: http://localhost:8000/api (health at `/api/health`)

The API seeds a demo catalogue and two accounts on first start:

| Account | Password | Role |
| --- | --- | --- |
| `admin@gabrueducation.com` | `Gabru@12345` | admin (can open `/admin`) |
| `demo@gabrueducation.com` | `Demo@12345` | buyer |

Change those passwords before sharing the app with anyone.

## Hosting: frontend on GitHub Pages, API on Base44

The storefront is a static build, so it can live on GitHub Pages while the API
keeps running on Base44.

1. **Frontend (GitHub Pages).** `.github/workflows/deploy-pages.yml` builds the
   storefront and deploys it on every push to `main`. Two repository variables
   (Settings → Secrets and variables → Actions → Variables) drive the build:
   - `VITE_API_BASE_URL` (required) — the Base44 backend address, e.g.
     `https://my-app.base44.app`. The build fails with an explanation if it is
     missing.
   - `VITE_BASE_PATH` (optional) — defaults to `/<repo>/`, which is where
     GitHub serves a project site. Set it to `/` if the site uses a custom
     domain.

   Then enable Pages once: Settings → Pages → Build and deployment → Source:
   **GitHub Actions**.
2. **Backend (Base44).** Keep the API running in the Base44 environment. Set
   `CORS_ORIGINS` there to the site's origin so the browser may call it, e.g.
   `https://<user>.github.io` (a `*` inside an entry matches anything:
   `https://*.github.io`). `PUBLIC_API_URL` is optional and only needed when the
   API should hand out absolute file URLs of its own.

Locally and in the Base44 preview nothing changes: the storefront is served at
the root and proxies `/api`, because neither variable is set.

`npm run build:pages` is the Pages build (static output plus a `404.html`
fallback so client-side routes like `/product/<slug>` resolve on a hard load).

## Notes

- Email is not sent by this environment: confirmations and password-reset links
  are written to the API log instead.
- Sign-up verification accepts the code `000000` while `DEV_ALLOW_FIXED_OTP=1`
  (the real code is also printed in the API log).
- Google sign-in is not configured; email + password is the working flow.
- Product data, orders and uploads live in the API data volume, not in git.
