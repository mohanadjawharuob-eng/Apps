# Working in this repo

Six small offline web apps served from GitHub Pages. No build step, no bundler,
no package.json. What is in the repo is what runs. (`handoff/` is not an app —
it is a page of screenshots for a design round.)

**Daybook, Kitchen, Timesheet and Mashghal share a byte-identical runtime.**
The block that begins `Shared runtime for all of these apps` carries
`loadState`/`persist` over `APP.storeKey`, the in-page modal with its field
spec, `confirmAction`, `toast`, the backup and restore dialogs, `download`,
the chart and tile helpers, and the date helpers. An `APP` object supplies
`storeKey`, `tabs`, `blank`, `hydrate`, `renderView` and `actions`. Two
sandbox lessons are encoded in it: **native `confirm()` silently returns
false** and **`<form>` submit never fires**, so every confirmation is an
in-page modal and every action is a button with Enter wired by hand. Copy it
verbatim into a new app and never improve one copy alone — a fix belongs in
all four at once, and this is the test:

```
for f in daybook kitchen timesheet mashghal; do
  sed -n '/Shared runtime for all of these apps/,/^<\/script>$/p' $f/index.html |
  sed '$d' | md5sum
done
```

Four identical hashes, or a copy has drifted.

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
  that left; `.spend` and `trueBurnFor()` exclude one-offs and money that came
  back. Runway is built from true burn over `freeAssets()` (which drops
  committed pockets). If you add a place that shows "what I spend", pick the one
  that matches the question and be consistent with the charts beside it.
- **A refundable costs what you paid less what came back — settled or not.**
  Every cost site used to key off `isPending` (`refundable && !settledOn`), so a
  reimbursed flight was left out of the burn while the money was still out and
  counted in full the day it arrived. That is backwards: the app was sure it
  was not a cost while that was uncertain, and called it a cost once it was
  certain it had not been one. One reimbursed trip a month shortened the
  runway, ate the category budget and filled Where-it-went with money that was
  never yours. `netCost(t)` is the one answer — still out: nothing; fully
  refunded: nothing; short: the difference — and `costParts(t)` scales a split
  by the same ratio so no caller has to know. The residual lands in the month
  you SPENT it and under its own category, so a refund arriving in May corrects
  March rather than charging May for a March flight; past months move, and that
  is a correction of fact, not a re-valuation. The refund entry (`refundFor`)
  comes out of income for the same reason — **both halves come out together**,
  or a reimbursement reads as a month where you both spent and earned money you
  never had. `isPending` survives for one job only: whether something is still
  outstanding, which is what Home's Pending card asks.
- **Goals are planned on what you spend, not on the limits you set.**
  `plannedOutgoings()` used to count a budgeted category at its LIMIT and
  everything else at behaviour. That only holds while the budgets describe what
  you do; set above it — the ordinary case, because a budget is written once
  and hopefully — every one quietly removed the difference from what reached a
  goal, so a goal got pushed out for money that was never going to be spent.
  Outgoings are the burn rate now. **A consequence worth knowing: correcting a
  budget no longer frees anything**, so no proposal may claim it does, and the
  adviser's re-read step is gone. Budgets keep the job they are good at —
  saying a category is running hot before the month ends — and `slack`
  (limits minus observed) exists only so `budgetSlackNote()` can explain why
  the two figures differ.
- **A goal that watches a total holds nothing back.** `g.tracks` is `pocket`
  (money actually set aside — the default), `free` (reachable money) or `worth`
  (net worth). Only a pocket goal reaches `goalsHeld()`, and only a pocket goal
  can be told to set money aside: `free` and `worth` are whole-position figures
  that already contain the money, so reserving against them would subtract it
  from `spareAssets()` and credit it as progress at once — the same dollars
  twice, in opposite directions. Watching goals are therefore dropped from
  `adviceMonth().moves` (there is nowhere to move money to) and `goal-fund`
  refuses on one.
- **Deleting a record has to take its money with it, or leave it alone.**
  Deleting a grant removes its award and every entry spent from it, because the
  grant record is the only reason the ledger knows that money was not yours —
  keep the entries and the award becomes your income, the unspent balance
  rejoins your net worth, and the spending starts counting against your own
  budgets. Its pocket goes too, unless something of yours is filed in it.
  Deleting a *pocket* is the opposite case and keeps every entry: they move to
  Unallocated, the account total does not change, and only a pocket holding a
  live grant refuses. A holding keeps the payouts it made, since that money
  really did arrive, but they stop being counted as a return on anything.
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
  out. Recording a sale as income counts the same money twice. **Nor is buying
  one a way to get richer**: `invest-add` used to put the figure you paid into
  the new account's `opening`, which `totalAssets()` counts, so adding a
  holding you had just paid $5,000 for raised your net worth by $5,000 out of
  nothing. It asks which account the money came out of and writes the transfer.
  An `opening` is still right for a holding funded before this ledger existed,
  which is the other option in the same picker.
- **The projection never averages past income.** `projectForward()` uses
  scheduled recurring income only, weighted by confidence. Averaging what a
  contractor earned last quarter is the lie that makes freelance work look like
  a salary. Confidence lives on `state.plan.lines`, never on the recurring
  record — join through `planKey`.
- **The projection starts next month from today's balance, so the rest of THIS
  month has to be folded in.** `projectForward()` walked from `i = 1`, which is
  next month, off `freeAssets()`, which is now — and everything between the two
  fell through the gap. A salary due on the 30th was on Contracts, in Home's
  Pending card and nowhere on the chart, so every point for eighteen months sat
  a month's income low and anyone paid at month end read their whole future
  understated. The `stub` closes it: income whose `startsOn` falls after today
  and inside this month, less `(burn + goalHold) * daysLeft / daysInMonth`,
  applied to the opening balance rather than drawn, because the x-axis is
  months and this is a part-month. `opts.extra` for the current month goes in
  here too — a purchase asked about *this* month never reached the loop either.
  It counts **one payment** (`L.base`), not `L.monthly`: a weekly line
  contributes the single occurrence the stub can see rather than four and a
  third, which undercounts, and undercounting is the safe direction for a
  figure someone plans against. `pr.opening` is captured **before** the walk —
  read off `balance` at the end it is the figure eighteen months out — and the
  band states it, or the chart opens on a number matching nothing else on
  screen. `outlook.js` computes the stub from today's date rather than writing
  it down, because it is nearly a whole month on the 2nd and almost nothing on
  the 29th.

- **A contract ends on `r.until`, and its renewal ends on `r.renewUntil`.**
  (`endsOn` belongs to grants; writing it on a recurring record means the
  contract silently never ends, which is how the sample's headline cliff went
  missing.) `renews` used to pay its weighted fraction to the edge of the
  horizon — eighteen months of income from a job that finished, at 45%, which
  flatters every figure built on it. The second date is how far a renewal is
  expected to run; past it the line stops. Left empty it still runs on, because
  that is what was said, and `renewUntil` is dropped when `renews` is.
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
- **A goal is a promise with a date on it, not a bill.** Every afford route
  measured the purchase against savings the goals had declared untouchable, so
  with goals set beyond the income the tool could only answer "no" and never
  asked whether the goal should move. The `slip` route pauses the goal costing
  the most a month. What that frees is **`surplus + pace`, never the pace** —
  the surplus it is paused into may already be negative, and the first thing
  the freed money does is close that gap; reading the pace alone said one month
  where two were needed. And a pause is not a diversion: `goalDelay()` models
  money taken away for good and reports every full pause as *breaking* the
  goal, so a paused-then-resumed goal computes its own slip, which is exactly
  the length of the pause.
- **A screen that says you are short must not open with "Yes".** When
  `monthlySurplus().surplus` is negative that is the finding, stated before
  anything about the purchase, and only a route paid out of income or out of
  spending less is still a plain yes — under a shortfall the savings pile is
  going down anyway and nothing is putting back what comes out of it. The same
  rule upward: Outlook leaves goals out, so if the goals-fed line crosses zero
  inside the horizon the headline is amber and says so, or it reads "you stay
  above water" in green directly above a card saying the month never balances.
- **The afford card is a glance, not an essay.** It was five stacked
  paragraphs — a sentence and a half per route — and its owner could not read
  a word of it. The shape now: an alarm line if the month is short, the answer
  in one sentence with its price in a second, three tiles (`Savings` ·
  `Income` · `Delays`), where you stand as two figures over one line of
  arithmetic, then every route as **one row under aligned columns** —
  `Savings` and `Costs`, the only two currencies a route has. Prose belongs to
  the route being looked at, once, under the table. Three rules hold it
  together: the verdict describes the *cheapest* route while the tiles
  describe the *selected* one, so the tiles are captioned with whose figures
  they are; a route label is a column heading and not a clause, so each route
  carries a `phrase` that reads after both "Yes —" and "Only by"; and a
  blocked route can never be selected, so its reason prints in its own row or
  it has nowhere to say why it is shut.
- **The screen may not use a word it has not defined.** "Out of promises" was
  the badge on most of the afford cards and appeared nowhere else in the app;
  a pill says which of the two it lands on, the cushion or a named goal. A
  negative is never printed as a minus figure ("spare: −$1,148" says the true
  thing backwards) — print `Math.abs()` under a label that carries the sign.
  And `label.toLowerCase()` in a sentence put "pausing cyprus move" on screen:
  a route naming a proper noun carries its own `phrase` for that slot.
- **The adviser proposes and never acts.** `adviceProposals()` returns
  changes; nothing moves a figure until a tap, and every `apply()` hands back
  its own undo. It computes nothing of its own either — every figure comes
  from `monthlySurplus`, `goalNeed`, `budgetRows` or `spendByCategory`, the
  same rule the written report lives by, or the advice and the app will
  eventually disagree and only one will be right. **Order is the whole of the
  intelligence**: budgets that do not describe what you actually spend are
  corrected first, the month is re-read as if they were (`freed` is exactly
  what `plannedOutgoings()` would return with the new limits), and a promise
  is asked to move only if it still does not fit. Proposed against today's
  figures instead, the first advice it gave was to take the date off a goal
  while a $300 budget for something costing $120 sat two cards below. And the
  promise it moves is the **cheapest sufficient** one — the goal whose pace
  can drop by the deficit with the least slip — not simply the largest.
  `state.settings.adviceOff` holds what the reader has waved away; like every
  other settings key it is adopted in `adoptState` and nowhere else.
- **Grants are a mode, and a mode may not move a figure.**
  `state.settings.grantMode` decides whether anything grant-shaped renders —
  the hub page, the Settings row, the report's restricted section. It decides
  nothing else: `restrictedTotal()`, `trueBurnFor()` and `spendByCategory()`
  exclude grant money in both positions of the switch, and `hub.js` reads
  Worth with it off and on and compares the two character for character. A
  book that already holds a grant is in the mode whether the setting says so
  or not (`grantMode()` is `settings.grantMode || grants().length`), which is
  what stops this shipping as a feature that hides money people are already
  tracking — and is the same fact as "switching it off with a live grant
  refuses".
- **Removing an account is three different things.** *Closing* keeps it on the
  screen and stops new money landing in it. *Deleting* (`account-del`) takes
  its transactions with it. *Removing* (`account-forget`) is the third and the
  one a pocket always had: the record goes, every entry stays exactly as
  logged, and `state.forgotten[id]` keeps the name so `accountName()` can still
  answer "Old BoC (removed)" — without it every one of those rows reads
  "(removed account)" and the history stops being history. Its balance does
  leave your net worth, because the account is gone, and the confirmation says
  so with the figure rather than letting it be noticed later.
- **An average is over the months that have entries.** `spendOver()` returns
  `live` beside `total`, and the ranged Where-it-went divides by it. Dividing
  by the months you asked for makes every average look better the further back
  you ask, which is a plausible wrong number rather than a visible failure.
- **A goal carries the adviser's reading of it, and computes none of it.**
  The Goals page was a list, so the three things that decide whether a goal
  happens — what it is owed this month, what would have to change for it to
  fit, and the budgets corrected before it is asked to move — all lived on
  another screen. `goalAdviceBlock()` is handed `adviceMonth()` and
  `adviceProposals()` already built, once for the page rather than once per
  card, and finds a goal's own proposals by the id they are named with
  (`goal-date-<id>`, `goal-target-<id>`, `goal-pause-<id>`). The budget note
  is one fact about the month, so it is said **once above the goals** — in
  every card it was the same paragraph four times.
- **"Kept" is income less TRUE BURN, not income less what left.**
  `monthSummary().kept` sits beside `.net`: `net` is the month's real cash
  movement (one-offs included, because they really did leave), `kept` takes
  one-offs out as well. `avgMonthlySaving()` averages `kept`, because it is
  making a **rate** — a laptop bought once is not a reason to say you cannot
  save every month. A real book read "$600 salary, +$48 kept" in a month whose
  true burn was $369, because a $183 one-off was inside the figure; that $48
  was then held up against a goal as what its owner manages every month. The
  plan close-out keeps `net` on purpose: it is a retrospective on one named
  month, not a rate.
- **A warning states its cause, or it reads as the app being broken.**
  "Over-allocated $185.10" on an account card was a conclusion with nothing
  attached. The row now prints the two figures it came from — what the account
  holds and what its pockets claim — so the reader can tell which side is
  wrong: if the account line disagrees with the bank, the fault is in an entry;
  if the pockets line disagrees with the pockets above it, the fault is in the
  app. Same rule as the pace and the written report: a figure that cannot be
  checked or acted on is worse than no figure.
- **Over-allocation has two causes and the note names both.** It said only the
  common one — money set aside into a pocket and then spent straight from the
  account without the pocket being named, so the pocket keeps its figure while
  the account drains. The first real book it met was the other one: money that
  arrived and was never logged (or an opening figure entered too low), which
  leaves the **pockets right and the account short** and presents identically.
  Told to look for spending that did not exist, its owner concluded the app was
  broken. `balanceFloor(acc)` walks the account's history in date order and
  returns the lowest it ever was — a mis-filed pocket keeps the account
  plausible the whole way through, a missing deposit takes it below zero
  somewhere, and that dip is the only evidence in the book which of the two it
  is. It is stated with its date and against the opening figure, and only when
  it is actually negative. (Sort before walking: `state.transactions` is in the
  order things were entered, not the order they happened.)
- **An opening figure is the one number a ledger cannot check, so there is a
  way to correct it.** Balances are derived from opening plus entries, which
  makes every entry checkable against a receipt and leaves the opening as the
  single stated figure with nothing to test it. Two accounts created with an
  opening of nought for money that was already in them put the first real book
  $2,226 out: every dollar that left them came from nowhere, and it surfaced
  three screens away as pockets claiming more than their account held.
  `account-true` asks what the account really holds and moves the **opening**
  by the difference. An adjustment *transaction* would do the same arithmetic
  and lie about a month — it would land in income or in the burn rate — so the
  dialog says no entry is touched and `reconcile.js` asserts the burn rate does
  not move. The opening keeps the rate it was frozen at (`opening += delta *
  acctRate`), because recomputing it at today's rate would re-value a figure
  that is already recorded; for the same reason the picker opens on the
  account's own currency and the prefill is converted into it, since a base
  figure under a EUR label invites a EUR number typed into a dollar box.

- **A pace needs three months, the same as a burn rate.**
  `avgMonthlySaving()` returns `partial` when it has fewer than three, and the
  screens then refuse to state a rate or a shortfall built on one — they say
  how many months there are and point at what the month leaves instead. Before
  this, a ledger a fortnight old reported "$48 a month" off a single August and
  declared a goal short by $629 a month on it. The current month stays out
  (it is half over, so its spending has not finished even when its income has)
  and the screen **says so by name**, or a month where real money arrived looks
  like it went missing.
- **The pace never appears as a bare figure.** `avgMonthlySaving()` returns
  `{rate, months, incomeMonths, parts, lumpy}`, not a number, because a number
  here is close to useless: income that arrives in lumps makes a monthly
  average say more about WHEN you were last paid than about how you are doing.
  Three months with one dry month average to almost nothing, and the answer
  swings wildly as that month falls in and out of the window. It was also read
  over 3 months on Goals and 6 on Insights, so one question had two answers
  with nothing saying why — there is **one window** now. `paceWords()` states
  the span, `paceBreakdown()` lists what each month contributed (said once
  above the goals, not repeated in every card), and `lumpy` — income in fewer
  than half the months — makes the screen say the average is a poor guide
  rather than printing it flat. The pace is stated even when it is nought or
  below; it used to be dropped unless positive, so the one case that most
  needed saying printed nothing. A negative is "gone $250 a month backwards",
  never "kept −$250".
- **`pace` and `monthlySurplus()` are both honest and they disagree.**
  The pace is what you actually kept; the adviser reads what the
  month leaves once the plan is paid. A freelancer who underspent last quarter
  has a pace that covers a goal the plan does not, so the card read "your
  recent pace of $1,312/mo covers it" eight lines above a proposal to move
  that same goal. When the adviser has a proposal for a goal, the line names
  the pace as behaviour rather than plan and points at the answer below, and
  its tone goes amber — green is a healthy state and nothing else. (That
  `tone` was computed on all four branches of `goalsBody` and read by nothing,
  so a goal past its date and a goal on pace printed in the same grey.)
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
- **A split belongs to one amount, so anything that changes the amount drops
  it.** `tx-edit` wrote `t.amount` and left `t.splits` alone, so an entry
  edited from $60 to $80 kept parts reading 38 + 22 — `spendByCategory()` and
  `planActuals()` then disagreed with `monthSummary().expense` and
  `trueBurnFor()` by $20 with nothing said. Scaling the parts to fit is
  guessing at money and refusing the edit means a typo can never be corrected,
  so the parts go and both the dialog and the toast say so. The same holds for
  a type change: expense categories filed under income are nonsense. The
  currency is deliberately not a trigger — the parts are in the entry's own
  currency, so they still sum to it.
- **A pocket's opening figure is in the pocket's own currency**, at the rate it
  was opened at, exactly like the account it sits in — `pocketOpeningBase(p)`
  beside `acctOpeningBase(a)`. `pocketBalance()` used the raw figure while
  `balanceOf()` converted the account's, so a lira pocket in a lira account was
  counted as dollars and `unallocatedOf()`, which subtracts one from the other,
  went to pieces. A pocket saved before this carries no `currency`, so
  `toBase()` hands the raw figure back and nothing stored moves — which is also
  why `pocket-edit` opens its picker on **base**, not the account's currency:
  defaulting to the account would re-value an old pocket the moment anyone
  opened the dialog and pressed Save.
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
- **One type ramp, one press feel.** `--fs-xs` `--fs-sm` `--fs-md` `--fs-lg`
  replace the eleven sizes that had accumulated between 0.66rem and 0.86rem,
  chosen a card at a time. `--t` (120ms) is the only transition, applied to
  every tappable thing in one rule rather than per component, with a
  `:active` give and `prefers-reduced-motion` honoured once for all of them.
  Nothing reacted to a tap before, which is most of why the app read as stiff.
- **Cards are separated by fill, not elevation.** One shadow exists, on the log
  bar, because it floats over scrolling content.

Both token vocabularies are live: the design's (`--bg --tint --ac --calm
--emph --alert`) and the original names, which most of the app still uses and
which are aliased onto the new values.

## Coffer's shape

**Five tabs, and a gear.** Home · Ledger · Horizon · Worth · Insights, with
Settings on a gear in Home's header. Settings is opened a few times a year and
was holding a sixth of the bottom bar; **that freed slot is what pays for
everything else** — Horizon exists because of it. A tab that grows past about
three cards has stopped answering one question — split it, or give it a
`subNav` the way Worth does. Today was allowed to reach ten blocks, six of them
another tab's card rendered in full, and became the thing everybody scrolled
past; Overview died of the same thing at seven.

**Home opens on the day and closes on the month**, in that order: what you
spent today and what it went on, where you stand (net worth and runway as two
tiles, not two full-width blocks), the advice line when there is one, the
one-tap buttons, what is Pending, and the month's two spending numbers last. A
summary of the month above the day it is made of is the wrong way round.

**Pending is one card, because it is one question**: bills inside seven days
have not left yet, refundables have not come back yet. Each refundable carries
`tx-settle` as an icon-only button — the label lives in `title` and
`aria-label`, never in ink.

**Horizon is a hub, not a sub-nav.** Eight sub-tabs on one strip put the last
three off the edge of a phone, and nobody opened them. The hub is the
projection and one piece of advice as lead cards, then `PLAN_PAGES` as buttons
that open full pages: **Contracts · Budgets · Goals · Bills & one-offs · The
plan**, with **Grants** joining them only in grant mode. Every hub card is the
**same size** — a bigger card reads as a more important page, and these are
equal questions — so the sub-line is one clipped line and the icon takes the
slack. `outlook` and `advice` are pages too, reached from the lead cards and
from anywhere that links straight to them; they are in `PLAN_DEEP`, not on the
grid. New work becomes a page here rather than a sixth tab.

**The Horizon tab always lands on the hub** (`currentPlanTab()` returns
`planTab || "hub"`, and the tab handler clears `planTab`). Opening on whichever
page you last used means the tab shows a different screen depending on what you
did ten minutes ago, which is why nobody could learn where anything was.

**Bills & one-offs is one question — what is dated.** A bill leaves on a cycle
and a lump sum lands once; both are things with a day attached that you have or
have not settled, which is exactly what Home's Pending card is built from.
Contracts are the other half and have their own page, because a payer, an end
date and a likelihood of carrying on are what every projection is built from.
The retired `income` sub-tab id still routes, to `contracts`.

**Worth keeps its `subNav`** (Accounts · Investments · Debts) and is the screen
the others are patterned on.

When a screen is rebuilt, check nothing was the *only* caller of an action.
`accountsCard()` stopped being called during the Worth rebuild and took pocket
editing with it; the buttons still existed, nothing rendered them. It stayed
dead for two more rebuilds. **Scan for orphans after every reshape** —

```
python3 -c 'import re;s=open("coffer/index.html").read()
for n in sorted(set(re.findall(r"^  function ([A-Za-z_$][\w$]*)\(",s,re.M))):
  if len(re.findall(r"(?<![\w$.])"+n+r"(?![\w$])",s))<=1: print(n)'
```

— and either give the function a caller or delete it, leaving a note saying
what renders instead. Six were removed this way; only `pad2` is allowed to
survive uncalled, as a one-line utility.

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

## Mashghal's rules

Work leaves a wake — the report, the copy sent to certain people, the file put
somewhere — and the app holds the wake. Four nouns and nothing else:

- **A board** is a procedure (a template) or a run of one.
- **A node** is a step (`do` · `send` · `watch` · `ask` · `file`) or a thing
  (person, file, photo, kit, note).
- **An edge** is `flow` (sequence) or `link` (association, with no ordering
  meaning whatsoever).
- **A due** is a live step of an open run, and is derived, never typed.

- **A procedure is a graph, not a checklist.** The first real example had a
  send that opened a wait on two named people, a decision, and a loop back to
  an earlier step; the next had a run sitting at four nodes at once, a dated
  step and a wait with nobody to chase. A flat `steps[]` array holds none of
  that. And a run is at a *set* of steps, not one: `activeNodes()` derives that
  set from `enteredAt`/`doneAt` rather than storing a position, so it can never
  disagree with the dates.
- **Sequence and association are different edges and must never be conflated.**
  A run advances along `flow` edges alone and never touches a `link`, which is
  what lets a reference photo or a pair of headphones hang off a step without
  becoming a predecessor. Draw them differently too — inked with a head, versus
  dashed without one.
- **A run freezes its procedure when it starts.** `startRun()` deep-copies the
  template, so editing the template can never move a run already under way and
  a run's own attachments can never leak back into the template. Same
  discipline as Coffer's frozen rates.
- **A run is never advanced for you.** An `ask` is answered by a person, never
  inferred from elapsed time, and finishing an `ask` opens *only* the exit that
  was chosen — which is exactly how the revision cycle loops.
- **The archive lock.** `run-close` refuses while a `file` step is undone, and
  says which. Asked what actually gets forgotten, the owner named three things:
  chasing people, getting back to where they were, and filing. So an overdue
  `send`/`watch` outranks everything on every screen, every run shows where it
  stands without being opened, and a printed-but-never-archived run stays on
  the list rather than being tidied away.
- **Silence is not always failure.** `overdueBy()` returns 0 when a step has no
  chase interval — a wait with no chase set can sit for ever without being
  called late, because nobody said when to chase it.
- **Nothing is hardcoded.** Claimants, modes, benches and board kinds are all
  added, renamed and removed by the reader; the sample seeds one person's set,
  it is not the app's vocabulary. Removal follows the `forgotten` pattern so a
  past board still reads "U. of Balamand (removed)" rather than losing its
  history.
- **A board carries a kind and only optionally a bench.** A visa or a
  scholarship belongs to no employer. That is the brief's "life underneath that
  belongs to none of them".
- **No notifications, and the app says so.** Push needs a server and a secret
  key, and a public Pages repo cannot hold one — already turned down for
  Coffer. What is late is waiting when you open it.

## Mashghal's other rules

- **Hours are derived from spans and no total is stored.** A span is a stretch
  at one bench; every figure on the week is summed from them, so none can drift
  from the record. Switching is one act, so the old span ends exactly when the
  new one starts and no minute belongs to both.
- **Three things the app refuses to invent.** An open span is not an hour and
  counts nowhere. An open span from yesterday, or longer than `LONG_DAY`, is a
  question rather than an amount, and is closed only by being told when you
  left. Time at no bench goes to suspense, is shown, and is never distributed —
  guessing would put hours on an employer's name.
- **A claimant owed days is measured in days.** `owedOf()` carries the unit;
  counting one in the other's is exactly the plausible wrong number this repo
  refuses.
- **A week is measurable only if it has an entry for somebody.** Any entry means
  a nought for this claimant is real; no entry anywhere means the week was not
  lived in the app, prints as a dash, and is left out of every total. The report
  called three unused August weeks "short by 20h" each before this rule existed.
- **The report computes nothing of its own and states its own limits** — the
  same two rules Coffer's `buildReport()` lives by. Read it after changing it;
  both defects in the first draft were invisible to assertions and obvious on
  sight.
- **A cadence has no due date.** Every so often since it was last done, so
  arrears never compound: there is one of each, however far past. It carries a
  place, so the phone offers only what is doable where you are, and it can name
  the bench or thing it protects — a stale backup is a threat to the work behind
  it, not a chore.
- **The kit is what a mode hands you**, and the re-entry note is what you left
  behind: one line per bench, asked at the moment of leaving because that is the
  only moment you still know, and read back on arrival.
- **Sync is sealed here and merged per record.** Whole-file last-write-wins eats
  a day logged on the phone, silently — so every record carries `updatedAt`, a
  hard delete leaves a tombstone, and `go()` stamps only what changed. Pull,
  merge, push is one act; pushing without pulling overwrites someone's day.
  Neither the token nor the passphrase is ever in `state`, so a backup carries
  neither.
- **The launcher is handed an id, never a path.** `mashghal://enter/<id>` and
  nothing else; the PowerShell handler refuses any other shape and looks the id
  up in a file already on the machine. A handler that ran what a link told it to
  would be an RCE hole registered on your own laptop.
- **The digest is numbers only.** No label, no name, no note — it can leak in
  full and say nothing about the work. A scheduled job cannot hold the
  passphrase, so the file is written to be worth nothing instead.

## Mashghal's shape

**Five tabs: Boards · Waiting · The week · Kit · Settings**, and a switch bar
pinned to the bottom of every screen showing where you are, since when, and the
note you left. Boards lists procedures and runs; opening one shows the canvas
over an editable list. Waiting is the only screen the phone really needs — dues
worst-first, unfinished runs, and upkeep filtered by place. The week is the
standing, suspense and repair, and holds the report. Kit is the vocabulary plus
each mode's kit.

**Every tab always lands on its list.** Which board is open, which week is
shown, which report is built and which mode's kit is open are all *view state* —
module-level `openId`, `weekOf`, `reportOn`, `openMode`, `placeFilter`, none of
them in `state`, so none reaches a backup or survives a reload. Keeping it in settings meant the tab
showed a different screen depending on what you did ten minutes ago, which is
the same trap Coffer's Horizon tab fell into.

**The canvas is ArcGIS ModelBuilder, deliberately.** Rectangles with a cut
corner are steps, ovals are things, and the owner reads that vocabulary
professionally. It pans, zooms and drags, positions persist on the node, and
`autoLayout()` seeds them in a serpentine so nobody ever meets a blank sheet —
its BFS ignores back edges, or the loop in a revision cycle drags its own
target off to the right. "Tidy" re-runs it.

## Mashghal's look

**Evening ink**, from `mashghal/DESIGN-HANDOFF.md` — chosen out of three
directions a design round came back with, and committed dark because the brief
asked for it, so there is no light palette and every colour is painted
explicitly. It replaced the first build's drafting room, which was one cold
hue with state carried by hairlines and uppercase mono labels, and read as an
instrument panel. Four rules hold it:

- **Two hues, and each says one thing.** **Sage** is in hand and healthy.
  **Apricot** is late, and late is the only alarm — there is no red in the
  palette at all. Everything else is neutral.
- **Waiting carries no colour.** A step waiting three days against a five-day
  chase is not a problem, and the first build coloured it amber as though it
  were. The ladder, in the order it has to be legible: **late** apricot ·
  **in hand** sage · **waiting** dim grey · **not started** faint · **done**
  receded, and it sinks. `stateTone()` and `NODE_INK` are the same ladder, one
  for the rows and one for the canvas, and a change belongs in both. The state
  is written as a **word** beside the colour, so the board survives a reader
  who cannot separate the hues.
- **Nothing emphatic borrows a state hue.** A primary button is neither late
  nor healthy, so it takes contrast — ink on the page colour. A `danger`
  button is quiet at rest (a row of apricot `×` buttons competed with the one
  step that was actually overdue) and colours only under the finger; inside
  `#overlay` it is loud, because there is one action there and it is the moment
  of consequence.
- **A claimant's or a kind's colour is identity, not state**, so it comes from
  its own muted family and never from sage or apricot. Those two are read as
  "how is this going" everywhere else.

A line on the sheet is a path and not a state, so it carries no hue either:
sequence is neutral, dead sequence dimmer, and a loop back is legible by the
**arc over the top** rather than by colour. Association is dashed and brass.
The sheet keeps its survey grid (fine at 40, heavy at 200) panning and zooming
with the work, the paper grain over the top, and the **title block** in the
corner the way every site drawing has one — and now a **legend** at the foot in
plain words, `— comes after · ·· belongs with, no order`, because the
distinction the whole model rests on should be written where the sheet is read.

Bricolage Grotesque 500 with negative tracking carries display, names and
figures, and is **embedded as a base64 woff2** because the app must open with
no network. Work Sans for the work and Newsreader for serif asides are named
first and fall back to system sans and Georgia — embedding all six faces came
to 415KB against a 189KB app. Mono only for what is genuinely machine-read:
clocks, counts, act labels. Panels round at 12px and float; **no shadow inside
a frame** — separation comes from fill.

**On a phone, a row wraps its buttons onto their own line** (under 560px). A
pill, a sentence and two buttons on one line left the sentence about ten
characters wide, and an upkeep row naming a place and the thing it protects
wrapped to nine.

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
UI, and prints what it found. **Not everything in the scratchpad is a test**,
so never run them all with a `for f in *.js` — some are source drafts that do
nothing, some render screenshots, and `icons.js` is a *generator* that writes
Bustan's PWA icons back into `icons/`. A blanket sweep once left three
committed PNGs modified as a side effect of a Coffer change. Name the scripts
you mean, and `git status` before committing. Screenshot anything visual and *look at it* —
a bug that renders 55 plants identically passes every assertion you thought to
write.

The scripts drive the real UI, so **a reshaped screen breaks them and that is
not a regression** — but a suite nobody trusts is a suite nobody runs, so fix
them in the same change. Four traps account for almost every stale one.

- `innerText` reflects `text-transform`, so a heading uppercased in CSS reads
  `SALARY` and `.includes("Salary")` is false. Write the *verdict* and its
  failure message off the same comparison, too — one helper here tested
  case-insensitively for PASS and case-sensitively for the detail line, and
  printed `"Pending" missing` beside a `PASS` for a year.
- The ledger and plan rows are `div.row` and `.card`, never `<tr>`, so
  `closest("tr")` returns null. Home's Pending rows are `.pend-row`.
- **A Horizon page is opened with `[data-act="plan-tab"][data-id="…"]`**, not
  `.subnav button[data-id="…"]` — that selector belongs to Worth now. Matching
  a hub card by its label fails too: its `innerText` is the name *plus* a
  sub-line, so `/^Budgets$/` never matches.
- **A grant-less book has no Grants page**, because grants are a mode. A script
  that adds the first grant has to switch it on the way a person does: Home →
  gear → `[data-act="grant-mode"][data-v="1"]`.

When a dialog gained a confirmation step, the script has to press through it —
logging from the bar goes via `#omniSheet [data-act="omni-commit"]` now, income
asks what arrived before it writes, and loading the sample asks before it
replaces anything.

Two figures moved and take assertions with them. **Net worth to the cent is on
Worth** (`.hero-fig`); Home prints it rounded in a `.stand-fig` tile. **The
typical month's burn is on Insights**; Home's month card is `viewMonth`'s own
figures, which is `$0` in a month whose only spending was a grant's.

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

That site-wide scope cuts both ways. Coffer is served from **two** paths on one
origin — `/Apps/coffer/` and `/deep/apps/coffer/` — so the two copies shared one
ledger, and loading the sample in one wiped the real book in the other. The key
is now derived from the path:

```js
var STORE_SUFFIX = /(^|\/)deep\//.test(location.pathname) ? ".deep" : "";
var KEY = "coffer" + STORE_SUFFIX + ".v2";
```

Derived rather than hard-coded per copy, so `index.html` stays byte-identical
between the two and there is no line for anyone to forget to change when
copying it across. `LEGACY_KEY` and `PHOTO_DB` take the same suffix, and so
does the pre-paint theme reader at the top of the file — it runs before the
main script and needs its own copy of the expression. Anything not under
`/deep/` keeps the original key, so no existing install loses sight of its
data.

## The written report

`buildReport()` in Insights writes the whole ledger down as prose — for an
accountant, a visa application, or reading once a quarter. Two rules keep it
worth trusting. **It computes nothing of its own**: every figure comes from the
function the screen uses (`monthSummary`, `trueBurnFor`, `budgetRows`,
`grantLeft`, `projectForward`), or the report and the app will eventually
disagree and only one of them will be right. And **it states its own basis and
its own limits** — how many months the burn rests on, what is still owed back,
which rates are stale, whether a plan exists at all. A report that hides how
thin its data is, is worse than no report.

Read it after changing it. Two defects in the first draft — a dangling "with
entries in" and a contract that appeared to stop twice — were invisible to
every assertion and obvious on sight.

## Sample data

`sampleData()` is the thing people are shown the app with, so it has to
exercise the app rather than describe it: two currencies, pockets in three
states, a grant with lines, two holdings (one funded by a transfer, one held
from before the ledger), a split, a cross-currency exchange with a spread, a
contract that ends, a salary with an allowance inside it, and a one-off fee
with a date on it so the half of Bills & one-offs that is not a bill has
something in it. If a feature has no representation here, nobody can be shown
it.

Three rules it must keep. **Nothing may be dated in the future** — and because
that left the current month with four entries when the sample was loaded on the
3rd, the current month's days are squeezed into the days that have actually
happened while `elapsed < 12`, with `Math.ceil` so the last entry lands *on*
today and "Spent today" is not empty. **The grant arithmetic has to
self-check**: the award transaction equals the grant total, and spending never
runs past it, or the sample demonstrates a bug instead of a feature. And
**anything the sample puts into a pocket has to come out again** — rent was set
aside every month and then paid from the account, so the pocket climbed to
$3,800 and showed the opposite of what a pocket is for. Money in, money out,
and it sits at one month's rent.

Look at it after changing it. Every figure on every screen is derived, so a
plausible-looking seed can still produce a screen that says something false.
