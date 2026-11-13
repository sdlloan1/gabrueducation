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

## Notes

- Email is not sent by this environment: confirmations and password-reset links
  are written to the API log instead.
- Sign-up verification accepts the code `000000` while `DEV_ALLOW_FIXED_OTP=1`
  (the real code is also printed in the API log).
- Google sign-in is not configured; email + password is the working flow.
- Product data, orders and uploads live in the API data volume, not in git.
