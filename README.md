# Leading Indicators

A calm, offline-first PWA for discovering the leading indicators that predict your results —
built as a companion to the TimeStudy app, sharing its stack and theme approach.

This is not a stopwatch. It's a **Leading Indicator Builder**: you define the events that matter,
the app prompts you at scheduled check-ins to tap what happened, and it automatically builds a
timeline, a Pareto, a heat map, a rolling trend, and a generated FMEA from the data.

## Tech stack
React 18 (hooks only) · Vite · vite-plugin-pwa · Recharts · localStorage only, no backend.

## Getting started
```bash
npm install
npm run dev       # local dev server
npm run build     # production build to dist/
npm run preview   # preview the production build
```

## Deploying
1. Push this repo to GitHub.
2. Import it in Vercel — framework preset **Vite**, build command `npm run build`, output `dist`.
3. `vercel.json` already includes the SPA rewrite rule.
4. On your phone: Safari/Chrome → Share → Add to Home Screen, to install as a PWA.

## Icons
`public/icon-192.png` and `public/icon-512.png` are placeholders generated for this build so the
app installs cleanly out of the box. Swap them for your own artwork any time — same filenames,
same sizes.

## Theme engine
Your upload described the TimeStudy app's structure and behavior in detail but didn't include its
actual theme CSS/hex values, so this app ships its own Warm / Dark / Light token set (see
`src/theme/themes.js`) built in the same spirit — calm, muted, no red urgency colors. Every color
is a CSS custom property, so if you paste in TimeStudy's real hex values later, it's a one-file
change and nothing else needs to move.

## Project structure
```
src/
├── theme/            Theme tokens + ThemeContext (Warm/Dark/Light)
├── store/            localStorage persistence + StoreContext (all business logic, no UI)
├── utils/             Pure functions: time, stats (pareto/heatmap/trend), fmea, csv export
└── components/        Screens: Dashboard, Events, Timeline, Fmea, Charts, Projects, Settings
    └── charts/         Pareto, HeatMap, Distribution, RollingTrend
```

Business logic lives entirely in `store/` and `utils/`, separate from `components/`, so a future
version can swap localStorage for Firebase, add multi-user support, or bolt on AI suggestions
without touching the UI layer.

## Data model
Every tap creates one **observation**: `{ id, timestamp, eventId, note, project, customer, severity }`.
Nothing pauses or stops a clock — the clock only timestamps.

## FMEA
- **Occurrence** — count of observations for that tile.
- **Severity** — blank until you set it (1–10) on the FMEA screen.
- **Detection** — inferred from *when* events are typically noticed relative to the configurable
  workday window in Settings. Later in the day scores worse (closer to 10); earlier scores better
  (closer to 1).
- **RPN** — Occurrence × Severity × Detection, once severity is set.

## Export
The header's export icon downloads one CSV with labeled sections: configuration, projects, tiles,
check-in schedule, raw observations, occurrence table, timeline data, generated FMEA, and each
chart's underlying data.
