# CWA Strahan Recipe Collection — Setup Guide

Three parts: the **Form** (members submit), the **Sheet** (Gill's holding pen), the **app** (reads only what Gill approves). No tokens, no backend, no cost.

---

## 1. The Google Form

Create a form named **"CWA Strahan Branch — Share a Recipe"**. Add these questions **in this exact order** (order matters — it sets the Sheet columns):

| # | Question | Type | Notes |
|---|----------|------|-------|
| 1 | Recipe title | Short answer | Required |
| 2 | Category | Dropdown | Required. Options: Sponges, Slices, Biscuits, Cakes, Scones, Preserves, Savoury |
| 3 | Your name | Short answer | Required. "As you'd like it to appear — first name only is fine" |
| 4 | Your story | Paragraph | "A few lines — where the recipe came from, who taught you, when you make it" |
| 5 | Photo (optional) | File upload | Images only, 1 file. Note: requires responders to sign in to Google — see §5 |
| 6 | Publishing consent | Multiple choice | Required. Options: "Name and photo" / "Name only" / "First name only" |
| 7 | Measurements used | Multiple choice | "Metric (grams/ml)" / "Cups and spoons" |
| 8 | Makes / serves | Short answer | "e.g. 24 biscuits, 20 pieces" |
| 9 | Oven temperature (°C) | Short answer | "Leave blank if no-bake" |
| 10 | Ingredients | Paragraph | **"One ingredient per line**, with the amount first — e.g. 125 g butter, ½ cup caster sugar, 4 eggs" |
| 11 | Method | Paragraph | **"One step per line"** |
| 12 | Baker's notes (optional) | Paragraph | "Tips, substitutions, how it keeps" |

The per-line instructions on Q10 and Q11 are the only formatting discipline the app needs — put them in the question description so they're visible.

Then: **Responses tab → Link to Sheets** → create the spreadsheet. Get the share link via **Send → link icon → shorten URL** and paste it into `FORM_URL` in `index.html`.

---

## 2. The Sheet — Gill's holding pen

The linked sheet gets a **Form Responses 1** tab automatically:
`A` Timestamp · `B` Title · `C` Category · `D` Name · `E` Story · `F` Photo upload · `G` Consent · `H` Units · `I` Makes · `J` Oven · `K` Ingredients · `L` Method · `M` Notes

**Add Gill's review columns** to the right of the responses:

- `N` — **Approve** (Insert → Checkbox)
- `O` — **Feature** (Checkbox — Recipe of the Month; if several are ticked the app features the newest)
- `P` — **Photo URL** (the curated public image link — see §5)
- `Q` — **Gill's notes** (private, never shown in the app)

**Add a second tab named `Published`.** Row 1, type these headers across A1:P1:

```
Title | Category | Name | Story | Photo upload | Consent | Units | Makes | Oven | Ingredients | Method | Baker's notes | Approve | Feature | Photo URL | Gill's notes
```

In **A2**, one formula:

```
=FILTER('Form Responses 1'!B2:Q, 'Form Responses 1'!N2:N=TRUE)
```

That tab now contains *only approved rows*, automatically. This is deliberate: you publish **only this tab** to the web, so unapproved submissions (names, stories, contact details) never leave the sheet.

---

## 3. Publish → connect the app

1. In the Sheet: **File → Share → Publish to web**
2. First dropdown: select the **Published** tab (NOT "Entire document")
3. Second dropdown: **Comma-separated values (.csv)**
4. Publish → copy the link (ends in `output=csv`)
5. Paste it into `SHEET_CSV_URL` at the top of `index.html`
6. Commit `index.html` to the repo → GitHub Pages serves it

Done. That's the whole pipeline.

---

## 4. Gill's workflow (the entire admin job)

1. Member submits via the form → new row lands in **Form Responses 1**
2. Gill reads it. Worthwhile? Tick **Approve** (tidy any wording directly in the cell first if needed)
3. Recipe of the Month? Tick **Feature** (untick last month's)
4. Photo? Paste the final image link in **Photo URL**
5. Recipe appears in the app — allow **up to ~5 minutes** (Google caches the published CSV)

Untick Approve to pull a recipe. Edit a cell to fix a typo. Gill never touches GitHub.

---

## 5. Photos — the one fiddly bit

- Form uploads land in a Drive folder as private files, and uploading requires the submitter to sign in to Google. Treat the upload as **convenience only**, or skip Q5 entirely and have people email photos to the branch.
- Gill picks the final image, puts it somewhere public, and pastes the link into **Photo URL**. If it's a Google Drive file shared as "Anyone with the link", the app converts the link to a displayable thumbnail automatically — just paste the normal Drive share link.
- No photo → the app shows a coloured initials monogram. Looks intentional, not missing.

---

## 6. What the app does with the data

- Parses each ingredient line (`125 g butter`, `½ cup caster sugar`, `4 eggs`, `pinch of salt`)
- Converts metric ⇄ cups using **Australian measures** (1 cup = 250 ml, **1 tbsp = 20 ml** — not the US 15 ml), with a density table for ~40 common baking ingredients
- Anything it can't recognise it displays exactly as written — never wrong, just unconverted
- Spoon measures stay spoons in both views; batch scaling (½ / ×2 / ×3) applies before conversion
- Caches the last good copy locally, so the app still works in the kitchen with no signal

---

## 7. Going full PWA (when ready)

Same pattern as Ten Ring: add `manifest.json` (name, icons, `display: standalone`, theme `#2E5A38`) and a small service worker caching the app shell. The recipe data already self-caches via localStorage. Say the word and I'll generate both files plus the icon set.
