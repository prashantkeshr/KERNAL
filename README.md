# KERNAL

> **The core of every coder.** A free, offline-first developer learning platform.

[![License: MIT](https://img.shields.io/badge/License-MIT-4fd1c5.svg)](LICENSE)
[![Phase](https://img.shields.io/badge/Phase-0%20%E2%80%94%20Core%20Engine-orange)](ROADMAP.md)

---

## What is KERNAL?

KERNAL is a structured developer knowledge and learning system — not a course website. It combines:

- **A course** — structured progression for beginners
- **A reference** — fast daily lookup for professionals
- **A playground** — hands-on in-browser practice
- **A debugger** — learn by fixing broken code
- **A knowledge graph** — understand how concepts connect

The same structured content powers all of these modes.

## Key principles

- **No backend** — runs entirely in the browser
- **No accounts** — no tracking, no data collection
- **Offline-first** — works as a PWA after first load
- **Free forever** — no paywalls, no premium tiers
- **AI-optional** — works perfectly without AI

## Quick start

```bash
git clone https://github.com/dhurta/kernal
cd kernal
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Build for production

```bash
npm run build
```

The `dist/` folder contains a completely static site. Deploy by dragging it to any static host (GitHub Pages, Netlify, Cloudflare Pages).

## Project structure

```
kernal/
├── public/
│   ├── content/         # All lesson content (JSON)
│   │   └── html/        # HTML course
│   └── data/            # Technology registry, search index
├── src/
│   ├── components/      # React components
│   ├── lib/             # Storage, content engine, search
│   ├── store/           # Zustand state
│   └── types/           # TypeScript types
├── KERNAL_CONSTITUTION.md
└── README.md
```

## Adding new content

To add a new lesson to HTML:

1. Create `public/content/html/lessons/<id>.json` following the [Universal Lesson Schema](docs/CONTENT_GUIDE.md)
2. Add the lesson to `public/content/html/modules.json`
3. Add entries to `public/data/search-index.json`

To add a new technology (e.g., Rust):

1. Create `public/content/rust/` with `course.json`, `modules.json`, `lessons/`
2. Add the technology to `public/data/technologies.json`
3. Done — no engine changes required

## Tech stack

| Layer | Technology |
|-------|-----------|
| UI | React 18 + TypeScript |
| Styling | Tailwind CSS + CSS Custom Properties |
| Routing | React Router (HashRouter) |
| State | Zustand |
| Search | Fuse.js |
| Build | Vite |
| Highlighting | highlight.js |

## The KERNAL Constitution

15 permanent principles governing every decision. See [KERNAL_CONSTITUTION.md](KERNAL_CONSTITUTION.md).

## License

MIT — Dhurta.Org
