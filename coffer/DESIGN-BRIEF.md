# Coffer — a brief for Claude Design

Paste everything from **the line below the rule** into Claude Design. Attach the
current screenshots if you have them; the brief works without them but they help.

---

## What this is

**Coffer** is a personal finance app. It runs entirely in the browser on one
phone — no account, no server, nothing sent anywhere — and it is installed to the
home screen as a web app. It is one HTML file.

It is not built for a salaried person. Its owner does contract and project work,
gets paid in a currency that moves week to week (Lebanese lira), is moving
between countries, and has months where nothing arrives at all. Almost every
feature exists because a normal budgeting app assumed a steady wage.

## Who is looking at it, and when

Two completely different sessions, and the design has to serve both:

- **Five seconds, several times a day.** Standing in a shop, phone in one hand.
  Type "10$ potato", done. Glance at one number.
- **Ten minutes on a Sunday.** Reading charts, writing a plan for the year,
  reconciling what actually happened against what was intended.

The first is by far the more frequent. Anything that adds a tap to logging a
purchase is a bad trade.

## The screens

Six tabs. **This structure is settled — please keep it.** It was arrived at after
the app got crowded, and each tab exists to answer exactly one question.

| Tab | The question | What is on it |
|---|---|---|
| **Today** | What's happening right now? | Net worth on one line · a free-text box for logging · what was spent today against a typical day · four tiles: money in, money out, kept, **runway** · what's due in the next fortnight · three notable observations |
| **Ledger** | What happened? | Search and filters, then every transaction grouped by day |
| **Plan** | What do I intend? | Five sub-tabs: Budgets · Bills · Income · Goals · The plan (a written plan imported as text and scored against reality) |
| **Worth** | What do I hold and owe? | Net worth, a 12-month balance curve, accounts with "pockets" inside them, debts with payoff strategies |
| **Insights** | What am I missing? | Total outflow vs true burn vs runway · where the money went · in and out over 12 months · all-time category table · largest single expenses |
| **Settings** | — | Backup, currency, exchange rates, categories, appearance, screen lock |

## The ideas that need to be legible

These are the concepts a design has to carry. If a redesign makes any of them
harder to see, it has failed regardless of how it looks.

1. **Runway** — months of survival at the current burn. For someone on contract
   income this is *the* number. It should probably be the most prominent thing
   on the app after net worth, and it should feel different depending on whether
   it reads 1.2 or 14 months.
2. **Two spending numbers, deliberately different.** "Total out" is everything
   that left. "True burn" strips one-offs and money that is coming back. They
   are shown side by side and the gap between them is the point. A reader must
   never confuse the two.
3. **Money that is not really yours.** A balance can be free, set aside, or
   already spoken for. Net worth counts all of it; runway counts only what can
   actually be reached.
4. **Frozen rates.** Every entry stores the exchange rate it was logged at, so
   history never re-values itself. Foreign amounts show as e.g. `LL45,000,000`
   with `= $503` beside them. A rate older than 30 days is flagged.
5. **Planned against actual.** Most of the Plan tab is pairs of numbers — what
   was intended, what happened — with a bar between them.

## What it looks like now

Warm and papery rather than fintech. Worth knowing so you can react to it — not
so you have to keep it.

- **Light:** off-white page `#eff1ed`, white cards, near-black ink `#131c1a`,
  brass accent `#8a6420`.
- **Dark:** near-black `#0b1110`, cards `#131c1a`, same brass.
- Headings in a serif (`Iowan Old Style`/Palatino/Georgia), everything else in
  the system sans. **No web fonts are loaded** and none can be.
- Cards with a hairline border and a soft shadow. Pills for status. Small
  hand-built SVG charts — an area chart, a donut, a bar chart, sparklines, and a
  progress meter with a marker showing how far through the month you are.
- Green for money in, red for money out, amber for warnings.

**What works:** it does not look like every other budgeting app; the serif
figures feel considered; it is readable in sun and in bed.

**What does not:** it can feel flat and samey — six tabs of very similar cards.
Rows with a title, a subtitle, a figure and three buttons get cramped at 390px
and have needed hand-tuning more than once. Nothing on screen signals *urgency*
well; a runway of 1.2 months looks much like a runway of 14.

## Hard constraints — these cannot be designed around

- **One self-contained HTML file. No dependencies, ever.** No React, no
  Tailwind, no icon library, no CDN, no build step. Vanilla CSS and vanilla JS.
- **No web fonts.** System and generic families only.
- **Must work offline**, from a cache, with no network at all.
- **Light and dark both**, and a manual override that beats the phone's setting.
  Neither can be an afterthought.
- **390px is the primary width.** Desktop is a bonus. It also has to survive
  320px.
- **Numbers must be tabular** and must align. Money is the content.
- **Charts must stay hand-built SVG.** Simple enough to write without a library.
- Reachability matters: primary actions want to be low on the screen, not top-right.

## What I would like from you

Not a repaint — a point of view. Specifically:

1. **A visual system**, in both light and dark: colour roles, type scale, spacing
   rhythm, card treatment, how a "figure" differs from a label.
2. **Today, designed properly.** It is the screen that opens every time. Show me
   how net worth, the logging box, and runway can share the top of one phone
   screen without any of them feeling squeezed.
3. **A dense list row that works at 390px** — a title, a detail line, an amount,
   a status pill and up to three actions. This pattern repeats everywhere and is
   the weakest part of the current design.
4. **Make runway feel like a state, not a statistic.** Three months should look
   different from twelve without resorting to a red banner.
5. **A pair-of-numbers treatment** for planned vs actual, and for total out vs
   true burn, that makes it obvious which is which at a glance.

Please show **Today**, **Plan › Budgets**, and **Worth** as artboards, in both
light and dark. Feel free to reject the parchment-and-brass direction entirely if
you have something better — but say what you are replacing it with and why, and
keep it something that can be built in plain CSS.

## What to avoid

- Purple-to-blue gradients, glassmorphism, neon-on-black "crypto" styling.
- Dark-only designs. This is used outdoors.
- Anything needing an icon font or an SVG icon set — the current icons are single
  Unicode glyphs (◈ ≡ ◇ ◆ ◐ ⚙) and that is a constraint worth keeping.
- Illustrations or mascots. It is a ledger.
- Removing information to make it look calmer. The density is the feature; the
  problem is that the density is currently undifferentiated.
