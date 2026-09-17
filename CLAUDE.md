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

## Where things live

**An app directory holds only what a browser loads** — `index.html`,
`manifest.webmanifest`, `sw.js` (and Bustan's five scripts, which really are
loaded). Everything else moved out into a folder that says what it is, because
six shouting `.md` files sitting beside the app they describe are
indistinguishable from app files, and one of them turned out to be two dead
`.dc.html` design comps referencing a `support.js` that was never committed
and pulling webfonts off a CDN — inside the directory of an app whose first
rule is that it fetches nothing.

```
<app>/docs/                 briefs, the design system, formats — never served
tools/                      icon generators; nothing ships, no app loads them
mashghal/companion/         the mashghal:// handler, to be installed
mashghal/mailer/            the scheduled digest workflow, to be installed
handoff/                    not an app: one page of screenshots for a round
```

Every one of those folders carries a `README.md` naming its contents, and
inside `docs/` the names are lowercase-kebab and say what the file is:
`design-system.md` rather than `DESIGN-HANDOFF.md`, `design-brief-round-2.md`
rather than `DESIGN-BRIEF-2.md`. Shouting names are reserved for the three
files at the root that are the repo's own conventions — `CLAUDE.md`,
`README.md`, `ROADMAP.md`.

**Two paths were deliberately left alone.** `garden/` is Bustan: the name
changed and the directory did not, because the manifest `id` and `scope` are
the app's own directory and moving either makes the browser treat it as a
different app and orphans every install. And `handoff/` keeps its
uninformative name because it is a live URL on the Pages site; it got a
`README.md` instead. **Renaming a served path is never worth a tidier tree** —
say what a directory is in a file inside it.

`.gitignore` exists for one reason: `shots/`, where the Playwright scripts
write their screenshots. Those are evidence for one change, and a blanket
`for f in *.js` sweep once left three committed PNGs modified as a side
effect of a Coffer change.

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

The Press system, from `coffer/docs/design-system.md`. Three rules worth keeping in
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

**The scan has two false negatives and both have hidden a dead function.** The
word boundary `(?<![\w$.])` allows a **hyphen** in front, so every
`"text-anchor": "middle"` on Mashghal's sheet read as a call to `anchor()` and
it survived three reshapes uncalled. And a mention inside a *comment* counts,
which is how `picThumb` stayed on the list after nothing called it. Sharpened,
the test requires the name to be followed by a call or a hand-over:

```
python3 -c 'import re;s=open("mashghal/index.html").read()
for n in sorted(set(re.findall(r"^  function ([A-Za-z_$][\w$]*)\(",s,re.M))):
  if len(re.findall(r"(?<![\w$.\-])"+n+r"(?![\w$])(?=\s*[(,)\];]|\s*$)",s))<=1: print(n)'
```

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
  sight, and so were both of the next two. It knew about runs and nothing about
  what they were for, so it now opens the work with **PROJECTS** (every word
  from `projState()` and `projSays()`, the same two the Jobs tab reads, so the
  report cannot call a project late while the screen calls it in hand — there is
  a test that compares the two character for character) and closes it with
  **WHAT WAS FILED IN THIS PERIOD**, because a done filing step is the only
  thing in the book that says a piece of work left the building. `filings()` is
  one walk, ranged or not, and `projOutputs()` is the unranged call of it — two
  walks would eventually answer one question differently.
  The two defects reading found: **`niceDate()` is relative**, so the
  week-commencing column printed "w/c yesterday" — `plainDate()` exists for a
  date in a table, and `niceDate` stays for a date in a sentence. And a
  four-month report printed **sixteen identical "nothing recorded that week"
  rows** above the two rows anybody wanted, so consecutive empty weeks collapse
  to one line that still says how many they were. A report nobody reads to the
  end is worse than a shorter one.
- **A cadence has no due date.** Every so often since it was last done, so
  arrears never compound: there is one of each, however far past. It carries a
  place, so the phone offers only what is doable where you are, and it can name
  the bench or thing it protects — a stale backup is a threat to the work behind
  it, not a chore.
- **The kit is what a mode hands you**, and the re-entry note is what you left
  behind: one line per bench, asked at the moment of leaving because that is the
  only moment you still know, and read back on arrival.
- **The sealed payload is compressed, and the size was measured before it was
  changed.** The bare book is 23KB of JSON and seals to 31KB of base64; twenty
  travelling thumbnails take it to **1.3MB** and forty-seven to **3MB**, past
  what a gist hands back inline. Gzipped, the bare book is 6KB and a realistic
  book shape compresses about **7×** — base64 wastes a third and gzip reclaims
  most of it even on already-compressed JPEG. `CompressionStream` is a platform
  API and not a dependency: nothing is fetched and nothing is installed, and
  where it is missing the blob is sealed uncompressed exactly as before.
  **Compress then encrypt**, in that order: the other way round compresses
  random bytes and saves nothing. (The usual caveat about compression leaking
  plaintext length needs an adaptive oracle, and there is none here — an
  attacker sees one static blob, whose length already leaked.) The envelope
  carries `z: "gzip"` so a book sealed **before** this still opens, which is
  the whole point of the marker: without it every gist already out there
  becomes unreadable the moment one device updates. There is a test that seals
  an old-style blob by hand and opens it.
  One promise trap worth remembering: a rejection handler **cannot catch its
  own sibling's rejection**. Attached as the second argument of the `then` that
  *starts* the decrypt, it never saw a failed decrypt at all — it belongs on
  the `then` that follows it.
- **The pictures travel in their own file, so the record can never fail to sync
  because of them.** Measured: the book is 6KB sealed and five big thumbnails
  took the picture file from 888 bytes to 185KB while the book grew by
  **88 bytes**. That is the whole reason for two gist files — compression alone
  bought headroom and the cliff was still there at forty pictures.
  Three things hold it. `payload()` **copies** the boards rather than deleting
  `thumb` in place, because it hands back the live arrays and a delete would
  take the pictures off the screen as a side effect of syncing. The map is keyed
  by **`n.pic`, never the node id**: `startRun()` deep-copies a template without
  re-issuing node ids, so a run and the procedure it came from share every one
  of them, while `pic` is a fresh `uid()` per picture — which is what a
  thumbnail actually belongs to. And `mergeThumbs()` runs **after** the book
  merge, never before: the merge replaces the node records and the remote
  copies carry no `thumb` at all, so re-attaching from the merged map is the
  only thing keeping a picture on screen through a sync that did not carry it.
  It never *clears* one either — a node with no entry in the map keeps what it
  had, which is how the device holding the full picture stays ahead.
  A picture file that will not open, or will not seal, is caught on its own and
  **the book goes anyway**, with the toast saying the pictures did not travel
  this time. There is a test that breaks the picture file deliberately and
  fails if the board stops crossing.
- **Sync is sealed here and merged per record.** Whole-file last-write-wins eats
  a day logged on the phone, silently — so every record carries `updatedAt`, a
  hard delete leaves a tombstone, and `go()` stamps only what changed. Pull,
  merge, push is one act; pushing without pulling overwrites someone's day.
  Neither the token nor the passphrase is ever in `state`, so a backup carries
  neither.
- **The launcher is handed an id, never a path.** `mashghal://enter/<id>` and
  nothing else; the PowerShell handler refuses any other shape and looks the id
  up in a file already on the machine. A handler that ran what a link told it to
  would be an RCE hole registered on your own laptop. **The id now names three
  kinds of thing and the URL shape did not change by one character**, which is
  the whole discipline: widening what a link may *say* would be dangerous,
  widening what the machine already knows is not. `launchTable()` writes
  `benches`, `steps` and `things`, and the handler looks in all three — reading
  `benches` first and unchanged, because a per-mode kit file already on
  somebody's machine has to keep working.
  The **step** case is the one worth having. A bench opens ArcGIS Pro and three
  bookmarks; a step opens the project file, the reference photograph and the mail
  search for *that* piece of work, which is exactly what the link edge was built
  to carry — so `stepNeeds()` reads it rather than recording anything new, and a
  step's own `path`/`url` counts too, since a `file` step usually holds the
  folder it files into. **Only open runs contribute steps**: a closed run's
  paths are history and a lookup table is not an archive. The table holds
  labels, paths and URLs and nothing else — it sits unencrypted in a user folder
  because the script must read it without a passphrase, so it is written to be
  worth little, the same reasoning as the digest. Every link comes from
  `launchLink()`, the one place it is built, and every one of them disappears
  when `settings.companion` is off, with the copy-path fallback staying either
  way because a managed laptop can block a scheme handler outright.
- **The digest is numbers only.** No label, no name, no note — it can leak in
  full and say nothing about the work. A scheduled job cannot hold the
  passphrase, so the file is written to be worth nothing instead.

## Mashghal's shape

**Six tabs, and a gear: Boards · Waiting · The week · Calendar · Jobs ·
Repo.** Settings gave up its slot and moved to a gear beside the finder —
exactly the trade Coffer made to pay for Horizon, and for the same reason: it
is opened a few times a year and was holding a sixth of a bar a phone can only
just carry six of. A seventh tab was the other option and it is the one this
repo has already learned not to take.

**The Repo is one store, presented four ways.** `state.assets` already held
files, photos, datasets, documents, software and field kit with a path, a
link, upkeep and provenance, so a second list for "the apps and sites and
files I log into" would have been the *one name, one entry* mistake this file
already records. `REPO_PAGES` is **Devices · Apps · Sites · Files**, and
**which section an entry is in is stated, not derived** (`a.repo`, with
`repoOf()` falling back on the kind so nothing written before it needs a
migration). Deriving it is tempting and wrong for the same reason `parked` is
stored on a project: ArcGIS Pro has a path *and* a licence page, and a reader
who types a name should never have to wonder which of four lists it landed in.

**In the Repo the row IS the open control**, and that is the only place in the
app where a row does not navigate. This tab is a launcher — its owner asked
for "all apps and all webs and all files that i use" — and row, then page,
then "Open the link" was two taps to do the one thing. Everywhere else a row
still opens a page, because there the question is "tell me about this".

**`openHandle(a)` is the one place that decides what "open" means**, because
there are three answers and only one is a plain link:

- a `url` opens in the browser, and works with nothing installed;
- a `path` with the companion on becomes `mashghal://enter/<id>`;
- a `path` with the companion off is **copy only, and the screen says why**.

That last one is not a limitation of this app. **A page served over https is
not allowed to navigate to `file:///C:/…`** — every browser blocks it and
Chrome blocks it *silently*, so the tap does nothing at all. Its owner
reported exactly that ("clicking open file from the pc don't open the file, it
only work with links on web") and the app was not broken; the browser was
refusing. So a path is **never rendered as a `file://` href** — a control that
quietly does nothing is worse than no control — and the reason is stated once
above the list with the one-line fix, only where it is actually true.

**The whole job on one sheet** (`jobSheet`, reached from the job page) is the
same canvas one level up: the job, its projects, and every board hanging off
them. Three rules keep it honest. It is **derived and throwaway** — rebuilt
from `state` on every render, so it can never disagree with what it draws and
there is no second copy of the hierarchy to keep in step. It is
**read-only, and the canvas is told so**: `b.derived` guards every mutating
path, because `save()` would write a board that is not in `state.boards`, and
a sheet that looked editable and silently dropped every edit would be worse
than no sheet. And **a tap opens the board** rather than selecting it — on a
real sheet picking a node is how you reach what can be done to it, and here
there is exactly one thing to do.
`openBoard()` returns `jobMap` when one is up, which is what lets Fill, Fit,
the zoom, the pan and the arrow keys all work on it with no second copy of any
of them. Two traps it walked into: **`autoLayout` is for a procedure, not a
tree** — it ranks steps into columns and parks things above them, so the job
and "on its own" landed side by side on one row and the shape said nothing
(`mapLayout` places depth down and siblings across, parents centred over their
children, walked bottom-up). And **a node on a derived sheet carries its own
state and sub-line** (`_mapState`, `_says`, `_pill`), because `nodeState` and
`stepMeta` answer questions a *board* does not have — a chase interval, a due
date — and drawn from the thing vocabulary the job and "on its own" both read
"note", a word belonging to neither.

**A TASK IS THE ONE THING SOMEBODY TYPES, and it names the work it belongs
to.** Everything else on Waiting is derived — a live step of a run, or a day
passing — and the standing rule was that *a due is born, never typed*. Its
owner asked for tasks anyway, so the shape is the one that does not unravel
the model: `state.tasks` names a job, a project **or** a board, and that
attachment is the whole reason a task lives here rather than in Daybook, which
already owns free-floating errands. Three rules hold it:

- **`dues()` does not absorb them.** A due is derived from a run, and folding
  typed lines into that function would make every figure built on it — the tab
  badge, the report, `projState()` — quietly stop meaning what it says.
  Waiting carries them in their own section and **says out loud** which half
  is which; the foot of that screen used to read "nothing here was typed in by
  hand", which with tasks on it would be a screen contradicting itself.
- **The headline counts them, because a headline is a figure.** Left counting
  only derived dues it read "Nothing is late." above a rose row saying a typed
  task was past its date — *a figure may never disagree with its own parts.*
- **One attachment, the narrowest.** The dialog offers job, project and board;
  storing all three would put the same task under a project *and* under its
  job, which is the "two of everything" fault the job page already had once.
  And **a task is never drawn on the sheet**: it is not a step, nothing waits
  on it and a run does not advance through it, so a node would be exactly the
  conflation the two edge kinds exist to prevent.

A task with no date is **never called late**, however long it sits — the same
rule as `overdueBy()` returning 0 for a wait with no chase interval.

**A DRILL IS A CADENCE THAT STARTS A RUN**, and that is the whole of it: no
fifth noun. Asked for "a repeating drill", the two nouns to compose were
already there — upkeep says *every so often since it was last done*, and a
procedure says *what to actually do*. A chore you tick is upkeep naming no
procedure; a drill is upkeep naming one (`cd.runsBoardId`), and ticking it
**starts the run and stamps the date in one act**, with the undo taking back
both — a half-undone drill would leave a run nobody started beside a date
saying it was done. Only templates are offered, because starting a run *of* a
run is not a thing, and a cadence whose procedure has since been deleted falls
back to being ticked rather than refusing: the interval is still true.

**THE KNOWLEDGE LIBRARY IS THE REGISTRY READ BY TOPIC INSTEAD OF BY KIND.**
The spec asks for a library of what you have learned — methods, references,
reading that outlives one project. The registry already holds exactly those
objects: a document, a dataset, a PDF, with a link, a path, notes, provenance
and `assetUses()` answering where each was used. The one thing it could not
answer was *"everything I have on harbour surveying"*, because nothing said
what a thing was **about**. So `a.topics` is a list of words the reader types,
and the Library is the fifth section of the Repo strip — one store, five
questions. A second list would be a second thing to keep in step, which is
the fault this file already records twice. Topics are de-duplicated
case-insensitively on save ("Harbour, harbour" is one word typed twice) and
you never create a topic: you write one onto a thing, which keeps the
vocabulary a description of the work rather than a taxonomy to maintain. The
route that earns it is the pill on a thing's own page — you are looking at one
dataset and one tap shows everything else on the same subject.

**THE ARCHAEOLOGICAL DATA MODEL IS ONE FIELD, NOT FOUR NOUNS.** Site,
Artifact, Feature and Survey are exactly what a reader types into "Other —
write it in": `assetKinds` is a floor and not a ceiling, and hardcoding those
four would break the app's first rule *and* make it absurd for the thesis, the
visa and the lecture, which are half of what is actually in the book. There is
a test that reads `ASSET_KINDS` and fails if any of the four appears in it,
and the sample seeds them through `state.vocab` to prove the registry, the
finder, provenance, upkeep and the boards all work on words the app has never
heard of.

What *was* missing is the relation those four nouns exist for: **containment.**
`a.atId` is "part of / found at", and Site → Feature → Artifact falls out of it
generically. It is deliberately **not** `fromIds`: a sherd is *found at* a site
and an orthophoto is *made from* three hundred frames, and conflating them
would list the site among the things the sherd was manufactured out of. Same
discipline as provenance — the forward link is stated, the reverse (`partsIn`)
is derived so the two cannot disagree, and the picker withholds anything
already below the entry, because picking it would close a loop and both pages
would recurse. The trail prints top-down (`site › trench › sherd`) so it reads
as an address rather than having to be decoded backwards.

**FIELD MODE IS A POSTURE, NOT A NOUN.** On site you are not creating a new
sort of record; you are doing the same three things one-handed in bright sun
with no patience for four levels of navigation. So it composes what was
already there — `place` on upkeep (out of the house has been a place since
upkeep shipped), `pickPicture` as the single way a photograph gets in, and a
task as the one thing you type — and changes only the **size and the number**
of choices. It takes over Waiting rather than adding a seventh tab, because
Waiting is already the screen the phone really needs.

Three things about it. **Nothing is hidden that would otherwise be
reachable**, and the foot of the screen says so: a mode that quietly drops
half the record is the app behaving strangely. Upkeep doable *anywhere* stays
on the list beside upkeep doable out of the house — filtering to `out` alone
would be the app deciding for you. And it is **a setting, not view state**,
against this app's usual rule: you turn it on at the site and off in the car,
so surviving a reload is the entire point, whereas everything else mode-ish
resets because a tab should land on its list. The camera never guesses which
run a photograph belongs to — one open run and it goes there, several and it
asks, none and it says so rather than opening a camera with nowhere to put the
result.

**HOME IS FIRST, AND IT IS WHAT WAS MISSING.** The app opened on Boards — a
list of procedures, which is the right screen once you know what you are doing
and the wrong one to arrive on. The mockup calls panel 1 "mission control";
this is it, and the rule that keeps it honest is the one the report and the
adviser already live by: **nothing on Home is stored and nothing on it is
computed here.** Every figure comes from the function the screen it points at
uses — `dues()`, `projState()`, `runProgress()`, `openTasks()`,
`openHandle()` — so Home cannot drift from the rest of the app. There is a
test that reads the chase tile against Waiting's own headline and fails if one
says nothing is late while the other shows a rose row.

Even "recent" is derived: `updatedAt` is already stamped on every record for
the sync merge, so `recentlyTouched()` reads the trail off the stamps and
there is no `recents` list to keep in step (asserted — the test fails if such
a key appears in the record).

**The order is the argument.** TODAY first, because it is the only thing that
cannot wait — three tiles, not three cards, because it is one question with
three parts. Then WHAT IS MOVING, because that is what you came to work on;
the bar's width *is* the percentage string, both out of `projPace`, so the two
cannot disagree. Then QUICK RUN, because the next thing you do is open
something. Then CONTINUE WORKING and RECENT THINGS, which answer "where was
I" — the second of the three forgettings this app was built around.

An empty book gets `firstRun()`, not a dashboard of noughts: a grid of zeroes
presented as your morning is the "seeded fiction" fault in reverse.

**SEVEN TABS NOW**, and the bar still holds them — measured at 390px, 360px
and 320px with nothing wrapping and nothing scrolled off the edge. Settings
staying on the gear is what paid for the seventh.

**The finder is above the tabs, because it reaches further than any of
them.** Ctrl+K, `/` when you are not typing, or the box at the top of the rail.
Nothing in the app could be reached by its name before it: six sections, boards
inside them, steps inside those, and a person's name written only on a step
three levels down — so finding the one you sent the brochure to meant already
knowing which board she was on. Four rules:

- **It searches the record, not the screen.** Every hit is built from `state`
  through the same helpers the views use (`boards`, `dues`, `benchLabel`,
  `nodeState`, `projState`), so a hit can never name something the app would
  then fail to open, and a rebuilt screen cannot leave it searching a list that
  no longer exists. It reaches projects, boards, runs, steps, people, things,
  jobs, benches and upkeep — and it reaches each of them **once**: a thing
  node whose `fromAssetId` resolves is dropped in favour of the registry entry,
  and a person node is never listed from a board at all, because `people()`
  folds every mention into one row that says what is outstanding with them.
  Four boards naming a supervisor gave four identical hits.
- **It changes nothing.** A hit navigates; the handful of commands at the foot
  hand straight over to `APP.actions`, which is the only place a figure may
  move. A command closes the box first, or its dialog opens behind the scrim.
- **It opens on the work, never on a blank list.** With nothing typed it shows
  what is late, then the open runs, then the sections — the three forgettings
  again. A palette that says nothing until you think of a search term is a
  palette nobody opens twice.
- **A word-start match beats one buried inside a word**, and an exact prefix
  beats both, or typing `pat` puts every board with "update" in its name above
  the person called Patricia. Ties break on the kind (`k`), late things first.

It must be reachable with no keyboard: the rail hides `.railwork` and
`.brand-sub` under 880px but **not** `.findbtn`, because a phone has no Ctrl+K.
`focusNode()` prefers the picked node for the same reason — a hit on one step of
a forty-node board arrives by setting `sel` and nothing else, and the sheet has
to centre on it.

**Six tabs: Boards · Waiting · The week · Calendar · Jobs · Settings**, and a
switch bar
— and **Jobs is where the hierarchy is walked** (job → project → board), which
is why Projects did not become a seventh tab. Coffer's rule applies here too:
new work becomes a page inside an existing section rather than another slot on
a bar that a phone cannot hold.
pinned to the bottom of every screen showing where you are, since when, and the
note you left. Boards lists procedures and runs; opening one shows the canvas
over an editable list. Waiting is the only screen the phone really needs — dues
worst-first, unfinished runs, and upkeep filtered by place. The week is the
standing, suspense and repair, and holds the report. Kit is the vocabulary plus
each mode's kit.

**Every tab always lands on its list.** Which board is open, which job or
project is open, which week is shown, which report is built and which mode's kit
is open are all *view state* — module-level `openId`, `openJob`, `openProj`,
`weekOf`, `reportOn`, `openMode`, `placeFilter`, none of
them in `state`, so none reaches a backup or survives a reload. Keeping it in settings meant the tab
showed a different screen depending on what you did ten minutes ago, which is
the same trap Coffer's Horizon tab fell into.

**The canvas is ArcGIS ModelBuilder, deliberately.** Rectangles with a cut
corner are steps, ovals are things, and the owner reads that vocabulary
professionally. It pans, zooms and drags, positions persist on the node, and
`autoLayout()` seeds them in a serpentine so nobody ever meets a blank sheet —
its BFS ignores back edges, or the loop in a revision cycle drags its own
target off to the right. "Tidy" re-runs it.

## Mashghal, as it ended up

- **A project is what you are working on; a job is who it is for.** They are
  different questions and neither contains the other cleanly, so `state.projects`
  names its job when it has one and leaves it blank when it does not — a paper
  written between two universities is one project across two jobs, a thesis and
  a move abroad belong to no employer, and a job holds many projects over years.
  The hierarchy is **Job → Project → Board → Node**, and the Jobs tab is where
  it is walked: a job page lists its projects *and* the boards that are in none
  of them ("on its own"), which is not an error state — a one-off procedure
  needs no project, and printing a board under both its project and its job
  made the page read as though there were two of everything.
  **Nothing about how a project is going is stored.** `projState()` reads it off
  the boards, so the two can never disagree, and the ladder is the familiar one:
  late (a chase) · past its date · set down · in hand · to file · done ·
  nothing running · nothing yet. Two of those are worth the words: `done` means
  every run closed *with nothing left to file*, because three closed runs and
  three procedures nobody started look identical from a count of open runs; and
  a date gone by on unfinished work **outranks having been set down**, since
  parking something does not move its deadline. `parked` is the one stated
  field, because from the outside work deliberately set down and work with
  nothing running are the same thing and no derivation can tell them apart.
  `projState()` also publishes **`overdue`** separately from the ladder, for the
  calendar: a project late for a chase is not a reason to paint a deadline three
  weeks out, and the mark there is rose only when the date itself has gone.
  Deleting a project **keeps every board** — they move to "not in a project",
  exactly as Coffer's pocket delete keeps every entry — and the name goes to
  `forgotten`, so the undo can put it back and a board still naming it reads
  "(removed)".
- **The registry holds what the work is made OF as well as what it is made
  WITH.** `state.assets` was four pieces of hardware with upkeep on them
  (laptop, phone, audio, other, all hardcoded); it is now files, photographs,
  datasets, documents, software and field kit as well, with `assetKinds` joining
  the extensible vocabulary so the list is a floor and not a ceiling. Two rules
  hold it. **A board never points into it** — a run freezes its procedure at the
  start, so a node reaching back into a shared list would be a hole in that
  freeze, and renaming a file next year would rewrite a board closed last year.
  A node made from an entry is a **copy carrying `fromAssetId`**, which is
  enough for `assetUses()` to answer "where is this used" without any board
  depending on the registry; there is a test that renames an entry and asserts
  no board moved. And **provenance is stated, never guessed**: `fromIds` is what
  this was made from, because that is the one fact about a derived file nobody
  can reconstruct later — an orthophoto is three hundred frames and a control
  file, and the file itself says none of it. The reverse (`madeInto`) is derived
  by walking the other way, so the two cannot disagree, and `asset-from-add`
  refuses a cycle by walking `madeFromAncestors()` with a seen-set — a book that
  somehow already holds one (a bad merge, a hand-edited backup) must not take
  the page down with it.
  **One name, one entry, in every list that pools them.** The registry and the
  boards hold the same headphones, so the borrow dialog offered both and the
  finder showed one row per board that had borrowed a thing — the only hit that
  knew where it was used buried under its own copies. The finder drops a thing
  node whose `fromAssetId` still resolves; the borrow pool dedupes by name and
  the registry entry wins, except where a board copy carries a picture it does
  not have. Note the trap that caused: the board's vocabulary and the
  registry's are **different lists** (ArcGIS Pro is "software" in one and was
  filed as "kit" on the board), so a kind+name key matches nothing — dedupe on
  the name, and on `fromAssetId` where it is there.
  `assetLook()` is the single place a kind decides its glyph and its identity
  colour, because the row, the finder and the detail page all have to agree.
- **WHERE A THING IS AND WHEN IT WAS LAST USED ARE BOTH STATED, AND SAYING
  NOTHING IS A STATE.** The mockup's Equipment panel reads *available · in the
  field · maintenance*, and it is tempting to derive that — a board that
  borrowed the sonar looks like the sonar being out. It is not: a run freezes
  its procedure, so a board that named the total station in March says nothing
  about where it is this week, and no walk of the record can tell a machine in
  the van from one back on the bench. So `a.state` is typed
  (`THING_STATES`: ready · out · fixing · busy · done · lost) and `a.lastUsedOn`
  is typed beside it, refused in the future by `dayOk` the same as every other
  date. What must **not** happen is a guess dressed as a fact: a thing nobody
  has said anything about carries **no pill at all** on its row, and its page
  says "Nothing said about how it stands" in as many words rather than leaving
  a hole a reader will fill in wrongly. `thingState(a)` is the one place the
  word and its pill tone are decided, `stateTone`'s ladder again: `out` and
  `fixing` read as drift, `lost` as late, `ready` calm.
- **"What you can do next" is built from what the entry actually holds, never
  from its kind.** The mockup prints a menu per kind (*Open in CloudCompare ·
  Import to QGIS*), which would be a list of buttons that cannot do the thing
  they name — exactly the fault `openHandle()` exists to prevent. `nextActions(a)`
  offers only routes that exist: `openHandle()`'s one answer for opening it,
  what it was made into (`madeInto`), everything on its own topics, and upkeep
  when it has none. There is a test that clicks one and fails if the screen
  does not move.
- **The Library's kind chips are counted from what is under the open subject.**
  Five hardcoded type words would show "Survey" over an empty list on a subject
  holding three photographs. Each chip carries its own count, so no chip can
  empty the list, and the chip **clears when the subject changes** — a filter
  surviving a subject change lands you on nothing and reads as the app having
  lost your things.
- **A person is half derived and half stated, and the derived half is nearly
  all of it.** Waiting answers "what is late" step by step; nobody could ask
  *"I am about to write to Rita — what else is outstanding with her"*, because a
  person existed only as a node inside whichever frozen board named them.
  `people()` assembles both halves: every open `send`/`watch` they are linked
  to, across every live run, with how long it has waited and whether it is past
  its chase — **nothing about a thread is stored** — beside `state.contacts`,
  which holds only what no board could know (where they work, what they do, an
  address, one line of your own). Boards never point into that record, so
  renaming a contact cannot rewrite a board that named them three years ago;
  there is a test.
  **Fold on the contact id, fall back to the name.** Keying on the name alone
  was wrong and only a screenshot showed it: renaming a contact split one
  person into two rows — the new name with the address and nothing outstanding,
  the old one with three boards and a late send. So the key is `c:<id>` for
  anybody in the list and `n:<lowercased name>` for anybody a board merely
  mentions, the display name is always the contact's (the current truth), and a
  board node with no `fromContactId` still joins a contact whose name it
  matches, so a book written before contacts existed folds correctly. Forgetting
  somebody archives the stated half only: they stay on the list as a name on a
  board, and `openPerson` is moved from `c:<id>` to `n:<name>` so the page
  follows them rather than falling silently back to the list.
  A related trap: a fact the reader needs may not depend on a lookup that can
  miss. The forget dialog's "the boards that name them are untouched" sentence
  was counted through `personOf(name.toLowerCase())`, which found nothing the
  moment the key became `c:<id>` — so the one sentence that stops "forget"
  reading as losing the history quietly disappeared.
- **The workbench is three questions behind a strip, not one page six sections
  long.** It was called Kit and carried claimants, modes, benches, things,
  upkeep and board kinds on one screen; once the registry grew past four pieces
  of hardware it stood 3,300 pixels tall, which is Coffer's Today tab again —
  the screen everybody scrolls past. `KIT_PAGES` is **Things · People · Upkeep · Words**,
  a strip rather than three levels, and `kitTab` is view state that resets to
  Things on every tab press. It is also no longer called Kit: its owner said of
  the version that was, *"the kit i didn't really get the way it's working and
  what is what the vocab is kinda weird to get"*.
- **A job is the bag.** `state.jobs` is the top of the hierarchy: one engagement
  holding the benches you sit at for it, the boards you run for it, and the kit
  it hands you. Claimant, mode and bench survive underneath, because the hours
  still have to be owed to somebody and the work still has a craft — but the job
  is what you open, and the kit is a section of it rather than a tab to decode.
  `ensureJobs()` derives one job per claimant and runs **before every render**,
  not at boot: state is replaced by the sample, a restored backup, a restored
  file (which lives in the shared runtime and cannot call into the app) and a
  sync merge, and chasing each one would eventually miss one. It exits at once
  when everything is filed.
- **A procedure can be written as prose.** `parseProse()` reads arrows,
  indentation, `(remind me after 5 days)` and a trailing question mark into
  steps, acts, people and branches. It **never guesses at a shape** — a line
  nobody pointed anywhere comes back unplaced and named — but it **does** take
  the writer at their word: a way out naming a step not yet written makes it.
  It writes nothing; `boardFromProse()` does, and only on a tap.
- **Sync runs itself**, on three triggers (a change debounced 4s, a 90s
  heartbeat, returning to the tab or the network). The merge is untouched: every
  pass is still pull-merge-push. Watch for the trap that cost a real board —
  replacing state wholesale, as the sample and a wipe do, **takes
  `settings.sync` with it and switches sync off silently**. Sync config is how a
  device reaches the book, not part of it, so it is preserved across both.
- **Backups are not sync.** Sync propagates the state you are in now, so a bad
  delete travels everywhere; a backup preserves the state before it. Ten
  snapshots in IndexedDB, restored through `APP.hydrate` — the single adoption
  point — because hand-copying a key list at a second site is how Coffer lost
  grants. Restoring snapshots first, so it is itself undoable.
- **A picture is two copies, and only the small one travels.** The full one
  (1400px, a couple of hundred KB) lives in IndexedDB on the machine that took
  it and never syncs — the quota is shared with five sibling apps, and a few
  megabytes through the sealed-gist door would make sync fail slowly and
  silently. But "on this device only" made a board built at the desk show a
  named frame and no frame on the phone, so a **thumbnail** (300px, capped at
  34KB of characters) is stored on the node as `thumb`, which means it goes
  wherever the record goes: sync, backup, every device. A picture whose
  thumbnail will not fit under the cap gets none rather than turning the record
  into an album. `hasPic(n)` is therefore the test everywhere, never `n.pic` —
  reading `n.pic` alone is exactly how the other device saw nothing — and
  `mountPics` falls back through `data-thumb` (the node id, since ids are
  unique) when the local store has no copy. `url` is the third case: a Google
  Drive share link for opening the full-size one elsewhere. Drive's own API is
  not used and will not be — it needs Google's script from a CDN and an OAuth
  client, and this app fetches nothing and holds no secret.
- **Both copies are made off the thread that paints, and the resize happens
  inside the decode.** A photograph is taken on a phone, which is the slowest
  device the app runs on, and the old route put every expensive part exactly
  where it is felt: a `FileReader` turned a five-megabyte file into a
  seven-megabyte base64 string, `new Image()` decoded that string, `toDataURL`
  encoded the result, and then `picThumb` decoded the whole picture **a second
  time** for the small copy. Measured on a desktop, the decode alone was 167ms
  and the encode 118ms, twice over — on a phone the app simply stopped, with
  nothing on screen saying why.
  `createImageBitmap(blob, {resizeWidth, resizeHeight, resizeQuality})` is the
  whole of the fix and the options are the half that matters: the bare call
  decodes off the thread but hands back the full 3000×2250 bitmap, and the
  `drawImage` that scales it down runs on the thread that paints — which
  measured at 131ms for the big copy against 4ms for a blit of a bitmap that
  is already the right size. `OffscreenCanvas.convertToBlob` moves the encode
  off too. `picPair(file)` makes both copies from **two** off-thread decodes,
  deliberately: one decode at full size plus two scalings here puts both
  scalings where they hurt. `sizeOf()` reads the dimensions off a loaded
  `<img>` without ever drawing it, because loading needs the header and the
  decode is what we are avoiding.
  Both are platform APIs, not dependencies — and where either is missing the
  old route is still there, still correct and still slow, which is the only
  honest way to use a capability that is not everywhere. **There is a test that
  takes both APIs away** (`addInitScript` deleting them) and fails if the
  fallback stops producing the two copies: a path nobody drives is a path
  nobody can trust.
- **The board is the screen, and the words fold away under it.** Opening a board
  shows the sheet; the same facts written out as rows sit behind one
  `<details class="fold big">` that remembers nothing, so a board always opens
  closed. `foldOpen` is module-level view state like `openId`. And the two kinds
  of button are in two places: what you do to the *board* (rename, delete, run,
  close) in the header, what you *add to the sheet* on the sheet's own bar —
  eight in one row wrapped to three lines on a phone and read as a wall.
- **A tap on the sheet selects; it does not open a dialog.** Every accidental
  tap used to be a modal. `sel` (view state, never saved) drives `selPanel()`,
  a strip under the toolbar carrying what can be done to that node — mark done,
  a photo, edit, remove, look. It is repainted by `paintSel()`, never `render()`,
  or picking a node would re-fit the sheet and throw away wherever you panned
  to. Floated over the sheet it covered the zoom and Tidy buttons, so it is in
  the flow. The ring on the picked node is **solid**: dashed is already how a
  finished step is drawn, and the first ring read as "done".
- **A picture let go on the sheet lands where you let it go**, and on a step it
  belongs with that step — asking again would be a second job. `pickPicture(b,
  host, at, file)` is the one way in for all four routes (the board button, a
  selected step, a drop, a replacement); `dragover` must `preventDefault` on
  every event or the browser navigates to the file, which looks exactly like the
  app crashing.
- **A card that grows has to push, not overlap.** Positions persist, so the
  first photograph on a board drew its frame straight through the step beneath
  it. `settleNode()` moves only what is actually in the way, and only
  vertically — sideways would change the order the sheet appears to be in — and
  each pushed card settles in its turn, or a step lands on the kit hanging
  under it. It refreshes `_pics` first: `dims()` reads what the **last** draw
  stamped, so a step that just gained its first picture measures 34px shorter
  than it is about to be drawn, which was exactly the overlap.
- **A DERIVED SHEET HAS NO ZOOM FLOOR.** `minScale` takes the board now, not
just the width: a phone's 0.7 floor is right for a forty-node procedure (the
fit falls back to opening on the step that matters and letting you pan) and
exactly wrong for a job map, whose entire point is the shape. Without the
exception the job itself was clipped off the top of a 390px screen with arrows
arriving from nowhere. There is a test that reads every node's position back
against the viewBox and fails if one is outside it.

**The sheet stops zooming out before it stops being readable.** Two floors,
  because the screens are two problems: on a phone (< 620px) the whole board is
  hopeless at any size, so it opens at 0.7 on the step that is **late**, then
  the one in hand, then the way in, and you pan; on a laptop fitting the board
  IS the point and the floor (0.45) only catches a board so large the fit would
  be a diagram of nothing.
- **A back edge is a DFS stack test**, and nothing else works. "Is the target to
  the left" called forward edges loops; comparing flow depth called a **join** a
  loop; plain reachability flagged every edge in a cycle. Only "points at a node
  still on the stack" marks exactly the edge that closes it.
- **`join: "all"` holds a step until every marked way in is done.** Otherwise the
  board says a step waits for all its inputs while the run starts it on the
  first — a label that lies. Only ways in that were actually entered can hold
  it, or a branch never taken deadlocks the run for ever.
- **A thing borrowed from another board is a copy.** A run freezes its procedure
  at the start; a thing reaching into a shared table would be a hole in that
  freeze, and renaming a person would rewrite a closed board.

## What an audit of the running app found

Eleven of these came out of driving the real interface rather than reading the
source, and every one was invisible to the assertions that existed. They are
written as rules because each is a class of fault, not a one-off.

- **Never index a hardcoded vocabulary map directly — go through `vocabLabel()`.**
  `ACTS[n.act].label` in `stepRow()` threw for any act the reader invented
  through "Other — write it in", and it threw *before the page painted*: after
  a reload the board could not be opened at all, so the offending step could
  never be edited out and one dropdown choice cost a backup restore. The
  vocabulary is extensible by design, so `ACTS`, `THINGS`, `PLACES`,
  `CLAIM_KINDS` and `EDGE_KINDS` are only ever the *built-in half* of the
  list — `vocabAll()` is the whole of it. Grep for `ACTS[`, `THINGS[` and
  friends after touching any of this.
- **Escape and the focus trap belong to the OVERLAY, not to `openModal`.**
  `backupDialog` and `restoreDialog` write `overlay.innerHTML` themselves, so
  neither had an Escape handler or a trap: the one key everybody presses to get
  out of a modal did nothing, and Tab walked straight through the scrim into the
  page behind, where a keyboard reader could reach controls they could neither
  see nor click. `trapOverlay(onEscape)` is the extracted pair, and **anything
  that writes `overlay.innerHTML` itself has to call it** — a facility that
  lives inside one constructor is a facility the other two dialogs silently do
  without. It is in the shared runtime, so the fix landed in all four apps at
  once and the md5 test is what proves it did.
- **A dialog's destructive branch never goes on `onCancel`.** The archive lock
  read "a run will not close until it is done" and then closed the run on
  Escape, on a scrim click and on the ×, because the close sat in `onCancel`
  while `onConfirm` was empty. Those three are the universal "I didn't mean
  that" gestures and they all fire cancel. Confirm does the thing, cancel
  undoes the intent, and a confirm that destroys something carries
  `danger: true` so the loud button is the consequential one. `onCancel` is
  for cleanup only — discarding a picture nobody named is the legitimate case.
- **No minute belongs to two stretches, on every path that writes one.**
  Switching benches always enforced this (the old span ends exactly when the
  new one starts), but **Add time had no check at all** — and Add time is the
  path used for everything you forgot to tap. 10:00–11:00 beside 10:30–11:30
  was accepted and the week read 2h for ninety minutes of life, silently, in
  the one figure the app exists to produce. `clashesWith()` tests the new
  stretch against every other on that day, half-open so touching is fine, and
  the refusal names the stretch it clashes with. An invariant enforced on one
  path and not its twin is the same bug as not having it.
- **A date has to exist, not merely be shaped like one.** `^\d{4}-\d{2}-\d{2}$`
  passed `2026-13-45`, which stored, parsed to `Invalid Date`, counted in no
  week, appeared on no screen and was named by no report — eight hours in a
  hole nothing could see. `dayOk()` round-trips through the calendar
  (`iso(parseISO(v)) === v`), which is the only test that catches it.
- **Every removal confirms, says what it touches, and offers an undo.**
  `bench-del` was three lines straight to `go()`: one tap on a small × removed
  a bench carrying five weeks of logged stretches, with no confirmation, no
  toast, no undo and nowhere in the app to bring it back. It now counts the
  hours filed against it and the boards that keep reading its name, because
  that is what you would want to know before pressing Delete. `claimant-del`
  had the confirmation and neither the facts nor the undo: it named only the
  boards, and left out the hours filed against it, the benches that stop being
  usable, and the job that stays put with its work.
- **A figure may never disagree with its own parts, and archiving is where that
  breaks.** After removing a claimant the week read **"counted 7h across 2
  claimants" above a breakdown accounting for nought** — the total walked every
  span and `standing()` walked `live(state.claimants)`, so the removed
  claimant's real hours stayed in the total and vanished from the parts. This
  is the "history stops being history" rule in the one number the screen exists
  to produce. `standing()` now keeps an archived claimant **that still has hours
  in the week**, with `owed` forced to nought and `behindBy()` skipped, because
  nothing is owed to somebody who is gone and a cumulative shortfall against
  them would be a figure about nothing.
  The other half of the same fault: **`nameOf()` checked the list first and
  returned the plain name**, so a bench read "GIS · AUB Tripoli 21st C" after
  that claimant was removed. `forget()` had put the name in `forgotten` and
  nothing ever looked, because the record was still there — it survives on
  purpose, since the spans point at it; what it must not do is look live. An
  archived record now reads "(removed)" from that one function, which fixes
  every place in the app that names one.
- **A derivation happens once, and the book records that it did.**
  `ensureJobs()` tested "is `state.jobs` empty", so deleting your last job put
  it straight back on the next load and a confirmed delete quietly reversed
  itself. `settings.jobsDerived` is a fact about the book rather than something
  to infer from its contents. Anything that back-fills state needs the same
  treatment, and the flag goes through `adoptState` like every other setting.
- **A first run is an empty book with an offer, never seeded fiction.**
  `afterBoot` used to replace an empty book with `sampleData()` and **save
  it**, so a new reader's first screen was three jobs, six boards, named people
  and "three things are late" — all invented, none of it marked as such, while
  Settings still offered to load the example as though it had not happened.
  `firstRun()` on Boards says the book is empty and offers the two ways in;
  `emptyBook()` is the shared test, and loading the example over an empty book
  skips the "everything is replaced" question, which was a question about
  nothing.
- **The prose sequence is read off the written column, never array order.**
  A step invented from a branch target is appended to `read.steps`, so chaining
  `i → i+1` down that array did three wrong things at once on the app's own
  worked example: the lines after an indented block were never joined to the
  question above them (giving a second entry node, so every run opened telling
  you to watch the printing of a brochure nobody had designed), "archive" was
  chained to the invented "file the final version" backwards, and the stop
  branch dead-ended. `proseLinks()` reads sequence from the lines the writer
  actually typed and treats the indented block as a detour the column
  continues after — from the way out that goes **forward**, meaning its target
  is not already above it. Exactly one forward way out and that is
  unambiguous; none or several and it **refuses to join** and says which line
  it could not place, the same rule as a line nobody pointed anywhere. It is
  one pure function over indices used by both the preview and the writer, so
  what you are shown cannot drift from what gets written down — and the
  preview states **how many ways in** the board has, because two ways in means
  a run starts on both at once and that is the one figure worth checking
  before accepting.
- **The sheet is operable from the keyboard, and it has two axes because it
  has two meanings.** It was the one screen a pointer was compulsory for:
  everything you can do to a node lives behind picking it, and picking it was a
  tap, so with no mouse the board could be looked at and nothing more. It is
  `tabindex="0"` and `role="application"` now, never `role="img"` — an image
  cannot be walked. **Left and right walk the nodes in reading order**, which
  always works and can never dead-end (the order `autoLayout` places them, so
  it matches what you see), and they wrap rather than stick. **Down and up
  follow the flow**, which is what the board is actually saying, cycling when a
  step has several ways on. `Enter` hands focus to the selection strip, because
  the strip is rendered *before* the sheet in the document and Tab alone would
  walk away from the board rather than into it; `Escape` lets go. Focusing with
  nothing picked lands on `focusNode(b)` — late first, then in hand, then the
  way in, the same order the fit uses.
  Two details that make it usable rather than merely present: `panTo()` brings
  the node into view **without changing the zoom**, for the same reason
  `paintSel()` exists instead of a full render — a re-fit throws away wherever
  the reader had got to. And a dead end on the vertical axis is **announced**
  through `toast()`, which is the app's live region and therefore the only
  channel a screen reader hears. The keys are written under the sheet in
  `.cvkeys` rather than hidden in a tooltip: a shortcut nobody can find is a
  shortcut nobody has.
- **A whole row that opens something is a `<button>`.** Job rows and both
  calendar renderings were `<div data-act="…">`, so the Jobs tab could not be
  opened by keyboard at all. The element changes and the look does not:
  `.panel.rowbtn`, `button.cal-m` and `button.cl-row` carry the reset.
  `#toasts` is a live region too, or a refused form says nothing to anyone
  using a screen reader — the toast is the only channel validation has.
- **A name can be any length and the layout may not depend on it.** A
  400-character board name took the document to 5142px against a 1400px
  window and stretched the sheet's title block straight through the legend.
  `min-width: 0` on the growing half of `.page-head`, `overflow-wrap: anywhere`
  on the name, and a clipped `max-width` on `.tblock span`.
  The same rule caught a **half-fix** on the phone rows: `.panel:has(> .itile)
  > .grow` was set to `flex: 1 1 auto` to stop an identity tile landing on a
  line of its own, and with the basis at `auto` the grow starts at its
  *max-content* width — so a short name stayed beside its tile and a long one
  pushed the tile off again. `flex: 1 1 0` is the fix: from a basis of nought
  the text wraps inside the grow, where it belongs, and the row went 138px to
  94px. **A fix that holds for the short case and not the long one is the same
  bug with a smaller reproduction.**
  And a warning about measuring it: two flex children on one line do **not**
  share a `top`. A 28px tile centred against a three-line text block sits
  ~18px lower, so `Math.abs(a.top - b.top) < 12` reports a wrap that is not
  there. Compare the widths against the row's, or read `flex-wrap` and the
  line count.
- **A figure a person types is validated where it is typed.** `claimant.hours`
  was a text field with no check, and `num()` returns 0 for anything it cannot
  parse — so "twenty" made a 20-hour-a-week employer read "on demand — nothing
  is owed" and "-5" read "3h of 0h · met". A number field, bounded, blank
  still meaning on demand. (And a number field hands back a *number*:
  `String(v.hours).trim()`, or `.trim()` throws on every save.)

**The scan this adds**, beside the orphan and double-declaration ones — an
action nobody can click, and a button with no handler. The dispatcher ignores
an unknown `data-act` without a word, which is how the Job page's whole
"Where you sit for it" row did nothing for weeks:

```
python3 -c 'import re;s=open("mashghal/index.html").read()
i=s.index("APP.actions = {");j=s.index(chr(10)+"  };",i)
d=set(re.findall(r"^    \"([a-z0-9-]+)\":",s[i:j],re.M))
u=set(re.findall(r"data-act=\"([a-z0-9-]+)\"",s))
print("no handler:",sorted(u-d) or "none");print("unclickable:",sorted(d-u) or "none")'
```

**The `data-act` scan has a blind spot: an INTERPOLATED action.** It matches
`data-act="literal"` only, so a helper that builds the attribute from a
variable — `'" data-act="' + act + '"'`, which is how Home's three tiles are
written — is invisible to it, and the action reads as unclickable while being
clicked every day. `tab-jobs` sits on that list for exactly this reason. Both
halves still matter: "no handler" is never a false positive and is the half
that catches a button doing nothing silently, and "unclickable" needs the
interpolated sites checked by hand:

```
grep -n "data-act=\"' *+" mashghal/index.html
```

Four sites today. It did earn its keep on this change, though: it found a
`tab-home` handler that nothing could ever call, because a tab is reached
through `data-tab` and not through an action at all.

**And one for CSS, because a class name can be taken already.** A new
identity-tile class called `.tile` landed 400 lines below the figure tiles on
Waiting and the week, which are also `.tile` — so the second rule won and put a
28px flex box with a centred SVG onto every one of them. It looks like the app
breaking, not like a name collision, and no assertion would have caught it. Any
bare single-class rule declared twice outside a media query is the bug (a media
query re-declaring one is the normal way to override it):

```
python3 -c 'import re,collections;s=open("mashghal/index.html").read()
c=s[s.index("<style>"):s.index("</style>")];keep=[];m=0;b=0
for ln in c.split(chr(10)):
  if m:
    b+=ln.count("{")-ln.count("}")
    if b<=0: m=0
    continue
  if ln.strip().startswith("@media"):
    b=ln.count("{")-ln.count("}");m=1 if b>0 else 0;continue
  keep.append(ln)
sel=re.findall(r"^\s*(\.[A-Za-z][\w-]*)\s*\{",chr(10).join(keep),re.M)
print([k for k,v in collections.Counter(sel).items() if v>1] or "no collisions")'
```

That scan only sees *bare* class rules, and the other half of the same fault is
a **compound** one: `.panel.late` was rebuilt to the channel rule (a neutral
card with a rose edge) and `.panel.calm.late` twenty lines below it was not, so
the identical late row was a neutral card on Waiting and a rose card with rose
prose inside a project page. **One state, one rule.** When a state's treatment
changes, grep the state's class name across the whole stylesheet rather than
editing the rule you happened to be looking at.

## Mashghal's look

**Deep navy**, and it is the third palette this app has had — which is the
point of writing the reasons down. The first build's drafting room was one cold
hue with state on hairlines and uppercase mono labels, and read as an instrument
panel. **Evening ink** replaced it (`mashghal/docs/design-system.md`) and was
committed dark with no light palette at all. The navy system replaced *that*
when the app grew from four nouns into a workspace with sections: eight
categories need eight identity colours, which evening ink's two-hue rule had no
room for. It is **dark-first with a real light theme** — the bare `:root` block
carries the dark values, `@media (prefers-color-scheme: light)
{ :root:not([data-theme="dark"]) }` and `:root[data-theme="light"]` carry the
light ones, so the toggle wins in both directions and nothing is left to
inherit. Every one of the 43 token names evening ink defined is still defined,
aliased onto the new values, because ~7,700 lines of CSS read them.

Four rules hold it, and the first is the one the new palette put under strain:

- **Colour runs in two channels and they never mix.** **Identity** (which
  section, which job, which kind) lives only in an **icon tile** — a low-alpha
  tint of an `--id-*` token behind a muted glyph. **State** (how is this going)
  lives only in a **pill carrying a word** and in a row's **left edge**, at full
  chroma. Eight identity hues and four state hues on one screen is unreadable
  any other way: with the channels separated, a green tile never claims a thing
  is healthy and a rose edge never claims it belongs to a category. Sage is in
  hand and healthy, amber is drift and staleness, rose is late. **Late is still
  the only alarm** — evening ink's apricot is now a rose, so the "no red at all"
  rule is superseded, but nothing else took a warm hue with it.
- **Waiting carries no colour.** A step waiting three days against a five-day
  chase is not a problem, and the first build coloured it amber as though it
  were. The ladder, in the order it has to be legible: **late** rose ·
  **in hand** sage · **waiting** dim grey · **not started** faint · **done**
  receded, and it sinks. `stateTone()` and `NODE_INK` are the same ladder, one
  for the rows and one for the canvas, and a change belongs in both. The state
  is written as a **word** beside the colour, so the board survives a reader
  who cannot separate the hues.
- **Nothing emphatic borrows a state hue.** A primary button is neither late
  nor healthy, so it takes contrast — ink on the page colour. A `danger`
  button is quiet at rest (a row of rose `×` buttons competed with the one
  step that was actually overdue) and colours only under the finger; inside
  `#overlay` it is loud, because there is one action there and it is the moment
  of consequence.
- **A claimant's, a kind's or a section's colour is identity, not state**, so it
  comes from the `--id-*` family and never from sage, amber or rose. Those three
  are read as "how is this going" everywhere else — and the mistake is easy to
  make by recolouring rather than rebuilding: swapping apricot for rose turned
  the whole late panel rose-on-rose (prose, figure and button together) and made
  the top of Waiting one continuous alarm. A late row is a **neutral card with a
  coloured edge and a pill**, never a coloured card.

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

**A toast sits above the switch bar, and the bar measures itself.** The bar is
pinned to the bottom of every screen, so a toast at a fixed `bottom` sat behind
it: half of "Removed · Undo" was under the bar and the Undo was unreachable on
a short window. `mountBar()` writes the bar's real height into `--sbh` on every
render — measured, not written down, because it wraps to two lines when there
is a re-entry note to read back, and a constant would hide a toast exactly when
the bar had most to say. The `.toasts` box is `pointer-events: none` with each
toast taking it back, so it never blocks what is under it.

**On a phone, a row wraps its buttons onto their own line** (under 560px). A
pill, a sentence and two buttons on one line left the sentence about ten
characters wide, and an upkeep row naming a place and the thing it protects
wrapped to nine.

**A LINE ON THE SHEET IS NOT A HAIRLINE.** The four edge tokens — `--edge`,
`--edge-dead`, `--edge-assoc`, `--edge-back` — exist because the sheet used to
borrow `--line-dim` and `--rule-mid`, both `#27395a`, which is **1.54:1**
against the dark sheet. And on a template board nothing has started, so that
was *every* edge on the screen: its owner said they could not see the links,
and they were right. Measured, per theme: dark 8.17 / 3.92 / 7.10 / 8.20:1,
light 5.14 / 3.09 / 4.07 / 6.70:1. Two things worth keeping: the light
dead-edge had to come **down** from the obvious `#93a3b5`, which is only
2.58:1 — *dimmer is not the same as invisible* — and **the arrowhead markers
have to follow the line**, or a line raised to 3.92:1 ends in a tip still at
1.54:1. `--line-dim` keeps its own job where low contrast is correct; the
sheet no longer reads it.

**The sheet fills the screen** (`.cvbox.max`, and `setMax`). Inside a page it
is a letterbox — about 420px against a board three screens wide — so reading
it meant panning constantly and losing your place. **Not the Fullscreen API**:
it is refused without a gesture in some contexts, it takes the whole document
so a dialog opened from the sheet can render *behind* it, and leaving it is a
different key on every platform. A fixed box at **z-index 55** is the same
effect with none of that — above the switch bar (50), below the storage alarm
(70) and the overlay (90), so every dialog and alarm still lands on top.
Toggling is **not a render** (that would re-fit and throw away wherever the
reader panned to, the same reason `paintSel()` exists), but the class is
written into the markup **as well**, because any render that rebuilds the
sheet builds a fresh box — and a box without it dropped out of full screen
mid-edit while `html.cvmax` stayed on, leaving the page unscrollable behind a
sheet no longer covering it. Every route that leaves the board calls
`unmaximize()` for the same reason.

**AN ESCAPE STACK IS WRITTEN ONCE.** It was written twice — in the sheet's key
handler and in the document-level one — and both saw the same keypress,
because the sheet's called `preventDefault` but not `stopPropagation` and they
sit on different targets. So one Escape cleared the node **and** left the full
screen, the opposite of stacking. `sheetEscape()` is the single copy. Two
copies of a rule is the same bug as no rule.

## What the phone found

Its owner sent one screenshot of the app on their own handset, and it was the
most useful thing in the whole round — every item here was invisible from a
laptop.

- **A quarter of the screen was chrome.** 208 CSS px of wordmark, finder and a
  tab bar that wrapped "The week" onto two lines, on a screen 780px tall. The
  mark and the finder share one row now (a `.railtop` wrapper at
  `display: contents` on a laptop, so the wide layout does not move by a
  pixel), the wordmark goes because the mark already says it, and **no tab
  wraps and none scrolls off** — six at a sixth each with `nowrap`, down to
  0.62rem under 400px. 208px → 122px.
- **A run card was 370px tall for a name and two figures.** 124px now, by
  taking out air rather than content.
- **Done was filled and in hand was also filled.** Both track marks were a
  solid green bar, so a run with two steps in hand and none finished drew two
  bright green marks beside the words "0 of 5", and its owner read that as the
  app contradicting itself. On every progress bar ever made, filled means
  finished. In hand is a **ring** now. And the figure said "0 of 5" with no
  word saying what it counted, directly beside "Two steps in hand" — two
  different measures on one line. `boardStand()` had the word all along; the
  card had dropped it.
- **A background sync announced that nothing had happened.** `quiet` was
  honoured in the `.catch` and ignored in the success branch, so the 90s
  heartbeat and the every-change debounce both toasted "Synced — nothing had
  changed elsewhere" over whatever you were reading. **Silence is the correct
  report for a no-op**; pressing Sync yourself still always gets an answer,
  because then you asked.

## Storage failures

**The app may never carry on as though the record were intact.** Two ways it
can be in trouble, and both were silent.

**It could not be read.** A truncated write, a half-finished sync or a backup
pasted in short makes `JSON.parse` throw; the catch returned a blank shape and
the app opened on its first-run screen with **not one word said**. The only
rational reading of that screen is "everything is gone", while the text was
still sitting in storage — and the next thing that saved would have written
over it. An empty book presented as your book is the worst failure this app can
have. So `loadState` **keeps the raw text** in `bookTrouble.unread`, and
`persist()` **refuses to write at all** until somebody decides: that text is
the only copy of the work, and a blank book written over it *is* the loss. The
alarm offers the two real choices — hand me the text (through `backupDialog`,
so it can be copied out or saved), or throw it away and start fresh, which
confirms first and says it is the only copy.

**It could not be written.** The old code toasted and moved on: four seconds
later nothing said so, and the screen went on showing a change that would
vanish on reload. Worse, the sample's own "Example loaded" toast landed
directly after two failures, so the app claimed success immediately after
admitting failure. A refused save is **sticky** now, the first one opens the
backup dialog so the work can be copied out of the page it is still in, and
`toast()` appends **"· not saved"** to every message while it stands — one
place, because every success message in all four apps comes through there.

Three things about the alarm itself. It is **not a toast**: a toast is for
something that happened, and these are states the app is IN, true until
somebody acts. It is **`position: fixed`, not sticky** — sticky pins to
whichever ancestor scrolls, and in one of these apps that is not the body, so
it scrolled off the top, which is the one thing it may never do. And it has
**two shapes**: the unread alarm is a full card, because the page behind it is
an empty book and covering it costs nothing, while the unsaved one is a single
line, because it stands while you keep working and a three-line card
permanently over the top of every screen is its own problem. Its buttons are
wired with real listeners rather than `data-act`, so every app that shares the
runtime gets them without adding an action.

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

**A script that finds nothing must fail, not return.** `pics.js` looked for
`pic-add` on a board that had just opened, found nothing because the words are
folded away and because that button renders only on a node that is already a
photograph, printed `NO`, and **returned without failing** — so it sat in the
suite for weeks testing nothing while reporting nothing. Any `if (!el) return`
in a test is that bug; it exits non-zero or it is not a test.

**A sweep's own pattern can cry wolf.** `grep -cE '^FAIL|[0-9]+ failed'`
matches the string `0 failed`, so a clean 26-assertion run reported as a
failure and sent me chasing a bug that was not there. `[1-9][0-9]* failed`.
A sweep nobody trusts is a sweep nobody reads — the same rule as the suite
itself, one level up.

**A performance test must not charge the app for the harness's own cost.**
`picperf.js` reported a 1279ms freeze on adding a photograph and the app was
innocent: timestamping every long task against the moment the file was handed
over showed the block starting *before* `createImageBitmap` was ever called —
it was Playwright materialising a five-megabyte file into the file input, and
generating twenty-seven million pixels in the page was another 1.4 seconds.
So the photo is made once before the observer starts, every entry is recorded
with its `startTime`, and the ones that began before the app had the file are
**named and excluded** rather than quietly dropped — a reader has to be able
to see what was left out. Inside the app's own stretch the figure is now
`none`.

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
