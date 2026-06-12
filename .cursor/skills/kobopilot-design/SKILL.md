---
name: kobopilot-design
description: Kobopilot product branding built on Invest Bamboo design tokens. Use when building Kobopilot landing pages, dashboard, lessons, or paper-trading UI.
---

# Kobopilot Design System

Kobopilot reuses the **Invest Bamboo** visual language (see `.cursor/skills/investbamboo-design/SKILL.md`) with education-first positioning.

## Product differentiation

| Aspect | Invest Bamboo | Kobopilot |
|--------|---------------|-----------|
| Purpose | Invest & grow wealth | Learn & practice trading |
| Tagline | Dream, Invest, Live | **Learn. Practice. Trade.** |
| Hero focus | Returns & products | Lessons, quizzes, paper trading |
| CTA copy | Create account / invest | Start learning / browse lessons |

## Token source

All colors, spacing, shadows, and typography map to tokens in `app/globals.css`:

| Token | Hex | Tailwind class |
|-------|-----|----------------|
| Primary | `#004a3d` | `bg-primary`, `text-primary` |
| Primary bright | `#006652` | `hover:bg-primary-bright` |
| Ink | `#0c231a` | `text-ink`, `bg-ink` |
| Ink soft | `#80a39e` | `text-ink-soft` |
| Canvas | `#f4ede4` | `bg-canvas` |
| Paper | `#fefdfc` | `bg-paper` |
| Accent lime | `#e6ff55` | `text-accent-lime` (icons only) |
| Success | `#00a239` | `text-success` |

## Typography

- Font: **DM Sans** (Haffer XH fallback via `next/font/google`)
- Utilities: `text-display-xl`, `text-display-md`, `text-display-sm`, `text-body-lg`
- Section rhythm: `section-padding` (96px vertical on large screens)

## Layout

- Marketing: alternating `bg-canvas` / `bg-paper` / `bg-ink` / `bg-primary` sections
- App shell: `bg-primary-deep` sidebar, `bg-paper` content area
- Cards: `bg-paper`, `rounded-md`, `shadow-card`, hover `shadow-soft-lift`

## Rules

1. Use `{colors.accent-lime}` only for small icons/badges — never body text
2. One primary CTA per viewport (`bg-primary`)
3. Paper mode badge uses `bg-accent-lime text-ink`
4. All interactive elements need `cursor-pointer` (set globally in `globals.css`)
