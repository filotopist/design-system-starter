---
description: Harvest a reference website and bootstrap a calibrated atomic design system in this project
argument-hint: <reference-url>
---

# /design-system-from

The user wants to bootstrap a design system for the current project, calibrated against the reference URL `$ARGUMENTS`.

If `$ARGUMENTS` is empty, ask the user for a reference URL (one public site they want their product to feel like). Do not proceed without it — a design system without calibration is generic.

## Your job

Follow the workflow in `~/tools/design-system-starter/SKILL.md` (or wherever the starter bundle is cloned — check `~/tools/`, `~/.claude/skills/`, `~/dev/` if not at default).

End state:
- `design.md` at project root (or `frontend/design.md` if there's a `frontend/` subdir) populated with REAL values harvested from `$ARGUMENTS`
- `ds/` folder with `Atoms.tsx`, `Molecules.tsx`, `Organisms.tsx`, `index.ts` placed under `app/design-test/ds/` (or `src/app/design-test/ds/`)
- `app/design-test/page.tsx` sandbox that renders the atoms
- `CLAUDE.md` updated with a "Frontend Design System" rules block (append, don't overwrite)
- A short summary printed to the user: what was harvested, what to review first, where to look at the sandbox

## Constraints

- Target stack: Next.js (App Router) + Tailwind + TypeScript. If the project uses something else, adapt the templates accordingly and tell the user what you changed.
- Don't pollute the user's repo with `/tmp/<site>-extract/` — that's scratch.
- The Forbidden Patterns section in `design.md` is the most important — populate it with anti-patterns that the reference site notably does NOT do.
- After all files are placed, run a quick sanity check (`ls` the new files, confirm they parse) before reporting done.

Proceed.
