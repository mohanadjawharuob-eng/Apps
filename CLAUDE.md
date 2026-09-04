# Working in this repo

Six small offline web apps served from GitHub Pages. No build step, no bundler,
no package.json. What is in the repo is what runs.

## Rules that are not negotiable

- **One app, one directory, one file.** `<app>/index.html` holds the entire app:
  markup, styles and script. Bustan (`garden/`) is the exception and splits into
  `app.js`, `ui.js`, `species.js`, `sprites.js`, `icons.js`.
- **No dependencies.** Nothing is fetched from a CDN, nothing is installed.
  Adding a library is a decision to argue for, not a default.
- **Every app owns its service worker.** `<app>/sw.js` with
  `CACHE = 'pwa-<app>-vN'`. A worker whose scope covers more than its own
  directory claims every app at once, and then only the first one installed
  actually installs.
- **Bump the cache on every ship.** `pwa-<app>-vN` → `vN+1`, and Coffer's
  `BUILD` string with it. A fix that is not in a new cache is a fix the phone
  never sees.
- **Register the service worker immediately**, not inside `window.load`. Bustan
  loads a webfont, and a blocked font host once left `readyState` at
  `interactive` forever — so the worker never registered and the app installed
  as a shortcut instead of an app.
- **Manifest `id` and `scope` are the app's own directory.** Changing either
  makes the browser treat it as a different app.

## Money rules (Coffer)

- **Rates are frozen per record.** A transaction, a recurring item and a plan
  line each store the rate they were logged at. Changing a rate must never move
  a figure that is already recorded. There is a regression test for this.
- **Balances are derived**, never stored: opening figure plus every
  transaction. Nothing can drift out of sync. The two exceptions are stated
  rather than computed, because no ledger can know them: a debt's balance, and
  an investment's worth. Both are hand-entered; the investment's is a *dated*
  list of marks, so a March valuation stays a March valuation and the
  net-worth history is not rewritten every time you check a price.
- **Opening figures are in the account's own currency**, at the rate it was
  opened at, while transaction effects are already in base. Anything summing
  the two must convert first (`acctOpeningBase`) — adding them raw is a real
  bug that shipped once.
- **Two spending numbers, deliberately.** `monthSummary().expense` is everything
  that left; `.spend` and `trueBurnFor()` exclude one-offs and money you are
  owed back. Runway is built from true burn over `freeAssets()` (which drops
  committed pockets). If you add a place that shows "what I spend", pick the one
  that matches the question and be consistent with the charts beside it.
- **Three kinds of money are not yours to spend, and each is excluded
  differently.** Committed pockets are yours but out of the runway. Investments
  count toward net worth at their mark but are dropped from `freeAssets()`
  entirely — you cannot pay rent from a pension. A grant is not yours at all:
  its unspent balance comes out of net worth, its spending is out of
  `trueBurnFor()` and out of `spendByCategory()`, and it lives in a pocket
  forced to `committed`. The grant arithmetic is self-checking — the award
  arriving adds to assets and to restricted together, so net worth does not
  move; spending takes off both; overspending past it takes off assets alone
  and net worth falls. If a change breaks one of those three, it is wrong.
- **Money going into an investment is a transfer, never an expense.** Logged as
  an expense it lands in the burn rate and reports a saver as someone bleeding
  money. Same rule for the reverse: a payout is income, a sale is a transfer
  out. Recording a sale as income counts the same money twice.
- **The projection never averages past income.** `projectForward()` uses
  scheduled recurring income only, weighted by confidence. Averaging what a
  contractor earned last quarter is the lie that makes freelance work look like
  a salary. Confidence lives on `state.plan.lines`, never on the recurring
  record — join through `planKey`.
- **An allowance inside a salary is not a fourth kind of restricted money.**
  A travel allowance paid at so much a day is yours either way, so it counts as
  income and net worth on arrival and its spending stays in `trueBurnFor()` and
  `spendByCategory()` like anything else. What it changes is one thing:
  `budgetRows()` draws the pot down before your own budget. It resets monthly
  and whatever is left becomes ordinary money, so **there is no balance to
  store** — the pot derives from `state.allowanceDays`, which holds the days
  worked and the rate they were converted at.
- **"Can I afford it" measures cost, not survival.** `freeAssets()` is the
  runway's numerator and the wrong one here: it contains earmarked pockets,
  which is where goal savings sit, so the tool used to offer up the deposit to
  buy the car and then call the car affordable because the deposit existed.
  `spareAssets()` holds back what goals have put aside plus a cushion. Anything
  that talks about money over several months walks `surplusOver()` rather than
  multiplying today's surplus — income stops, and two routes that multiply
  independently will contradict each other.
- **Never guess at money.** If a currency has no rate, an account name does not
  match, or a date is not `YYYY-MM-DD`, refuse and say why. A plausible wrong
  number is worse than a visible failure. "Can I afford it" refuses outright
  when there is no income booked, rather than projecting a date from nothing.
  A transfer whose currency changed refuses to save without the figure that
  actually arrived, because the only number it could fill in is the stored
  rate — and the stored rate is exactly what turned out to be wrong.
- **A transfer has two sides and they are matched separately.** The source is
  `accountId` + `pocketId`, the destination `toAccountId` + `toPocketId`, and
  anything walking transfers must test each on its own account *and* its own
  pocket. `pocketBalance()` filtered on `t.pocketId` before looking at
  anything, so money moved into a pocket was never credited and a move between
  two pockets of one account cancelled itself out. For the same reason
  `effectOn()` adds both sides instead of returning on the first match — an
  account can be both ends of one transfer, and returning early made
  `balanceOf()` disagree with `totalAssets()`.
- **What left and what landed are two figures.** `txBase()` is what left;
  `txBaseIn()` is what arrived, falling back to `txBase()` when `toAmount` is
  absent, which is every transfer between accounts in one currency. The three
  arithmetic sites — `pocketBalance`, `effectOn`, `totalAssets` — credit the
  destination with `txBaseIn()`. Net worth falls by `txSpread()`, which is
  right: it left. It stays out of `trueBurnFor()`, because an exchange fee is
  not a living cost.
- **A split is in the transaction's own currency.** `t.splits` holds
  `{category, amount}` parts that must sum to `t.amount`, so the one frozen
  rate covers the whole entry and no part can be re-valued separately.
  Everything that files money under a category goes through `txParts()`, which
  returns a single part for an unsplit entry — so no caller needs to know
  whether it was split. `t.category` stays the largest share.
- **A currency picker belongs wherever money goes in or out**, and the rate is
  frozen onto the record there. The quick-log preview, the log-bar sheet,
  one-tap buttons, a debt payment, a contract arriving and a goal top-up all
  take one. A figure in a foreign currency is never printed with the base
  symbol — `fmtIn()` for the original, `fmt(toBase(...))` for the converted.

## Coffer's look

The Press system, from `coffer/DESIGN-HANDOFF.md`. Three rules worth keeping in
mind before adding anything:

- **Green means healthy state and nothing else** — the runway arc, an on-pace
  budget bar, a rising net-worth line. Never decoration, and never on a routine
  income row. Amber is drift and staleness; red is genuinely wrong.
- **Every monetary figure is set in `var(--serif)` at weight 400.** Prose in a
  figure slot gets `.words`, which drops back to the UI stack — the display
  serif is for numbers and phrases at that size just break.
- **Cards are separated by fill, not elevation.** One shadow exists, on the log
  bar, because it floats over scrolling content.

Both token vocabularies are live: the design's (`--bg --tint --ac --calm
--emph --alert`) and the original names, which most of the app still uses and
which are aliased onto the new values.

## Coffer's shape

Six tabs, one question each: Today, Ledger, Plan, Worth, Insights, Settings. A
tab that grows past about three cards has stopped answering one question — split
it, or give it a `subNav` the way Plan does. Overview was allowed to reach seven
blocks and became the thing everybody scrolled past.

Two tabs now carry a `subNav`: **Plan** (Outlook · Budgets · Bills · Income ·
Goals · Grants · The plan) and **Worth** (Accounts · Investments · Debts).
Plan › Income is itself three groups — contracts, one-off income, and ended
contracts — because a two-year contract and a lump sum need different details
about them. New
work goes into one of those rather than into a seventh tab — six is the grid,
and the bottom bar is the app's shape.

When a screen is rebuilt, check nothing was the *only* caller of an action.
`accountsCard()` stopped being called during the Worth rebuild and took pocket
editing with it; the buttons still existed, nothing rendered them.

`accountOptions()` returns a **grouped** list — an account with pockets comes
back as `{group, options}` and carries no `value` of its own. Anything that
needs a first entry to default to, or builds its own `<select>`, takes
`accountOptionsFlat()`. Reading `.value` off a group gave `undefined`, which is
how a debt payment came to default to "don't log a transaction" and silently
record nothing.

The Ledger's "Add something" card and the log bar's sheet render the **same**
`omniPreviewHtml()`, so with the sheet open there are two copies of every
control in the document. Every lookup goes through `omniEl()`, which scopes to
the visible one — `getElementById` returns the copy under the scrim, and for a
while nothing you changed in the log bar was wired to anything.

## State

One shape, adopted in one place. `adoptState()` turns a parsed object into
state and **both** `load()` and the backup restore call it. They used to
hand-copy the same key list separately, and only one was updated when grants
and allowances shipped — so restoring a backup quietly lost them. Anything
added to the state shape goes in `STATE_LISTS`, `STATE_MAPS` or `adoptState`'s
settings block, and nowhere else.

## Testing

Playwright against a local server, driving the real app:

```
cd /home/user/Apps && python3 -m http.server 8899
node <script>.js          # scripts live in the session scratchpad
```

There is no test runner. Each script seeds `localStorage`, reloads, drives the
UI, and prints what it found. Screenshot anything visual and *look at it* —
a bug that renders 55 plants identically passes every assertion you thought to
write.

The scripts drive the real UI, so **a reshaped screen breaks them and that is
not a regression** — but a suite nobody trusts is a suite nobody runs, so fix
them in the same change. Three traps account for almost every stale one:
`innerText` reflects `text-transform`, so a heading uppercased in CSS reads
`SALARY` and `.includes("Salary")` is false; the ledger and plan rows are
`div.row` and `.card`, never `<tr>`, so `closest("tr")` returns null; and a
control that moved to a sub-tab needs `.subnav button[data-id="…"]` clicked
first. When a dialog gained a confirmation step, the script has to press
through it — logging from the bar goes via `#omniSheet [data-act="omni-commit"]`
now, and income asks what arrived before it writes.

Check both inline scripts still parse after any edit:

```
node -e 'var h=require("fs").readFileSync("coffer/index.html","utf8");
var re=/<script>([\s\S]*?)<\/script>/g,m;while((m=re.exec(h)))new Function(m[1]);
console.log("ok")'
```

## Data

`localStorage`, one key per app (`coffer.v2`, `bustan.v1`, …). Browsers scope it
to the **site**, not the folder — which is why moving these apps from
`deep/apps/` carried every user's data across untouched. Receipt photos live in
IndexedDB, because one phone photo is larger than an entire ledger and would
break saving for everything else.
