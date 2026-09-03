# Coffer — round two: the three screens you have not designed

Paste everything below the rule into Claude Design, along with the round-one
bundle (`Coffer B - Press.dc.html`) so it has the system to work from.

---

## Where this is

Press is built. Tokens, type scale, the runway gauge, the bottom assembly, the
tab icons — all shipped and live. Today, Plan › Budgets and Worth follow the
handoff. What you are looking at now is a working app, not a mockup.

The problem is the half you did not design. **Ledger, Insights and Settings**
were left to inherit the system through shared card and row styles. They now
use the right colours, the right radii and the right type — but nobody
composed them, and it shows. They read as "the same paint on the old layout"
rather than as designed screens.

I have since made every card header a kicker, every button and tag a pill at
one radius, and rebuilt the Debts section and the Insights header so nothing is
speaking the old vocabulary. It is coherent now. It is not *designed*.

## What I need designed

**1. Ledger** — the hardest one, and currently the weakest.

It is a filter bar (search, type, category, account, date range) over a table of
transactions grouped by day, with a running day total on each group header. Each
row carries: description, category, account, amount, and up to four actions
(attach a receipt, mark a refund settled, edit, delete). At 390px a table does
not fit, and the current answer — horizontal scroll — is bad.

Questions I actually want answered: how does a dense financial list work on a
phone in this system? What happens to four per-row actions? How do filters
present themselves without eating the top third of the screen? How does a day
group header read?

**2. Insights** — composed rather than stacked.

It currently holds, in order: the runway band (shared with Today), a total-out
vs true-burn pair, three small tiles, a list of written observations, a
spending donut, a savings-rate line, a twelve-month in/out bar chart, an
all-time category table, and the largest single expenses. That is nine blocks
in one scroll. Some of it should be cut, some grouped, some given a shape.

The charts are all hand-built SVG and must stay that way.

**3. Settings** — nine cards of forms and destructive buttons.

Backup and restore, app version, currency symbol, exchange rates (with a
staleness warning), receipts, categories (two lists of removable chips),
appearance, screen lock, erase everything. It is a long undifferentiated
scroll where "Back up my data" and "Erase all local data" have nearly the same
visual weight. Dangerous things should look dangerous and routine things
should be quiet.

## Also worth your opinion

- **The dense row.** Title, detail line, amount, a status tag, and two or three
  icon actions. It repeats on every screen and I have hand-tuned it twice. In
  the built app it stacks: name and figure on line one, detail on line two,
  actions right-aligned on line three. It works but it is tall.
- **Empty and first-run states.** Not designed anywhere. Every screen has one.
- **The under-three-months runway.** The `--alert` role does not exist in your
  tokens; I derived one. Worth seeing what you would actually do when the arc
  goes short — that is the moment the app matters most.
- **Modals.** Every dialog in the app is one shell: a title, a paragraph, a
  grid of fields, cancel and confirm. It has not been touched by the redesign.

## The constraints, unchanged

One self-contained HTML file. No dependencies, no build step, no web fonts, no
icon library. Georgia for figures, the system stack for everything else. Light
and dark both, with a manual override. 390px primary, 320px must survive.
Charts hand-built SVG. `font-variant-numeric: tabular-nums` throughout.

Please deliver the same way as last time — artboards plus a handoff README with
tokens and per-component values. That format worked; the built app matches it
closely wherever you actually specified something.
