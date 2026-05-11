<!--
  Append this section to your CLAUDE.md (project root or .claude/CLAUDE.md).
  If CLAUDE.md doesn't exist, create it with this as the initial content.
  These rules teach Claude how to use the design system you just installed.
-->

## Frontend Design System — Single Source of Truth

- **Contract**: `design.md` (or `frontend/design.md` if frontend lives in a subdir). YAML tokens, component recipes, motion, shapes, elevation, and a **Forbidden Patterns** section. Calibrated against a reference site via the `design-system-starter` harvest. **Do NOT diverge** — if a `design.md` value disagrees with what feels right, the `design.md` value wins until updated explicitly.

- **Implementation**: `app/design-test/ds/` (or `src/app/design-test/ds/`) — `Atoms.tsx` (Button, Badge, StatusIndicator, TextInput, Switch), `Molecules.tsx` (Card, StatBlock, ListRow, StatusPill), `Organisms.tsx` (PageHeader, EmptyState, Section). Live sandbox at `/design-test`.

- **Reuse before reinvent**: when building UI, **first check `ds/`** for an existing component. Import from `@/app/design-test/ds` (or the equivalent alias). Only inline a primitive when no reusable component fits.

- **Promotion rule**: if you write the same pattern twice (or it's clearly reusable across surfaces), **promote it into Atoms/Molecules/Organisms** instead of copy-pasting. Add a swatch to `app/design-test/page.tsx` so the next person discovers it.

- **Forbidden patterns** (mirrored from `design.md` — short version):
  - No saturated CTA gradients (`from-violet-600 to-indigo-600`, etc.)
  - No `backdrop-blur-md` / glassmorphism on surfaces
  - No `hover:scale-*` on buttons or cards
  - No pure black canvas (`bg-black`) — always layer ambient radials over your canvas token
  - No wide halo glows on CTAs (`shadow-[0_0_60px_...]`) — use contained drop shadows
  - No saturated 500-level fills (`bg-emerald-500`, `bg-violet-500`) — use accent tones as TEXT
  - No `font-bold` on hero h1 — too heavy. Weight 500 max for display.
  - No `transition-all duration-150` — jumpy. Use 200ms+ on specific properties.
  - No plain white h1 — consider painting via `background-clip: text` for distinctive feel

- **Motion**: `200ms cubic-bezier(0.4, 0, 0.2, 1)` for micro-interactions, `300ms` default. Never `<200ms` (jumpy), never `>500ms` (sluggish). Respect `prefers-reduced-motion`.

- **Typography**: tracking depends on display font — harvested from reference. Mono for status pills + tabular nums. Hero h1 considers painted gradient text via `background-clip:text` for distinctive feel.

- **When to update design.md**: if the design needs a value not currently in tokens (a new spacing unit, a new accent color, a new shadow), **edit `design.md` first, then implement**. `design.md` is the contract — code follows it. Never inline a one-off color/shadow in component code.
