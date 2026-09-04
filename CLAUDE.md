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
