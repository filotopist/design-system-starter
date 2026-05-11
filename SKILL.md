---
name: design-system-from
title: Harvest a reference site and bootstrap an atomic design system
description: >
  Given a public URL, open it in a real browser, harvest computed styles +
  hover screenshots + network runtimes, then translate findings into a
  calibrated design.md + minimal Atoms.tsx + sandbox page + CLAUDE.md
  rules block. End result: agent-readable design contract that a freshly
  cloned Next.js + Tailwind project can follow.
target_stack: Next.js (App Router) + Tailwind + TypeScript
status: starter-v0.1
---

# Design System From Reference — Skill

## Purpose

Take a project from "no design system" to "calibrated atomic design system
that Claude follows" in one command. The user supplies a reference URL
they want their product to feel like — you do the rest.

## When invoked

The user typed `/design-system-from <url>` (or pasted equivalent
instructions). They expect, in this order:

1. A token harvest from the reference site (computed styles, not guesses).
2. A `design.md` populated with REAL values from the harvest.
3. A minimal `ds/` folder (Atoms + Molecules + Organisms scaffold).
4. A `/design-test` sandbox route that renders the atoms.
5. A "Frontend Design System" section appended to (or creating) `CLAUDE.md`.
6. A short summary of what was harvested and what they should review.

If no URL is in the message — ask for one. Without a reference, the
output is generic AI aesthetic, which defeats the point.

## Workflow

### Step 0 — Locate the starter bundle

This skill ships with `capture.mjs` and `templates/` next to it. Find
its absolute path:

```bash
# This SKILL.md lives at <bundle>/SKILL.md
# capture.mjs is sibling, templates/ is sibling dir
BUNDLE_DIR=$(dirname "$(realpath <path-to-this-SKILL.md>)")
```

If the user installed the bundle via `git clone`, the path is wherever
they cloned it. Common locations:
- `~/tools/design-system-starter/`
- `~/.claude/skills/design-system-starter/`
- `~/dev/design-system-starter/`

If you can't find it — ask the user `where did you clone design-system-starter?`.

### Step 1 — Cheap probe first (curl)

Before spinning up Chromium, try the 30-second probe. For static
Next.js / Vite landing pages this is often enough:

```bash
TARGET=<user-url>
SITE=$(echo $TARGET | sed 's|.*//||;s|/.*||')
OUT=/tmp/${SITE}-extract
mkdir -p "$OUT"

curl -sL "$TARGET" -o "$OUT/page.html"
CSS_URL=$(grep -oE '/_next/static/css/[^"]*\.css' "$OUT/page.html" | head -1)
[ -n "$CSS_URL" ] && curl -sL "${TARGET%/}${CSS_URL}" -o "$OUT/bundle.css"

# Inspect:
[ -f "$OUT/bundle.css" ] && {
  echo "=== COLORS ===" && grep -oE "background-color:[^;}]+|color:[^;}]+|border-color:[^;}]+" "$OUT/bundle.css" | sort -u | head -30
  echo "=== GRADIENTS ===" && grep -oE "linear-gradient\([^)]+\)|radial-gradient\([^)]+\)" "$OUT/bundle.css" | sort -u | head -20
  echo "=== RADII ===" && grep -oE "border-radius:[^;}]+" "$OUT/bundle.css" | sort -u
  echo "=== SHADOWS ===" && grep -oE "box-shadow:[^;}]+" "$OUT/bundle.css" | sort -u | head -20
  echo "=== FONTS ===" && grep -oE 'font-family[^;"]+' "$OUT/bundle.css" | sort -u | head -10
}
```

You can stop here if the answer is obvious in static CSS. Most premium
sites have JS-driven motion (Rive, Framer Motion, mouse-tracking
spotlights) — in that case proceed to Step 2.

### Step 2 — Browser harvest

```bash
cd "$BUNDLE_DIR"
[ ! -d node_modules ] && npm install
[ ! -d ~/.cache/ms-playwright ] && npx playwright install chromium

TARGET=<user-url> node capture.mjs
```

Output lands in `/tmp/<sitename>-extract/`:

| File | What to read it for |
|------|--------------------|
| `01-full-desktop.png` | Overall composition. Don't load if >2MB — read chunks via crops. |
| `02-fold-desktop.png` | Above-the-fold treatment. **Always read this**. |
| `03-full-mobile.png` | Responsive sanity check. |
| `btn-*-rest.png` + `btn-*-hover.png` | Button anatomy. Compare for hover delta — usually subtle Y-shift, not bigger spread. |
| `btn-*.json` | Computed styles at rest + hover. Look for: `boxShadow`, `transition`, `padding`, `height`, `borderRadius`, `fontWeight`. |
| `big-text-styles.json` | **Critical for editorial feel**. Look for `webkitTextFillColor: rgba(0,0,0,0)` + `backgroundImage: ...radial-gradient...` → h1 painted via background-clip:text (standard CSS technique). |
| `cards-inventory.json` | Card recipes: bg, border, radius, shadow, backdrop-filter. |
| `network-requests.txt` | Runtimes: `@rive-app`, `framer-motion`, `gsap`, `lottie`, `lenis`, `three`, `spline`. Lets you decide what to fake with CSS vs. what to skip. |

### Step 3 — Read selectively, synthesize

**Don't** load the full PNG into context (often >5MB). Read JSON files
first — they have the actual numbers. Open screenshots only for
sections that look distinctive in the JSON (gradient text, unusual
card treatments, status pills with mono fonts).

Translate findings into 4 buckets:

1. **Token deltas** — what colors / radii / spacing the reference uses
   that differ from generic dark UI.
2. **Typography facts** — fonts, sizes, letter-spacing (often surprises),
   gradient-text recipes.
3. **Motion facts** — transitions (duration + easing), runtimes used.
4. **Anti-patterns to forbid** — things the reference notably does NOT
   do (e.g. "no hover:scale", "no flat colored fills on CTAs").

### Step 4 — Detect project structure

Figure out where to place files in the user's project:

```bash
# Next.js App Router (most common)
SRC=$(test -d src && echo "src" || echo ".")
APP_DIR="$SRC/app"
[ ! -d "$APP_DIR" ] && APP_DIR="$SRC/pages"  # Pages Router fallback

# Where does Tailwind live?
TAILWIND_CFG=$(ls tailwind.config.* 2>/dev/null | head -1)
[ -z "$TAILWIND_CFG" ] && echo "WARNING: tailwind not configured, design system assumes it"

# Existing CLAUDE.md?
CLAUDE_MD=".claude/CLAUDE.md"
[ ! -f "$CLAUDE_MD" ] && CLAUDE_MD="CLAUDE.md"
```

### Step 5 — Place files

Copy templates from `$BUNDLE_DIR/templates/`:

| Template | Destination | Action |
|----------|-------------|--------|
| `templates/design.md` | `<project>/design.md` (or `frontend/design.md`) | **Edit before placing**: replace placeholder tokens with harvested values. Add Site-Specific Gotchas section with 3-5 observations. |
| `templates/ds/Atoms.tsx` | `<project>/$APP_DIR/design-test/ds/Atoms.tsx` | Edit Tailwind classes to use harvested colors if the project doesn't have a token layer yet. |
| `templates/ds/Molecules.tsx` | same dir | As-is (it's a scaffold). |
| `templates/ds/Organisms.tsx` | same dir | As-is. |
| `templates/ds/index.ts` | same dir | As-is. |
| `templates/design-test/page.tsx` | `<project>/$APP_DIR/design-test/page.tsx` | As-is. |
| `templates/CLAUDE-section.md` | append to `$CLAUDE_MD` | Append, don't overwrite. If file doesn't exist, create with this as content. |

### Step 6 — Report

Print a short summary to the user:

```
Done. Here's what I built from <reference-url>:

design.md            populated with N tokens, M button recipes,
                     gradient-text recipe (if found), motion timing
ds/Atoms.tsx         Button (3 variants), Badge (3 variants), StatusIndicator
ds/Molecules.tsx     scaffold (empty)
ds/Organisms.tsx     scaffold (empty)
design-test/page.tsx renders all atoms in sandbox at /design-test
CLAUDE.md            appended "Frontend Design System" rules block

Top 3 things you should review in design.md:
1. <e.g. "h1 uses background-clip:text — confirm Cal Sans loaded">
2. <e.g. "CTA shadow is 0 6px 16px rgba(...) — subtle, not halo">
3. <e.g. "no Rive runtime — motion is CSS-only">

Run `npm run dev` → open /design-test to see atoms.
Next: ask me to build a real page ("make a /pricing page using our DS").
```

## Common pitfalls

- **Don't overshoot button shadows.** Computed-style says `0 6px 16px`
  → use that, not `0 0 60px -10px` which is generic-AI default.
- **Letter-spacing on display text is often POSITIVE** (+0.02em) for
  editorial sites with Cal Sans / Fraunces. Negative tracking is an
  Inter/SF-pro idiom.
- **Gradient text is a strong editorial signal.** If `big-text-styles.json`
  shows `webkitTextFillColor: rgba(0,0,0,0)` + a radial-gradient
  background-image, that's a generic CSS pattern — use it in your own
  h1 with your own color palette. It's the difference between editorial
  and generic.
- **Don't attempt to reproduce Rive scenes / proprietary canvas animations.**
  If `@rive-app/canvas` shows up in network-requests, note it in
  design.md as "out of scope, CSS fallback only" and move on. Build
  your own motion language with the tokens.
- **Forbidden list > Allowed list.** AI knows 100k patterns. You
  restrict, not enumerate. Always include explicit forbiddens
  (`hover:scale`, `backdrop-blur-md`, `violet→indigo gradients`).
- **Don't pollute the user's repo with the harvest.** Output lives in
  `/tmp/`. Throw it away after synthesis.

## Where templates live

In this bundle:
- `templates/design.md` — YAML + prose skeleton with sane defaults.
- `templates/ds/` — Atoms.tsx + Molecules.tsx + Organisms.tsx + index.ts.
- `templates/design-test/page.tsx` — sandbox.
- `templates/CLAUDE-section.md` — rules block for CLAUDE.md.

Copy them, edit them with harvested values, place them in the user's
project. Don't symlink — they're starting points the user will own.
