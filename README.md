# Gabru Education

A complete website for **Gabru Education** — a learning centre for school students and
competitive-exam aspirants — plus a staff console for running it:

* **The public website** (`/`), rendered on the server: home, courses, about, blog,
  contact, and a blog where **every post is published as its own standalone HTML file**.
* **The staff console** (`/admin`), a React app: sign in, manage courses, publish and
  delete blog posts, read the enquiries, and (as an administrator) manage accounts.
* **A Node API** (`/api/*`) behind both, on the same origin and the same port.

## Pages

| Route | What it is |
| --- | --- |
| `/` | Home — hero, why-us, featured courses, how it works, testimonials, latest posts |
| `/courses` | All programmes with duration, format, fee and FAQs |
| `/about` | Story, values, faculty and milestones |
| `/blog` | Every published post, with a category filter |
| `/blog/<slug>` | A single post, served from `posts/<slug>.html` |
| `/contact` | Address, phone, email and an enquiry form |
| `/admin` | **Staff console** — sign in to manage courses, content and accounts |

## The staff console

Open `/admin` and sign in. The **first visit on a new installation shows “Create the first
administrator”** — that account is yours, and it is the one that can add everyone else.

| Section | What you can do |
| --- | --- |
| Overview | Counts of courses, posts, enquiries and accounts, with the latest of each |
| Courses | Add, edit and delete courses — they appear on `/courses` immediately |
| Blog content | Publish a post and delete one; each post is written to `posts/<slug>.html` |
| Enquiries | Every message sent from the contact page |
| Accounts | Administrators only: add an editor, change a role, pause or delete an account |

Two roles:

* **Administrator** — courses, content **and** accounts.
* **Editor** — courses and content only.

## API

| Method and path | Who | What |
| --- | --- | --- |
| `GET /api/auth/me` | anyone | The signed-in account, and whether the site still needs setting up |
| `POST /api/auth/setup` | anyone, once | Creates the first administrator (only while no account exists) |
| `POST /api/auth/login` · `POST /api/auth/logout` | anyone | Start and end a session |
| `POST /api/contact` | anyone | The contact form's enquiry |
| `GET/POST /api/courses`, `PUT/DELETE /api/courses/:slug` | signed in | Course management |
| `GET/POST /api/posts`, `DELETE /api/posts/:slug` | signed in | Blog content |
| `GET /api/messages` | signed in | Enquiries |
| `GET/POST /api/users`, `PATCH/DELETE /api/users/:id` | administrator | Accounts |

Sessions are opaque cookies (`gabru_session`, httpOnly) recorded in `data/sessions.json`;
passwords are hashed with `scrypt` from `node:crypto`. No third-party service is involved.

## Publishing a post

1. Open `/admin`, sign in, and go to **Blog content**.
2. Fill in the title, author, category, date and the post body, then press **Publish post**.
3. The site writes `posts/<slug>.html` and adds the post to `content/posts.json`.

Each published post is a complete HTML document — the stylesheet is inlined, so the file
renders correctly on its own even without the server. It is also served directly at
`/posts/<slug>.html` as well as at `/blog/<slug>`.

Formatting inside the post body:

```
## Heading
A paragraph on its own line.

- a bullet
- another bullet

1. a numbered step
2. the next step

> A pull-quote
**bold** and *italic* inline
```

## Running it

```bash
npm install
npm run dev          # http://localhost:3000  (auto-restarts on server changes)
npm start            # the same, without the watcher
```

`npm run dev` runs `node --watch server.js`. In development the server runs **Vite in
middleware mode**, so the console, its hot reload, the API and the public website all share
one origin and one port — there is no second server to start.

> The app installs its own dependencies on first boot when `node_modules` is missing
> (`server/bootstrap.js`), so a container that starts `node server.js` directly, with no
> install step of its own, comes up on its own.

### Production build

```bash
npm run build        # writes client/dist
npm run serve:built  # NODE_ENV=production: serves client/dist at /admin
```

When `client/dist` exists the server serves that bundle instead of the Vite dev server.

## Content you can edit without touching code

| File | Holds |
| --- | --- |
| `content/site.json` | Name, tagline, phone, email, address, opening hours |
| `content/courses.json` | Every course card (managed from the console) |
| `content/posts.json` | The blog index (written when a post is published) |
| `posts/*.html` | The published posts themselves |
| `data/users.json` | Staff accounts — runtime data, git-ignored |
| `data/sessions.json` | Live sessions — runtime data, git-ignored |
| `data/messages.json` | Contact-form enquiries — runtime data, git-ignored |

> The contact details, faculty names, statistics and testimonials currently in the
> repository are sample content — replace them with your real details before going live.

## Layout

```
server.js               Entry point: makes sure dependencies exist, then starts the app
server/app.js           The Express app: API, console, public site, one HTTP server
server/bootstrap.js     Installs dependencies on first boot (container starts us directly)
server/auth.js          Password hashing, sessions, the sign-in middleware
server/users.js         The staff account store (data/users.json)
server/routes/          One module per API area: auth, contact, courses, posts, messages, users
server/public-site.js   The server-rendered website (home, courses, blog, contact, posts)

client/index.html       The console's HTML entry
client/vite.config.mjs  Vite config: root, base /admin/, React plugin
client/src/main.jsx     React entry: router + auth provider
client/src/App.jsx      Console routes and the sign-in gate
client/src/auth.jsx     Who is signed in
client/src/api.js       fetch wrapper for /api
client/src/hooks.js     useLoad — loading / error / data for a screen
client/src/components/  App shell, icons, and the small shared pieces (fields, notices…)
client/src/pages/       Login, Setup, Dashboard, Courses, Content, Users, Messages

lib/layout.js           Public-site HTML shell, header/footer, icons, standalone post document
lib/pages.js            One renderer per public page
lib/blog.js             Publish / delete a post (writes the HTML file)
lib/content.js          Reads and writes content/*.json
lib/utils.js            Escaping, slugs, dates, the mini formatter
public/css/style.css    Public-site styles (inlined into every published post)
public/js/main.js       Public-site navigation, blog filter, contact form
posts/                  Generated post HTML files
```

## Notes

* `/admin` is only ever a shell until the API says who you are; every management route
  behind it requires a session, and account management requires an administrator.
* The console is a separate surface from the public site and carries its own stylesheet
  with the same colour tokens — the public stylesheet is never loaded inside it.
