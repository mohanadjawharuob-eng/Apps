# Roadmap

What is built, what is queued, and what was considered and turned down. Updated
in the same commit that ships the change, so it cannot drift from the code.

## Coffer

### Shipped
- Multi-currency: log in any currency, total in one. **Rates frozen per entry**,
  so history never re-values itself.
- Exchange rates you set yourself, with a suggested starting figure to correct.
- Pockets inside an account (`Bank › Cyprus`), always summing to the account.
- Recurring split into **Bills** and **Regular income** as separate sections.
- Receipt photos, in IndexedDB, deliberately outside backups.
- Accounts grouped by where they are held — headings only where a place holds
  more than one account.
- **Close an account** without losing its history; balance moved out as a real
  transfer.
- Ledger grouped by day; a "spent today" card on the overview.
- Quick-entry shorthand and paste-a-list bulk entry.
- **Financial plans**: write a year as text, import it, and score real spending
  against it on the Plan tab. See `coffer/PLAN-FORMAT.md`.
- Self-updating service worker, and a build marker in Settings.
- **Six tabs instead of eight**, each answering one question: Today (log and
  right now) · Ledger (what happened) · Plan (what you intend — budgets, bills,
  income, goals and the imported plan, on sub-tabs) · Worth (accounts, pockets,
  debts, net worth) · Insights (patterns) · Settings. Overview's seven stacked
  blocks are gone, Goals and Debts no longer own near-empty tabs, and the
  cashflow chart that rendered on two tabs now renders on one.
- A written prompt (`coffer/PLAN-PROMPT.md`) that makes any AI emit a plan file
  Coffer will accept.

### Shipped: built for irregular income and a moving currency

Coffer was designed around a steady salary, a stable currency and predictable
expenses. None of those hold for contract work paid in a currency that moves, so:

- **True burn, separate from total outflow.** One-offs (`oneOff`) and money you
  expect back are stripped out, so the burn rate is what it actually costs to
  keep living.
- **Runway as a headline**, on Today and Insights: money you can actually reach,
  over true burn, averaged across up to six months rather than one noisy one.
- **Refundable / pass-through spending** — kept out of burn and category charts
  until you mark it settled, then counted normally.
- **Pocket status** — free, earmarked or committed. Committed money stays in net
  worth but is out of the runway, because it is only nominally yours.
- **One-off income** (`once`) and **income end dates** (`until`), so a grant is
  not averaged into a monthly rate and a contract's projection stops when it does.
- **Gap alerts** — an income line ending with nothing scheduled after it.
- **Dated exchange rates** with a staleness warning after 30 days.
- **Goals that follow a pocket** instead of a figure you keep updating.
- **Category rename** that carries transactions, budgets, recurring items and
  plan lines with it.
- **Plan scenarios** (`extends`), **confidence on income** (`at 40%`),
  **`review_by`**, **sub-budgets** (`Subscriptions > Spotify`), and a
  **close-out** comparing projected against real once a plan's period ends.
- **Light / dark / match-my-phone**, applied before first paint so there is no
  flash, with the status-bar colour kept in step.
- **Reclassifying past entries** — refundable and one-off can be set when editing
  a transaction, not only when adding one.
- **An "Owed back to you" card** on Today, listing everything reimbursable that
  has not come back, flagging anything over 30 days. Marking one settled offers
  to log the money arriving, prefilled, into the account it left from.
- **Net worth on the first screen** — one line at the top of Today with the
  month's movement, what is owed and what is spoken for. The 12-month curve and
  the accounts behind it stay on Worth, a tap away.

### Shipped: seeing forward, and money that is not yours

- **Plan › Outlook** — an eighteen-month projection instead of a division.
  Walks month by month from reachable money, with every contract starting and
  stopping on its own date, income weighted by its confidence, and the month
  you run out marked on the line. Outgoings are true burn plus only the
  *changes* inside the horizon, so a logged monthly bill is never charged
  twice. Income is only ever scheduled income — averaging past contract work
  is the lie that makes freelancing look salaried.
- **"What if this stops"** — a switch per income line, re-running the
  projection against a dashed ghost of where you were. Answers "what if the
  contract doesn't renew" without a second stored plan.
- **"Can I afford it?"** — five funding routes side by side rather than a yes
  or a no: pay now, N instalments with the markup shown against the sticker
  price, save up to a month that still leaves three months of cover, trim a
  budget, or take it from a pocket (which names the goal that pocket feeds).
  Every route is measured over one window long enough to contain the slowest,
  a route that runs you out is a warning rather than an option, and with no
  income booked it refuses instead of inventing a date. Nothing is logged.
- **Investments** — an account with `kind: "investment"`, so money going in is
  a *transfer* and never lands in the burn rate. Cost is derived from the
  transfers; worth is a dated mark you set by hand, kept in a list so a March
  valuation stays a March valuation and the net-worth history is not rewritten
  every time you check a price. Payouts are income tagged `investId`; selling
  is a transfer back out. Net worth counts the mark, the runway never does.
  Lives on **Worth › Investments**.
- **Grants** — money in your account that is not yours. Held in a pocket forced
  to `committed`, so the runway already excludes it. The unspent balance comes
  out of net worth, grant spending is out of true burn, and it is out of your
  own category budgets. Split into lines that are a total for the whole award
  rather than a monthly cap, with drawdown, per-line spend, and warnings for
  overspending or a deadline arriving with money unspent. Lives on
  **Plan › Grants**.

### Fixed along the way
- `balanceOf` added a foreign account's opening figure, stored in its own
  currency, to transaction effects already converted to base — so a EUR account
  read its opening as dollars and disagreed with the same account inside
  `totalAssets`.
- Pockets could be created and then never edited or removed: the Worth rebuild
  left `accountsCard()`, the only screen carrying `pocket-edit`, uncalled.
- A bare `burn` in `buildInsights` threw a ReferenceError whenever there were
  recurring bills, no recurring income and nothing logged that month — which is
  a freelancer between contracts.
- The three insight lines on Today floated on the page background with no card.

### Next
- **Split transactions** — one shop trip across two categories.
- **Cross-currency transfers** — a transfer needs two amounts when the accounts
  hold different currencies.
- **Latching save warning** — a failed save currently only toasts once.
- **Search by amount** in the ledger.
- **Sub-tabs elsewhere** if any other tab grows past three cards.
- **Merging two categories** — rename refuses a name that already exists, because
  merging is lossier than renaming and deserves its own confirmation.
- **Auto-detecting one-offs** — an expense far above what its category normally
  costs could offer the one-off tick rather than waiting to be told.
- **Budget rollover** — carry an underspend into next month.
- **Plan: dated changes** — "rent becomes €700 from March". Needs budgets to
  gain a time dimension; they are one figure per category today.

### Shipped: the Press visual system
Claude Design returned two directions and chose one. Press is now built:
warm bone paper in light, near-black with a sage accent in dark, every monetary
figure set in the serif, cards separated by fill rather than elevation.

- **Runway is a gauge, not a statistic** — a semicircular arc over nought to
  twelve months, coloured calm / warn / alert, with the figure written out in
  words beside it ("Nine months and a bit before the money runs out").
- **The log bar is pinned to the bottom of every screen**, above the tabs, so
  logging is five seconds from wherever you are rather than only from Today.
- **Tab icons are drawn**, not set as Unicode glyphs — still inline SVG, still
  no icon font and no library.
- **Colour discipline:** green means healthy state and nothing else, so income
  rows are no longer green; direction is carried by the sign and the column.
  Amber marks drift and staleness. Red is kept for genuinely wrong.
- Today, Plan › Budgets and Worth rebuilt to the design; the other three tabs
  inherit the system through the shared card and row primitives.

`coffer/DESIGN-BRIEF.md` is the brief that was sent;
`coffer/DESIGN-HANDOFF.md` is what came back, including the tokens and the
gauge maths.

### Not designed yet
Ledger, Insights and Settings have no bespoke screens. They now use the same
component vocabulary as the rest — one card header, one pill, one row — so they
are coherent, but nobody composed them. `coffer/DESIGN-BRIEF-2.md` is the
follow-up brief for Claude Design covering those three plus the dense row,
empty states, the under-three-months runway and the modal shell.

### Considered and turned down
- **Receipt scanning by camera** — OCR of a photographed receipt is wrong often
  enough that every entry would need checking, which is slower than typing it,
  and it doubles the app's complexity. The receipt *photo* attachment shipped
  instead: the picture is the record, you type the number.
- **.docx plan import** — a ZIP of XML needing ~100KB of library, and the prose
  inside still would not parse. Pasting the text works from anywhere.
- **Email or push reminders** — needs a server and a secret key. Static files on
  Pages are public, so any key in the repo is a published key.

## Bustan (`garden/`)

### Shipped
- 55 species, five growth stages, drawn from 16 parametric archetypes.
- Watering from real evapotranspiration (Open-Meteo ET₀), scaled by crop
  coefficient, sun exposure and pot type, with rainfall subtracted.
- Seasonal almanac by location; parchment/night visual rebuild.

### Next
- **Rebalance the catalogue** — 29 vegetables against 10 houseplants, but the
  app is used mostly for houseplants.
- **32×32 sprites** — attempted and reverted; rescaling produced NaN
  coordinates in 35 species. Needs the archetypes reworked at the larger grid,
  not a scale factor.

## Daybook, Kitchen, Timesheet

Stable. No queued work.
