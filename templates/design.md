---
version: 0.1.0
name: {{PROJECT_NAME}}
description: >
  Atomic design system calibrated against {{REFERENCE_URL}} via real-browser
  computed-style harvest. YAML tokens below are the contract. The "Forbidden
  Patterns" section at the bottom is what saves the system from generic AI
  aesthetic — keep it short and concrete.
---

# {{PROJECT_NAME}} — Design System v0.1

> **Single source of truth.** Code follows this file, not the other way around.
> When the design.md value disagrees with what feels right in code — the
> design.md value wins until updated explicitly.

---

## TOKENS (YAML)

> **All values below are generic starter defaults** (Tailwind zinc + blue/sky/amber/emerald scales).
> Replace them with values harvested from your reference site — that's the whole point.

```yaml
# ----- COLORS -----
colors:
  # Canvas — base background.
  canvas:        '#09090B'    # zinc-950
  surface:       '#18181B'    # zinc-900
  surface-2:     '#27272A'    # zinc-800

  # Borders — three tiers (use rgba so they sit on any surface)
  border-subtle:  'rgba(255,255,255,0.06)'
  border-default: 'rgba(255,255,255,0.10)'
  border-strong:  'rgba(255,255,255,0.18)'

  # Text — hierarchy
  text-primary:   '#FFFFFF'
  text-body:      '#FAFAFA'   # zinc-50
  text-secondary: '#D4D4D8'   # zinc-300
  text-muted:     '#A1A1AA'   # zinc-400

  # Accents — pick one as your brand-level primary, others for context.
  # Used as TEXT colors on quiet surfaces, NOT as solid fills.
  accent-blue:    '#60A5FA'   # blue-400 — default brand accent
  accent-sky:     '#7DD3FC'   # sky-300
  accent-amber:   '#FCD34D'   # amber-300
  accent-emerald: '#6EE7B7'   # emerald-300

  # Status — semantic (these are generic Tailwind, keep as-is)
  status-success: '#86EFAC'   # green-300
  status-info:    '#93C5FD'   # blue-300
  status-warn:    '#FCD34D'   # amber-300
  status-danger:  '#FCA5A5'   # red-300

# ----- TYPOGRAPHY -----
typography:
  font-display: 'Inter, system-ui, sans-serif'      # swap to your display font
  font-body:    'Inter, system-ui, sans-serif'
  font-mono:    'ui-monospace, "SF Mono", Menlo, monospace'

  # Letter-spacing depends on your display font. Editorial display fonts
  # (Cal Sans, Fraunces) usually want POSITIVE tracking; UI fonts (Inter,
  # SF Pro) usually want SLIGHTLY NEGATIVE. Harvest tells you which.
  display-tracking: '-0.01em'
  body-tracking:    '0'
  caps-tracking:    '+0.08em'

  sizes:
    h1: '56px'
    h2: '40px'
    h3: '28px'
    body: '15px'
    small: '13px'
    micro: '11px'

  weights:
    display: 500     # NOT 700 — bold display is heavy & generic
    heading: 500
    body: 400
    medium: 500

# ----- SPACING / RADIUS -----
spacing:
  unit: 4            # base spacing unit (px)
  scale: [4, 8, 12, 16, 20, 24, 32, 40, 56, 80]

radius:
  sm: '6px'
  md: '10px'
  lg: '14px'
  pill: '999px'

# ----- MOTION -----
motion:
  duration-fast:   '200ms'   # micro-interactions (button hover)
  duration-base:   '300ms'   # default
  duration-slow:   '500ms'   # page transitions

  easing-default:  'cubic-bezier(0.4, 0, 0.2, 1)'
  easing-spring:   'cubic-bezier(0.34, 1.56, 0.64, 1)'

  # NEVER 150ms (jumpy). NEVER >500ms (sluggish).

# ----- SHADOWS -----
shadows:
  # Subtle, contained drop shadows. NOT halo glows.
  sm:  '0 1px 2px rgba(0,0,0,0.3)'
  md:  '0 4px 12px rgba(0,0,0,0.35)'
  lg:  '0 6px 16px rgba(0,0,0,0.40)'
  cta: '0 6px 16px rgba(255,255,255,0.10), inset 0 1px 0 rgba(255,255,255,0.08)'
```

---

## COMPONENT RECIPES

### Buttons (3-tier taxonomy)

1. **Accent CTA** — page's primary action.
   Pill shape (`rounded-full`), height 44px, padding 22px horizontal,
   weight 500. Subtle accent-tint border + soft contained drop shadow.
   Background: dark gradient with a faint accent radial that intensifies
   on hover. **No saturated fill, no halo glow, no scale on hover.**

2. **Outline** — secondary action.
   Same size, subtle white-opacity border. Hover: lift border strength,
   no transform.

3. **Header / Ghost** — tertiary action (header nav, table rows).
   Height 28-32px, weight 400, no background until hover. Hover: tint
   surface, no border change.

### Typography

- **h1 / Hero** — display font, `font-size: clamp(48px, 6vw, 96px)`,
  weight 500, line-height 1.05.
  Consider painting via `background-clip: text; -webkit-text-fill-color:
  transparent; background-image: radial-gradient(...)` if the reference
  uses gradient text — much more distinctive than flat white.
- **h2** — display font, 40px, weight 500.
- **h3 / Section** — display font, 28px, weight 500.
- **Body** — body font, 15px, weight 400, line-height 1.6.
- **Eyebrow / Small caps** — mono font, 11-12px, tracking +0.08em,
  uppercase, color `text-muted`.

### Cards

Default surface: `surface` background, `border-subtle`, `radius: lg`.
No backdrop-blur (forbidden). On hover: lift border to `border-default`,
no transform.

---

## ACCESSIBILITY

- All interactive elements have visible focus rings (`focus-visible:ring-2 ring-offset-2 ring-offset-canvas`).
- Color contrast: text on canvas/surface ≥ 4.5:1.
- Hit targets: minimum 44×44px on touch surfaces.
- Motion: respect `prefers-reduced-motion` — disable transitions, keep state changes instant.

---

## FORBIDDEN PATTERNS

> This is the most important section. AI knows 100,000 patterns —
> we restrict, we don't enumerate.

- ❌ Saturated CTA gradients (`from-violet-600 to-indigo-600`, `from-blue-500 to-purple-500`, etc.)
- ❌ `backdrop-blur-md` / `backdrop-blur-lg` glassmorphism on surfaces
- ❌ `hover:scale-105` or any transform on hover for buttons/cards
- ❌ Pure black canvas (`bg-black`, `bg-[#000]`) with no ambient layering
- ❌ Wide halo glows on CTAs (`shadow-[0_0_60px_-10px_...]`) — use contained drop shadows
- ❌ Saturated 500-level fills (`bg-emerald-500`, `bg-violet-500`) — use accent tones as text colors
- ❌ Bold display (`font-bold` / `font-weight: 700+`) on hero h1 — too heavy
- ❌ `transition-all duration-150` — too fast, feels jumpy. Use 200ms+ on specific properties.
- ❌ Plain white h1 — consider painting it with gradient via `background-clip: text`

---

## Site-Specific Gotchas (calibration log)

> Add 3-5 observations from the harvest that would be impossible to guess
> without looking at the real reference site. Example structure:

- **Reference uses {{RUNTIME}}** for {{COMPONENT}}. Note: out of scope for
  this system — use a CSS fallback with the motion tokens above instead.
- **CTA shadow is {{ACTUAL_SHADOW_VALUE}}** (subtle drop, not halo).
  Confirmed via `btn-{{NAME}}.json` in harvest.
- **h1 painted with {{GRADIENT_RECIPE}}** — `webkit-text-fill-color:
  rgba(0,0,0,0)` + radial-gradient(...) background-image.
- **Letter-spacing on display is {{VALUE}} (POSITIVE/NEGATIVE)** for
  {{FONT_NAME}}.
- **Header buttons are tiny** ({{HEIGHT}}px, padding {{PADDING}}, weight
  {{WEIGHT}}). Hero CTAs are bigger ({{HERO_HEIGHT}}px). Two separate
  button systems.
