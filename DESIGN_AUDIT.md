# Paisa Pulse — Visual System Audit (against landing-page-design skill Part B)

**App type:** Authenticated dashboard / finance app (not a landing page)
**Scope note from skill:** "Apply to all web UI work: landing pages, marketing sites, components, dashboards, prototypes, and design reviews."

---

## Critical Violations (Must Fix)

### B1 Typography — Font Family
| File | Line | Current | Required | Severity |
|------|------|---------|----------|----------|
| `src/app/layout.tsx` | 52 | `Inter` (400-800) | **Geist, Manrope, or Poppins only** — Inter is explicitly banned | 🔴 Critical |
| `src/app/globals.css` | 6 | `--font-inter` system stack | Replace with approved font | 🔴 Critical |

### B1 Typography — Font Weights
| File | Line | Current | Required | Severity |
|------|------|---------|----------|----------|
| `layout.tsx:52` | 52 | `wght@400;500;600;700;800` | Cap at **semibold (600) / bold (700)** — no 800/black | 🔴 Critical |
| `Button.tsx` | 30 | `font-medium` (500) | Buttons must use `Button-*` named styles (semibold) | 🟡 High |
| Many | — | `font-extrabold`, `font-bold` | Only allowed in Heading styles (semibold) | 🟡 High |

### B1 Typography — Arbitrary Font Sizes (Not on Tailwind Scale)
| File | Examples | Required |
|------|----------|----------|
| `StatusLayout.tsx` | `text-[10px]`, `text-[11px]`, `text-[9px]` | **Snap to nearest scale step below** (xs=12px, sm=14px, base=16px, lg=18px, xl=20px, 2xl=24px, 3xl=30px, 4xl=36px, 5xl=48px) |
| `AuthGate.tsx` | `text-[11px]`, `text-[10px]` | Same |
| `QuestModal.tsx` | `text-[11px]`, `text-[10px]` | Same |
| `StatusWindow.tsx` | `text-[10px]`, `text-[11px]` | Same |
| `Button.tsx` | `text-xs` (12px) for sm — OK, but `text-sm` for md, `text-base` for lg — map to Button-* styles | Use named Button styles |

### B1 Typography — No Named Text Styles
**Current:** Loose `text-*` + `font-*` utilities everywhere
**Required:** Every text element uses one of:
- **Heading 1-6** (page/section headings)
- **Title 1-5** (card titles, list items, nav labels)
- **Body 1-6** (running text)
- **Button lg/md/sm/xsm** (button text only)
- **Caption 1-5** (metadata, badges, timestamps)

### B1 Typography — Hyphens in Copy (Banned)
| File | Violations |
|------|------------|
| `AuthGate.tsx` | "256-Bit", "self-directed", "zero-JS", "in-app" |
| `StatusLayout.tsx` | "Net-Balance" (concept), "UID-isolation" |
| `globals.css` | "zero-JS" in comment |
| Many | "side-by-side", "step-by-step" patterns |

**Fix:** Rewrite phrases without hyphens.

### B1 Typography — Orphaned Words
**Current:** No `text-wrap: balance` (headings) or `text-wrap: pretty` (body)
**Required:** Apply globally.

---

### B2 Spacing — Values Outside Token Set
**Allowed tokens only:** 0, 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96px
**Tailwind mapping:** `0, 0.5, 1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24`

| Pattern | Found | Must become |
|---------|-------|-------------|
| `px-3.5` (14px) | Button, Input, Select, many | `px-3` (12px) or `px-4` (16px) |
| `py-1.5` (6px) | Button sm, tabs | `py-1` (4px) or `py-2` (8px) |
| `gap-1.5` (6px) | Widespread | `gap-1` (4px) or `gap-2` (8px) |
| `gap-2.5` (10px) | Widespread | `gap-2` (8px) or `gap-3` (12px) |
| `p-3.5` (14px) | Cards, modals | `p-3` (12px) or `p-4` (16px) |
| `text-[10px]` | Widespread | `text-xs` (12px) |
| `text-[11px]` | Widespread | `text-xs` (12px) |
| `text-[9px]` | StatusLayout | `text-xs` (12px) |
| `h-2` (8px) progress | ProgressBar sm | OK (Spacing-75) |
| `h-2.5` (10px) progress | ProgressBar md | `h-2` or `h-3` |
| `h-3.5` (14px) progress | ProgressBar lg | `h-3` (12px) or `h-4` (16px) |

---

### B3 Corner Radius — Nested Radius Formula Not Applied
**Rule:** When inner shape sits inside outer with gap < 32px: `inner = outer − gap` (min 2px)
**Current:** Arbitrary `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-full` with no relationship.

| Example | Outer | Gap | Inner should be | Actual |
|---------|-------|-----|-----------------|--------|
| Card (2xl=16px) with p-4 (16px gap) | 16px | 16px | 0px → leave square | inner elements use rounded-xl (12px) |
| Modal (3xl=24px) with p-6 (24px gap) | 24px | 24px | 0px → leave square | content uses no radius |
| Button in Card | — | — | — | Button uses rounded-xl independent of card |

---

### B4 Borders & Backgrounds — Gradients in Backgrounds (Banned)
**Rule:** "Never use gradients in backgrounds. Backgrounds are flat."

| File | Violations |
|------|------------|
| `globals.css` | Body: dual `radial-gradient` (lines 44-46, 53-55) |
| `globals.css` | `.card-3d`: `linear-gradient` overlay (line 64) |
| `Button.tsx` | All variants: `bg-gradient-to-b` (lines 40, 42, 44, 46, 48, 50) |
| `ProgressBar.tsx` | All variants: `bg-gradient-to-r` (lines 30-39) |
| `AuthGate.tsx` | Multiple gradient backgrounds (lines 176, 178, 239, 294, 331) |
| `StatusLayout.tsx` | Sidebar gradient (line 280), icon boxes, badges |
| `StatusWindow.tsx` | Mochi card gradient (line 446), metric cards |
| `Card.tsx` | `.subtle` variant uses gradient-like `shadow-inner` |

**Allowed gradient:** **Only** hero heading text (B5) — left-to-right `#FFFFFF → #9B9B9B` (dark) or `#000000 → #666666` (light).

---

### B4 Borders — Single-Sided Borders on Cards (Banned)
**Rule:** "Never apply a border to only one side of a card. Borders go all the way around or not at all."

| File | Violations |
|------|------------|
| `StatusLayout.tsx` | `border-t`, `border-b`, `border-r` on nav items, cards, footer dock |
| `StatusWindow.tsx` | `border-t` on metric cards, `border-b` on CardHeader |
| `QuestModal.tsx` | `border-t` on footer |
| `AuthGate.tsx` | `border-t` on footer, `border-b` on header |
| `Card.tsx` | `CardHeader` uses `border-b` |
| `Modal.tsx` | Header uses `border-b` |

---

### B4 Dark Mode Backgrounds — Non-Compliant Colors
**Allowed only:** `#000000`, `#181818`, `#1F1F1F`, `#272727`, `#313131`, `#131209`

| File | Current | Allowed? |
|------|---------|----------|
| `globals.css` | `#090d16`, `#131926`, `#1c2436` | ❌ No |
| `layout.tsx` | `bg-[#090d16]` | ❌ No |
| `AuthGate.tsx` | `bg-[#090d16]`, `dark:bg-[#0f1522]` | ❌ No |
| `StatusLayout.tsx` | `dark:from-[#111726]`, `dark:to-[#0b0f19]` | ❌ No |

---

### B6 Icons — Not from Approved Sets
**Approved:** Phosphor, Solar, Iconamoon
**Current:** Inline custom SVGs + emoji (🍡, 💬, 📊, ☁️, ⚠️, ✕, 🛡️, 🌸, 🍵, 📝, 📅, 💰, 🔒)

---

### B7 Motion — Wrong Easing & Duration
**Required base curve:** `ease-[cubic-bezier(0.22,1,0.36,1)]` with `duration-500` for layout/position
**Allowed shorter:** `duration-300` for color/opacity hover (never < 200ms)

| File | Current | Required |
|------|---------|----------|
| `globals.css` | `.card-3d:hover`: `duration-180` `cubic-bezier(0.22,1,0.36,1)` | `duration-500` |
| `Button.tsx` | `duration-150` | `duration-500` (transform) or `duration-300` (color) |
| `ProgressBar.tsx` | `duration-300 ease-out` | `duration-500` base curve |
| `Modal.tsx` | `duration-150` `animate-in zoom-in-95` | `duration-500` base curve |
| `StatusLayout.tsx` | `duration-150`, `duration-200` | `duration-500` base curve |
| `QuestModal.tsx` | `duration-150` | `duration-500` base curve |

**Banned animations:** `width`/`height` on ProgressBar (line 55: `style={{ width: ... }}`) — must animate `transform` only.

---

### B7 Navigation — Not Compliant
| Requirement | Current | Status |
|-------------|---------|--------|
| Floating bar off top edge, centered, content-sized | Fixed full-height sidebar | ❌ |
| Translucent surface + background blur | Opaque sidebar | ❌ |
| Menu toggle icon transforms (animated) | Hamburger → X (instant swap) | ❌ |
| Mobile: full-height panel, high-opacity surface + strong blur | Drawer (w-72), no strong blur | ❌ |
| Link entrance: staggered 60ms, 24px rise, 400ms cap | No stagger animation | ❌ |

---

### B7 Scroll Reveals — Missing
**Required:** Sections rise 32px + fade 600-800ms on base curve via IntersectionObserver
**Current:** None

---

### B8 Content Realism
| Issue | Examples |
|-------|----------|
| Placeholder copy | "Your money, clearly in view", "Personal Finance Vault", "Self-directed privacy" |
| Emoji as icons | 🍡, 💬, 📊, ☁️, ⚠️, ✕, 🛡️, 🌸, 🍵 |
| Banned filler words | "effortless" (AuthGate:350), "seamless" (layout.tsx:24) |

---

### B9 States — Incomplete
| Requirement | Current |
|-------------|---------|
| Hover | Partial (cards, buttons, nav) |
| Active (`scale(0.98)` or `translateY(1px)`) | Buttons have `active:translate-y-[1px] active:scale-[0.99]` — good |
| Focus ring | Global `focus-visible` in globals.css — good |
| Loading: skeleton loaders (not spinners) | **Circular spinners** in Button, QuestModal — ❌ |
| Empty: composed "getting started" view | EmptyState component exists — partial |
| Error: inline, specific, no alert() | Inline errors in Input/Select — good |
| No dead links | Some nav items use `#` in modals — check |
| Current page indicated in nav | Active state exists — good |
| Skip-to-content link | **Missing** — ❌ |

---

### B10 Ship Requirements — Missing
| Requirement | Status |
|-------------|--------|
| Privacy policy & terms links in footer | AuthGate has modals, but not in main app footer |
| Custom branded 404 | Missing |
| Client-side form validation (email, required) | Partial (required on date, amount) |
| Skip-to-content link | **Missing** |
| Cookie consent | Missing (may not apply) |
| Branded favicon | SVG icon exists — check if branded |
| `<title>`, meta description, `og:image`, social tags | Basic metadata in layout.tsx — no og:image |
| Alt text on meaningful images | No images in dashboard |
| Semantic HTML (`<nav>`, `<main>`, `<article>`, `<aside>`, `<section>`) | Uses `<aside>`, `<main>`, `<nav>` — good |
| Way back from every page | Sidebar provides — good |
| 390px check: no horizontal overflow | Needs verification |

---

### B11 Tagline Reveal — N/A (Dashboard)

---

## Summary: Remediation Priority

### Phase 1: Foundation (Do First)
1. **Swap font**: Inter → Geist or Manrope (update layout.tsx, globals.css, tailwind config)
2. **Define named text styles** as CSS classes / Tailwind components (Heading 1-6, Title 1-5, Body 1-6, Button, Caption 1-5)
3. **Audit all font sizes** → snap to Tailwind scale steps
4. **Remove hyphens** from all copy
5. **Add `text-wrap: balance/pretty`** globally

### Phase 2: Spacing & Radius System
6. **Replace all spacing** with token values only (create spacing scale map)
7. **Implement nested radius formula** for all card/button/input nesting
8. **Remove all single-sided borders** → full border or none

### Phase 3: Colors & Gradients
9. **Remove all background gradients** (body, cards, buttons, progress bars, modals)
10. **Flatten backgrounds** to allowed dark mode palette
11. **Hero gradient text only** (if any landing page added later)

### Phase 4: Motion & Interaction
12. **Standardize easing** to `cubic-bezier(0.22,1,0.36,1)` + `duration-500` (layout) / `duration-300` (color)
13. **Replace width/height animations** with transform
14. **Add prefers-reduced-motion** handling to components (not just globals.css)
15. **Implement scroll reveals** with IntersectionObserver
16. **Fix navigation** to match floating/blur/stagger spec (or document why dashboard nav differs)

### Phase 5: Icons & Assets
17. **Replace all icons** with Phosphor/Solar/Iconamoon (install package)
18. **Remove emoji** from UI

### Phase 6: States & Polish
19. **Replace loading spinners** with skeleton loaders
20. **Add skip-to-content link**
21. **Add custom 404 page**
22. **Complete meta tags** (og:image, etc.)
23. **Verify 390px viewport**

---

## Files to Modify (Priority Order)

| Phase | Files |
|-------|-------|
| 1 | `layout.tsx`, `globals.css`, `tailwind.config.ts` (new), `src/lib/textStyles.ts` (new) |
| 2 | All component files (Button, Card, Input, Select, Modal, ProgressBar, Badge, EmptyState, StatusWindow, QuestModal, StatusLayout, AuthGate) |
| 3 | `globals.css`, `Button.tsx`, `ProgressBar.tsx`, `AuthGate.tsx`, `StatusLayout.tsx`, `StatusWindow.tsx` |
| 4 | `globals.css`, all interactive components, new `ScrollReveal.tsx` |
| 5 | All files using inline SVG/emoji → install `@phosphor-icons/react` or similar |
| 6 | `Button.tsx`, `QuestModal.tsx`, `StatusLayout.tsx`, `app/layout.tsx`, `app/not-found.tsx` (new) |

---

## Notes for Dashboard Context

The skill is landing-page-oriented. For a dashboard/app:
- **Navigation** (B7) can differ — but floating top bar + mobile drawer with blur/stagger is still the quality bar
- **Hero section** (B5) — not applicable
- **Tagline reveal** (B11) — not applicable
- **Page structure** (A2) — not applicable
- **Visual system (B1-B10)** — fully applicable per scope note

**Recommendation:** Treat the dashboard as "Operate" mode (per Impeccable modes): scanability, consistency, native expectations outrank expression. But the visual system (tokens, type scale, motion, radius, spacing) must still comply.