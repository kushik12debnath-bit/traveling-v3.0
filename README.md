# Traveling v3.0 — Alive Dreams Holidays

Version 3.0 of the Alive Dreams Holidays website — a premium, editorial multi-page experience built as fast, dependency-free static HTML with a shared design system and a progressive-enhancement interaction layer. This is a separate copy of the site so the previous version remains untouched.

## Local preview

```bash
node server.js
```

The site is served at **http://localhost:5174** and falls back to ports 5500, 8787, 3000 and 8080 if 5174 is busy. Set `PORT` to override the first choice. The process id is written to `.server.pid`.

## Structure

| Path | Purpose |
| --- | --- |
| `index.html` | Home — cinematic hero, holiday search, season's edit, atlas, trip collections |
| `assets/css/premium.css` | Design system: midnight/ivory palette, Fraunces display type, layouts, motion, responsive rules |
| `assets/js/premium.js` | Scroll progress, reveal choreography, counters, atlas preview, magnetic buttons, rail controls, menu focus handling |
| `assets/js/site.js` | Core navigation, search, forms, gallery lightbox, slider and WhatsApp handoff |
| `trips/*.html` | Eight curated trip detail pages |
| `assets/img/` | Photography and brand assets |

## Deployment

The repository is linked to Vercel and deploys as a static site (`framework: null`, `cleanUrls: true`).

```bash
vercel --prod
```

Every page is plain HTML, so GitHub Pages or any static host also works. `sitemap.xml` and `robots.txt` use the production domain `https://alivedreams.co.in`.

## Notes

- `scripts/build-pages.js` is a legacy content generator and is disabled by default so it cannot overwrite the hand-tuned premium pages. It requires `ALLOW_LEGACY_REBUILD=1` to run.
- The site respects `prefers-reduced-motion`; all animations and autoplaying rails are disabled there.
- Forms intentionally hand off to WhatsApp instead of posting to a backend. No personal data is stored by the site.
