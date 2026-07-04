# CWA Strahan Branch — Recipe Collection

An installable recipe collection built for **CWA Strahan Branch, Tasmania**. Members submit recipes through a Google Form; the branch reviews each one before it goes live. No accounts, no backend server, no tracking — the app reads a published Google Sheet and runs entirely in the browser.

**Live app:** _add your GitHub Pages URL here once deployed_

---

## What it does

- **Browse & search** — recipes grouped by category (Sponges, Slices, Biscuits, Cakes…), with a search box and one recipe pinned as **Recipe of the Month**.
- **Metric ⇄ Cups** — every ingredient converts on the fly using Australian measures (250 ml cup, 20 ml tablespoon). Unrecognised ingredients display exactly as written rather than guessing.
- **Batch scaling** — ½ / ×1 / ×2 / ×3, recalculating ingredients and the "makes" line together.
- **Cooking mode** — tap ingredients and method steps to tick them off as you go.
- **Print-friendly** — a "Print this recipe" button produces a branded, letterhead page with the branch footer repeated on every page and no orphaned steps.
- **Works offline** — the last successfully loaded recipe list is cached, so the app still works in the kitchen with no signal.
- **A story with every recipe** — who submitted it, a few lines about where it came from, and (optionally) their name and photo.

## How recipes get published

```
Member fills in Google Form
        ↓
Row lands in the branch's private Google Sheet
        ↓
Branch reviews, ticks "Approve" (and "Feature" for Recipe of the Month)
        ↓
Approved rows only are exposed via a published "Published" tab (CSV)
        ↓
The app fetches that CSV and renders it
```

Nothing is ever pushed to this repo to publish a recipe. The **only** thing committed here is the app itself — layout, styling, and logic. Content lives entirely in the Sheet.

Full setup instructions (Form fields, Sheet structure, publish-to-web steps) are in [`SETUP.md`](./SETUP.md).

## Configuration

Two lines at the top of `index.html`:

```js
const CONFIG = {
  FORM_URL: "https://forms.gle/your-form-id",
  SHEET_CSV_URL: "https://docs.google.com/.../pub?output=csv"
};
```

Leave `SHEET_CSV_URL` blank to run in demo mode (three sample recipes, no live data).

## Deployment

Static, single-file app — no build step.

1. Commit `index.html` to this repo's default branch.
2. **Settings → Pages → Deploy from a branch → `main` / root.**
3. Live in a minute or two at `https://<username>.github.io/<repo>/`.

## Privacy

The app collects nothing about visitors: no accounts, no sign-in, no analytics, no cookies. Submitters choose what to share (name, story, photo) via the Google Form, and the branch controls what's published.

## Tech

Plain HTML/CSS/JS, no framework, no build tooling. Google Sheets + Forms as the content backend. Deployed on GitHub Pages.
