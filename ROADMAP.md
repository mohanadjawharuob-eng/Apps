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

### Next
- **Split transactions** — one shop trip across two categories.
- **Cross-currency transfers** — a transfer needs two amounts when the accounts
  hold different currencies.
- **Latching save warning** — a failed save currently only toasts once.
- **Search by amount** in the ledger.
- **Sub-tabs elsewhere** if any other tab grows past three cards.
- **Budget rollover** — carry an underspend into next month.
- **Self-filling goals** — a goal that fills from transactions in a category
  instead of being topped up by hand.
- **Plan: dated changes** — "rent becomes €700 from March". Needs budgets to
  gain a time dimension; they are one figure per category today.

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
