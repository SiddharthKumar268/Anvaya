# ANVAYA — UI/UX Design Documentation

**Tagline:** Financial Support. Every step, together.
**Product type:** Financial recovery / claims-and-benefits companion for Indian families
**Design mood:** Calm, premium, trustworthy, human — not a "trading terminal"

---

## 1. Design Philosophy

ANVAYA is built around one emotional goal: **"I am safe here. Someone is guiding me."**

The product helps people through inherently stressful processes — insurance claims, pension/benefits, bank account settlement, asset transfer — so the interface deliberately avoids the visual language of typical fintech dashboards (dark navy + bright green + stark white + neon accents). Instead it leans on:

- Soft, pastel, low-saturation colors
- Warm ivory / sage backgrounds instead of pure white
- Deep navy typography for authority without harshness
- Subtle Indian heritage and nature motifs (mountains, trees, birds, family silhouettes, heritage architecture) as low-opacity watermarks
- Frosted-glass / translucent cards rather than flat solid panels
- Generous whitespace and rounded, friendly geometry

**One-line design language:** Warm ivory/sage base + blue atmospheric gradient + extremely subtle illustrated watermark + translucent cards + deep navy typography + muted blue CTAs + sage success states + gold pending states + very soft shadows + large rounded corners + generous whitespace.

---

## 2. Color System

### 2.1 Core Brand Colors

| Name | Hex | Usage |
|---|---|---|
| Deep Navy | `#0B2854` | Headings, key numbers, primary text |
| Navy Dark | `#071D3D` | Logo, strongest text, footer headings |
| Primary Blue | `#2576A6` | Main buttons, active nav, links |
| Blue Light | `#5FA0BE` | Hover states, secondary accents |
| Sky Blue | `#A9D1DF` | Soft backgrounds, illustrations |
| Sage Green | `#78965E` | Success, completed states, nature elements |
| Deep Sage | `#557A49` | Strong green text/icons |
| Muted Gold | `#D5A546` | Pending, premium accents, financial highlights |
| Warm Gold | `#E7BE62` | Gold hover/highlight |
| Soft Red | `#D95B4C` | Urgent deadlines, errors, high priority |

### 2.2 Non-Negotiable Core Palette (lock these first)

| Role | Hex |
|---|---|
| Deep Navy | `#0B2854` |
| Primary Blue | `#2576A6` |
| Soft Blue | `#5FA0BE` |
| Sage Green | `#668C55` |
| Pale Sage | `#E4EBD9` |
| Gold | `#D5A546` |
| Pale Gold | `#F6EED9` |
| Main Background | `#E9EFE5` |
| Surface | `#F5F6EE` |
| Urgent Red | `#D95B4C` |

### 2.3 Backgrounds

| Token | Hex | Use |
|---|---|---|
| `--bg-primary` | `#E9EFE5` | Main app background — pale sage/stone, never pure white |
| `--bg-secondary` | `#E2E9D8` | Sidebar, secondary sections, large areas |
| `--bg-warm` | `#F2EEE2` | Pending sections, financial cards, gold-themed areas |
| `--bg-cool` | `#E5EFF0` | Info cards, in-progress areas, document sections |
| `--surface` | `#F5F6EE` | Replaces pure white surfaces |
| `--surface-white` | `#FAFAF5` | Lightest surface variant |

Background gradient (used behind the whole canvas, very subtle, no hard edges):

```css
background:
  radial-gradient(circle at 75% 10%, rgba(190,220,224,0.45), transparent 32%),
  radial-gradient(circle at 10% 85%, rgba(181,207,170,0.35), transparent 30%),
  linear-gradient(135deg, #E8EFE5 0%, #EEF1E8 45%, #E4EEE8 100%);
```

### 2.4 Typography Colors

| Token | Hex | Use |
|---|---|---|
| `--text-heading` | `#0B2854` | H1/H2, "Namaste!" greeting |
| `--text-primary` | `#152D48` | Body copy |
| `--text-secondary` | `#526579` | Supporting text |
| `--text-muted` | `#71808A` | Metadata, timestamps |
| `--text-disabled` | `#A4ADA9` | Disabled state |
| `--text-white` | `#FFFFFF` | On dark/blue surfaces |

Never use pure black (`#000000`).

### 2.5 Cards & Borders

```css
--card: rgba(248, 248, 239, 0.72);      /* translucent/frosted */
--card-solid: #F5F6EE;                   /* fallback */
--border: #C7D6CC;
--border-light: #D5DED5;
```

Glass/frosted card treatment:

```css
background: rgba(248, 249, 241, 0.68);
border: 1px solid rgba(190, 207, 198, 0.72);
backdrop-filter: blur(14px);
box-shadow: 0 8px 24px rgba(44, 72, 67, 0.06); /* soft, never black */
```

### 2.6 Buttons (Primary CTA)

| State | Hex |
|---|---|
| Normal | `#2576A6` |
| Hover | `#1E668F` |
| Active | `#185A7F` |
| Light/tint | `#D5E9F0` |
| Text on button | `#FFFFFF` |

### 2.7 Semantic / Status Colors

**Pending (warm gold/cream)**
```css
--pending: #D5A546;
--pending-dark: #B98220;
--pending-bg: #F6EED9;
--pending-border: #E6CF9A;
```

**In Progress (cool blue)**
```css
--progress: #3D8FBD;
--progress-dark: #2576A6;
--progress-bg: #E1EEF3;
--progress-border: #B8D5E1;
```

**Completed (sage green)**
```css
--success: #668C55;
--success-dark: #4D743F;
--success-bg: #E4EBD9;
--success-border: #C4D3B5;
```

**Urgent (soft red — use sparingly)**
```css
--danger: #D95B4C;
--danger-dark: #B94338;
--danger-bg: #F7E1DD;
--danger-border: #E8B8B1;
```

**Priority scale**
| Priority | Hex |
|---|---|
| High | `#D95B4C` |
| Medium | `#D9902F` |
| Low | `#4E8A68` |

### 2.8 Financial / Rupee Colors

```css
--money: #638C51;        /* rupee icon */
--money-gold: #D5A546;
--money-bg: #E8EEDC;
```
Rupee amounts (e.g. ₹18,64,500) render in `--text-heading` (`#0B2854`); the ₹ icon itself uses `--money`.

### 2.9 Sidebar

```css
--sidebar-bg: #E2E9D8;
--sidebar-text: #17304D;
--sidebar-icon: #17304D;
--sidebar-hover: #D5E4D9;
--sidebar-active: #2576A6;
--sidebar-active-text: #FFFFFF;
```
Optional active-item gradient: `linear-gradient(135deg, #2576A6, #4B97BA)`.

The sidebar stays **light**, integrated with the main background — not a dark nav panel — so the whole app reads as one cohesive surface.

### 2.10 Background Illustrations (watermark layer)

Faded, low-opacity nature/heritage motifs sit behind content — mountains, clouds, trees, leaves, birds, family silhouettes, heritage architecture (e.g., an India Gate–style arch).

| Element | Hex | Opacity |
|---|---|---|
| Mountains | `#B5C9C0` | 0.15–0.35 |
| Clouds | `#F2F4EC` | 0.15–0.35 |
| Trees | `#9EB89A` | 0.15–0.35 |
| Leaves | `#78965E` | 0.15–0.35 |
| Family silhouettes | `#8BAFA8` | 0.15–0.35 |
| Birds | `#78A9B4` | 0.15–0.35 |
| Heritage architecture | `#9BB6B4` | 0.15–0.35 |

Symbolism: roots → family → journey → growth → stability → recovery. The mountain line communicates "you are moving through this, step by step."

### 2.11 Full CSS Variable Block

```css
:root {
  /* BRAND */
  --navy: #0B2854;
  --navy-dark: #071D3D;
  --blue: #2576A6;
  --blue-hover: #1E668F;
  --blue-active: #185A7F;
  --blue-light: #5FA0BE;
  --blue-soft: #A9D1DF;

  /* BACKGROUNDS */
  --bg-primary: #E9EFE5;
  --bg-secondary: #E2E9D8;
  --bg-warm: #F2EEE2;
  --bg-cool: #E5EFF0;
  --surface: #F5F6EE;
  --surface-white: #FAFAF5;

  /* TEXT */
  --text-heading: #0B2854;
  --text-primary: #152D48;
  --text-secondary: #526579;
  --text-muted: #71808A;
  --text-disabled: #A4ADA9;
  --text-white: #FFFFFF;

  /* GREEN / SUCCESS */
  --green: #668C55;
  --green-dark: #4D743F;
  --green-light: #9EB89A;
  --green-soft: #E4EBD9;

  /* GOLD / PENDING */
  --gold: #D5A546;
  --gold-hover: #C4912E;
  --gold-light: #E7BE62;
  --gold-soft: #F6EED9;

  /* RED / URGENT */
  --red: #D95B4C;
  --red-dark: #B94338;
  --red-soft: #F7E1DD;

  /* ORANGE / MEDIUM PRIORITY */
  --orange: #D9902F;
  --orange-soft: #F7EBD5;

  /* BORDERS */
  --border: #C7D6CC;
  --border-light: #D5DED5;
  --border-blue: #B8D5E1;
  --border-green: #C4D3B5;
  --border-gold: #E6CF9A;

  /* SIDEBAR */
  --sidebar-bg: #E2E9D8;
  --sidebar-text: #17304D;
  --sidebar-hover: #D5E4D9;
  --sidebar-active: #2576A6;

  /* STATUS */
  --status-pending: #D5A546;
  --status-progress: #3D8FBD;
  --status-completed: #668C55;
  --status-danger: #D95B4C;

  /* FINANCIAL */
  --money: #638C51;
  --money-gold: #D5A546;
  --money-bg: #E8EEDC;

  /* ICONS */
  --icon-primary: #2576A6;
  --icon-secondary: #526579;
  --icon-success: #668C55;
  --icon-warning: #D5A546;
  --icon-danger: #D95B4C;

  /* GLASS */
  --glass-bg: rgba(248, 249, 241, 0.68);
  --glass-border: rgba(190, 207, 198, 0.72);
  --shadow-soft: 0 8px 24px rgba(44, 72, 67, 0.06);
  --shadow-card: 0 4px 16px rgba(44, 72, 67, 0.05);
}
```

### 2.12 Rules — What to Avoid

- No bright/neon greens or blues
- No pure `#000000` or overused pure `#FFFFFF`
- No highly saturated gradients
- No hard drop shadows (always soft, warm-tinted shadows, never pure black)
- Red is a sparing accent, never a dominant color

### 2.13 Overall Color Balance (visual weight)

| Share | Element |
|---|---|
| 60–65% | Soft ivory / sage / blue-grey background |
| 15–20% | Translucent cream/white cards |
| 8–10% | Blue interaction elements |
| 5–8% | Sage green |
| 2–4% | Gold / amber |
| 1–2% | Red urgency indicators |
| — | Dark navy reserved for typography/key numbers |

---

## 3. Layout & Navigation

### 3.1 Global Structure

- **Left sidebar** (fixed, light sage `--sidebar-bg`): logo/brand block, primary navigation, "We're here to help" support card, sign-off.
- **Top bar**: hamburger/menu toggle, page greeting ("Namaste! 👋" + subtitle), global search, notifications bell (with count badge), case/profile chip (e.g. "Case ID: ANV-2024-0012").
- **Main canvas**: scrollable content area over the illustrated watermark background, organized into card-based sections.

### 3.2 Sidebar Navigation (top to bottom)

1. Logo — tree icon (family/roots motif) + "ANVAYA" wordmark + tagline
2. Dashboard (active state uses `--sidebar-active` blue pill)
3. Onboarding
4. Document Checklist
5. Claim Tracker
6. Benefit Calculator
7. Asset Transfer
8. No Nomination Path
9. Pension & Benefits
10. UDGAM Checker
11. Reports
12. Help & Guides
13. Settings
14. Support card (fixed near bottom): "We're here to help — Compassionate support whenever you need." + "Contact Support" button + hours (Mon–Sat, 9 AM–7 PM)

Icons throughout: thin-line/outlined style, colored in navy/blue/green/gold — never solid black.

### 3.3 Top Bar Elements

- Menu/hamburger toggle (collapses sidebar)
- Greeting: "Namaste! 👋" (large navy heading) + "We're with you in every step of this journey. 🤍"
- Search bar: "Search anything…" with search icon, pill-shaped, light surface
- Notification bell with numeric badge (red/gold dot)
- Case ID chip with avatar + dropdown chevron

---

## 4. Dashboard — Component Inventory

### 4.1 Progress Summary (section header)
Icon + "Progress Summary" heading, subtitle "Your recovery journey at a glance."

Four stat cards in a row, each a translucent frosted card:

1. **Claims Filed vs Pending**
   - Circular progress ring (sage green = filed portion, light grey = pending portion), center label "68% Progress"
   - Side stats: "17 Filed", "8 Pending"
   - Footer: "Total: 25 Claims"

2. **Documents Collected**
   - Circular progress ring, blue fill, center "72% Progress"
   - Side stats: "36 Collected", "14 Remaining"
   - Footer: "Total: 50 Documents"

3. **Amount Received**
   - Large pale-green circular icon container with ₹ symbol
   - "₹7,48,900 — Received so far"
   - Footer: "40% of total estimated"

4. **Next Urgent Action** (soft blue-tinted card, visually distinct)
   - Calendar icon in pale blue circle
   - "Submit LIC Claim Form"
   - Deadline in muted red: "Due in 5 days"
   - Primary blue button: "View Action →"

Top-right standalone card: **Estimated Receivable Amount** — "₹18,64,500 — Across all assets", wallet/coins illustration, chevron to drill in.

### 4.2 Claim Tracker (three-column kanban)

Section header: clipboard icon + "Claim Tracker", right-aligned "View All Claims →" link.

**Column 1 — Pending (warm cream/gold background, hourglass icon, count badge)**
Each claim card shows: icon, claim name, reference/policy number, a "Due in N days" pill (gold), deadline date (red text), priority dot + label (High/Medium/Low).
Examples: LIC Policy Claim (High), EPFO/PF Claim (Medium), Bank Account Settlement (Medium).
Footer: "+ Add Claim" link.

**Column 2 — In Progress (cool blue-grey background, hourglass icon, count badge)**
Each card: icon, claim/process name, sub-detail (account type), "In progress" status pill (blue), applied-on date, priority dot.
Examples: Property Mutation (Medium), Post Office Scheme (Low), HDFC Bank FD Closure (Medium).
Footer: "+ Add Claim" link.

**Column 3 — Done (soft sage background, checkmark icon, count badge)**
Each card: icon, claim name, account/reference number, "Completed" pill (green), completion date.
Examples: PMJJBY Claim, Sukanya Samriddhi A/c, Demat Account Transfer.
Footer: "+ Add Claim" link.

Card anatomy (shared across all three columns):
- Icon badge (left, tinted circle matching column color)
- Title (navy, semibold)
- Meta line (muted grey, reference numbers/account IDs)
- Status/priority pill (top-right, pill-shaped, column-appropriate color)
- Date/deadline line (colored per urgency)

### 4.3 Bottom Trust Strip

Full-width band, very light blue-green translucent background, four equal columns, each: large circular icon container + bold label + short supporting line.

1. Shield icon — "Secure & Private" — "Your data is safe and encrypted"
2. People icon — "Trusted Guidance" — "Step-by-step help from experts"
3. Rupee/hands icon — "Financial Clarity" — "Know what you are entitled to receive"
4. Heart/hand icon — "Built for India" — "Designed for every Indian family"

Purpose: reframes the product from "financial software" to "trusted financial recovery companion."

### 4.4 Background Illustration Layer

Full-bleed, very low-opacity watermark behind the entire dashboard: distant mountains, birds in flight, a family silhouette (parent + two children) walking beside a tree, botanical/leaf clusters bottom-left, and a heritage arch motif (India Gate–style) bottom-right. Opacity kept low (~0.15–0.35) so it never competes with foreground content — it should read as texture, not imagery.

---

## 5. Component Design Patterns

### 5.1 Cards (general rule)
- Never pure white — always `--card` translucent or `--surface`
- Large border radius (16–20px)
- Thin border in `--border` / `--border-light`
- Minimal, warm-tinted shadow (`--shadow-soft` / `--shadow-card`), never black
- Generous internal padding, lots of whitespace

### 5.2 Progress Rings
- Track color: light grey/sage for the "remaining" portion
- Fill color: semantic (sage for claims, blue for documents)
- Bold navy percentage in the center
- Paired with a numeric breakdown beside the ring, not just the ring alone

### 5.3 Status Pills / Badges
- Pill/rounded-rectangle shape
- Background = soft tint (e.g. `--pending-bg`), text = the darker tone of the same family (e.g. `--pending-dark`)
- Never a solid saturated fill with white text except on primary buttons

### 5.4 Priority Indicators
- Small colored dot + label text, not a full badge — keeps the card visually light
- High = red, Medium = orange/gold, Low = green

### 5.5 Buttons
- Primary: solid `--blue` fill, white text, rounded corners, arrow icon for forward actions ("View Action →")
- Secondary/tertiary: text links in `--blue`, often with a trailing arrow ("View All Claims →", "+ Add Claim")

### 5.6 Icons
- Thin-line/outlined style throughout (Home, User, Documents, Clipboard, Calculator, Transfer arrows, Shield, Search, Settings, Calendar, Bank, Folder, Rupee, Heart, People)
- Colored (navy/blue/green/gold), never flat black
- Typically housed in a soft circular tinted container when used as a card's leading visual

### 5.7 Typography Hierarchy
| Level | Style |
|---|---|
| H1 | Large bold navy (page greeting, "Namaste!") |
| H2 | Medium-weight navy (section titles: "Progress Summary", "Claim Tracker") |
| H3 | Dark blue/navy, semibold (card titles) |
| Body/Supporting | `--text-secondary` muted navy-grey |
| Metadata | `--text-muted`, smaller size, sometimes semantic color (dates, IDs) |

No pure black text anywhere in the system.

---

## 6. Semantic Color Language (quick reference)

| Meaning | Color |
|---|---|
| Money / financial value | Green (`--money`) with navy amount text |
| Information / in-progress | Blue |
| Attention / pending | Gold |
| Urgency / danger | Red (sparingly) |
| Success / completed | Sage green |

This lets users read dashboard state by color alone, before reading any text.

---

## 7. Accessibility & Tone Notes

- Maintain sufficient contrast between navy text and pale backgrounds (verify against WCAG AA, especially `--text-muted` on `--bg-warm`/`--bg-cool`)
- Reserve red strictly for genuine urgency — overuse breaks the "calm, reassuring" premise
- Keep watermark illustrations subtle enough that they never reduce text legibility
- Copy tone should stay warm and human ("Namaste!", "We're with you in every step of this journey") rather than clinical/corporate

---

## 8. Summary

ANVAYA's UI/UX is a **soft, Indian-inspired financial wellness dashboard** built from: frosted ivory surfaces, pale sage and sky-blue atmospheric gradients, deep navy typography, muted gold accents, botanical/family/heritage watermark illustrations, and a clear semantic color language (blue = in progress, gold = pending, green = done, red = urgent) — all in service of a single emotional goal: making a stressful financial-recovery process feel calm, guided, and trustworthy.
