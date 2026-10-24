# Gabru Education

A complete website for **Gabru Education** — a learning centre for school students and
competitive-exam aspirants — with a built-in writing desk: publish a blog post from the
browser and the site writes it out as its **own standalone HTML file**, then links it
from the blog.

## Pages

| Route | What it is |
| --- | --- |
| `/` | Home — hero, why-us, featured courses, how it works, testimonials, latest posts |
| `/courses` | All programmes with duration, format, fee and FAQs |
| `/about` | Story, values, faculty and milestones |
| `/blog` | Every published post, with a category filter |
| `/blog/<slug>` | A single post, served from `posts/<slug>.html` |
| `/contact` | Address, phone, email and an enquiry form (enquiries land in the writing desk) |
| `/admin` | **Writing desk** — publish a new post, delete a post, read enquiries |

## Publishing a post

1. Open `/admin` (the footer link "Write a post" goes there).
2. Fill in the title, category, date and the post body, then press **Publish post**.
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

No build step, no dependencies — just Node 18.11 or newer.

```bash
npm start          # http://localhost:3000
npm run dev        # same, with auto-restart on source changes
```

With Docker:

```bash
docker compose -f docker-compose.base44.yml up -d
```

## Content you can edit without touching code

| File | Holds |
| --- | --- |
| `content/site.json` | Name, tagline, phone, email, address, opening hours |
| `content/courses.json` | Every course card |
| `content/posts.json` | The blog index (written by the writing desk) |
| `posts/*.html` | The published posts themselves |

> The contact details, faculty names, statistics and testimonials currently in the
> repository are sample content — replace them with your real details before going live.

## Layout

```
server.js            HTTP server, routing, JSON API
lib/layout.js        HTML shell, header/footer, icons, standalone post document
lib/pages.js         One renderer per page
lib/blog.js          Publish / delete a post (writes the HTML file)
lib/content.js       Reads and writes content/*.json
lib/utils.js         Escaping, slugs, dates, the mini formatter
public/css/style.css Site styles (inlined into every published post)
public/js/main.js    Navigation, blog filter, contact form, writing desk
posts/               Generated post HTML files
```

## Notes

* The writing desk has **no login** — it is meant for local/trusted use. Put it behind
  authentication before exposing the site publicly.
* Enquiries are stored in `data/messages.json`, which is git-ignored.
