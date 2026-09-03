# Handoff: Coffer — Today, Budgets, Worth

## Overview
Coffer is a personal-finance app for a freelancer with irregular contract income, holdings in more than one currency (USD and Lebanese lira), and no interest in a monthly budgeting ritual. The core idea: the app answers "how long can I keep going?" before it answers anything else, and logging an expense takes five seconds from a cold start.

This bundle covers three of the app's six tabs, in two competing visual directions plus a light/dark theming layer.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing intended look and behaviour, not production code to copy. The task is to **recreate these designs in the target codebase's existing environment** (React Native, SwiftUI, Flutter, web, whatever the app is) using that codebase's established patterns, component library and navigation primitives. If no environment exists yet, pick the framework that fits the project and implement there.

Specifically, do not port these files as-is:
- Layout uses absolute pixel values against a fixed 390 × 844 frame. Real screens need flexible layout and safe-area insets.
- Theming is done with CSS custom properties injected as an inline style string. Use the platform's own theming mechanism.
- All data is hardcoded sample data. See **State Management** for what is actually dynamic.
- Every screen is rendered simultaneously and side by side for review. In the app they are three destinations of one tab bar.

## Fidelity
**High-fidelity.** Colours, type sizes, weights, spacing, radii and copy are all final and intentional. Recreate them precisely, substituting the codebase's own primitives where they exist. Exact values are in **Design Tokens** and per-component below.

Two things are deliberately unresolved and need a decision during implementation:
1. **Typography.** The design brief forbids bundling web fonts. Press uses Georgia (or Iowan Old Style / Palatino Linotype) for all monetary figures and the system UI stack for everything else. On a platform where Georgia is unavailable, substitute a bundled transitional serif rather than falling back to the UI font — the serif figures are load-bearing in this direction.
2. **The tab bar has six tabs; only three are designed.** Ledger, Insights and Settings appear in the bar but have no screens yet.

## Directions
Two directions were built. **Press is the chosen one** — build against it. Slate is included because it resolves some information problems better and may be worth raiding.

### Press (`Coffer B - Press.dc.html`) — CHOSEN
Full-width rounded bands, one idea per band, serif figures, generous air. Runway is a semicircular gauge with a plain-language sentence beside it. Three themes: `light` (warm bone paper, terracotta accent), `dark` (warm dark, persimmon accent), `dark sage` (near-black, sage-green accent). **`dark sage` is the chosen default.**

### Slate (`Coffer A - Slate.dc.html`) — reference only
A denser instrument panel: hairline rules instead of cards, a four-tile metrics grid, runway as a twelve-segment fuel gauge. Two themes, `light` and `dark`. Its Budgets and Worth screens carry more detail than Press's and are worth reading before you build those two.

---

## Screens / Views

All three screens share one frame: 390 × 844, corner radius 26px (the review frame's radius — use the device's own), a scrolling content column, and a fixed bottom assembly.

### Shared: the bottom assembly

Pinned to the bottom of every screen, above the home indicator. Two rows.

**Row 1 — the quick-log bar.** Height 46px, horizontal padding 14px, 12px gap below.
- Input pill: flex 1, `border-radius: 999px`, padding 13px 17px, background `--surface`, shadow `0 2px 10px rgba(27,26,23,0.08)`. Contains a `+` glyph in `--ac` at 600 14px, then placeholder text at 500 14px in `--dim`. Placeholder on Today is the literal string `10$ potato` — this is the app's natural-language entry format, demonstrating it by example. On other screens it reads `Log something`.
- Log button: padding 14px 18px, `border-radius: 999px`, background `--ac`, text `--onac` at 700 13px, label `Log`.
- **Note:** `--onac` exists because white text on the sage and persimmon accents fails contrast. Light theme uses `#fff`; both dark themes use a near-black tinted to the accent hue.

**Row 2 — the tab bar.** Six tabs, equal flex, padding `0 8px 26px`, each item `padding: 4px 0`, centred.
- Icon: 20 × 20 SVG, `stroke="currentColor"`, `fill="none"`. Press uses `stroke-width: 1.6`, round caps and joins. Slate uses `stroke-width: 1.75`, butt caps, mitre joins.
- Label: 6px below the icon. Inactive 600 9px, active 700 9px, both `letter-spacing: 0.06em`.
- Inactive colour `--dim`; active colour `--ac` (the whole item, icon and label together).
- Tabs in order: Today, Ledger, Plan, Worth, Insights, Settings.
- **Hit targets in these mocks are ~44px tall including the label. Do not shrink them.**

Icon geometry is in **Assets** below.

---

### 1. Today

**Purpose.** The screen the user opens most. Answers, in order: what am I worth, how long do I last, what have I spent, what is about to hit me. Also the launch point for the five-second log.

**Layout.** Vertical stack, scrolling. Section margins: text sections `0 20px`, card sections `0 14px`.

**Components, top to bottom:**

1. **Date line.** Padding `42px 20px 0`, space-between row. Left: `Tuesday 2 September` at 700 10px, `letter-spacing: 0.16em`, uppercase, `--dim`. Right: settings glyph at 400 13px, `--dim`.

2. **Net worth.** Padding `16px 20px 0`.
   - Kicker `Net worth`, 700 10px, `letter-spacing: 0.16em`, uppercase, `--dim`.
   - Figure `$12,480`, **Georgia 400 46px**, `line-height: 1`, `letter-spacing: -0.02em`, 8px below.
   - Sub `up $310 over thirty days`, 500 12px, `--dim`, 9px below. Plain language, not a signed percentage.

3. **Runway band.** Margin `18px 14px 0`, padding `18px 18px 16px`, `border-radius: 18px`, background `--tint`. Horizontal flex, 16px gap, centre-aligned.
   - **The gauge.** 112 × 66 SVG. Track: `M8 60 A48 48 0 0 1 104 60`, stroke `--line`, width 9, round caps. Fill: `M8 60 A48 48 0 0 1 96.5 33.5`, stroke `--calm`, width 9, round caps — this arc length encodes the runway and must be computed, see below. Centred inside: `9.4` in Georgia 400 26px, fill `--ink`, at `(56, 56)`.
   - Text block: kicker `Runway` (as above); then `Nine months and a bit before the money runs out.` at 600 14px / 1.35 — **the number spelled out in words, deliberately**; then `$8,905 reachable at $945 a month` at 500 11px, `--dim`.
   - **Gauge maths.** The semicircle spans 0–12 months. Sweep fraction `f = min(runwayMonths / 12, 1)`, angle `θ = π · f` measured from the left end. Endpoint on a radius-48 arc centred at `(56, 60)`: `x = 56 - 48·cos(θ)`, `y = 60 - 48·sin(θ)`. At `f = 9.4/12` this gives the `96.5, 33.5` in the mock. Beyond 12 months, cap the arc and let the numeral carry the surplus.
   - **State colours.** `--calm` above 6 months, `--warn` from 3 to 6, `--alert` below 3. The band's `--tint` background does not change; only the arc and, if you want, the sentence.

4. **Burn card.** Margin `12px 14px 0`, padding `16px 18px`, `border-radius: 18px`, background `--surface`.
   - Two columns split by a 1px vertical rule in `--line`, stretched to the row height.
   - Left: kicker `Total out`; figure `$1,982` Georgia 400 27px; sub `everything that left` 500 10px `--dim`.
   - Right: kicker `True burn`; figure `$1,610` Georgia 400 27px in `--emph`; sub `one-offs stripped out`.
   - **`--emph` is `--ac` in the light and dark themes but plain `--ink` in dark sage** — deliberate, so nothing competes with the runway arc for attention. Match this.
   - Below: a bar, height 7px, `border-radius: 4px`, track `--tint`, fill `--ac` at `inset: 0 19% 0 0` (i.e. 81% width) = the one-off share of total out.
   - Caption `$372 of it was a one-off — a new laptop`, 500 10px, `--dim`.
   - **The distinction between total out and true burn is the app's central concept.** One-offs are excluded from burn, and therefore from the runway calculation. Preserve it.

5. **Three small tiles.** Margin `12px 14px 0`, horizontal flex, 10px gap, each flex 1, padding `14px 16px`, `border-radius: 16px`, background `--surface`. Kicker at 700 9px / `0.14em` uppercase `--dim`; figure Georgia 400 22px, 7px below. Contents: `In / $2,840`, `Kept / $858`, `Today / $34`.

6. **Upcoming card.** Margin `12px 14px 0`, padding `16px 18px`, `border-radius: 18px`, background `--surface`.
   - Kicker `Due in the next fortnight`.
   - Three rows, 10px gap, each a baseline-aligned row: name at 500 13px with an inline date at 11px, then amount in Georgia 400 16px, right-aligned.
   - `Rent — Beirut / 5 Sep / $450`, `Health insurance / 11 Sep / $128`, `Internet / 14 Sep / $41`.
   - The middle date is in `--warn`; the others in `--dim`. The rule: dates inside a window that the current balance cannot comfortably cover get `--warn`.

7. **Notices.** Margin `12px 20px 0`, column, 6px gap, 500 12px / 1.5, `--dim`.
   - `◆ Groceries are 22% above your six-month average.`
   - `◐ The lira rate was frozen 34 days ago.` — this line in `--warn`.
   - The stale-rate notice matters: multi-currency net worth is only as good as its last rate refresh, and the app admits when it is guessing.

---

### 2. Plan › Budgets

**Purpose.** Whether spending is tracking against intent, per category, with the month's progress as the reference line.

**Components:**

1. **Header.** Padding `42px 20px 0`. Kicker `Plan`; title `September` in Georgia 400 34px, `letter-spacing: -0.02em`, 8px below.
2. **Sub-tab pills.** 14px below, horizontal flex, 6px gap. Active: padding `8px 14px`, `border-radius: 999px`, background `--ac`, text `--onac` 700 11px. Inactive: same metrics, background `--surface`, text `--dim` 600 11px. Labels: `Budgets` (active), `Bills`, `Income`, `Goals`. Slate's version adds a fifth, `Plan`.
3. **Summary band.** Margin `16px 14px 0`, padding `18px 20px 16px`, `border-radius: 18px`, background `--tint`.
   - Lead sentence at 600 14px / 1.35: `You are seven tenths of the way through what you meant to spend, and two thirds of the way through the month.` **Fractions in words, again deliberate.**
   - Baseline row 12px below: `$1,244` Georgia 400 30px, then `of $1,780 intended` at 500 12px `--dim`.
   - Bar 13px below: height 8px, `border-radius: 999px`, track `--line`, fill `--calm` at `inset: 0 30% 0 0` (70% spent). A 2px vertical marker in `--ink` at `left: 63%`, overhanging 4px top and bottom, `border-radius: 2px` — the month's elapsed fraction.
   - Caption `the mark is today`, 500 10px, `--dim`.
   - **The comparison is the point:** spent-fraction against elapsed-fraction. Fill colour follows the gap — `--calm` when spending is at or behind the marker, `--warn` when ahead of it.
4. **Category cards.** Margin `12px 14px 0`, column, 8px gap. Each: padding `15px 18px`, `border-radius: 18px`, background `--surface`.
   - Row: name 600 14px; amount Georgia 400 19px.
   - Bar 10px below: height 6px, `border-radius: 999px`, track `--tint`.
   - Caption 8px below, 500 11px / 1.3.
   - The five cards:
     | Category | Amount | Fill | Fill colour | Caption | Caption colour |
     |---|---|---|---|---|---|
     | Groceries | `$370` | 88% | `--warn` | `running ahead — $50 left of $420` | `--warn` |
     | Transport | `$108` | 60% | `--calm` | `on pace — LL8,100,000 logged this month` | `--dim` |
     | Eating out | `$57` | 38% | `--calm` | `well under — $93 still there` | `--dim` |
     | Rent | `$0` (in `--dim`) | none | — | `$450 due on the fifth, not yet paid` | `--dim` |
     | Equipment | `$372` | striped | — | `a one-off, kept out of your burn` | `--dim` |
   - Equipment's bar is `repeating-linear-gradient(90deg, var(--line) 0 5px, transparent 5px 10px)` — the stripe means "no budget, excluded from burn". Reuse this treatment for any one-off category.
   - Transport's caption shows the original lira amount alongside the converted total. **Always surface the currency the entry was made in.**

---

### 3. Worth

**Purpose.** What is owned, what is owed, and critically, how much is actually reachable — the number that drives runway.

**Components:**

1. **Header.** Padding `42px 20px 0`. Kicker `Worth`; `$12,480` Georgia 400 42px, `letter-spacing: -0.02em`; sub `up $1,240 over the year` 500 12px `--dim`.
2. **Trend card.** Margin `16px 14px 0`, padding `16px 18px 12px`, `border-radius: 18px`, background `--tint`.
   - 320 × 92 SVG, full width. Area fill `--calm` at 14% opacity; line stroke `--calm` 2.5px, round joins and caps; a 4px `--calm` dot at the final point. Twelve monthly points.
   - Axis row below: `Sep 25`, `Mar 26`, `Sep 26`, space-between, 500 10px, `--dim`.
3. **Primary account card.** Margin `12px 14px 0`, padding `16px 18px`, `border-radius: 18px`, background `--surface`.
   - Header row: `Fransabank · current` 600 14px; `$4,120` Georgia 400 20px.
   - Three breakdown rows 12px below, 7px gap, space-between, 500 11px:
     - `Free to spend` / `$2,470`
     - `Set aside for tax` / `$1,180`
     - `Spoken for — rent` / `$470` (whole row in `--dim`)
   - **This three-way split is the reachable-balance model.** Only "free to spend" plus liquid pockets elsewhere feed the runway figure. Set-aside and spoken-for money is excluded.
4. **Three further asset cards.** Margin `8px 14px 0` each, same padding and radius, background `--surface`. Header row (name 600 14px, amount Georgia 400 20px) then a caption at 500 11px / 1.35 in `--dim`, 8px below.
   - `Cash · lira` / `$503` — caption `LL45,000,000 — ` then, in `--warn`, `the rate was frozen 34 days ago`.
   - `Wise · USD` / `$5,940` — caption `two pockets · $3,900 reachable today`.
   - `Gold · half-sovereigns` / `$3,617` — caption `not counted toward your runway`.
   - Illiquid assets count toward net worth and not toward runway. Say so on the card, every time.
5. **Debt card.** Margin `8px 14px 0`, same shell. `Laptop instalments` / `−$1,700` (a true minus sign, U+2212, not a hyphen). Bar 11px below: height 6px, `border-radius: 999px`, track `--tint`, fill `--ink` at 34%. Caption `$212 a month · clear by April`.
   - Debt uses `--ink`, not a warning colour. A serviced debt on schedule is not an alarm.

---

## Interactions & Behavior

The prototypes are static. Intended behaviour:

- **Quick log.** Tapping the input pill focuses it and raises the keyboard; the tab bar may hide while focused. The field parses free text — `10$ potato` means amount 10, currency USD, description "potato", category inferred from history, date today. `LL450000 taxi` means the same in lira. Submitting appends to the ledger, updates Today's figures optimistically, and clears the field without leaving the screen. Round trip target: **five seconds from cold start**, which is the constraint the whole bottom assembly exists to serve.
- **Parse feedback.** Not designed yet, and it needs designing: the user must be able to see and correct what the parser understood. Suggested minimum — after logging, a brief inline confirmation naming the resolved category and currency, tappable to edit.
- **Tab navigation.** Six destinations, standard tab semantics, each keeping its own scroll position. Plan's sub-tabs are a segmented control within the Plan stack, not separate tabs.
- **Card taps.** Every category card opens that category's filtered ledger. Every asset card opens that account's detail and edit screen. The stale-rate warning taps through to a rate refresh.
- **Transitions.** None specified. Keep them short and unobtrusive — this app is opened many times a day, and animation that charms on first run becomes friction by the fortieth.
- **Loading.** No spinners over the figures. Show the last known values with a subtle staleness treatment and update in place.
- **Empty states.** Not designed. Runway with no data, a category with no entries, and a first-run Worth screen all need thought.
- **Responsive.** Designed at 390pt width. The layout is a single column and scales up without restructuring; on wider screens cap the content column rather than stretching cards. Type sizes are near the floor already — do not scale them down.

## State Management

Derived values, and what they depend on:

- `netWorth` = sum of all assets in display currency − sum of debts. Depends on live FX rates.
- `reachable` = liquid balances only, minus set-aside and spoken-for allocations. Excludes gold and any asset flagged illiquid.
- `trueBurn` = trailing average monthly outflow with one-off-flagged entries removed. The averaging window is not specified in the design; three months is a reasonable default given irregular income.
- `runwayMonths` = `reachable / trueBurn`. Drives the gauge arc, its colour, and the spelled-out sentence.
- `monthProgress` = elapsed days / days in month. Drives the Budgets marker.
- `categorySpend[]` — per-category actual against intended, per month.
- `upcoming[]` — scheduled outflows in a fourteen-day window, each with a coverage flag.
- `fxRates` with a per-currency `lastRefreshed` timestamp. **Staleness is user-visible state, not an implementation detail** — the design surfaces it in two places.
- `theme` — one of `light`, `dark`, `dark sage`. Should follow the system setting by default with a manual override in Settings.

Persistence: all of it is local. The brief specifies no account and no server dependency for the core loop.

## Design Tokens

Semantic names as used throughout, with values per theme. `dark sage` is the default.

| Token | light | dark | dark sage | Role |
|---|---|---|---|---|
| `--bg` | `#f7f4ee` | `#16130f` | `#101312` | Screen ground |
| `--surface` | `#ffffff` | `#201c17` | `#191d1b` | Cards |
| `--tint` | `#efe9dc` | `#262119` | `#1f2422` | Emphasised bands, bar tracks |
| `--ink` | `#1b1a17` | `#f0ece3` | `#e8ece9` | Primary text, figures |
| `--dim` | `#6f6a60` | `#9a9287` | `#8d9793` | Secondary text, kickers, inactive tabs |
| `--line` | `#e3ded2` | `#322c24` | `#2a302d` | Rules, gauge track |
| `--ac` | `#b0472c` | `#e0765a` | `#7fb08a` | Accent: actions, active tab |
| `--onac` | `#ffffff` | `#241009` | `#0f1a13` | Text on the accent |
| `--calm` | `#4a6b4f` | `#7fa384` | `#7fb08a` | Healthy state |
| `--warn` | `#a5701a` | `#d3a04a` | `#cfa055` | Drifting / stale |
| `--emph` | `#b0472c` | `#e0765a` | `#e8ece9` | True-burn figure |

An `--alert` role is needed for runway under three months and does not exist in the mocks; derive it from the accent hue at higher chroma.

**Slate's tokens**, if you raid that direction: light `--bg #e9ecee`, `--surface #ffffff`, `--ink #101619`, `--dim #5d686d`, `--line #cfd6d9`, `--ac #0f5f6b`, `--calm #2f6b4f`, `--warn #96650c`, `--alert #9c3324`. Dark `--bg #0d1113`, `--surface #151a1d`, `--ink #e6eaec`, `--dim #8b979c`, `--line #283035`, `--ac #4fb3bf`, `--calm #6fb98e`, `--warn #d9a441`, `--alert #e0705d`.

**Colour discipline — the rule to carry into the app.** Green means one thing only: healthy state. It appears on the runway arc, on-pace budget bars, and the net-worth trend line. It is never decoration. Money in and money out are distinguished by position and type weight, not by a green/red pairing — there is no red in this palette. Amber marks drift and staleness. The accent is for actions and the active tab.

### Spacing
Screen edge for text 20px, for cards 14px. Card padding `15–18px` vertical, `18–20px` horizontal. Gap between stacked cards 8px, between sections 12px. Kicker-to-figure 8–10px. Figure-to-caption 6–9px.

### Typography
Two families. **Georgia** (fallbacks Iowan Old Style, Palatino Linotype, serif) at weight 400 for every monetary figure and for screen titles. **The system UI stack** (`-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`) for all labels, captions and body text.

`font-variant-numeric: tabular-nums` is set on the root and matters — figures must not jitter as they update.

| Role | Family | Size / weight | Notes |
|---|---|---|---|
| Hero figure (net worth) | Georgia | 400 46px / 1 | `letter-spacing: -0.02em` |
| Screen title | Georgia | 400 34–42px / 1 | `letter-spacing: -0.02em` |
| Section figure | Georgia | 400 27–30px / 1 | |
| Card figure | Georgia | 400 19–22px / 1 | |
| Inline figure | Georgia | 400 16px / 1 | Upcoming rows |
| Gauge numeral | Georgia | 400 26px | Inside the SVG |
| Kicker | UI | 700 10px, `0.16em`, uppercase | Small tiles use 9px / `0.14em` |
| Lead sentence | UI | 600 14px / 1.35 | Runway and Budgets summary |
| Card title | UI | 600 14px / 1.2 | |
| Row label | UI | 500 13px / 1.2 | |
| Caption | UI | 500 10–11px / 1.3 | |
| Tab label | UI | 600 (700 active) 9px, `0.06em` | |
| Button | UI | 700 13px | |

### Radii
Cards and bands 18px. Small tiles 16px. Bars, pills, buttons and the input `999px`. The device frame in the mocks is 26px.

### Shadows
Only two. The input pill: `0 2px 10px rgba(27,26,23,0.08)`. The device frame: `0 18px 40px rgba(16,22,25,0.28)` — a review artefact, not part of the design. Cards are separated by fill, not elevation.

## Assets

No images or third-party icon libraries. Everything is drawn inline.

**Tab bar icons** — 20 × 20, `viewBox="0 0 20 20"`, `fill="none"`, `stroke="currentColor"`. Two sets, one per direction; both are in the HTML files and can be lifted verbatim.

*Press* — `stroke-width: 1.6`, `stroke-linecap: round`, `stroke-linejoin: round`:
| Tab | Motif |
|---|---|
| Today | Sunrise — horizon line, half-arc, three short rays |
| Ledger | Ruled page — rounded rect `rx 2.4`, left margin rule, three text lines |
| Plan | Envelope — flap fold, for money-in-envelopes budgeting |
| Worth | Stacked coins — ellipse plus two skirts |
| Insights | Lens — circle and handle |
| Settings | Two sliders with round knobs |

*Slate* — `stroke-width: 1.75`, `stroke-linecap: butt`, `stroke-linejoin: miter`:
| Tab | Motif |
|---|---|
| Today | Crosshair between two vertical rules |
| Ledger | Table grid |
| Plan | Allocation bars against a left axis |
| Worth | Four-column chart on a baseline |
| Insights | Trend arrow with an arrowhead |
| Settings | Three rules with square knobs |

**In-line notice glyphs.** Today's notices use `◆` and `◐` as bullets. These are Unicode geometric shapes, not designed marks — replace them with proper icons or drop them.

**Charts.** The Worth trend line and the runway gauge are hand-authored SVG paths in the mocks. In the app both must be generated from data; the gauge maths is given under Today.

**Photography.** None. The design uses no imagery.

## Files

- `Coffer B - Press.dc.html` — **the chosen direction.** All three screens, with a `theme` prop switching `light` / `dark` / `dark sage`. Open it in a browser; the three phones sit side by side.
- `Coffer A - Slate.dc.html` — the alternative direction, same three screens, `light` / `dark`. Reference only, but its Budgets and Worth screens carry detail Press's do not.
- `Coffer Directions.dc.html` — the review canvas that embeds both, with the notes written during design review.
- `support.js` — the runtime the three files need in order to open. Not part of the design; do not port it.
- `DESIGN-BRIEF.md` — the original brief, including the product constraints (no web fonts, local-first, five-second logging) that shaped these decisions.

## Not designed yet

Ledger, Insights and Settings screens. Parse-confirmation feedback for the quick log. Empty and first-run states. The under-three-months runway state, including its `--alert` colour. Rate-refresh flow.
