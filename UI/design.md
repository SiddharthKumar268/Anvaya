# ANVAYA — Complete Product Design System

> **Product:** ANVAYA Financial Support Platform  
> **Tagline:** *Financial Support. Every step, together.*  
> **Design direction:** Calm, trustworthy, premium, Indian, human-centered financial recovery.

---

## 1. Design Vision

ANVAYA is a guided financial-recovery platform intended to help users understand, organize, and complete complex financial tasks such as claims, documentation, bank-account recovery, pension and benefit claims, asset transfer, property-related processes, and other recovery workflows.

The visual design must reduce anxiety rather than increase it. The product should feel like a **trusted financial companion**, not a trading terminal or government portal.

### Core emotional goals

- **Trust:** Users should feel their information and money-related journey are handled seriously.
- **Calm:** The interface must never feel aggressive, crowded, or alarm-heavy.
- **Guidance:** Every screen should make the next action understandable.
- **Clarity:** Financial information must be easy to scan and compare.
- **Human warmth:** Use family, nature, journey, and Indian visual cues subtly.
- **Progress:** Users should always understand where they are and what remains.

### Design keywords

`Calm` `Trustworthy` `Premium` `Human` `Indian` `Guided` `Financial` `Secure` `Natural` `Organized`

---

# 2. Visual Identity

## 2.1 Overall theme

The website combines:

- warm ivory and stone-like backgrounds,
- pale sage and muted blue atmospheric gradients,
- deep navy typography,
- muted gold financial accents,
- sage-green completion states,
- soft blue action states,
- restrained red urgency indicators,
- translucent/frosted cards,
- large rounded corners,
- generous whitespace,
- subtle botanical and Indian heritage illustrations.

The result should feel like **premium stationery + modern SaaS + financial guidance + Indian family heritage**.

## 2.2 What the design must avoid

Do not make the product look like:

- a stock-trading dashboard,
- a banking admin console,
- an overly dark fintech application,
- a neon AI product,
- a generic white SaaS template,
- a government portal with dense forms,
- a highly decorative Indian cultural website.

Indian identity should be **subtle, elegant, and embedded into the environment**, not applied as heavy ornamentation.

---

# 3. Color System

## 3.1 Brand colors

| Token | HEX | Purpose |
|---|---|---|
| `--navy` | `#0B2854` | Main brand color, headings, high-value figures |
| `--navy-dark` | `#071D3D` | Strongest text, logo, high-contrast elements |
| `--blue` | `#2576A6` | Primary actions, active navigation, links |
| `--blue-hover` | `#1E668F` | Primary hover state |
| `--blue-active` | `#185A7F` | Pressed/active state |
| `--blue-light` | `#5FA0BE` | Supporting accents and soft highlights |
| `--blue-soft` | `#A9D1DF` | Backgrounds, illustrations, soft information areas |
| `--green` | `#668C55` | Success, completed, positive financial states |
| `--green-dark` | `#4D743F` | Strong success text/icons |
| `--green-light` | `#9EB89A` | Illustration and decorative green |
| `--green-soft` | `#E4EBD9` | Completed-state backgrounds |
| `--gold` | `#D5A546` | Pending state, premium/financial accent |
| `--gold-hover` | `#C4912E` | Gold hover state |
| `--gold-light` | `#E7BE62` | Highlights |
| `--gold-soft` | `#F6EED9` | Pending-state backgrounds |
| `--red` | `#D95B4C` | Urgent, overdue, critical/error |
| `--red-dark` | `#B94338` | Strong danger text |
| `--red-soft` | `#F7E1DD` | Error/urgent backgrounds |
| `--orange` | `#D9902F` | Medium priority |
| `--orange-soft` | `#F7EBD5` | Medium-priority background |

## 3.2 Background colors

| Token | HEX | Usage |
|---|---|---|
| `--bg-primary` | `#E9EFE5` | Main application background |
| `--bg-secondary` | `#E2E9D8` | Sidebar/secondary zones |
| `--bg-warm` | `#F2EEE2` | Financial and pending zones |
| `--bg-cool` | `#E5EFF0` | Information/in-progress zones |
| `--surface` | `#F5F6EE` | Main card surface |
| `--surface-white` | `#FAFAF5` | Highest-contrast light surfaces |

## 3.3 Text colors

| Token | HEX | Usage |
|---|---|---|
| `--text-heading` | `#0B2854` | H1/H2/H3, important metrics |
| `--text-primary` | `#152D48` | Body and card text |
| `--text-secondary` | `#526579` | Supporting copy |
| `--text-muted` | `#71808A` | Metadata, labels, timestamps |
| `--text-disabled` | `#A4ADA9` | Disabled text |
| `--text-white` | `#FFFFFF` | Text on dark/colored buttons |

## 3.4 Border colors

| Token | HEX |
|---|---|
| `--border` | `#C7D6CC` |
| `--border-light` | `#D5DED5` |
| `--border-blue` | `#B8D5E1` |
| `--border-green` | `#C4D3B5` |
| `--border-gold` | `#E6CF9A` |

## 3.5 Status colors

| Status | Primary | Background | Border |
|---|---|---|---|
| Pending | `#D5A546` | `#F6EED9` | `#E6CF9A` |
| In Progress | `#3D8FBD` | `#E1EEF3` | `#B8D5E1` |
| Completed | `#668C55` | `#E4EBD9` | `#C4D3B5` |
| Urgent/Error | `#D95B4C` | `#F7E1DD` | `#E8B8B1` |
| Medium Priority | `#D9902F` | `#F7EBD5` | `#E7C99D` |
| Low Priority | `#4E8A68` | `#E3EEE5` | `#C5D7CA` |

---

# 4. Global Background Treatment

The default page background is **not flat white**.

Use a layered atmospheric background:

```css
background:
  radial-gradient(
    circle at 75% 10%,
    rgba(190, 220, 224, 0.45),
    transparent 32%
  ),
  radial-gradient(
    circle at 10% 85%,
    rgba(181, 207, 170, 0.35),
    transparent 30%
  ),
  linear-gradient(
    135deg,
    #E8EFE5 0%,
    #EEF1E8 45%,
    #E4EEE8 100%
  );
```

### Background illustration layer

Use extremely subtle environmental illustrations as a decorative watermark:

- mountains,
- clouds,
- birds,
- trees,
- leaves,
- family silhouettes,
- subtle Indian architecture.

These illustrations must remain behind the application content.

Recommended opacity: `0.10–0.30` depending on the illustration.

Never allow background artwork to reduce text readability.

---

# 5. Typography System

## 5.1 Typeface direction

Use a modern rounded sans-serif with excellent screen readability.

Recommended primary stack:

```css
font-family:
  Inter,
  "Plus Jakarta Sans",
  "Segoe UI",
  sans-serif;
```

For a more rounded branded feel, **Plus Jakarta Sans** may be used as the primary font, with Inter as fallback.

## 5.2 Type scale

| Level | Size | Weight | Color |
|---|---:|---:|---|
| Display | 40–48px | 700 | `#0B2854` |
| H1 | 32px | 700 | `#0B2854` |
| H2 | 26–28px | 700 | `#0B2854` |
| H3 | 20–22px | 650–700 | `#0B2854` |
| Section title | 18–20px | 650 | `#0B2854` |
| Body | 14–16px | 400–500 | `#152D48` |
| Label | 12–14px | 500–600 | `#526579` |
| Caption | 11–12px | 400–500 | `#71808A` |
| Metric | 28–40px | 700 | `#0B2854` |

## 5.3 Typography principles

- Use navy instead of black.
- Keep paragraphs short.
- Use bold selectively for financial values.
- Never use all-caps for large blocks of text.
- Avoid excessive font-weight variation.
- Maintain strong hierarchy between section title, card title, label, and metadata.

---

# 6. Layout System

## 6.1 Overall application layout

Desktop layout:

```text
┌──────────────── Sidebar ────────────────┐┌──────────── Main Workspace ───────────────┐
│ Logo                                    ││ Top Header                               │
│ Navigation                              │├───────────────────────────────────────────┤
│                                         ││ Page Header / Context                     │
│                                         ││                                           │
│ Support Card                            ││ Content / Dashboard                      │
│                                         ││                                           │
└─────────────────────────────────────────┘└───────────────────────────────────────────┘
```

### Desktop measurements

- Sidebar: `236–252px`
- Main workspace max width: `1440–1560px`
- Main content horizontal padding: `28–40px`
- Top header height: `82–96px`
- Section gap: `24–32px`
- Card gap: `14–20px`

## 6.2 Grid

Use a responsive 12-column grid on desktop.

Typical dashboard:

- Four summary cards: `3 / 12` columns each.
- Claim tracker: three equal-width columns.
- Bottom trust strip: four equal segments.

## 6.3 Border radius

Primary corner system:

```css
--radius-xs: 8px;
--radius-sm: 10px;
--radius-md: 14px;
--radius-lg: 18px;
--radius-xl: 22px;
--radius-pill: 999px;
```

Recommended:

- Inputs: `10–12px`
- Buttons: `10–12px`
- Cards: `16–20px`
- Large feature cards: `20–24px`
- Pills: `999px`

---

# 7. Shadows and Depth

The UI should appear lightly elevated, never floating dramatically.

```css
--shadow-soft: 0 8px 24px rgba(44, 72, 67, 0.06);
--shadow-card: 0 4px 16px rgba(44, 72, 67, 0.05);
--shadow-hover: 0 10px 28px rgba(44, 72, 67, 0.10);
```

Avoid:

- hard black shadows,
- large blur-heavy shadows,
- obvious neumorphism,
- strong glow effects.

---

# 8. Glass / Frosted Surface System

Use a subtle frosted surface for premium cards:

```css
background: rgba(248, 249, 241, 0.68);
border: 1px solid rgba(190, 207, 198, 0.72);
backdrop-filter: blur(14px);
box-shadow: 0 8px 24px rgba(44, 72, 67, 0.06);
```

Glass must remain subtle. It should read as **soft paper/frosted glass**, not futuristic glassmorphism.

---

# 9. Navigation / Sidebar

## 9.1 Sidebar structure

Order:

1. Logo
2. Primary navigation
3. Support/help panel
4. Support hours

Main navigation:

- Dashboard
- Onboarding
- Document Checklist
- Claim Tracker
- Benefit Calculator
- Asset Transfer
- No Nomination Path
- Pension & Benefits
- UDGAM Checker
- Reports
- Help & Guides
- Settings

## 9.2 Sidebar styling

```css
background: #E2E9D8;
color: #17304D;
```

Navigation item:

- Height: `44–48px`
- Radius: `10–12px`
- Icon size: `18–21px`
- Horizontal padding: `12–14px`

### Active navigation

```css
background: linear-gradient(135deg, #2576A6, #4B97BA);
color: #FFFFFF;
```

### Hover

```css
background: #D5E4D9;
color: #0B2854;
```

---

# 10. Header

The top header should contain:

- greeting,
- support message,
- search,
- notifications,
- case/account selector.

### Greeting

Example:

> Namaste! 👋

Supporting line:

> We're with you in every step of this journey. ♡

The greeting reinforces the human character of the product.

### Search

Use a wide rounded search field.

- Surface: `#F5F6EE`
- Border: `#B8D5E1`
- Search icon: `#0B2854`
- Placeholder: `#526579`
- Radius: `14px`

### Notification button

Rounded card/button with:

- pale surface,
- navy bell,
- small blue notification badge.

### Case selector

Use a softly outlined pill/card.

Text example:

`Case ID: ANV-2024-0012`

The case ID should never compete with the page heading.

---

# 11. Buttons

## Primary button

```css
background: #2576A6;
color: #FFFFFF;
border: none;
```

Hover:

```css
background: #1E668F;
```

Active:

```css
background: #185A7F;
```

## Secondary button

```css
background: #E5EFF0;
color: #0B2854;
border: 1px solid #B8D5E1;
```

## Gold action

Use only for premium/financial emphasis and pending-related action.

```css
background: #D5A546;
color: #071D3D;
```

## Destructive

```css
background: #D95B4C;
color: #FFFFFF;
```

Use destructive actions only when needed. Red should remain rare.

---

# 12. Inputs and Forms

Inputs must feel safe and easy rather than bureaucratic.

### Default input

```css
background: rgba(250, 250, 245, 0.86);
border: 1px solid #C7D6CC;
color: #152D48;
border-radius: 10px;
```

### Focus

```css
border-color: #2576A6;
box-shadow: 0 0 0 3px rgba(37, 118, 166, 0.12);
```

### Error

```css
border-color: #D95B4C;
box-shadow: 0 0 0 3px rgba(217, 91, 76, 0.10);
```

### Success

```css
border-color: #668C55;
box-shadow: 0 0 0 3px rgba(102, 140, 85, 0.10);
```

### Form labels

- Font size: `12–14px`
- Weight: `600`
- Color: `#526579`
- Margin bottom: `6–8px`

---

# 13. Dashboard Design

## 13.1 Page structure

The dashboard should contain:

1. Header
2. Progress Summary
3. Key metrics
4. Next urgent action
5. Claim Tracker
6. Trust/value proposition strip

## 13.2 Progress Summary cards

Recommended four-card layout:

### Card 1 — Claims Filed vs Pending

Visualization:

- donut chart,
- navy percentage,
- green/blue progress,
- light-grey remainder.

Semantic colors:

- Filed/positive: `#668C55`
- Progress: `#3D8FBD`
- Remaining: `#D9DDD5`

### Card 2 — Documents Collected

Use a blue progress ring:

`#2576A6`

### Card 3 — Amount Received

Use:

- sage circle,
- rupee icon,
- large navy financial amount,
- muted blue/green supporting information.

### Card 4 — Next Urgent Action

Use:

- pale blue background,
- calendar icon in a circular blue-tinted container,
- red due date,
- primary blue action button.

---

# 14. Claim Tracker Design

Three major state columns:

```text
Pending      In Progress      Done
────────     ───────────       ─────
Warm cream   Cool blue        Soft green
Gold         Blue             Green
```

## Pending

Background: `#F6EED9`

Border: `#E6CF9A`

Use for tasks that require user action.

## In Progress

Background: `#E1EEF3`

Border: `#B8D5E1`

Use for tasks currently being processed.

## Done

Background: `#E4EBD9`

Border: `#C4D3B5`

Use for completed tasks.

### Claim card contents

Each claim card should support:

- claim type/title,
- secondary identifier,
- date/deadline,
- status badge,
- priority indicator,
- optional menu.

---

# 15. Badges / Pills

Pills should be compact and soft.

### Pending

```css
background: #F6EED9;
color: #9A6E1B;
border: 1px solid #E6CF9A;
```

### In Progress

```css
background: #E1EEF3;
color: #2576A6;
border: 1px solid #B8D5E1;
```

### Completed

```css
background: #E4EBD9;
color: #4D743F;
border: 1px solid #C4D3B5;
```

### High Priority

```css
background: #F7E1DD;
color: #B94338;
```

---

# 16. Progress Indicators

Circular progress indicators should be clean and minimal.

### Ring rules

- Ring thickness: `8–12px`
- Track: `#D9DDD5`
- Primary progress: `#2576A6`
- Positive progress: `#668C55`
- Numeric value: `#0B2854`
- Supporting text: `#526579`

Avoid rainbow progress rings.

---

# 17. Financial Metrics

Financial amounts are among the most important visual elements.

### Large amount

```css
font-size: 32–40px;
font-weight: 700;
color: #0B2854;
```

Use Indian number formatting where appropriate:

`₹ 18,64,500`

Use the rupee sign prominently but do not make currency glyphs visually overpower the amount.

### Supporting line

Example:

`Across all assets`

Color:

`#526579`

---

# 18. Icons

Use a consistent outline icon family throughout the product.

Recommended icon properties:

- Stroke-based
- `1.8–2.0px` stroke
- Rounded joins/caps
- 18–22px standard UI size
- 24–32px feature size

Primary icon colors:

- Navy: navigation/context
- Blue: action/information
- Green: completion
- Gold: pending
- Red: urgency

Do not mix filled, outlined, cartoon, and 3D icon styles on the same screen.

---

# 19. Illustration System

Illustrations should be:

- soft,
- flat/low-detail,
- lightly textured,
- pastel,
- hand-crafted in appearance,
- harmonious with the UI palette.

### Illustration palette

| Element | HEX |
|---|---|
| Mountains | `#B5C9C0` |
| Clouds | `#F2F4EC` |
| Trees | `#9EB89A` |
| Leaves | `#78965E` |
| Family silhouettes | `#8BAFA8` |
| Birds | `#78A9B4` |
| Heritage architecture | `#9BB6B4` |

Decorative illustrations should generally sit between `10%` and `35%` opacity.

---

# 20. Logo Direction

The logo should communicate:

- roots,
- family,
- growth,
- stability,
- financial legacy.

The existing tree/family symbol is a strong fit for the product.

Recommended colors:

- Deep navy: `#0B2854`
- Olive/sage: `#668C55`
- Gold: `#D5A546`

The wordmark should be elegant, dark, and spacious.

---

# 21. Cards

Default card:

```css
background: rgba(248, 249, 241, 0.68);
border: 1px solid rgba(190, 207, 198, 0.72);
border-radius: 18px;
box-shadow: 0 4px 16px rgba(44, 72, 67, 0.05);
```

### Card padding

- Desktop: `20–24px`
- Tablet: `18–20px`
- Mobile: `16px`

### Card hierarchy

```text
Card title
Supporting context
────────────────
Metric / content
────────────────
Footer/status/action
```

Avoid overloading cards with too many controls.

---

# 22. Support / Help Card

The support box in the sidebar should reinforce the human nature of the product.

Visual direction:

- pale blue/green surface,
- headset/support icon,
- navy heading,
- muted supporting text,
- outlined blue CTA.

Example content:

> We're here to help  
> Compassionate support whenever you need.

The support component should feel reassuring, never promotional.

---

# 23. Core Application Modules

The design system must support the following modules:

### Dashboard

Overview of recovery progress, claims, documents, amount received, and next action.

### Onboarding

Guided multi-step data collection for financial assets and recovery information.

### Document Checklist

Track required, uploaded, verified, and missing documents.

### Claim Tracker

Track claims through pending, processing, completed, rejected, and follow-up states.

### Benefit Calculator

Estimate eligible benefits and amounts.

### Asset Transfer

Guide users through movement/transfer of financial and physical assets.

### No Nomination Path

Provide a guided recovery path when nomination information is missing.

### Pension & Benefits

Track pension, provident fund, insurance, and related benefits.

### UDGAM Checker

Provide a clearly explained workflow for checking relevant unclaimed-deposit information.

### Reports

Show progress, financial recovery, outstanding items, and action summaries.

### Help & Guides

Explain complicated financial processes in plain language.

### Settings

Profile, preferences, notifications, security, and accessibility controls.

---

# 24. Onboarding Wizard

The onboarding flow should use a guided multi-step visual system.

Recommended pattern:

```text
Step 1 → Step 2 → Step 3 → Step 4 → Step 5 → Step 6
```

The progress indicator should use:

- navy text,
- blue active state,
- sage completed state,
- muted grey for upcoming steps,
- thin connecting line.

### Active step

Blue:

`#2576A6`

### Completed step

Sage:

`#668C55`

### Upcoming

`#C7D6CC`

The form area should remain spacious and calm.

---

# 25. Tables

Tables should be lighter than conventional enterprise tables.

### Header

Background:

`#E5EFF0`

Text:

`#0B2854`

### Body

Background:

`rgba(248,249,241,0.55)`

### Row border

`#D5DED5`

### Row hover

`#EEF3EC`

Avoid heavy zebra striping.

---

# 26. Charts and Data Visualization

Charts must follow the same calm palette.

### Primary series

`#2576A6`

### Secondary series

`#668C55`

### Tertiary series

`#D5A546`

### Comparison/neutral

`#AAB8B3`

### Warning

`#D9902F`

### Danger

`#D95B4C`

Avoid using more than 5–6 visual colors in a single chart.

Charts should have:

- minimal gridlines,
- no heavy borders,
- clear labels,
- rounded/soft visual treatment where appropriate.

---

# 27. Notifications

Notifications should be short and actionable.

### Information

Blue background: `#E1EEF3`

### Success

Green background: `#E4EBD9`

### Warning

Gold background: `#F6EED9`

### Error

Red background: `#F7E1DD`

Avoid making every notification a high-priority alert.

---

# 28. Accessibility

Although the visual palette is soft, accessibility must remain a priority.

Rules:

- Do not rely on color alone to communicate status.
- Pair status colors with icons, labels, or text.
- Maintain readable contrast for all primary text.
- Focus states must be visible.
- Keyboard users must be able to navigate all interactive elements.
- Interactive controls should have at least `44px` touch targets where practical.
- Form errors must have text explanations.
- Decorative illustrations must not interfere with reading order.

---

# 29. Responsive Design

## Desktop

Use the full sidebar and multi-column dashboard.

## Tablet

- Collapse sidebar or turn it into a drawer.
- Reduce grid from 4 cards to 2 cards.
- Stack tracker columns where necessary.

## Mobile

Order content by priority:

1. Greeting/header
2. Next urgent action
3. Recovery amount/progress
4. Claims
5. Documents
6. Remaining modules

The navigation should become a drawer or bottom navigation where appropriate.

Do not simply shrink the desktop interface.

---

# 30. Mobile Card Rules

Cards become full-width.

Recommended:

- `16px` side padding
- `16px` card padding
- `14–16px` radius
- 12–16px gap
- metrics stacked vertically

Donut charts may reduce from desktop dimensions but must remain legible.

---

# 31. Motion and Animation

Animations should feel calm and reassuring.

Recommended duration:

```text
Fast interaction: 150–180ms
Standard transition: 200–250ms
Panel transition: 250–350ms
```

Use:

- fade,
- slight translate,
- scale from `0.98 → 1`,
- progress ring animation.

Avoid:

- bouncing cards,
- aggressive zooms,
- flashy gradients,
- constant background movement.

### Progress animation

Progress rings should animate from 0 to the actual percentage on initial load.

---

# 32. Microcopy Tone

The product voice is:

**supportive + simple + respectful + reassuring**.

Prefer:

> Here's what needs your attention

instead of:

> ACTION REQUIRED!!!

Prefer:

> You're almost there

instead of:

> Incomplete submission

Prefer:

> We'll guide you through the next step.

instead of:

> Complete the process.

Avoid overly technical financial/legal language unless necessary.

---

# 33. Empty States

Empty states should feel helpful rather than broken.

Structure:

```text
Illustration/Icon
Short title
1–2 lines of explanation
Optional action
```

Example:

> No claims yet  
> Add your first claim to start tracking your recovery journey.

CTA:

`+ Add Claim`

Use muted blue/green illustrations.

---

# 34. Error States

Errors should remain calm.

Use:

- soft red background,
- red icon,
- clear explanation,
- direct recovery action.

Never fill the entire screen with red.

Example:

> We couldn't verify this document yet.  
> Check the uploaded file and try again.

---

# 35. Success States

Success should use sage green, not neon green.

Example:

> Document verified  
> This document has been successfully added to your case.

Use:

- checkmark icon,
- pale green background,
- dark green title,
- navy supporting action if necessary.

---

# 36. Privacy and Security Visual Language

Security should use the visual language of:

- shields,
- locks,
- verification,
- calm blue tones.

Do not use scary warning graphics.

Recommended security color:

`#2576A6`

Supporting:

`#E1EEF3`

Example component:

> **Secure & Private**  
> Your data is safe and encrypted.

---

# 37. Design Tokens — CSS Foundation

```css
:root {
  /* Brand */
  --navy: #0B2854;
  --navy-dark: #071D3D;
  --blue: #2576A6;
  --blue-hover: #1E668F;
  --blue-active: #185A7F;
  --blue-light: #5FA0BE;
  --blue-soft: #A9D1DF;

  /* Background */
  --bg-primary: #E9EFE5;
  --bg-secondary: #E2E9D8;
  --bg-warm: #F2EEE2;
  --bg-cool: #E5EFF0;
  --surface: #F5F6EE;
  --surface-white: #FAFAF5;

  /* Text */
  --text-heading: #0B2854;
  --text-primary: #152D48;
  --text-secondary: #526579;
  --text-muted: #71808A;
  --text-disabled: #A4ADA9;
  --text-white: #FFFFFF;

  /* Green */
  --green: #668C55;
  --green-dark: #4D743F;
  --green-light: #9EB89A;
  --green-soft: #E4EBD9;

  /* Gold */
  --gold: #D5A546;
  --gold-hover: #C4912E;
  --gold-light: #E7BE62;
  --gold-soft: #F6EED9;

  /* Danger */
  --red: #D95B4C;
  --red-dark: #B94338;
  --red-soft: #F7E1DD;

  /* Orange */
  --orange: #D9902F;
  --orange-soft: #F7EBD5;

  /* Borders */
  --border: #C7D6CC;
  --border-light: #D5DED5;
  --border-blue: #B8D5E1;
  --border-green: #C4D3B5;
  --border-gold: #E6CF9A;

  /* Status */
  --status-pending: #D5A546;
  --status-progress: #3D8FBD;
  --status-completed: #668C55;
  --status-danger: #D95B4C;

  /* Financial */
  --money: #638C51;
  --money-gold: #D5A546;
  --money-bg: #E8EEDC;

  /* Glass */
  --glass-bg: rgba(248, 249, 241, 0.68);
  --glass-border: rgba(190, 207, 198, 0.72);

  /* Radius */
  --radius-xs: 8px;
  --radius-sm: 10px;
  --radius-md: 14px;
  --radius-lg: 18px;
  --radius-xl: 22px;
  --radius-pill: 999px;

  /* Shadows */
  --shadow-soft: 0 8px 24px rgba(44, 72, 67, 0.06);
  --shadow-card: 0 4px 16px rgba(44, 72, 67, 0.05);
  --shadow-hover: 0 10px 28px rgba(44, 72, 67, 0.10);
}
```

---

# 38. Component Styling Rules

## Every reusable component should define

- default state,
- hover state,
- focus state,
- active/pressed state,
- disabled state,
- loading state where applicable,
- success state where applicable,
- error state where applicable.

## Components to standardize

- Button
- IconButton
- Input
- Textarea
- Select
- SearchField
- Checkbox
- Radio
- Toggle
- Badge
- Card
- MetricCard
- ProgressRing
- Tabs
- Breadcrumbs
- Modal
- Drawer
- Tooltip
- Toast
- Alert
- DataTable
- ClaimCard
- DocumentCard
- Timeline
- Stepper
- FileUploader
- StatusIndicator
- EmptyState
- ConfirmationDialog

---

# 39. Spacing System

Use a 4px base spacing scale.

```text
4px   — xs
8px   — sm
12px  — md-xs
16px  — md
20px  — lg-xs
24px  — lg
32px  — xl
40px  — 2xl
48px  — 3xl
64px  — 4xl
```

Common rules:

- Card internal padding: `20–24px`
- Card gap: `16–20px`
- Section gap: `28–32px`
- Page top spacing: `24–32px`
- Input vertical gap: `16px`

---

# 40. Z-Index Hierarchy

Recommended:

```text
Base content        0
Background artwork  0
Cards               1
Sticky header       20
Sidebar             30
Dropdowns            50
Tooltip              60
Modal backdrop       80
Modal               90
Critical dialog     100
Toast               110
```

Background artwork must never appear above cards or readable content.

---

# 41. Accessibility / Interaction Rules

Minimum standards:

- Visible keyboard focus.
- Logical tab order.
- Descriptive labels.
- Accessible icon buttons with tooltips/ARIA labels.
- Do not communicate state using color alone.
- Use semantic HTML.
- Provide text equivalents for important visual metrics.
- Respect reduced-motion preferences.

Example:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

# 42. UX Principles by Module

| Module | Primary UX Goal | Visual Priority |
|---|---|---|
| Dashboard | Understand current position | Progress + next action |
| Onboarding | Complete data collection | Stepper + focused form |
| Documents | Know what is missing | Status + checklist |
| Claims | Track recovery | State + deadline |
| Benefits | Understand eligibility | Calculation + explanation |
| Asset Transfer | Complete transfer safely | Guided steps |
| No Nomination | Reduce complexity | Guidance + document path |
| Pension & Benefits | Find recoverable value | Financial summary |
| UDGAM Checker | Search efficiently | Search + result clarity |
| Reports | Understand outcomes | Charts + summaries |
| Help | Reduce uncertainty | Plain-language guidance |
| Settings | Manage account safely | Clear categories |

---

# 43. Dashboard Content Priority

Every dashboard screen should prioritize information in this order:

### Priority 1 — What needs attention now?

Urgent action, deadlines, missing documents.

### Priority 2 — How far have I progressed?

Claims, documents, onboarding progress.

### Priority 3 — What have I recovered?

Amount received, completed claims, assets recovered.

### Priority 4 — What comes next?

Upcoming actions, pending claims, required documents.

### Priority 5 — Where can I get help?

Support and guidance.

---

# 44. Design Rules for Financial Information

Always distinguish between:

- estimated amount,
- eligible amount,
- claimed amount,
- approved amount,
- received amount,
- pending amount.

Use labels and supporting descriptions so that users never have to infer what a number represents.

Example hierarchy:

```text
Estimated Receivable Amount
₹ 18,64,500
Across all assets
```

The number is the visual focus; the label provides context.

---

# 45. Design Rules for Deadlines

Deadline severity:

### Normal

Muted navy/grey.

### Due Soon

Gold/amber.

### Due in 1–3 days

Warm orange.

### Overdue/Critical

Soft red.

Do not make normal deadlines red.

---

# 46. Data Density

ANVAYA is a **clarity-first dashboard**, not a density-first enterprise tool.

Prefer:

`less information + stronger hierarchy`

over:

`more information + tiny text`.

Cards should be scannable within 2–4 seconds.

---

# 47. Visual Hierarchy Formula

A useful hierarchy rule for each screen:

```text
1 strong focal point
↓
2–4 supporting metrics/actions
↓
secondary details
↓
decorative/supportive content
```

Do not make every card equally prominent.

---

# 48. Do / Don't

## Do

- Use navy for authority.
- Use blue for actions.
- Use sage for successful outcomes.
- Use gold for pending/financial emphasis.
- Use red only for urgency.
- Keep illustrations subtle.
- Use large rounded cards.
- Keep layouts spacious.
- Use friendly microcopy.
- Maintain a consistent icon family.

## Don't

- Use black-heavy UI.
- Use neon green for money.
- Use bright red for ordinary statuses.
- Use excessive gradients.
- Use huge shadows.
- Fill every empty space.
- Mix icon styles.
- Use dense enterprise tables everywhere.
- Overuse Indian motifs.
- Turn every task into an alert.

---

# 49. Reference Dashboard Composition

The dashboard should visually follow this structure:

```text
┌───────────────────────────────────────────────────────────────────────┐
│ Sidebar │ Greeting                         Search  Alert  Case       │
│         ├─────────────────────────────────────────────────────────────┤
│         │ Progress Summary                         Estimated Amount  │
│         │                                                             │
│         │ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────────────────┐ │
│         │ │Claims  │ │Docs    │ │Amount  │ │Next Urgent Action   │ │
│         │ │68%     │ │72%     │ │₹...    │ │Submit LIC Claim     │ │
│         │ └────────┘ └────────┘ └────────┘ └──────────────────────┘ │
│         │                                                             │
│         │ Claim Tracker                         View All Claims       │
│         │                                                             │
│         │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│         │ │ Pending     │ │ In Progress │ │ Done        │             │
│         │ │             │ │             │ │             │             │
│         │ │ claim       │ │ claim       │ │ claim       │             │
│         │ │ claim       │ │ claim       │ │ claim       │             │
│         │ └─────────────┘ └─────────────┘ └─────────────┘             │
│         │                                                             │
│         │ Secure & Private   Trusted Guidance   Financial Clarity    │
└─────────┴─────────────────────────────────────────────────────────────┘
```

---

# 50. Brand Essence

The entire visual system should communicate the following message without saying it directly:

> **“Your financial recovery may be complicated, but you do not have to navigate it alone.”**

The interface should therefore feel like a combination of:

**financial clarity + human guidance + family trust + calm progress + Indian context.**

That is the core design language of ANVAYA.

---

# 51. Final Non-Negotiable Design Rules

1. **Background is soft ivory/sage, never stark white.**
2. **Deep navy is the primary text color, never pure black.**
3. **Primary interaction color is muted blue `#2576A6`.**
4. **Completed states use sage green `#668C55`.**
5. **Pending states use muted gold `#D5A546`.**
6. **Urgency uses restrained red `#D95B4C`.**
7. **Cards use translucent/frosted light surfaces.**
8. **Illustrations remain subtle and atmospheric.**
9. **Whitespace is a core part of the design.**
10. **Every screen must make the user's next action obvious.**
11. **Financial numbers must have clear labels and context.**
12. **The product must feel supportive, not alarming.**
13. **Indian identity should be elegant and subtle.**
14. **Accessibility must not be sacrificed for the pastel aesthetic.**
15. **All modules must use the same tokens, typography, spacing, status colors, and interaction patterns.**

---

# 52. One-Line Design Definition

**ANVAYA is a calm, premium, Indian-inspired financial recovery experience built from warm ivory surfaces, pale sage and sky-blue atmospheres, deep navy typography, muted gold and green status colors, soft illustrations, generous whitespace, and step-by-step guidance that makes complex financial recovery feel manageable.**
