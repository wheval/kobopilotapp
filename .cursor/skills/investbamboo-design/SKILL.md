---
name: investbamboo-design
description: Use this skill when building interfaces, landing pages, or components for Gain Access To Diverse Investment Options | Invest Bamboo. It includes the extracted color palette, typography scale, spacing tokens, and layout patterns from the source site so generated UI matches the brand without guessing.
---

# Invest Bamboo Design System

Kobopilot implements these tokens in `app/globals.css`. See also `.cursor/skills/kobopilot-design/SKILL.md` for product-specific copy and layout.

## Core palette

| Token | Hex | Usage |
|-------|-----|-------|
| primary | `#004a3d` | Main CTA, focus rings |
| primary-bright | `#006652` | Button hover |
| primary-deep | `#003930` | Dark accents |
| ink | `#0c231a` | Text, dark sections |
| ink-soft | `#80a39e` | Secondary text |
| canvas | `#f4ede4` | Page background |
| paper | `#fefdfc` | Cards, nav, inputs |
| accent-lime | `#e6ff55` | Icons only — never text |
| success | `#00a239` | Positive states |
| error | `#b5162a` | Errors, destructive |

## Typography (Haffer XH → DM Sans fallback)

- display-xl: 80px / 600 / 1.1 — hero headlines
- display-md: 45px / 600 / 1.2 — section titles
- body-md: 16px / 400 / 1.5 — default body
- button-md: 14px / 600 — buttons

Tailwind utilities: `text-display-xl`, `text-display-md`, `text-body-lg`.

## Spacing & radius

- Section padding: 96px (`section-padding`)
- Card radius: 16px (`rounded-md`)
- Button radius: 8px (`rounded-sm`)

## Shadows

- Card: `shadow-card` — `0px 18px 60px rgba(12, 35, 26, 0.16)`
- Hover lift: `shadow-soft-lift`

## Component patterns

- **Primary button:** `bg-primary text-on-primary hover:bg-primary-bright`
- **Ghost button:** `border-ink text-ink hover:bg-ink/5`
- **Card:** `bg-paper rounded-md shadow-card`
- **Dark section:** `bg-ink text-on-ink`
- **Primary section:** `bg-primary text-on-primary` (one per viewport)

## Do's

- Alternate `canvas` / `paper` / `ink` section backgrounds
- Use accent-lime sparingly on icons
- Set `cursor-pointer` on all clickables

## Don'ts

- Don't introduce colors outside the token set
- Don't use accent-lime for text or large backgrounds
- Don't use more than one primary CTA per viewport

For the full extracted specification (YAML tokens, iteration guide, responsive rules), refer to the source skillmd export or investbamboo.com.
