# design-system-starter

> Take any Next.js + Tailwind project from **"no design system"** to **"calibrated atomic design system that Claude follows"** in one command.

You give Claude a public URL of a site you love. It:

1. Harvests real computed styles, hover screenshots, and runtimes from that site.
2. Writes a `design.md` populated with the harvested values (not guesses).
3. Drops `Atoms.tsx` + `Molecules.tsx` + `Organisms.tsx` into your project.
4. Adds a `/design-test` sandbox so you can see every component live.
5. Teaches your `CLAUDE.md` how to use the system going forward.

End result: every UI request to Claude in this project ends up consistent with the reference, not with generic AI aesthetic.

---

## What's in the box

```
design-system-starter/
├── README.md                  # this file
├── SKILL.md                   # instructions for Claude on how to use the bundle
├── capture.mjs                # Playwright harvester
├── package.json               # playwright dep
├── commands/
│   └── design-system-from.md  # slash command — copy into your project's .claude/commands/
└── templates/
    ├── design.md              # YAML token contract + Forbidden Patterns
    ├── ds/
    │   ├── Atoms.tsx          # Button, Badge, StatusIndicator, TextInput, Switch
    │   ├── Molecules.tsx      # Card, StatBlock, ListRow, StatusPill
    │   ├── Organisms.tsx      # PageHeader, EmptyState, Section
    │   └── index.ts           # barrel
    ├── design-test/
    │   └── page.tsx           # live sandbox at /design-test
    └── CLAUDE-section.md      # rules block to append to CLAUDE.md
```

---

## Install (one-time, ~3 min)

### 1. Clone this repo somewhere persistent

```bash
git clone https://github.com/filotopist/design-system-starter ~/tools/design-system-starter
cd ~/tools/design-system-starter
```

> Path `~/tools/design-system-starter` is the default the slash command looks for. If you put it elsewhere, just tell Claude `"the bundle is at <path>"` when you run the command.

### 2. Install Playwright + Chromium

```bash
npm install
npx playwright install chromium
```

Takes about a minute. Chromium is ~150 MB and lives in `~/.cache/ms-playwright/` — you only download it once on this machine.

### 3. Wire the slash command into Claude Code

For **each project** where you want `/design-system-from` available:

```bash
cd <your-project>
mkdir -p .claude/commands
cp ~/tools/design-system-starter/commands/design-system-from.md .claude/commands/
```

(Or copy to `~/.claude/commands/` to make it available in every project — your choice.)

Done. Claude Code now knows the `/design-system-from <url>` command.

---

## Use (per-project, ~5 min)

In any Next.js + Tailwind project where you've installed the command, open Claude Code and run:

```
/design-system-from <reference-site-url>
```

Pick a public website whose visual style you want your product to feel like. The harvest reads computed styles + screenshots (same as opening DevTools) and translates them into design tokens for your project.

### What Claude will do, in order

1. **Locate the bundle** (looks in `~/tools/`, `~/.claude/skills/`, `~/dev/`). Asks if not found.
2. **Cheap probe**: `curl` the reference page, grep the compiled CSS bundle for colors, gradients, shadows, radii. 30 sec.
3. **Browser harvest** (`node capture.mjs`): opens the site in Chromium, captures hover states, computed styles, big-text gradient recipes, network runtimes. ~1 min.
4. **Synthesize**: reads `/tmp/<site>-extract/*.json`, picks out 5–10 concrete observations.
5. **Place files in your project**:
   - `design.md` at root (or `frontend/design.md` if you have a frontend subdir) — populated with real harvested values
   - `app/design-test/ds/{Atoms,Molecules,Organisms,index}.tsx` — starter components
   - `app/design-test/page.tsx` — live sandbox
   - `CLAUDE.md` — appended with "Frontend Design System" rules block (created if missing)
6. **Report**: prints what was harvested, top 3 things to review, where to look at the sandbox.

### What you do after

```bash
npm run dev
# open http://localhost:3000/design-test
```

You should see a dark, calibrated catalog of every atom + molecule + organism, in the visual style of your reference site.

From here, every future ask to Claude — "build a /pricing page", "add a settings drawer", "redesign the dashboard" — gets executed against this contract.

---

## How the magic works (short version)

Three things in combination:

1. **Real computed styles, not guesses.** Most AI design systems hallucinate token values. `capture.mjs` reads them from the live DOM, including hover states and gradient-text recipes that only show up at runtime.
2. **`design.md` as the contract.** A single markdown file with YAML tokens + prose recipes + an explicit **Forbidden Patterns** section. Claude reads it on every request.
3. **Atomic structure + reuse rules.** Components live in `ds/Atoms.tsx` and friends. `CLAUDE.md` teaches Claude to **check `ds/` before inlining new code** and **promote patterns on second use**.

The Forbidden Patterns section is doing more work than people expect. AI knows 100,000 visual patterns — the way you get a specific look is by enumerating what to **not** do (no violet→indigo gradients, no `hover:scale-105`, no backdrop-blur glass, no halo glows). The harvest of the reference site tells you which of those forbidden patterns to add.

---

## Going further

### Update the design system after a fresh harvest

Run the command again with the same or a new URL. Claude will diff the new harvest against current `design.md` and ask before overwriting. (You can also just re-run `capture.mjs` directly and copy values manually — sometimes faster.)

### Use the bundle for a project that isn't Next.js

Templates assume Next.js App Router + Tailwind. For Vite + React, Remix, Astro, etc.: ask Claude `"the project uses <stack>, adapt the templates accordingly"`. The harvest itself is stack-agnostic — only the placement of `ds/` files changes.

### Customize the templates

The starter templates are a baseline. Once your project's `ds/` evolves past them, **don't re-import** — your project owns the components now. Re-run the command only to refresh `design.md` against a new reference, not to overwrite atoms.

---

## Credits

Built by **Ivan Kolle** ([@filotopist](https://github.com/filotopist)). The Playwright harvest pattern, the `design.md` contract format, the Atomic Design rule set (`reuse before reinvent` / `promote on second use`), and the slash-command + SKILL workflow were developed while shipping production UIs with Claude Code.

Brad Frost's **Atomic Design** is the conceptual underpinning of `ds/`.

If you build something on top of this, a "Built on [design-system-starter](https://github.com/filotopist/design-system-starter) by @filotopist" line is appreciated but not required (MIT). See [CREDITS.md](./CREDITS.md) for the attribution convention.

## License

MIT — see [LICENSE](./LICENSE). TL;DR: do whatever you want, just keep the copyright notice in source files when you redistribute.

---

## Troubleshooting

**`npx playwright install chromium` fails** — your machine is missing system libs. On Ubuntu: `sudo npx playwright install-deps chromium`. On Mac: usually just works.

**`capture.mjs` hits 60s timeout on a slow site** — pass `TARGET=<url> node capture.mjs` from a fresher network, or edit the `timeout: 60000` in `capture.mjs` to `120000`.

**Slash command not picked up by Claude Code** — verify the file is at `.claude/commands/design-system-from.md` (lowercase, dashes) and restart Claude Code (`/clear` doesn't reload commands).

**Claude can't find the bundle** — tell it explicitly: `"the design-system-starter bundle is cloned at <absolute-path>"`. The slash command looks in `~/tools/`, `~/.claude/skills/`, `~/dev/` by default.

**Want the bundle as a user-level skill instead of per-project command** — copy `commands/design-system-from.md` to `~/.claude/commands/design-system-from.md`. Then it's available in every project automatically.
