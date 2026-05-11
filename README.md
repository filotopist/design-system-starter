# design-system-starter

> Take any Next.js + Tailwind project from **"no design system"** to **"calibrated atomic design system that Claude follows"** in one command.

You give Claude a public URL of a site you love. Claude opens it in a real browser, **looks at the screenshots with its own eyes** (Claude Code's Read tool is multimodal), reads the computed-style dumps alongside, and writes you:

1. A `design.md` populated with values harvested from what was actually visible — not guesses.
2. An `Atoms.tsx` + `Molecules.tsx` + `Organisms.tsx` scaffold in your project.
3. A `/design-test` sandbox so you can eyeball every component live.
4. A `CLAUDE.md` section that teaches Claude to use the system going forward.

The Forbidden Patterns section in `design.md` is auto-extracted from what the reference site **doesn't** do (no hover:scale, no backdrop-blur, no halo glows, no plain-white h1) — so every future UI request to Claude ends up consistent with that reference, not with generic AI aesthetic.

---

## Why vision-first

The first version of this tool grepped compiled CSS. That works on a fraction of the web (sites that ship semantic CSS tokens, like Vercel landing pages or Linear's marketing site) and silently produces garbage on the rest (Tailwind utility classes hide token values, CSS-in-JS hashes them, Canvas/WebGL sidesteps the DOM entirely).

The fix is to stop treating the harvest as a parsing problem. Claude Code is a multimodal model — when it `Read`s a PNG file, it **sees** the button. So the harvest script dumps small focused screenshots (rest+hover button pairs, individual headings, individual cards, hero crop, nav strip) instead of one giant full-page image. Claude reads those, describes what it sees, and pulls exact numbers from the accompanying JSON dumps.

That makes the skill work on any site whose UI is made of pixels, not just sites that publish their token vocabulary.

---

## Site compatibility

Honest expectations, set before each harvest by the skill itself based on signals from the page:

| Tier | Examples | What works |
|------|----------|------------|
| **1 — Semantic CSS / design tokens** | Sites that ship custom-properties or BEM-style classes for their design system | Everything. Tokens, hover deltas, gradient text — all recoverable with high confidence. |
| **2 — Tailwind / utility-first** | Most modern SaaS landing pages | Computed values are reliable. Token *names* are inferred by Claude looking at prominence — you tell it which CTA is "primary" if it picks wrong. |
| **3 — CSS-in-JS / hashed classnames** | Stripe, enterprise SaaS with emotion/styled-components | Computed values and visual reasoning still work. Names are invented. No way to follow upstream changes — frozen snapshot. |
| **4 — Canvas / WebGL-heavy** | Apple, motion-heavy editorial | Static look only. Interactivity isn't in the DOM, so it isn't harvestable. The skill says so honestly and offers an alternative. |
| **5 — Adversarial / auth-walled** | Private apps, anti-bot pages | Skill refuses with explanation. |

The skill classifies the site in Step 2 and reports the tier + confidence summary before writing files. You can abort if it looks bad.

---

## What's in the box

```
design-system-starter/
├── README.md                  # this file
├── SKILL.md                   # vision-first workflow Claude follows
├── capture.mjs                # Playwright harvester (sectional + per-element screenshots)
├── package.json               # playwright dep
├── commands/
│   └── design-system-from.md  # slash command for Claude Code
└── templates/
    ├── design.md              # YAML token contract + Forbidden Patterns
    ├── ds/
    │   ├── Atoms.tsx          # Button, Badge, StatusIndicator, TextInput, Switch
    │   ├── Molecules.tsx      # Card, StatBlock, ListRow, StatusPill
    │   ├── Organisms.tsx      # PageHeader, EmptyState, Section
    │   └── index.ts           # barrel
    ├── design-test/
    │   └── page.tsx           # live sandbox at /design-test
    └── CLAUDE-section.md      # rules block appended to CLAUDE.md
```

---

## Quick start — zero install

If you just want to try it once, you don't need to install anything manually. Open Claude Code in your Next.js + Tailwind project and paste:

> Clone https://github.com/filotopist/design-system-starter into /tmp/dss, run `npm install` and `npx playwright install chromium` inside it, then read SKILL.md and follow it to harvest `<REFERENCE-SITE-URL>` and bootstrap a design system in this project.

Claude does the clone, the install, the harvest, the visual analysis, and the file placement. You review `/design-test` and `design.md`.

For repeated use across multiple projects, use the durable install below — it skips the clone/install every time.

---

## Durable install (one-time, ~3 min)

### 1. Clone this repo somewhere persistent

```bash
git clone https://github.com/filotopist/design-system-starter ~/tools/design-system-starter
cd ~/tools/design-system-starter
```

`~/tools/design-system-starter` is the default path the slash command looks for. If you put it elsewhere, tell Claude `"the bundle is at <path>"` when invoking.

### 2. Install Playwright + Chromium

```bash
npm install
npx playwright install chromium
```

Takes about a minute. Chromium is ~150 MB and lives in `~/.cache/ms-playwright/` — downloaded once on this machine.

### 3. Wire the slash command

For **each project** where you want `/design-system-from` available:

```bash
cd <your-project>
mkdir -p .claude/commands
cp ~/tools/design-system-starter/commands/design-system-from.md .claude/commands/
```

Or copy to `~/.claude/commands/` to make it available in every project automatically.

---

## Use

In any Next.js + Tailwind project where you've installed the command, run inside Claude Code:

```
/design-system-from <reference-site-url>
```

Pick a public website whose visual style you want your product to feel like. The harvest captures computed styles + focused screenshots (same as opening DevTools and taking screenshots manually), Claude reads them with its own eyes, and translates them into design tokens for your project.

### What Claude does, in order

1. **Locates the bundle** — checks `~/tools/`, `~/.claude/skills/`, `~/dev/`. Asks if not found.
2. **Runs the harvest** — `node capture.mjs` opens the reference in Chromium, takes ~15-20 focused screenshots (fold, nav, hero, button rest+hover pairs, headings, cards) and dumps JSON with computed styles + tier-classification signals. ~1-2 min.
3. **Classifies the site tier** — reads `tier-hints.json`, picks a tier (1-5), reports honest expectations to you.
4. **Reads screenshots one at a time** — looking at the actual pixels. Describes what it sees in design-token terms. Cross-references with JSON for exact numeric values.
5. **Auto-extracts Forbidden Patterns** — by observing what the reference notably does NOT do (no hover transforms? no glassmorphism? no plain-white h1?). These become the most powerful part of `design.md`.
6. **Reports confidence summary** — tells you which tokens are high-confidence, which are inferred, which it skipped because it didn't see them clearly. You confirm before files are written.
7. **Places files** — `design.md` at project root (or `frontend/design.md`), `ds/` + sandbox under `app/design-test/`, appends `CLAUDE.md` rules block.
8. **Refines on request** — say "the h1 isn't quite right" and Claude re-reads the relevant screenshot. Normal Claude Code conversation, no special workflow.

### What you do after

```bash
npm run dev
# open http://localhost:3000/design-test
```

You should see a dark, calibrated catalog of every atom + molecule + organism in the style of your reference. From here, every future UI ask — "build a /pricing page", "redesign the dashboard" — gets executed against this contract.

---

## How it actually works

Three layers in combination:

1. **Sectional, focused screenshots.** `capture.mjs` doesn't just dump one full-page PNG — it crops out the nav, the hero, each named button at rest and on hover, each major heading, each card-shaped element. Claude reads them selectively. Loading a single 5MB full-page image into a multimodal model context is wasteful; loading a 200KB button screenshot is precise.
2. **`design.md` as the contract.** A single markdown file with YAML tokens + prose recipes + an auto-extracted Forbidden Patterns section. Claude reads it on every future request.
3. **Atomic structure + reuse rules.** Components live in `ds/Atoms.tsx` and friends. `CLAUDE.md` teaches Claude to **check `ds/` before inlining new code** and **promote patterns on second use**.

The Forbidden Patterns section is doing more work than people expect. AI knows 100,000 visual patterns — the way you get a specific look is by enumerating what to **not** do. The harvest of the reference site tells the skill which of those forbidden patterns to add automatically.

---

## Going further

### Update the design system after a fresh harvest

Run the command again with the same or a new URL. Claude will diff the new harvest against current `design.md` and confirm before overwriting. You can also re-run `capture.mjs` directly and copy values manually — sometimes faster.

### Use it on a non-Next.js project

Templates assume Next.js App Router + Tailwind. For Vite + React, Remix, Astro: ask Claude `"the project uses <stack>, adapt the templates accordingly"`. The harvest itself is stack-agnostic; only the file placement changes.

### Customize the templates

The starter templates are a baseline. Once your project's `ds/` evolves past them, **don't re-import** — your project owns the components now. Re-run the skill only to refresh `design.md` against a new reference, not to overwrite atoms.

---

## Credits

Built by **Ivan Kolle** ([@filotopist](https://github.com/filotopist)). The harvest workflow, the `design.md` contract format, the Atomic Design rule set (`reuse before reinvent` / `promote on second use`), and the slash-command + SKILL workflow were developed while shipping production UIs with Claude Code.

Brad Frost's **Atomic Design** is the conceptual underpinning of `ds/`.

If you build something on top of this, a "Built on [design-system-starter](https://github.com/filotopist/design-system-starter) by @filotopist" line is appreciated but not required (MIT). See [CREDITS.md](./CREDITS.md) for the attribution convention.

## License

MIT — see [LICENSE](./LICENSE). TL;DR: do whatever you want, just keep the copyright notice in source files when you redistribute.

---

## Troubleshooting

**`npx playwright install chromium` fails** — your machine is missing system libs. On Ubuntu: `sudo npx playwright install-deps chromium`. On Mac: usually just works.

**`capture.mjs` hits 60s timeout on a slow site** — pass `TARGET=<url> node capture.mjs` from a fresher network, or edit the `timeout: 60000` in `capture.mjs` to `120000`.

**Slash command not picked up by Claude Code** — verify the file is at `.claude/commands/design-system-from.md` (lowercase, dashes) and restart the session.

**Claude can't find the bundle** — tell it explicitly: `"the design-system-starter bundle is cloned at <absolute-path>"`. Default lookup paths: `~/tools/`, `~/.claude/skills/`, `~/dev/`, `/tmp/dss/`.

**Skill says "Tier 4, can't reliably harvest"** — that's not a bug, that's the skill being honest. Canvas/WebGL-heavy sites don't expose their interactivity to the DOM. Send Claude a manual screenshot of the section you want and ask it to extract from that.

**Want the skill globally** — copy `commands/design-system-from.md` to `~/.claude/commands/`. Available in every project automatically.
