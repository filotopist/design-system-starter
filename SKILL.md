---
name: design-system-from
title: Harvest a reference site and bootstrap an atomic design system
version: 0.2.0
description: >
  Given a public URL, open it in a real browser, capture screenshots +
  computed styles + tier signals, then translate findings into a
  calibrated design.md + minimal Atoms.tsx + sandbox page + CLAUDE.md
  rules. Vision-first: you are a multimodal model, so READ the screenshots
  and let your eyes do the work — JSON files are number-source, not
  primary truth.
target_stack: Next.js (App Router) + Tailwind + TypeScript
status: starter-v0.2 (vision-first via Claude Code's multimodal Read)
---

# Design System From Reference — Skill (v0.2)

## What you (Claude) actually do

You are a multimodal model running inside Claude Code. When you `Read` a PNG
file, you **see** the image. This skill exploits that: the harvest script
dumps a dozen small focused screenshots (rest+hover buttons, individual
headings, individual cards, hero crop, nav strip) instead of one giant
full-page PNG. You read those small images one at a time, **describe what
you see in design-token terms**, and use the JSON files alongside only for
**exact numeric values**.

This is the whole point of v0.2: the previous version tried to grep
compiled CSS, which only works on Tier 1 sites. Looking at pixels works
on any site whose buttons are made of pixels.

## When invoked

User typed `/design-system-from <url>` or asked you to follow this skill
with a reference URL. They expect:

1. A tier classification with honest expectations.
2. A `design.md` populated with REAL values from the harvest.
3. A minimal `ds/` folder + `/design-test` sandbox.
4. A "Frontend Design System" section appended to `CLAUDE.md`.
5. A summary of what was harvested, what's high-confidence vs guessed.

If no URL — ask for one. Without calibration the output is generic AI
aesthetic, which defeats the point.

## Workflow

### Step 0 — Locate the bundle

This SKILL.md ships next to `capture.mjs` and `templates/`. Find the bundle
absolute path. Common locations: `~/tools/design-system-starter/`,
`~/.claude/skills/design-system-starter/`, `~/dev/design-system-starter/`,
`/tmp/dss/` (one-prompt zero-install path).

If not found in defaults — ask the user.

### Step 1 — Run the harvest

```bash
cd "$BUNDLE_DIR"
[ ! -d node_modules ] && npm install
[ ! -d ~/.cache/ms-playwright ] && npx playwright install chromium

TARGET=<user-url> node capture.mjs
```

Output lands in `/tmp/<sitename>-extract/`. Manifest:

| File | What it gives you |
|------|-------------------|
| `01-full-desktop.png` | Full page. **Do not Read** — usually >5MB, will blow context. |
| `02-fold-desktop.png` | Above-the-fold. **Always Read first.** This is the design's first impression. |
| `02a-nav.png` | Nav strip alone. Read if you need nav recipes. |
| `02b-hero.png` | Hero section crop. Read to understand h1 treatment. |
| `03-full-mobile.png` | Mobile fold. Read for responsive sanity. |
| `btn-<name>-rest.png` + `btn-<name>-hover.png` | Buttons in both states. Read pairs side-by-side to describe hover delta. |
| `btn-<name>.json` | Exact computed values at rest + hover. Numbers to back up what you see. |
| `heading-h1-0.png`, `heading-h2-0.png`, ... | Individual heading crops. Read to detect gradient text. |
| `big-text-styles.json` | Typography numbers per heading. **Critical field**: `webkitTextFillColor: rgba(0,0,0,0)` + `backgroundImage: ...radial-gradient...` → h1 painted via background-clip:text. |
| `card-N.png` | Top 3 card-shaped elements. Read to describe card treatments. |
| `cards-inventory.json` | Card numbers (bg, border, radius, shadow, backdrop-filter). |
| `buttons-inventory.json` | Computed styles of every interactive element on page. |
| `tier-hints.json` | Cheap signals to classify site tier. Read this BEFORE anything else. |
| `network-requests.txt` | Runtimes loaded: `@rive-app`, `framer-motion`, `gsap`, `lottie`, etc. |

### Step 2 — Tier classification (do this before extraction)

Read `tier-hints.json`. Apply this rubric to classify the site:

```
canvas_area_ratio > 0.5                        → Tier 4 (Canvas-heavy)
hashed_classes > total_classes * 0.5           → Tier 3 (CSS-in-JS)
tailwind_like_classes > total_classes * 0.3
  AND custom_props_in_html < 20                → Tier 2 (Tailwind utility)
custom_props_in_html > 30
  OR semantic_classes > 20                     → Tier 1 (Semantic CSS / design tokens)
otherwise                                       → Tier 2 (default)
```

Report the tier to the user with honest expectations:

| Tier | What works | What you should warn about |
|------|-----------|----------------------------|
| 1 (semantic CSS) | Everything. Tokens, hover deltas, gradient text — all recoverable. | Nothing major. Proceed. |
| 2 (Tailwind) | Computed values reliable. Hover deltas reliable. | Token *names* will be inferred (you decide what's "primary" vs "secondary" by looking). |
| 3 (CSS-in-JS) | Computed values reliable. Visual reasoning works. | Token names invented. No way to follow upstream changes — frozen snapshot. |
| 4 (Canvas/WebGL) | Static look only. | Interactivity not harvestable. Tell user honestly: "I can mimic the look, not the motion." |
| 5 (adversarial / private) | Nothing reliable. | Refuse with explanation. Suggest user share screenshots manually instead. |

**For Tier 4/5: stop here.** Tell the user what you found and offer alternatives (e.g. "share a screenshot of the page section you want and I'll extract from that").

### Step 3 — Vision-first extraction

This is the heart of the skill. You are a multimodal model. **Read the
small focused PNGs**, describe what you see, then use JSON for exact numbers.
Don't try to grep tokens out of compiled CSS — that approach falls apart on
Tailwind, CSS-in-JS, and canvas-driven sites. Looking at pixels works on
anything visible.

#### 3a — First impression (sets the vibe)

`Read 02-fold-desktop.png`. In your head, answer:
- Is the canvas dark or light?
- Are there ambient gradients/auras on the background, or flat?
- Typography weight — heavy or thin?
- Density — generous whitespace or compact?
- Mood — editorial, technical, playful, brutalist?

These adjectives drive token defaults for everything below.

#### 3b — Buttons (run for every `btn-*-rest.png` you have)

For each named button:
1. `Read btn-<name>-rest.png` AND `btn-<name>-hover.png` (both, side by side mentally).
2. Describe the hover delta in plain English: "background lightens", "shadow shifts down 2px", "border brightens by ~30%", "no visible change" — whatever you actually see.
3. `Read btn-<name>.json` for the exact numeric values backing your observation.
4. Categorize: is this a primary CTA (filled / accented), an outline secondary, or a header/ghost tertiary? Use both **size** and **prominence** signals.

Pick the **single most prominent button** as `accent-cta` in your design.md. Pick the next as `outline`. Pick the smallest/quietest as `ghost`.

#### 3c — Typography (run for every `heading-*.png`)

For each heading screenshot:
1. `Read heading-<tag>-N.png`.
2. Visually: is the text **plain colored** or **gradient-painted**? (Gradient-painted = different colors blending within letterforms, often pastel halos.)
3. Read `big-text-styles.json` entry N. If `webkitTextFillColor === 'rgba(0, 0, 0, 0)'` AND `backgroundImage` contains `radial-gradient` or `linear-gradient` — yes, painted. Extract the gradient stops verbatim into design.md.
4. Note tracking sign: `letterSpacing` numeric — positive or negative? Display-font tracking is editorial signal.

#### 3d — Cards (run for `card-0.png`, `card-1.png`, `card-2.png`)

For each card screenshot:
1. `Read card-N.png`.
2. Describe: solid surface, gradient surface, border-only, glassmorphism? Hover affordance?
3. `Read cards-inventory.json` for exact bg/border/radius/shadow values.
4. If multiple cards share the same recipe — write ONE card recipe in design.md, not three.

#### 3e — Color extraction discipline

By the time you've read 8-12 PNGs, you've **seen** the palette. Compile the canonical token list:

- 2-3 canvas/surface levels (background, raised surface, nested surface)
- 3 text levels (primary, secondary, muted)
- 1 brand accent (the color of the primary CTA you identified)
- 0-3 secondary accents (only if you saw clearly distinct accent uses)
- 4 status colors — if the site doesn't use status states obviously, use generic green/blue/amber/red-300 from Tailwind (this is fine, status is generic)

**Do not** invent accents you didn't see. **Do not** copy every color the site happens to use into a token (e.g. a single illustration). Tokens are repeated values, not unique values.

### Step 4 — Self-confidence check

Before writing `design.md`, score yourself per token group (canvas / text / accents / typography / motion / cards). For each:

- **High** — saw it clearly in multiple PNGs, JSON values confirm. Write into design.md as-is.
- **Medium** — inferred from one or two observations. Write into design.md with a `# inferred` comment.
- **Low** — guessed because the site didn't expose this clearly. **Skip the token entirely or use a generic Tailwind default with a comment.**

Then tell the user the summary BEFORE writing files:

```
Tier: 2 (Tailwind utility)
High confidence: canvas, surface, text hierarchy, primary CTA color, motion timing
Medium: secondary accents, h1 gradient recipe
Low: status colors (site didn't show them — using Tailwind defaults)
Forbidden auto-extracted: 6 patterns (see below)

Proceed?
```

If the user says "yes" — proceed to Step 5. If "no, adjust X" — re-look at relevant PNGs and revise.

### Step 5 — Forbidden Patterns auto-extraction

This is what makes the design.md actually enforce the reference's style.
Looking at the screenshots, list patterns the site notably does NOT use:

- Does the primary CTA have a saturated violet/indigo gradient? If no → add `❌ no saturated CTA gradients` to Forbidden.
- Does any surface use `backdrop-filter: blur(...)`? Check `cards-inventory.json` `backdropFilter` field. If all `none` → add `❌ no backdrop-blur glassmorphism`.
- Does any button visibly scale on hover? Check hover screenshots vs rest — same dimensions? If yes → add `❌ no hover:scale on buttons`.
- Is h1 plain white or painted? If painted → add `❌ no plain-white h1 — paint via background-clip:text` (or copy that wording from the template).
- Are shadows wide halo glows (large blur, low opacity over big radius) or contained drops? Read button `boxShadow` JSON values — if they look like `0 6px 16px ...` (contained), add `❌ no wide halo glows`.
- Are letterSpacing values on display fonts positive or negative? Note in design.md, and add the opposite to Forbidden.

You usually end up with **6-10 forbidden patterns auto-extracted**, plus
the universal ones (no `transition-all duration-150`, no `font-bold` on
hero h1). Write them all into the Forbidden Patterns section.

### Step 6 — Detect project structure & place files

```bash
SRC=$(test -d src && echo "src" || echo ".")
APP_DIR="$SRC/app"
[ ! -d "$APP_DIR" ] && APP_DIR="$SRC/pages"

TAILWIND_CFG=$(ls tailwind.config.* 2>/dev/null | head -1)
[ -z "$TAILWIND_CFG" ] && echo "WARNING: tailwind not configured"

CLAUDE_MD=".claude/CLAUDE.md"
[ ! -f "$CLAUDE_MD" ] && CLAUDE_MD="CLAUDE.md"
```

Copy templates from `$BUNDLE_DIR/templates/`:

| Template | Destination | Action |
|----------|-------------|--------|
| `templates/design.md` | `<project>/design.md` (or `frontend/design.md`) | **Edit before placing**: replace placeholder tokens with harvested values. Inject "Site-Specific Gotchas" section with the 3-5 observations from Step 3. Inject your auto-extracted Forbidden Patterns from Step 5. |
| `templates/ds/Atoms.tsx` | `<project>/$APP_DIR/design-test/ds/Atoms.tsx` | If the project doesn't have its own token layer yet, tweak the inline hex values in this file to match harvested palette. |
| `templates/ds/Molecules.tsx` | same dir | As-is. |
| `templates/ds/Organisms.tsx` | same dir | As-is. |
| `templates/ds/index.ts` | same dir | As-is. |
| `templates/design-test/page.tsx` | `<project>/$APP_DIR/design-test/page.tsx` | As-is. |
| `templates/CLAUDE-section.md` | append to `$CLAUDE_MD` | Append, don't overwrite. Create file if missing. |

### Step 7 — Report

```
Done. Bootstrapped from <reference-url> (Tier <N>).

design.md             — N tokens, M button recipes, K forbidden patterns (auto + universal)
ds/Atoms.tsx          — Button (3 variants × 4 accents), Badge, StatusIndicator, TextInput, Switch
ds/Molecules.tsx      — Card, StatBlock, ListRow, StatusPill
ds/Organisms.tsx      — PageHeader, EmptyState, Section
design-test/page.tsx  — sandbox at /design-test
CLAUDE.md             — appended "Frontend Design System" rules block

Confidence summary:
  High:   <list>
  Medium: <list> (marked with # inferred in design.md)
  Low:    <list> (skipped or generic Tailwind default)

Top 3 things to eyeball in design.md:
1. <e.g. "h1 gradient recipe — confirm the radial-gradient stops match your reference">
2. <e.g. "primary accent — I picked the lavender CTA, but there were also cyan accents I left as secondary">
3. <e.g. "no Rive runtime detected — motion is CSS-only">

Run `npm run dev` → open /design-test to see atoms.
If anything looks off, tell me what's wrong and I'll re-look at the relevant screenshot.
```

### Step 8 — Iterative refinement (natural conversation)

The user will reply with things like:
- "The h1 isn't quite right — too white" → `Read heading-h1-0.png` again, re-extract gradient.
- "Buttons are too saturated" → `Read btn-cta-rest.png`, compare your tokens to what's visible, tune.
- "Add a second secondary accent" → re-look at `02-fold-desktop.png` and the inventory, pull a second one.

This is just normal Claude Code back-and-forth. No special workflow needed —
the harvest dir stays in `/tmp/` for the session, you can re-Read any
screenshot. Once the user is satisfied, the harvest dir can be deleted
(but design.md persists in their project).

## Common pitfalls

- **Don't grep for tokens in compiled CSS as your primary strategy.** Tailwind ships utility classes without revealing token values; CSS-in-JS ships hashed classnames. Looking at pixels is reliable regardless of how the CSS got there.
- **Don't load `01-full-desktop.png` into context.** It's huge. Use `02-fold-desktop.png` for first impression and sectional crops for detail.
- **Don't invent accents the site doesn't use.** If you only saw lavender CTAs, design.md gets one accent. The starter template has 4 placeholder accents — replace only what you actually observed.
- **Don't overshoot button shadows.** Computed-style says `0 6px 16px` → use that. The generic AI default `0 0 60px -10px` is a tell that you didn't actually look.
- **Don't refuse to refuse.** Tier 4 (canvas-heavy) and Tier 5 (adversarial) sites are real. Saying "I can't reliably harvest this, want to share screenshots manually?" is the correct answer, not a failure.
- **Don't pollute the user's repo with harvest output.** It's in `/tmp/`. Throw it away after design.md is written.

## Templates

In `$BUNDLE_DIR/templates/`:
- `design.md` — YAML + prose skeleton with generic Tailwind defaults.
- `ds/Atoms.tsx`, `Molecules.tsx`, `Organisms.tsx`, `index.ts`.
- `design-test/page.tsx` — sandbox.
- `CLAUDE-section.md` — rules block for CLAUDE.md.

Copy them, edit them with harvested values, place them in the user's
project. The user owns them after — don't symlink, don't re-import on
subsequent runs unless explicitly asked.
