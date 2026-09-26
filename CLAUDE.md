# Working in this repo

Seven small offline web apps served from GitHub Pages — six of them, plus
`mashghal2/`, which is the round-3 rebuild of Mashghal standing beside the
original rather than replacing it, because the two are different apps and
their owner asked to keep both. No build step, no bundler,
no package.json. What is in the repo is what runs. (`handoff/` is not an app —
it is a page of screenshots for a design round.)

**Daybook, Kitchen, Timesheet, Mashghal and mashghal2 share a byte-identical
runtime.**
The block that begins `Shared runtime for all of these apps` carries
`loadState`/`persist` over `APP.storeKey`, the in-page modal with its field
spec, `confirmAction`, `toast`, the backup and restore dialogs, `download`,
the chart and tile helpers, and the date helpers. An `APP` object supplies
`storeKey`, `tabs`, `blank`, `hydrate`, `renderView` and `actions`. Two
sandbox lessons are encoded in it: **native `confirm()` silently returns
false** and **`<form>` submit never fires**, so every confirmation is an
in-page modal and every action is a button with Enter wired by hand. Copy it
verbatim into a new app and never improve one copy alone — a fix belongs in
all five at once, and this is the test:

```
for f in daybook kitchen timesheet mashghal mashghal2; do
  sed -n '/Shared runtime for all of these apps/,/^<\/script>$/p' $f/index.html |
  sed '$d' | md5sum
done
```

**Five identical hashes now**, because `mashghal2/` carries the runtime too —
so a fix belongs in five copies, and the rebuild is not licence to improve it
in one. Five identical hashes, or a copy has drifted.

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
mashghal2/                  the round-3 rebuild, beside the original, own book
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
- **A rate and a month are different questions, and a card headed "This month"
  owes you the month.** `monthlyIncomeExpected()` sums every contract that has
  not ended, whether or not it pays this month — a running rate, and the right
  basis for a promise that repeats. The adviser's card printed it under the
  heading THIS MONTH, so a book whose second contract next paid on 31 October
  read "Expected in $933" in a September where $600 was the whole of it.
  `incomeDueIn(mk)` answers the other question, using **the same liveness test
  `projectForward()` walks with** (`startsOn <= monthEnd && until >= monthStart`)
  so the adviser and the chart cannot disagree about whether a contract pays in
  a given month. `monthlySurplus()` returns both — `due`/`dueSurplus` beside
  `income`/`surplus` — and every row on the card names its own basis: *Due in
  September*, *Left this month*, then *Short in a usual month* below the
  proposals, which are still sized on the rate because one lumpy month is no
  reason to move a goal. When the two agree (`lumpy` false) the explanation is
  not printed at all.
- **The pace notice is set against true burn, like the card above it.** It
  projected `monthSummary().expense` and compared it with last month's, so a
  month holding a refundable projected a figure nobody would ever pay, and said
  it was "$294 less than last month" against an $950 base — directly beneath a
  card headlined TRUE BURN $369, which is what the runway, the goals and the
  adviser are all built from. Both ends are `trueBurnFor()` now.
- **A contract ends on `r.until`, and its renewal ends on `r.renewUntil`.**
  (`endsOn` belongs to grants; writing it on a recurring record means the
  contract silently never ends, which is how the sample's headline cliff went
  missing.) `renews` used to pay its weighted fraction to the edge of the
  horizon — eighteen months of income from a job that finished, at 45%, which
  flatters every figure built on it. The second date is how far a renewal is
  expected to run; past it the line stops. Left empty it still runs on, because
  that is what was said, and `renewUntil` is dropped when `renews` is.
- **An allowance is asked about the months the contract actually ran, and the
  month is a FIELD.** `allowancesAwaiting()` walked last month and this month
  with nothing consulting `startedOn` or `until`, so a contract that began in
  September was asked how many days were worked in AUGUST — and the dialog took
  its month from the notice and offered no other, so an answer meant for
  September had nowhere to go but August and could not be moved afterwards.
  `allowanceLiveIn(r, mk)` gates the question; `allowanceMonths(r)` builds the
  picker, newest first, and includes any month already recorded even if it
  falls outside the contract's dates, or a mistake could not be reached to be
  corrected. The picker's labels carry what each month already holds and its
  `onChange` reloads the days box, or the figure prefilled for one month is
  saved against another. Nought clears a month, which is how a wrong answer is
  taken back.
- **What someone typed has to be findable and changeable, even when it is not a
  transaction.** The allowance days were an answer to a notice and nothing
  else: entered once, then rendered on no screen in the app. `allowanceLog(r)`
  puts them on the contract that owns them — month, days, what they came to,
  and an edit button per row. They are deliberately **not** ledger entries: the
  pay already arrived as income and the taxis are already logged as spending,
  so a third record of the same money would count it twice. The rule is that
  the record must be visible and editable, not that everything must be a
  transaction.
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
  Two more from reading it again a round later: **"the 1 whole week with
  entries fall short"** — a digit in prose and a verb that did not follow the
  count, in the one document that goes to an accountant or a visa office. And
  the page's own sub-line **repeated the report's first line** in a second
  format two lines above it ("AUB Tripoli 21st C · 2026-05-01 to 2026-09-17"
  over "AUB Tripoli 21st C — May 1, 2026 to September 17, 2026"); the page
  says what the page IS, the report says what it covers.
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

**Seven tabs, and a gear: Home · Projects · Workflows · Actions · Assets ·
Schedule · Outputs**, with Equipment, Knowledge and Connections as rail rows
under Assets (the poster's words; the record still says boards, jobs and
repo). Settings gave up its slot and moved to a gear beside the finder —
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

**AND A LIBRARY ENTRY IS A REGISTRY ENTRY — no fifth noun.** Asked for a
Library holding "formulas for excels" and "scripts I might use to extract
certain photos in Python", and then handed a brief naming five entry types
(Method · Script · Formula · Reference · Template) with per-type fields, the
shape that does not unravel the model was already here: the registry holds
what the work is made of and made with, and the **one thing a path cannot
carry is the content itself**. So `a.body` is the text and `a.lang` is what it
is written in — two fields, not a `state.snippets` list, which would have
begun the day it shipped by losing the topics, the provenance, `assetUses()`
and the finder.

**FIVE WORDS, THREE ROUTES, AND THE SCREEN SAYS SO.** `SAVE_KINDS` offers the
brief's five in its own question ("What are you saving?"), and they land on
three forms, because **the language is what says whether a body is code**:

- a **Script** and a **Formula** are one record with a different language
  (the Formula door opens the code form on Excel);
- a **Method** and a **Template** are one record with none, read as prose;
- a **Reference** is a link with a note and no body at all, which is the
  registry's own dialog with its kind and its section pre-answered.

Five doors onto three rooms is fine; five doors onto three rooms *with nothing
saying so* would read as the app losing track of what you picked, so the
picker's hint carries all five readings at once rather than one at a time —
a description that changes as you move through a list cannot be compared, and
comparing is the whole reason there are five words. Same fold, same reason, as
four archaeology nouns being one write-in field. (`type: "note"` was the first
draft of that hint and is **not a field type the shared runtime knows**; a new
one would have to land in all four apps byte-identically for one dialog.
`hint` is the runtime's own slot for a sentence about the control under it.)

Seven rules hold the record:

- **The test is the body, not the kind.** `hasBody(a)` is
  `kind === "snippet" || kind === "method" || !!a.body`; `isCode(a)` adds
  `!!a.lang`. It was called `isSnippet`, which stopped being true the day a
  method could be written out — a method is not a snippet, and the question
  the code was always asking is whether there is a body.
- **Code does not wrap; prose does.** `.snip` is `white-space: pre` in mono
  and scrolls; `.wrote` is `pre-wrap` in the UI stack and wraps. Same card,
  same head row, same Copy, one property different. Wrapping code at forty
  characters changes what it says; setting a method in the code box made the
  one entry type written to be READ scroll sideways at its first long
  sentence. The **line count is printed above** either way, so nothing is
  hidden without being counted, and on the entry's page the block sits
  **above** the facts table — for every other kind the facts are the point,
  and here five rows of table over the body would put the answer below the
  fold on a phone.
- **`repoOf()` returns `lib` for a body**, which makes the Library a
  **section** and not only a lens. The strip's count is `libEntries()`, and
  the borrow pool stops skipping the Library, because a script really is a
  thing a step is done with.
- **WHAT YOU REUSE IS THE LIBRARY'S OWN HALF** — `libOwn()`, everything whose
  section is `lib`, stated rather than derived like every other section. It
  was `hasBody`, and that was wrong twice over the moment a Reference could
  be saved: a reference has no body, so it **vanished out of the very section
  it had just been saved into** and showed up only in one subject row further
  down; and the language chips summed to four above five rows, because a
  method has no language and belonged to no chip. `libFacet()` gives every
  entry **exactly one** chip — its language, or "written out", or
  "referenced" — so the chips partition the list and All is their sum. *A
  figure may never disagree with its own parts*, and there is a test that adds
  them up.
- **One row, three shapes.** Code shows its first line in mono and offers
  Copy; prose shows its first line as prose and offers Copy; a reference shows
  what it POINTS at and offers whatever `openHandle()` really can do — so a
  reference can never grow a button that does nothing. The pill is the facet,
  so the row and the chip above it cannot disagree about which group it is in.
- **The body is never trimmed at the front.** Leading whitespace is what a
  Python block MEANS. Only the trailing blank lines a textarea collects go.
- **One dialog, two modes.** `bodyDialog(a, mode)`; on an EDIT the mode is
  left out and comes from the record, so an entry reopens in the shape it was
  written in and the language box is **absent** rather than present-and-blank
  where it could never apply. A picker cannot be hidden reactively here —
  `showWhen` matches another field's value and this is settled before the
  dialog opens — which is exactly why the mode is chosen first.

**THE BRIEF NAMES TEN SHORTCUTS AND FOUR OF THEM ALREADY WORKED.** Ctrl+K,
Escape, `/` and Enter came with the finder and the sheet; Ctrl+N, Ctrl+S,
Ctrl+Z, Ctrl+Shift+Z, Space and Delete are the other six. The rule under all
of them, and the reason none of them needed a new action: **a shortcut is a
keyboard route to a control that is already on the screen.** `APP.actions`
stays the only place a figure moves, so a key cannot do something a reader
could not have done with a tap, and it cannot drift from the button it fires.

- **Ctrl+N is a table, not a guess, and it goes by DEPTH.** `newHere()`
  returns what the screen you are on is a list *of* — a procedure on
  Workflows, a **step** on an open sheet, a project or a job on Projects
  depending on which half of the strip is up, a task on Actions, a thing or a
  Library entry in Assets. Home is five other screens and Schedule and
  Outputs are both derived, so there it returns null and the press **says
  so and names where it does work**: a shortcut that silently does nothing is
  the same fault as a button that does.
- **Ctrl+S earns its place on one case.** The runtime already wires Enter to
  a dialog's confirm, but inside a TEXTAREA Enter is a new line — so a note
  or a body was the one field you had to reach for the mouse from. It presses
  `[data-mok]`, and with nothing open it says nothing is being edited rather
  than letting the browser's Save Page through.
- **THE UNDO IS THE TOAST'S, AND IT LIVES EXACTLY AS LONG AS THE TOAST
  DOES.** This app has never had an undo stack: every change that can be
  taken back offers its own undo on the message it prints, as a closure over
  the records it touched. Ctrl+Z clicks that button. Keeping one reachable
  for longer would widen a real hole — the sample, a restored backup and a
  sync merge all **replace** state, and a closure captured before that would
  mutate objects no longer in the book. With none up it says what the app's
  undo actually is rather than pretending to have lost one.
- **And there is no redo, said plainly.** Offering one would mean keeping the
  state from before the undo and putting it back through `APP.hydrate` —
  which works once and then cannot re-offer the undo, because the closure
  that performed it captured records the restore has just replaced. A redo
  that silently stops being reversible is worse than not having one.
- **Space does the main thing and THE STRIP DECIDES WHICH IT IS** — the
  `loud` button when there is one (Mark done, Answer it, Add a picture),
  otherwise whatever the strip offers first (Reopen on a finished step).
  Read off the DOM `selPanel` has already drawn rather than worked out again,
  so Space can never do something the screen is not showing and cannot drift
  the next time that strip is reordered. Space used to share Enter's job,
  which was one of them too many: **Enter says "show me what I can do" and
  Space does it.**
- **Delete is the strip's own Remove**, which already confirms and says what
  goes with it. Backspace counts too, because that is the key a Mac keyboard
  has — and it is safe to accept precisely *because* Remove confirms:
  somebody reaching for Backspace out of go-back habit gets a question, not
  a loss.

**A REFERENCE TABLE IS NOT A FORM, AND IT HAS ONE WAY OUT.** Two drafts of
the keyboard dialog were wrong before the third. Ten read-only text fields
meant inventing a `ro` property the shared runtime does not have — the same
trap `type: "note"` was, and a field spec is not the place to put a
reference table. Then `openModal` with `cancelLabel: ""` **still drew
Cancel** beside Close, because the runtime reads `opts.cancelLabel ||
"Cancel"` and an empty string falls through: two buttons that both dismiss,
one of them dressed as a choice, which is the fault this file already
records about the equipment row. A dialog that is not a form writes the
overlay itself and calls `trapOverlay` — the way `backupDialog` does — and
the test presses Escape and Tabs all the way round, because *Escape and the
focus trap belong to the OVERLAY, not to `openModal`* and a hand-written
overlay is exactly where that is forgotten.

**AND LOOKING FOR THE NEW SETTINGS CARD FOUND A WHOLE SCREEN WITH NO ROUTE ON
A PHONE.** Settings gave up its tab slot for the seventh one and moved to the
gear; the gear lives in `.railme`, which is `display: none` under 760px; and
the finder built its section rows from `APP.tabs`, **where Settings is not**.
So typing "settings" found nothing and the gear was not on screen — the theme,
your name, sync, "Erase everything" and **"Get the newest"** were all
unreachable by tap on the device this app is most used on, and "Get the
newest" is exactly what a phone reaches for when its cached copy is stale.

The fix is the finder, in both places it has to be: in `findAll()` so it can
be searched for (with every word a reader would try — theme, dark, erase,
shortcuts, version), and in **`findDefault()`** so it is in the list the box
opens on. A row findable only by somebody who already thinks to type
"settings" is not a route for the one screen whose name is the thing you have
forgotten.

**A RIGHT-CLICK IS THE SECOND RENDERING OF ONE LIST, NOT A SECOND LIST.** The
brief asks for a node menu carrying Edit · Duplicate · Connect · Add related
thing · Disconnect · Delete, and the sheet already had all of that behind the
selection strip — so the thing to build was a menu that shows *the strip's own
list*, not a menu with a list of its own. `nodeActs(b, n)` is that list,
extracted out of `selPanel` and returned as records (`{act, label, loud,
danger, href, launch}`); `selPanel` lays it across and the menu lays it down,
and `nodeActBtn` builds the button either way. There is a test that reads both
and fails if the two strings differ, because **two copies of one list is the
same bug as two copies of one rule** — it would drift the first time an act
was added, and the drift would be silent.

- **The menu says "primary" and "destructive" the way the strip does.**
  Written first with the loud row in sage and the remove row in rose, it broke
  the channel rule in a third place: state lives in a pill carrying a word and
  in a row's left edge, and a menu row is neither. The loud row takes **weight
  and `--ink`**, and Remove is `--dim` until the finger is on it, exactly like
  every other `.btn.danger` outside a dialog. Two renderings of one list may
  not disagree about what its rows mean.
- **A menu as long as the node can be longer than the phone.** A live `send`
  with three ways out and two pictures runs to fourteen rows; clamped to the
  top by `Math.max(8, y)`, everything past the bottom was simply not there.
  It scrolls, with `overscroll-behavior: contain` so the page behind does not
  move with it, and the test drives it at **390 × 360** — a phone on its side,
  where no node's menu fits — and asserts the last row is inside the box once
  scrolled to. *Reachable means reached*: a scroll container that clips its
  last child is the same fault with a scrollbar drawn on it.
- **Two of the six items did not exist, and each one is a rule.**
  **Duplicate** copies the node and **not one edge** — the brief says so in as
  many words, and it is right: a copy of a step is a step you are about to
  place somewhere else in the sequence, so inheriting the original's
  predecessors would put it in the flow you have not decided on yet. It clears
  `enteredAt`, `doneAt` and `chasedOn`, because a copy of a step that is
  finished has not been done. **Disconnect** cuts every edge touching the node,
  says how many **as a word**, and refuses by name when there are none —
  neither asks for a confirmation, because both are reversible and the undo is
  on the toast, which is this app's rule for a routine act.
- **A thing and its line in one act.** `Add related thing…` is `thingDialog`
  with `opts.linkTo` and `opts.at`, so it writes the node *and* the `link`
  edge — a `link` and never a `flow`, since nothing waits on a reference photo
  and a run does not advance through it. Asked for the thing and then asked
  again for the line, nobody would draw the line.

**AND A NEW NODE LANDS WHERE YOU ARE LOOKING.** `nodeDialog` called
`autoLayout(b)` on every add, which re-ranks the whole board — so adding one
step to a forty-node procedure threw away every position anybody had placed by
hand, and on a panned sheet the new step appeared somewhere off screen.
`newSpot(b)` reads the live `vb` and returns the centre of what is actually in
view, nudged until it is not on top of something, and `settleNode` pushes only
what is genuinely in the way. "Tidy" is still there for when a re-layout is
what you want — which is the point: *a layout is a thing the reader asked for,
never a side effect of adding one node.*

**THE COORDINATES OF A PRESS GO STALE IN ONE EVENT, AND THAT COST FOUR
ATTEMPTS.** The menu did not open at all and every plausible cause was wrong
in an interesting way. `ev.target` is the `<svg>` under pointer capture, so it
never names the node; `document.elementFromPoint` failed the same way; the
selection strip appearing fires a `scroll`, which is one of the things that
closes the menu, so it was built and destroyed between two frames. The real
cause, measured: **the sheet's top moved 184 → 269px between `pointerdown` and
`contextmenu`** — the sheet is `tabindex="0"`, pressing it focuses it, and the
browser scrolls a newly-focused element into view. So the node comes from
**the press** (`drag && drag.n`), in the `contextmenu` handler and in the
long-press timer alike, and `menuPick` sets `sel`, paints the strip, and opens
the menu a frame later against a layout that has settled. The same fault then
appeared twice in the harness — a shot script that produced a screenshot with
no menu in it, and a contrast walk that right-clicked a point it had read
before picking the node. **A stored coordinate on a canvas is a coordinate
about the last frame.**

**AND THE ONE THAT WAS FOUND BY LOOKING: `.btn.loud:hover` HARDCODED `#fff`
BESIDE `color: var(--page)`.** On paper that is near-white text on white —
about 1.01:1 — so *Mark done*, the strip's primary button on every board,
lost its label the moment a pointer touched it. It is the identical fault this
file already records about `.btn.primary:hover`, in a second rule, and
`--ink-hover` already existed for it. It survived because `lightlook.js` hovers
every button on a *screen* and the strip is not on one: it appears only when a
node is picked, and picking a node is a press on a canvas. The walk now picks
one, measures the strip and then the menu in both themes, and `hoverScan` is a
function rather than a block written inline for one tab — **the surface that
proves a rule is the surface nobody thought to visit.** Two traps in that
measurement, both of which reported the fix as not having landed: an empty
selector *passes* a contrast assertion (nothing on screen is nothing
unreadable), so each scan asserts it matched some controls first; and the scan
leaves the pointer on the **last** row it hovered, so a read of "the menu at
rest" taken straight afterwards is a read of Remove under the finger.


**A second gear on the phone row was the wrong answer**, and the reasons are
worth keeping: it is two copies of one control, which is what `omniEl()` cost
Coffer; there is no room for a fourth row of chrome, since the phone pass
took that rail from 208px to 122px and that is not being given back for a
screen opened a few times a year; and **the one control a phone urgently
needs from there is not in Settings at all** — Field mode's toggle is on
Waiting, where somebody standing on a site will actually be. The rail already
hides the board list at this width and leans on the finder for it; this is
the same trade.

**THE BRIEF'S PER-TYPE FIELDS ARE ONE STATED LIST, NOT SIXTEEN BOXES.** Round
3 names them by kind: a file's extension, size, modified date and checksum; an
app's category, platform and version; a device's specifications, serial,
accessories, manuals and drivers; a site's alternative names, location, period
and type. Hardcoding those four sets is wrong three times over, and each
reason is a rule already in this file.

- **`assetKinds` is a floor and not a ceiling.** Site, Feature, Artifact and
  Survey are write-ins — there is a test that fails if any of them appears in
  `ASSET_KINDS` — so a fixed set of fields per kind would be wrong the first
  time somebody writes in a fifth, and *a picker that cannot be extended will
  eventually be wrong* applies twice over to a whole form.
- **A dialog of twelve boxes is a dialog people close.** The registry's is
  already thirteen behind a `more: true` fold for exactly that reason. Adding
  sixteen would make it twenty-nine.
- **Two of them are figures this app cannot know.** A page served over https
  may not read `C:\…` at all — that is why `openHandle()` exists — so a file's
  size and its checksum would be numbers typed by hand and wrong the next time
  the file is saved. *A plausible wrong number is worse than a visible
  failure*, and a checksum is the purest example of one: it is worth having
  only if it is true.

So `a.facts` is `{id, k, v}` — a label and a value, both typed — printed as
rows in the facts table the page already has, beside `Kind`, `Where it is
kept` and `Part of`, because **a serial number is a fact about a laptop and
not a different sort of thing**. Five rules hold it:

- **The brief's own words are a HINT, not fields.** `FACT_HINTS` carries one
  sentence per section of the Repo — *Serial, Specifications, Accessories,
  Warranty* on a device, *Version, Platform, Licence* on an app — because a
  suggestion can be ignored and a field cannot. Same fold, same reason, as
  four archaeology nouns being one write-in. The site hint says **never a
  password**, since that is the one thing somebody would try to keep here and
  this book is not a place for one.
- **Both halves or no row.** `assetFacts()` filters to facts carrying a label
  *and* a value: a label with the value cleared is a blank row and a value
  with no label is a row nobody can read. Same test as `assetTopics`, and
  there is one that hand-edits half a fact into the record — which a bad merge
  can do — and fails if the page prints it.
- **Emptying the value is how a row comes off**, and the dialog says so.
  A two-field record does not need a second delete button, and Coffer's
  allowance days already answer a wrong figure with *nought clears the month*.
  The undo is on the toast like every other removal here.
- **The finder reads the value, which is half the reason the field exists.**
  The question six months later is "which laptop is PF2XK9QD", and the serial
  is the half you have not forgotten. There is a test that types one and
  fails if the laptop is not the hit.
- **The same label with the same value is a double tap, not two facts.** Two
  accessories both labelled "Accessory" are two facts, so only the exact pair
  refuses — the opposite of `topicList()`, which de-duplicates on the word
  alone, because a topic IS its word and a fact is a pair.

Two things reading the rendered page changed. The pen was revealed on
`dd:hover`, which is **no gesture at all on a touch screen** and, on a laptop,
makes the only route to correcting what you typed something you have to
discover by waving the pointer at it — it is dim and always there now. And a
long value wraps, which dropped the control onto **a line of its own** at
phone width, reading as a stray button attached to nothing: the cell is a flex
row, so the value wraps inside its own box and the pen stays on the first
line's baseline. The sample states facts on three kinds (a serial and a
specification on the laptop, a version and a licence on ArcGIS Pro, a period
and a fabric on the sherd) because *a feature with no representation in the
sample is a feature nobody can be shown* — and the one on the sherd is the
whole argument in miniature: the brief's archaeology fields, on a kind the app
has never heard of, with no code naming either.


**THE EXTENT WAITED FOR A FIELD, AND THAT IS THE WHOLE ANSWER TO WHY
PROVENANCE COULD BE DRAWN AND IT COULD NOT.** The round-3 brief names two
data-driven visuals side by side; `fromIds` was already stated, so the chain
was buildable, and there was **no coordinate anywhere in the book**, so a
footprint would have been geometry the app invented. So `a.geo` came first:
`{lat, lon}` for a point, `{lat, lon, lat2, lon2}` for an extent, normalised
to south-west and north-east corners on the way in.

- **Decimal degrees and nothing else.** A parser that took `34°20′20″N` would
  be guessing about primes, hemispheres and three punctuation conventions —
  so `geoParse` refuses and **says what it wanted**: *"34°20′20″N" is not a
  decimal number. Degrees and minutes are not read here — write 34.3390.* A
  latitude outside ±90 is refused by name, as is a longitude; one number is
  refused with the shape it expected. Validated where it is typed, like every
  date in the app.
- **A COORDINATE IS NEVER ROUNDED ON ITS WAY BACK OUT.** `geoPlain` and
  `geoWords` both printed `toFixed(4)`, which is about **eleven metres** —
  coarser than the figure somebody typed. The copy button handed a map
  34.3388 for a sherd recorded at 34.33877, and reopening the dialog and
  pressing Save wrote the rounded one back over the real one. In the one
  field where eleven metres is the difference between two trenches. Both
  print the stored number.
- **"How big" is derived and says so.** `geoSpan` is one spherical degree
  (111,320 m, longitude times the cosine of the latitude) — right to well
  inside a percent across a site and wrong in the last digit by
  construction, so every figure built on it reads *"about 119 m east–west by
  90 m north–south"*. It is the only derived number here; everything else is
  stated. A point has no size, so the row is not printed rather than reading
  nought.
- **COPY-ONLY, and not a link to a map.** A basemap is tiles off a network
  and this app fetches nothing, so a "show it on a map" button would work at
  a desk and do nothing on the site where the coordinate was taken — exactly
  the fault `openHandle()` exists to prevent, and the same reasoning as a
  path with the launcher off. `asset-geo-copy` hands over the plain
  coordinate for whatever map the reader uses.

**AND THEN THE PLAN, WHICH IS WHAT IS LEFT WHEN YOU TAKE THE BASEMAP AWAY.**
`sitePlan(a)` draws the subject's extent and everything filed inside it
(`partsIn`) in their real relative positions. That is the one thing a column
of coordinates cannot say, it needs no tiles, and it is `atId` and `geo`
composed — which is why neither of them needed a new noun. Six rules:

- **Two points or it is not drawn.** One coordinate has no geometry; a lone
  dot in a frame is a picture of nothing, so the facts table says the
  coordinate and nothing is drawn.
- **North is up, east is right, and longitude is scaled by cos(latitude)** —
  or a square on the ground is not a square on the sheet and every angle
  measured off it is wrong by 17% at this latitude. There is a test that
  sorts every mark by its stated latitude and fails if one further north is
  drawn lower.
- **A plan without a scale is a picture**, so there is a bar in metres and a
  north arrow with the **letter** beside it, because an arrow alone is a
  convention and the letter is the fact. The bar is the largest 1·2·5 step
  that fits in a third of the sheet, so it is a length anybody can measure
  against.
- **An unplaced part is NAMED, not dropped.** A plan that silently omits half
  a site is worse than one with an awkward line under it, and the line agrees
  with itself at one ("One thing in it has no coordinate, so it is not on the
  plan: …").
- **The subject carries no label.** The page heading names it three inches
  above and the dashed frame says which mark is it; printed here as well it
  was one of three names landing on the same line, and the only one of the
  three that said nothing new.
- **A LABEL IS MASKED AGAINST WHAT IS BEHIND IT.** Pushing a label clear of
  another label does nothing about a label landing on a LINE, and the
  orthophoto's north edge sits three metres under the site's, so its name was
  written straight through the site's own frame. A mask in `--page` behind
  every label is what a real drawing does and the only fix that holds in
  general.

**A PUSH THAT CAN MOVE SOMETHING UP DOES NOT TERMINATE.** The label
de-collision restarted its scan on every push (`j = -1`) and set
`L.y = K.y + 13` unconditionally — so a label could be moved UP onto an
earlier one, pushed back down onto a third, and round again for ever. **Five
coordinates on one site froze the page.** And the symptom is worth
remembering, because it looked like nothing of the kind: every Playwright
click after it reported *"element is visible, enabled and stable … performing
click action"* and then timed out at thirty seconds, with `elementFromPoint`
confirming nothing was intercepting anything. That is what a spinning main
thread looks like from outside the page, and it cost two speculative fixes
to the harness before the app was suspected. Sorted by y and only ever
increasing, each placed label can force at most one move past it.

**And the de-collision is DRIVEN, not hoped for.** With the subject's label
gone the sample's four marks sit fifteen pixels apart and never collide, so
the loop would have been a path nobody drives — `geo.js` records an ashlar
block a metre from the top of the quay face, which is a real thing to record,
and asserts the cascade lands at exactly thirteen pixels with no pair
overlapping.

**Two ways a test can be wrong about geometry, both of which reported a fault
that was not there.** It compared a BOX's label position against the box's
stored `lat`, which is its SOUTH edge while the label is drawn above its
north one — two different things. And it read `box[0]` for "the quay face",
which became the orthophoto the moment the sample gained a second extent:
*name a mark, never count one*, the same rule as naming a tab. It pairs marks
with records by document order now, because the drawing emits them in
`planPoints` order.

**A scale bar can be round and absurd.** It read **"about 1 m" on a
119-metre plan** — `scale` is sheet units per DEGREE, so metres per unit is
`DEG_M / scale`, and the first version wrote `1 / (scale * DEG_M)`, out by
the square of a degree in metres. The assertion that it was a round number
passed the whole time, so the test now also measures the bar against the
sheet it is drawn on.

**The sample carries real coordinates**, because a feature with no
representation there cannot be shown to anybody: Anfeh on the Lebanese coast
as an extent about 120 m by 90 m, the orthophoto and the bathymetric survey
as extents inside and offshore of it (a **survey extent** is the brief's own
noun), and the trench and the sherd as points — a 2 × 3 m trench drawn as a
box on a 120 m plan is two pixels, and a point is the honest mark at that
scale.

**PROVENANCE IS A SHAPE, AND TWO LISTS CANNOT SAY IT.** `provGraph(a)` draws
what an entry was made from above it and what came of it below — the one
data-driven visual the round-3 brief names that this app already holds the
data for. (The other, a survey or site extent, it did NOT: there was no
coordinate anywhere in the record, so a footprint drawn from it would have
been invented geometry. That is why it waited for a field rather than being
drawn.) An orthophoto made from three hundred frames and a control file,
feeding a building layer that feeds a report, is a chain, and where you are
in the chain is exactly what a column of names does not say.

Six rules hold it:

- **It computes nothing of its own.** Every node is `madeFrom`, `madeInto` or
  the entry itself, so the drawing cannot name a relationship the words would
  deny — and the test asserts the drawn names against the ones the fold
  prints.
- **THE WORDS FOLD AWAY UNDER IT**, which is the treatment the BOARD already
  gets and for the same reason: the sheet is the screen, the same facts sit
  behind one `<details>`, and that is what keeps *say it once* true while the
  row's own controls — `Look`, and the `×` that takes a source back off —
  stay where a keyboard can reach them. Replacing the lists outright would
  have taken the unlink with them.
- **It is drawn vertically, so there is ONE layout at 1340px and at 390px.**
  No media query and no second layout to keep in step. Measured: the same
  viewBox at both widths, 1:1 on a laptop and 0.81 at phone width.
- **THREE OVALS IS THE WHOLE BAND, the "+N more" counted as one of them.**
  The first draft drew three *plus* an overflow, which is four across at
  604px — at 390px that scaled the names to 60% and 7.5px of type, which is
  not a drawing anybody can read. Four sources now draw two and count the
  rest. A `+N more` oval is a **label**: dashed, hollow, and it carries no
  `data-act`, because a button that cannot open anything is the fault
  `openHandle()` exists to prevent.
- **How much further back the chain goes is SAID, not drawn.** One hop each
  way is the drawing; a node opens the entry it names and that entry draws
  its own chain, which is the navigation rather than a shortcoming. The
  caption off `madeFromAncestors` is what stops one hop reading as all of it.
- **Identity stays in the tile channel.** A node is a neutral oval with its
  kind written underneath in words, never a hue — "made from" is not a state,
  and eight identity colours beside four state colours is what the two
  channels exist to keep apart. The subject carries an ink STROKE, the same
  reasoning as the picked node on the sheet: "you are looking at this one" is
  not a state of the work. Ovals, because an oval is data in ArcGIS
  ModelBuilder and every node here is data.

**A STRING-BUILT SVG TAKES TOKENS THROUGH CSS, NEVER `ink()` INTO ATTRIBUTES.**
The board's sheet is built with `svgEl` and reads `ink(token)`, which snapshots
a computed value; `assetPage` builds a string, so the same trick would freeze
the palette into the markup and the theme toggle would leave the drawing
behind. Every colour on it is a class reading a `var(--…)`, so the toggle
moves it with the page and nothing has to re-render. And the natural width is
written **inline** (`style="max-width:Wpx"`) because only the call knows it —
a stylesheet cap alone inflated a two-node chain to 432px, scaling 12.5px
type up 2.4× into a poster.

**MEASURE THE TEXT ON A NEW DRAWING YOURSELF: `lightlook.js` does not reach an
entry's page.** It walks the screens, and an entry is one strip and one row
further in, so the ovals' names, the kind words under them and the caption had
nobody measuring them. All seven runs clear 4.5:1 in both themes (the kind
word is the tightest at 4.61:1 on paper) — and the measurement's *first*
output was the fault: **CSS `fill` applies to every element and its initial
value is black**, so `style.fill || style.color` on an HTML `<p>` measured
black text and reported the caption at 1.12:1 dark and 19.54:1 light. A ratio
that inverts between the two themes is the tell that the harness is wrong and
not the app.

Two faults reading the built page found, both rules already in this file:

- **`.says` is a sub-line INSIDE a panel and carries nothing as a bare `<p>`**,
  so the caption rendered louder than the section heading above it and ran
  three lines. It has its own size and `--faint` now.
- **"1 thing(s) were made from this"** in the next-actions column — a digit in
  prose and a parenthesised plural, in the one place on the page that tells you
  what to do next. `ones.js` exists for exactly this and had never reached an
  entry's page either.

**And one `var` name declared twice in one scope.** `assetPage` had `var up =
partTrail(a)` at the top of its left column and `var up = assetUpkeep(a)`
ninety lines below it. Nothing was wrong today, because the first is finished
with before the second is assigned — which is precisely why it would have
broken the first time either half moved. The trail is `trail` now. (`cap` was
the same trap one level in: a local `var cap` inside `provGraph` shadowed the
file's own `cap()`, the function that capitalises a sentence's first word.)

**AND THE RELATIONSHIP THE BRIEF PUTS AT THE CENTRE OF THE MODEL: "a library
method can explain a workflow step".** Borrowing had always worked one way
round, from the sheet, which means it only occurred to you once you were
already on the board. `asset-to-board` is the other way: from the entry you
are reading, one tap. Three things about it — it writes through
**`borrowInto`/`borrowLine`**, the same pair `borrowDialog` uses, because two
copies of that mapping would drift the first time a kind was added (and the
mapping is the fiddly half: the board's vocabulary and the registry's are
different lists, so `borrowKind()` maps rather than passes through, a written
entry landing as a file or a note). The boards are **grouped into procedures
and open runs**, because editing a template for next time and adding to a run
in progress are different acts, and a closed run is not offered at all — its
procedure is history. And putting the same entry on the same board twice
refuses by name rather than making a second copy.

`needWords(title, message, act)` took the route as a third argument for this:
there are two ways out now (the workbench for a missing bench, Workflows for a
missing procedure), and *a refusal has to carry the way out* means the way out
has to be the right one.

**TWO QUESTIONS THE BRIEF NAMES THAT THE BOX COULD NOT ANSWER.** Its
command-bar section lists eight; six were answerable. `what belongs to
<project>` reads `projThings()` and `which workflows use <thing>` reads
`assetUses()` — the same functions the screens that answer them in full
already use, so neither can disagree with its screen, which is the rule every
answer in that table lives by. The second folds by BOARD, because one board
can name the same thing twice and "two boards" would then read as four.

Four things reading the built pages found, each a rule already in this file
being broken somewhere:

- **`showWhen` looks its field up by id, and a missing entry is not a
  fallback — it is no field at all.** `otherField`'s map from a vocabulary to
  the select that drives it had no row for `assetKinds`, so **"Other — write
  it in" on the registry's kind picker silently did nothing**: you chose it,
  no box came, and the entry saved under the fallback. It is the one
  vocabulary this file calls a floor rather than a ceiling, and it went
  unnoticed because the sample seeds Site, Feature, Artifact and Survey
  straight into `state.vocab` rather than by typing them. A picker that cannot
  be extended will eventually be wrong; one whose escape hatch is drawn and
  inert is worse.
- **A fact row may not say something the reader can see is untrue.** "Opening
  it — nothing to open, this is a thing, not a file" is right for a pair of
  headphones and plainly false three inches under a snippet's own body. Nor
  may a table print a row that can never have a value: "Written in — not
  said" under a method is a gap the table invented.
- **Say it once, and `assetSays` was saying the note twice** — in the
  sub-line under the title and again in its own panel twenty pixels below. On
  a snippet whose note runs three lines that was most of the screen.
  `assetSays(a, brief)` drops it for that one caller; every other caller is a
  ROW, where it is the only place the note is said at all. (`topicList()` came
  out of the registry dialog the same day, because a second dialog started
  writing topics and two copies of a rule is the same bug as no rule.)
- **A SCREEN MAY NOT SEND THE READER THE LONG WAY ROUND WHEN IT CARRIES THE
  SHORT ONE.** "Where it is used" read *"Bring it onto one with “Bring one
  in” on the sheet"* while "Put it on a board" sat in the right-hand column
  of the same page. The milder sibling of naming a screen that has been
  renamed.

**Two traps for the next person patching this file with a script.** A batch of
replacements that asserts halfway through and **writes at the end** leaves the
file untouched and every earlier edit in the batch lost — which looked
exactly like a rep that had applied, and produced a half-patched function that
would not parse. Save after each replacement. And **an em dash in a comment is
a real em dash while the same character inside a JS string may be `\u2014`**,
so a match string built one way fails against the other.

The mechanism is the opposite of what this file used to say, and the wrong
version would mislead the next person: **Python 3 raw strings DO decode
`\uXXXX`.** `r'\u2014'` is one character, not six — so a patch written with
`r'''…'''` writes a real dash into the file, and it is a *non-raw* string with
`'\\u2014'` that writes the literal escape. Which means a match string typed
one way against a file written the other fails silently, and the fix is always
the same: build the match with the real character (`D = "\u2014"` and
concatenate) rather than typing an escape and hoping. Two replacements in one
round failed on exactly this.

**And past a certain size, match the function's BOUNDARIES rather than its
body.** A rewrite of `keysDialog` failed on one space before a comma inside
twelve lines of hand-typed match string. `s.index("  function name() {")` to
the next `"\n  }\n"` cannot get that wrong.

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

**THE FINDER CAN BE ASKED A QUESTION, AND THERE IS NO MODEL BEHIND IT.** Asked
for a chatbot "to perform tasks related to the app", the thing actually wanted
is a box you type a sentence into and get an answer out of — and a language
model is the one way to build that which this app cannot have. It needs a key
(a secret in a public repo, which this file already refuses three times over),
a network (the app is offline-first and fetches nothing), and it would sit
**between the reader and their own record**, guessing — which is the fault
every rule in this file is written against. So the answer is read off the
record by pattern, deterministically, with the same helpers the screens use.
`ASK_SHAPES` is a table of ten question shapes, each with a regex and a `run`;
`askRecord(raw)` returns the first match's rows. Five rules hold it:

- **It says what it read the question as.** Every answer carries
  `sub: "read as: " + shape` — "read as: what is outstanding with a person" —
  because a box that answers a sentence has to say which sentence it thought it
  heard, or a wrong answer is indistinguishable from a wrong question. This is
  the same discipline as a warning stating its cause.
- **It never half-answers.** A question it cannot shape prints the **table** as
  the help (`asked.unread`), rather than guessing at the nearest shape: the
  ten things it can be asked, in the words it wants them in. A palette that
  answers approximately is worse than one that says what it knows.
- **It computes nothing of its own.** Every figure comes from the function the
  screen it points at uses, so an answer cannot disagree with the screen — and
  there is a test that compares three of them **character for character**
  against Waiting's headline, the week's COUNTED tile and a project row's
  `says`. That test found the one real defect: the hours answer summed
  `standing()`'s `got`, which walks the claimants — so it **dropped the
  claimant measured in days** and answered "9h 30m" against the week's own
  "16h". It reads `state.spans.reduce(minsIn)`, the same walk the tile does.
- **It proposes and never acts.** A shape's `run` navigates, or hands over to
  `APP.actions` on a tap — the adviser's rule, and the finder's own second
  rule, unchanged.
- **The table is the discoverability.** A box nobody knows can be asked
  anything is a box nobody asks: the placeholder names three of the shapes,
  `findDefault()` carries an "Ask it something" row, and `.find-foot` has a
  button that prints the whole table.

One trap worth keeping: **a capture keeps its preposition.** `"from haddad"`
matched the person shape and then looked up a person called *"from haddad"*,
answering "Nobody in the book matches" about somebody who is in it. `askName()`
strips the leading preposition and article and the trailing punctuation — the
question is prose, and prose is what a reader types.

**Jobs is where the hierarchy is walked** (job → project → board), which is why
Projects never became a tab of its own. Coffer's rule applies here too: new
work becomes a page inside an existing section rather than another slot on a
bar a phone cannot hold. (The tab list is above, under *Mashghal's shape* —
Home · Projects · Workflows · Actions · Assets · Schedule · Outputs, with
Equipment, Knowledge and Connections as rail rows and Settings on the gear.)
Under every screen is the **switch bar**, pinned to the bottom, saying where
you are, since when, and the note you left. Boards lists procedures and runs;
opening one shows the canvas over an editable list. Waiting is the only screen
the phone really needs — dues worst-first, unfinished runs, and upkeep filtered
by place. The week is the standing, suspense and repair, and holds the report.

**A PROJECT IS FIVE QUESTIONS, NOT EIGHT LISTS.** The mockup's project
workspace carries eight on one strip — Overview · Tasks · Data · Maps ·
Workflows · Documents · Links · People — and eight is the mistake this file
already records twice: Horizon's eight sub-tabs put the last three off the
edge of a phone and nobody opened them, and the workbench stood 3,300 pixels
tall before it became four pages. `PROJ_PAGES` is **Overview · Work · Tasks ·
Things · People**, and each fold has a reason rather than being a shortening:

- **Data · Maps · Documents · Links are one page.** They are four *kinds* of
  the same thing, and `repoOf()` already says which section an entry is in —
  stated, not derived — so the grouping is free, uses the Repo's own words in
  the Repo's own order, and a reader who typed a name has one place to look
  instead of guessing between four lists of one item each.
- **Nothing on the strip is a list to maintain.** A project's things are
  derived from the boards in it (`projThings`) and its people are `people()`
  narrowed to those boards, so a thing cannot be on the project page and
  missing from the Repo, and a person cannot read "one thing is late" here and
  "clear" on their own page. `projPeople()` was deleted for exactly this: it
  assembled the list itself and, since only `people()` folds on the contact
  id, the two would have disagreed the first time somebody was renamed. The
  row is `repoRow()` and `personRow()` **verbatim** — same reading, or one of
  the two screens is wrong.
- **A registry entry is matched by `fromAssetId` and, failing that, by name.**
  Third time this fold has been needed (the borrow pool, the finder, and now
  the project page), and without it the headphones sat under "Only on a board"
  while the Repo had them on Devices with a state and a place. A board copy
  written before `fromAssetId` existed carries only a name, which is what a
  real book looks like — the sample seeds one of each on purpose so neither
  path rots unexercised.
- **A thing with no registry entry is listed last, under its own heading.**
  The pool is what the project is made of and a page that silently omits part
  of it is worse than one with an awkward heading; it offers nothing to open,
  because a button that cannot do what it says is the fault `openHandle()`
  exists to prevent.
- **The project lands on its Overview from every route** — the project row,
  the finder, the job map, and creating one. Opening on whichever page you
  last used is the trap Horizon fell into.
- Overview is the two ends of the project, the shape the written report
  already has: where it stands, and what has left the building. The bar's
  width **is** the percentage string, both out of `projPace`, so the two
  cannot disagree.

**EVERY STRIP THAT NAVIGATES BELONGS IN `navSnap()`.** `kitTab` was in it and
`repoTab` and `projTab` were not, so Back from the Library left the Repo
altogether while Back from the workbench's Upkeep page went one step. A strip
press is a navigation; one rule for all three.

**A GROUPED PICKER, AND THE GROUPS ARE THE ONES THE APP ALREADY HAS.** The
mockup's Add Node palette is five hardcoded headings (Software · Web · Files ·
GIS Tools · Hardware) and two of those are not kinds at all — "GIS Tools" is a
topic — so a fixed five would be wrong the first time somebody writes in a
sixth, which every vocabulary in this app invites. `borrowGroups()` heads the
pool with `REPO_PAGES`, then your people, then the other boards. Four details
worth keeping:

- The **Library was skipped** while it was only a lens — `repoOf()` never
  returned it, so iterating it would have been a heading that could never hold
  anything. It holds written entries now, so it is in: a script IS a thing a
  step is done with, which is exactly what the link edge carries. The
  empty-group guard does the job the skip was doing, and Connections still
  drops out on its own the same way.
- A registry entry is described in the **registry's** words, not the board's:
  the two vocabularies are different lists, so under a heading reading
  "Devices" the picker said "Lenovo Legion — kit" while the Repo calls it a
  laptop. The board kind still decides what is drawn; only the reading changed.
- The default is the **first option of the first group**, not pool index 0 —
  `pool` is ordered by how often a thing has been used, so index 0 is usually
  a board thing and the select opened on a row at the bottom. Same shape as
  reading `.value` off a group in Coffer: a grouped list needs its first entry
  found, not assumed.
- **The gate has to test the whole pool.** The button read `allThings().length`
  — one of three sources — so a book with a full registry and a bare board
  vocabulary hid the one control that would have brought any of it in.

`{group, options}` support is in the **shared runtime's** select, so it landed
in all four apps at once and the md5 test is what proves it. Native
`<optgroup>`, deliberately: on a phone it is the operating system's own picker
with the headings in it, rather than a list this app would have to build,
scroll and trap focus in.

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

## The mockup, built

Its owner sent a twelve-panel poster of the app they wanted and said *make it
exactly as shown*. Most of what it draws was already here under other words;
what it really carried was a **shape** — a sidebar with a search field and a
user footer, and a home screen that is a grid of small cards rather than a
column of full-width blocks. Both are built. Four of its panels were folded
rather than copied and the reasons are already in this file (eight project
tabs are five pages, five hardcoded palette headings are `borrowGroups()`, a
per-kind action menu is `nextActions()`, and four archaeology nouns are one
write-in field plus `atId`); everything below is what the poster changed.

**THE SIDEBAR IS THE MOCKUP'S, AND THE ONE THING IT ASKS FOR THAT THE APP
CANNOT KNOW IS TYPED.** It heads the rail with "Mohannad Workspace" and greets
its owner by name on Home. A name cannot be derived from anything in the book,
and inventing one is the "seeded fiction" fault wearing a friendly face — so
`settings.owner` is written once in Settings, adopted in `adoptState` like
every other setting, and **blank is a first-class answer**: the rail reads
"Mashghal" and Home greets the hour, exactly as before. The greeting takes the
**first name** only ("Good morning, Mohannad."), because nobody is greeted by
three.

Four things about the rail's own shape:

- **The open section is a filled pill** (`--nav-on`, white on blue, measured
  6.70:1 in both themes) rather than the brass left-hand bar it replaces,
  which had to be looked for. This is the one place a solid identity fill is
  right: it is not claiming a thing is healthy or late, it is saying you are
  standing here. Defined per theme like every other colour — `.btn.primary:hover`
  already cost this app a label that vanished at 1.01:1 for exactly the
  shortcut of hardcoding one beside a token.
- **The search control looks like the field the mockup draws and is still a
  button.** A real `<input>` in the rail would be a second place to type one
  query, and Coffer's `omniEl()` is what two copies of one control costs.
- **Quick Actions is four things you start rather than navigate to**, and every
  one of them hands to an action that already existed (`run-start`,
  `proj-add`, `board-new`, `find-open`). The `data-act` scan earned its keep
  here immediately: the first draft named `run-quick` and `board-add`, neither
  of which has a handler, and "no handler" is the half of that scan that is
  never a false positive.
- **The footer says where the book is, not that you are online.** The mockup
  reads a name over "● Online"; there is no account here to be online with, so
  the slot carries the one fact that belongs in it — "This computer only", or
  the sync words — with the dot green only when the book really does reach
  another device. A screen may not state what the app cannot know.

**THE RAIL IS A STICKY FULL-HEIGHT COLUMN, AND IT HAS TO CLEAR THE SWITCH
BAR.** Without `position: sticky; height: 100vh` the rail stretched to the
height of the *document*, so on a long screen the user footer sat two thousand
pixels below the fold — the one control the mockup pins to the bottom corner
was off the bottom of the work. And its own bottom padding reads `--sbh`, the
height `mountBar()` measures, for the same reason the toasts do: the switch bar
is fixed across every screen and is two lines tall when there is a re-entry
note, so a constant would hide the footer exactly when the bar had most to
say. On a phone the rail goes back to being a bar across the top — pinning it
there would cost a row of the screen the app has least of.

**HOME IS A GRID OF FIVE CARDS, AND THE ORDER IS STILL THE ARGUMENT.** Today ·
Active projects · Quick run, then Continue working · Recent things — the same
five questions in the same order they have always been in, laid three across
and two across instead of stacked. The shape is what stops the screen being
scrolled past: the third question used to be below the fold.

- **`dcard()` builds every one of them**, so all five are the same shape. A
  bigger or differently-dressed card reads as a more important question and
  these are five equal ones — the same rule Horizon's hub cards live by.
- **Every card's header carries exactly one action**, the way into the screen
  that answers the same question in full ("View all →"). A card that answers a
  question and is not a route to it is a dead end, and `home.js` fails if any
  card lacks one.
- **The alarms are the only full-width thing on the screen.** A run finished
  but not filed, and upkeep past its interval, are the third and quietest of
  the three forgettings; the mockup has no slot for them and it should. They
  sit above the grid, said once and only when true.
- **A tag on a row is a short word, so it is the board's KIND** — the mockup's
  own tags are Maps · Research · 3D. A project name was the obvious choice and
  the wrong one: "Harbour festival 2026" in a pill clipped mid-word at every
  width, and a pill that has to be decoded is worse than no pill.
- **A clipped name carries the full text in the row's `title`**, and on a
  phone (under 560px) the tag and the age wrap onto their own line: a pill, a
  name and a timestamp on one 334px row left "Southampton — Maritime
  Archaeology" about ten characters wide, which is this app's upkeep-row fault
  in a new place. The wrap basis is 60% and not 100%, or the grow demands the
  whole width and pushes the leading tile onto a line of its own.

**A BRACE THAT WAS NEVER THERE MADE A FUNCTION RETURN ON ITS FIRST LINE.**
`boardRecentSays()` was written `if (b.kind !== "run") var n = …` with the
return on the next line and no braces, so the return sat **outside** the `if`:
every board on Home read "a procedure · undefined steps", a run included, and
the three lines below it that describe a run were unreachable. It parses, it
throws nothing, no assertion looked at that string, and the only reason it was
ever caught is that the word "undefined" was on screen and the screen was
read. `new Function` cannot see it, the same as the free variable in
`projOver` — **reading the rendered text is the only test for this class.**

**AND THE RULES THAT MOVED WITH THE RESHAPE, RATHER THAN BEING LOST.**
`.homerow` and `.hometile` are gone, and so is `.btn.clip` — Quick run was its
only caller. The rule it existed for did not go anywhere: *a launcher button
is one line*, now carried by `.drow .nm` (nowrap, clipped, the full name in
the row's `title`). The dead-CSS scan is what forced the tidy-up, and the
three new dead names it printed — `brand-sub`, `clip` and the tile rules —
were all real. `.drow` and `.dact` went into the one focus-ring rule the same
day they were written, because `keys.js` fails on a control wearing
Chromium's default outline and it caught both.

**NAME A CARD, NEVER COUNT ONE** — the same rule as naming a tab, one level
in. `.dcard:first-of-type` matched the first card of the *second* grid as well
as the first, whose rows carry no figure at all, so a test reading Today's
figures crashed on the wrong card. Find the card by its heading.

### The poster's other panels

**CONNECTIONS IS THE SAME STORE ASKED A DIFFERENT QUESTION.** Panel 7 draws
Software · Web services · Hardware with a tick against each, which looks like
a list of integrations to keep. It is not one: `openHandle()` is already the
single place that decides what "open" means, so a **tick is that function
answering yes** rather than a stored flag — a url opens in the browser and
ticks, a path with the companion on opens through the launcher and ticks, and
a path with the companion **off** is amber and says why, because a copy is
half a connection. Hardware has nothing to open ever, so its rows carry how
the thing stands and where it is instead. It is the sixth section of the Repo
strip, not a tab: one store, six questions, and its count is what can be
**reached**, because a count of things filed would be the Repo's own total
said twice.

**A SUBJECT IS A ROW, NOT A CHIP OVER AN EMPTY SCREEN.** The Library's landing
was a strip of subject chips above the words "Pick a subject" — a screen whose
entire content was an instruction to press something, on a page that was not
empty at all. Panel 6 draws what it should always have been: one row per
subject with what it holds and the first few things in it, so the page answers
"what do I know about" without a tap. The kind chips now sit **above** the
subjects and re-count every row beneath them, and a subject holding none of
the chosen kind drops out rather than reading nought — which is the honest
meaning of picking "Papers". **Quick access** is derived too: the library
entries with the most uses that `openHandle()` can really open, because a
shortcut that cannot open what it names is the fault that function exists to
prevent.

**AN ENTRY OPENS ON ITS FACTS.** Panel 4 puts a short table of label-and-value
rows beside the thing's face, and that shape is right — these are the
questions you ask of one entry, and they had been spread down the page as four
cards of loose prose. Only the rows that **exist** are printed: half the
poster's labels (a file's size, which program wrote it) are fields this record
does not have, and a table of blanks is worse than a shorter table. Where a
fact is genuinely unstated the row says so in words rather than leaving a gap.
The face is the identity tile at size, because the registry keeps no picture
of an entry — a thumbnail belongs to a photograph on a board, and a stand-in
would be a picture of nothing.

Below it the page is **two columns, as the poster lays them out**: what the
thing is connected to on the left, what you can do with it on the right. The
poster puts everything on the left under one heading, "Related"; this app keeps
them apart on purpose, because *made from three hundred frames*, *found at
trench 4* and *used on this board* are three different facts and the pickers
that write them refuse to conflate them. **The shape is the poster's and the
headings are this app's.**

**A ROW'S STATE AND ITS DATE BELONG AT THE ROW'S RIGHT-HAND END**, as panel 5
draws an equipment row: how it stands over when it was last used, so a column
of them reads down instead of being hunted for inside a run of prose. Reading
it found two things worth keeping. Under a label saying "Last used",
`lastUsedWords()` reads "last used Jul 18" — **the label and the value said it
twice**, so a table takes the value alone. And where there is nothing to open,
the row's own hit already **is** "About": the labelled button beside it was the
same action twice, one of them dressed as a choice, so it is a chevron now —
which is also what the poster draws.

**UPCOMING IS A SECOND CALLER, AND THAT IS HOW A LYING FUNCTION NAME WAS
FOUND.** Panel 8 carries an Upcoming list under the month grid — the question
you actually have on the 28th, which the grid cannot answer because the answer
is in October. `upcoming()` reads `calMarks()` for this month and the two after
it rather than walking the record again; two walks would eventually answer one
question differently, which is the rule the report and the adviser both live
by. It immediately printed **"Friday meeting" three times**: `calMarks(ym)`
filtered every branch to `ym` except the dated-step one, and the grid had never
noticed because it reads `by[day]` for the days it is drawing and nothing else.
**A function called `calMarks(ym)` has to return the marks in `ym`** — a name
that is only true for its first caller is a trap laid for the second. (And the
row's right-hand meta printed the date the badge beside it already carried, so
it says which *day* it is instead.)

**THE PROJECT'S OVERVIEW IS THE POSTER'S PROJECT WORKSPACE**: where the work
stands on the left, and beside it the two things panel 2 puts there — what to
do next, and what the project is made of. Both are **leads and not copies** of
the pages behind them, and both carry the route to the full list: a card that
grows into a whole page is how Coffer's Today tab became the screen everybody
scrolled past. **Next actions keeps the derived and the typed apart and says
which is which** — a live step of a run is born from the record, a task is the
one thing somebody types, and folding the two into one list is exactly what
`dues()` refuses to do. Each row ticks through the action that screen already
uses (`step-done`, `task-done`) and its sub-line comes from `stepMeta()`, the
same function the board and Waiting print, so nothing here can mark something
done, or describe a step, in a way the rest of the app would not.

**NAME A SECTION, NEVER COUNT ONE.** `repo.js` asserted "five sections" and
broke the day Connections landed. It names the six ids it wants now, so the
failure says which one is missing instead of only that the number moved — the
same rule as naming a tab and naming a card, one level further in.

### The poster's words, and the order it puts them in

**SEVEN TABS AND THREE RAIL ROWS, NAMED THE WAY THE POSTER NAMES THEM.** Its
sidebar reads Projects · Workflows · Assets · Equipment · Knowledge · Schedule
· Connections, and every one of those already existed here under a word its
owner had to learn: Jobs walked job → project → board, Boards held procedures
and runs, the Repo held everything you own and open. The order is the
poster's, and it is **one order for the rail and the bar**, so nothing sits in
a different place depending on which screen you are looking at:

```
Home · Projects · Workflows · Actions · Assets
         (Equipment · Knowledge · Connections) · Schedule · Outputs
```

- **The record is untouched.** `state.boards` is still boards and every view
  id is unchanged, because renaming a state key migrates nothing and risks
  everything — the same trade already made when "mode" became "craft" on
  every screen.
- **`alias` keeps the old word searchable.** Somebody who learned "Repo" types
  it and lands on Assets; "calendar" lands on Schedule; "new board" finds
  "New procedure". What the screen SAYS is the current name — the rule the
  finder already followed for "kit".
- **Waiting and The week are not on the poster and are not dropped.** One is
  the screen a phone really needs and the other holds the hours; hiding a
  whole section to match a drawing would be the app deciding for you.
- **Equipment, Knowledge and Connections are rows, not tabs.** They are three
  of the six questions the one registry answers, so they open the Assets tab
  on their own section. Written in `navSects()` rather than in `renderNav()`,
  which belongs to the shared runtime and has to stay byte-identical across
  four apps — the same reason `railWork()` fills the rail itself. They are
  rail-only: the phone's bar was measured at six, carries seven, and ten is
  the mistake this repo has already refused twice.
- **Assets lands on Files.** With `repoTab` defaulting to Devices, the Assets
  tab and the Equipment row were the same screen under two names. A section
  row is current only when its own section is open, and Assets gives up its
  mark while one of them is showing, or two rows light up for one screen.

**EVERY WORD SOMEWHERE BEATS NOTHING AT ALL, in the finder's score.** It
matched the whole query as one substring, so a two-word search only ever found
a name carrying both words together in that order. The rename made it visible:
"new board" scored nought against a command called "New procedure" whose key
carries "board" as an alias. A phrase match still outranks a words-only match,
so the order this file describes is unchanged (exact prefix, then word start,
then buried) — and **all** the terms have to hit, or typing a second word
would widen the search instead of narrowing it.

**A third shape of the `data-act` blind spot: `setAttribute`.** The scan reads
`data-act="literal"` and already misses an attribute built by concatenation;
`navSects()` builds its rows with `b.setAttribute("data-act", "repo-sect")`,
which is invisible to it in a third way. So `repo-sect` sits on the
"unclickable" list beside `tab-jobs` and `tab-repo` while being clicked on
every screen. `nav.js` is what actually proves those rows work: it reads the
rail's words, asserts the three sections sit under Assets in the poster's
order, clicks each one and checks it opens its own section and is **the only**
row marked current, then measures the phone's bar at seven on one line.

**What the rename did NOT do, deliberately: the noun "board" still stands.**
The section is Workflows and what you make in it is a *procedure* or a *run* —
the two words the app's model rests on, and the two its own sub-line has
always used ("A procedure is written once. A run is one pass through it").
"Board" survives in about twenty-five sentences where it means either the
record or the canvas you draw it on, and those are two different things; the
poster itself only uses "workflow" for the section and for the builder, never
for a step. Sweeping the noun is a separate decision and belongs to its owner,
not to a rename.

### The Core Structure, and the section that was missing

The poster's second panel names five things, and the app is those five now:
**Projects** (why) · **Workflows** (how) · **Assets** (what) · **Actions**
(what happens next) · **Outputs** (results). Nothing was dropped to get there;
what changed is where each one lives.

**OUTPUTS IS THE ONE THE APP HAD NOWHERE FOR.** A filing step that is done is
the only thing in the book that says a piece of work LEFT THE BUILDING, and it
could be seen only from inside the project it belonged to; the written report
was a button on the week; and the week was a tab of its own, which said that
hours are a section of the workspace rather than one of the things the work
produces. Three pages, three answers to "what came out of this": what was
**Filed**, what was **Written**, and the **Hours** both rest on. It computes
nothing — `filings()` is the one walk (a project's `projOutputs()` is the same
function unranged) and the report is `buildReport()`, which reads the screens'
own figures.

Two rules it needed immediately:

- **The headline belongs to the page, not the section.** Written once for the
  whole tab it read "Nothing has left the building yet." above the Hours page
  showing sixteen hours of real work — a nought over a screen contradicting
  it, which is Home's deadline tile all over again. Each page states its own
  finding.
- **A second caller finds the fragile lookup.** Outputs offers a way into the
  board a filing came off, and `filings()` returned the board's NAME only —
  so the row looked it up by name and would have opened the wrong board the
  first time two were called the same thing, which a run and the procedure it
  came from very often are. It carries `boardId` now.

**THE PROJECTS TAB LANDS ON PROJECTS.** "Project-based organization" is the
first line of the poster's Key Features and the tab was landing on a list of
employers: the two projects nobody was paying for were the only ones on the
landing screen, and everything else was two taps down inside a bag named after
a university. Both levels are kept and neither contains the other — a job holds
the benches, the kit and the hours; a project is the work, and a thesis or a
visa belongs to no employer at all. The strip is **Projects · Jobs**, the
project list is ordered worst-first off `projState()` so it can never rank a
project differently from the way its own page describes it, and work under no
job keeps its heading on the Jobs page, where it is the one thing the list
above cannot show.

**A WAY OUT HAS TO LAND WHERE ITS LABEL SAYS.** A job page's button reads "All
jobs"; reached from Home or the finder, `projList` was still "projects" and it
dropped you on a screen that did not contain the thing you had just left.

**THE SAMPLE HAD NOTHING FILED**, so Outputs, a project's "What it has
produced" and the report's FILED section all showed their empty state in the
only book anybody is ever shown. It seeds a run that went all the way now —
designed, approved, printed, archived, closed — which is also the honest pair
to the run that is printed and never filed: the two of them together are the
archive lock's whole point.

**PAST ABOUT A MONTH, A COUNT OF DAYS STOPS BEING AN ANSWER.** Outputs read
"filed 120 days ago" for something archived in May. Nobody holds four months
as a number of days, and the date is the fact you would actually use; under a
month, elapsed time still places a thing in this week without arithmetic, so
`agoWords()` keeps both readings and switches where one stops being useful.

**ON A PHONE A COUNT MAY NOT ADD A LINE.** The tab is an icon over a label
there, so Actions' "3 late" landed as a third line and made one tab taller
than the other six — the bar grew a row, which is exactly the chrome this app
measured its way out of. It is a figure on the icon instead (105px of chrome,
down from 122), and the word stays on the wide rail where there is room for
it. Measured: seven tabs, all 48px, one row.

**And the two sentences that ran together.** `stepMeta` printed "With N.
Haddad and L. Mroueh six days." — the names ran straight into the count with
nothing between them, which reads as a sentence that lost a word.

### And then I used it

Walking the screens is not using the app. `flows.js` makes a project on the
screen the tab now lands on, starts a run, drives it to its end, closes it,
and checks each thing turns up where the app said it would — and it found the
one defect the reorganization made unmissable:

**IN YOUR HANDS IS NOT WAITING.** Everything on Actions that was not late went
under one heading, "Waiting, and that is fine" — including every step nobody
else is holding up. Start a run and its first step landed there: the screen
that exists to answer *what happens next* filed the one thing you could get on
with under a sentence telling you it was fine to do nothing. Two sections now,
and the yours-to-do one comes first, beside the other things that are yours
(the unfiled runs above it, the typed lines below). `calmRow` had been writing
"In your hands. Waiting on nobody but you" the whole time — under a heading
that contradicted it.

**AND THAT ROW NEVER SAID WHICH WORK IT WAS.** Its whole sub-line was that
sentence, so a screen listing steps from five runs printed "Digitise the
layers" with nothing naming the board — the one row you could act on said the
least about itself. Both calm branches name the work now, and the heading
carries the meaning the sentence used to.

**A pre-escaped sub-line is a trap for the next branch.** `calmRow` builds
`says` in three branches and the caller does not escape it, so the branch that
gained a bench label gained an unescaped one — a craft and a claimant, both
typed by the reader. Escape at the branch or escape at the caller, but the two
halves of one function may not disagree about which.

**A REPORT MAY NOT POINT AT LINES IT DID NOT PRINT.** "Nothing. Either nothing
finished, or it finished and was never archived — *the unfiled lines above say
which*" was printed whenever a period had no filings, including the many
reports whose work carries no undone filing step at all. It says the second
half only when THE WORK really printed one.

Two traps for the next person driving the app rather than reading it:

- **`innerText` cannot see inside a closed `<details>`.** What is waiting and
  not late sits behind a fold, so a test reading the screen reported a step
  missing when it was merely folded. Open what a reader would open.
- **A stop word breaks an alias.** The finder now needs every term of a query
  to hit, so the alias has to carry the old name IN FULL: "week" was there and
  somebody typing the section's actual former name, "the week", matched
  nothing. Half an old name is not the old name.

## The round-3 brief is a different app, and folding it in was the mistake

Its owner said it plainly: *"you are building the features in stuff inside the
structure of the old one and telling me that everything is matching while it
does not."* That is exactly what happened, and the mechanism is worth writing
down because this file encouraged it.

Every round, the new document was read and the question asked was **"what does
this app already have that answers this?"** — and the answer was written up as
a virtue: *composing what was already there rather than adding a noun*. Once,
against one feature, that is discipline and it is why the Library is the
registry and a drill is a cadence. Seven rounds running, against documents
describing a **different app**, it means the app never becomes the thing that
was described. It becomes the old app wearing the new words.

Then the conformance was graded against the app's own structure and reported
as a match. That second half is the worse one.

**The evidence is countable.** `design-brief-round-3.md` specifies, screen by
screen, the state vocabulary (§5) and the empty-state copy (§6): **133 exact
strings.** The app was missing **95** of them. `spec3.js` reads them out of the
document rather than out of anybody's memory of it and prints the number; it
FAILS until that number is nought, and it is deliberately left out of the
named sweep so it cannot be mistaken for a regression.

**And the structure that is still the old app's**, none of which either
document asks for:

- `state.claimants`, `state.modes`, `state.benches`, `state.spans` — claimant,
  craft and bench. The brief has `Job` and a `TimeEntry {projectId,
  claimantId, startedAt, endedAt}`. Neither document contains the word bench.
- **The switch bar**, pinned to the bottom of every screen. It is in none of
  the poster's twelve panels. It is rev-1's switch-led spine.
- `state.boards` — one record that is both a procedure and a run. The brief
  separates `Workflow`, `WorkflowNode`, `WorkflowEdge`, `WorkflowRun`,
  `WorkflowRunNode`, which is *why* a failed run can keep its failure point
  without touching the reusable workflow.
- `state.tasks` — the brief's `Action` is one record with six types (`task`,
  `waiting`, `unfiled`, `in_hand`, `upkeep`, `workflow_manual_step`).
- **No `Output` records at all** — the brief's are `Filed`, `Reports` (with
  Draft/Submitted) and `TimeEntries`.
- No `PersonRelationship`, no typed asset records, no `Schedule record`.

The brief's §32 says what to do instead, in one line: **"Build canonical
records, relationships, and shared derived selectors first; then make each
screen a view over that same underlying workspace."** This app did the
opposite — kept the store and re-dressed the screens — and that is the whole
of the fault.

**What shipped here is the half that survives a rebuild**: the brief's own
words, and one selector per question rather than per screen. What does not
survive is the structure, and that is a rebuild rather than a patch, waiting
on one decision from its owner (whether the current book has to migrate).

**AND THE BRIEF'S SITES ARE PLACES, WHICH WAS A REAL MISREADING.** Round 3
asks that section *"what archaeological or geographic places are part of my
work?"*, with states **Located** and **Location unknown** — and this app had
filed Drive and a mail search there, which is the brief's **Connections**
("web services"). Two different things had the same word. What decides a place
needs no vocabulary and invents nothing: **a place is a coordinate with
nothing to open.** That is stated, generic, breaks no write-in rule, and it is
why the brief's two states are Located and Location unknown — an entry filed
there with no coordinate reads as the second rather than being guessed at. The
second half of the test matters: an orthophoto has an extent *and* a path, and
it is a file with a footprint, not a place.

**`assetState(a)` is one selector for "how does this asset stand"**, in the
brief's words and per its own section — Devices get Available · In use ·
Maintenance · Missing · Unknown, Apps Installed · Web · Launcher unavailable ·
Unknown, Sites Located · Location unknown, Files Available · Path unavailable ·
Unknown, the Library Reusable · Needs review, Connections Connected ·
Available · Unavailable · No opener recorded. One function, so the row, the
entry's own facts table, the Connections grid and the finder cannot disagree —
which is the brief's own rule that every screen reads the same derived
selector.

**AND AN UNSTATED STATE READS "Unknown".** This file used to say a thing
nobody has said anything about carries no pill at all. That was the wrong
reading of the reality rules, and the brief's §28 says the opposite in as many
words: *"Unknown information should be represented explicitly as unknown."* A
named absence is not a guess. `THING_STATES` keys that the brief has no word
for (`busy`, `done`) are no longer offered but still read, mapped onto the
nearest word it does have, so nothing on screen is outside its vocabulary and
nothing stored is lost.

**`emptyLines(pair)` is the shape of forty of those strings** — a finding,
then the one thing to do about it — so the two lines are always set the same
way round and the second is always the quieter one.

## What READING every screen found

Eleven faults from driving the interface; these came from **reading** it —
every screen's text, on an empty book and on the sample, printed out and gone
through line by line. Not one was visible to an assertion, because an
assertion tests behaviour and these are sentences. They are written as rules
because each is a class.

- **A SCREEN MAY NEVER NAME A PLACE THAT DOES NOT EXIST.** "Kit" was renamed
  the workbench, split into four pages and taken off the tab bar, and five
  sentences went on sending the reader there — the empty week's one line of
  advice ("add one in Kit"), the job page's no-bench line, and the refusal
  that fires from the switch bar on **every** screen. The finder was the worst
  of them: it still listed the section as "Kit", and the finder is exactly
  where somebody looks up a screen whose name they have forgotten. The old
  word stays in the finder's `key` so typing "kit" still finds it; what it
  *says* is the current name. Grep a renamed screen's old name across the file
  before calling a rename done.
- **A REFUSAL HAS TO CARRY THE WAY OUT.** Pressing Start on an empty book
  gave "Add a bench in Kit first", and following that gave "Add a mode and a
  claimant first" — two dead toasts naming two places, one of which was gone,
  from a bar pinned to every screen. `needWords()` is the shape: a dialog
  saying what the missing thing **is**, with its confirm button landing on the
  page that makes one. A toast cannot carry a route, so a refusal that needs
  to point somewhere may not be a toast.
- **ONE WORD FOR ONE THING.** "Mode" meant the craft you work in *and* Field
  mode, the posture you switch on at a site — and the owner had already said
  of that screen, *"the vocab is kinda weird to get"*. It is a **craft** now
  in every sentence a reader sees; the record still stores `modes`, because
  renaming a state key migrates nothing and risks everything. CLAUDE.md's own
  prose had been calling it a craft all along, which is the tell. The test is
  not that the word is gone but that **every** use of it is Field mode.
- **A word the code uses is not a word the screen may use.** The Calendar said
  "everything here came off a board or a cadence"; every surface a reader sees
  calls that upkeep. Same rule that took "out of promises" out of Coffer's
  afford card.
- **A FIGURE MAY NOT READ NOUGHT ABOVE A CARD CONTRADICTING IT.** Home's
  deadline tile filtered on `p.endsOn >= today()`, so it read "0 deadlines ·
  none inside a fortnight" directly above "Balamand print work 2025 — past
  its date". A date you have **missed** is the one most worth counting. It
  counts a gone deadline, says "One already gone", and goes amber; a project
  whose runs are all closed with nothing left to file is out, because that is
  a finished job rather than a missed one.
- **Do not offer the reader two readings of their own book.** Waiting said
  "Nothing is waiting on you. Either everything is done, or nothing has been
  started." The app knows which — it is the one question that screen exists
  to answer.
- **A screen that explains itself has to be re-read when the thing it
  explains changes.** Settings described the palette from two designs ago,
  down to a colour the app no longer uses: it told the reader that late is
  apricot on ink and vanishes on paper, and late has been rose in both themes
  since the navy system. Confidently wrong is worse than silent.
- **Say it once.** The Repo printed `page.blurb` under the tools and again
  inside "Nothing under Devices yet" forty words below — the same sentence
  twice on a screen with nothing else on it. And the launcher's reason,
  which CLAUDE.md already says is *stated once above the list*, was also in
  full on every row: the same twenty words four times on the Files page,
  under a card already saying them. `openHandle()` carries `brief` for a row
  and `how` for the card and the tooltip.
- An empty list's one job is to say **what to do**, so it names the button
  that does it rather than repeating what the section is.

**AND THEN READ THE DIALOGS, WHICH ARE WHERE ANYBODY IS ASKED TO DECIDE
ANYTHING.** The screens had been read; the dialogs had not. Four more:

- **A field that is never read is a control that does nothing.** "New step" —
  the app's most-used dialog — carried a sixth box with **no label at all**,
  always empty, which `onConfirm` never read. It existed to hold one
  explanatory sentence, and it silently threw away whatever was typed into
  it. The sentence belongs to the picker it is about, so it is a `hint` on
  Act. Same rule this file already states about a file path: a control that
  quietly does nothing is worse than no control.
- **A date has to exist, everywhere.** Three validators were still the shape
  regex rather than `dayOk()` — a step's due date, the report's range, and
  closing an open stretch — so `2026-13-45` would store, parse to
  `Invalid Date` and appear on no screen. The rule was already written down;
  what it needed was `grep '^.d{4}-.d{2}-.d{2}\$'`, which should now match
  `dayOk` itself and nothing else.
- **A dialog of twelve boxes is a dialog people close.** The registry's asked
  for a name, a kind, a write-in, which list, a path, a link, where it is
  kept, how it stands, when it was last used, when it was made, what it is
  part of, what it is about and a note — four of which are what anybody
  types when adding something. `more: true` on a field puts it behind a
  native `<details>` in the **shared runtime**, so all four apps have it and
  the md5 test proves it; the summary says how many, because a fold that does
  not is a fold nobody opens. `collect()` reads by id, so a folded field is
  still read and still saved — asserted, because a fold that silently dropped
  what you typed into it would be worse than the long form.
- **`offsetParent !== null` is not a visibility test once fields can fold.**
  Chrome keeps the children of a closed `<details>` in the layout tree
  (`content-visibility: hidden`), so they have an offsetParent and
  `trapOverlay`'s filter let Tab walk into seven fields nobody could see —
  the same fault as Tab walking out through the scrim, one level in. The trap
  excludes anything inside a closed fold, and the test presses Tab all the
  way round and asserts where the focus actually went rather than reading a
  property that lies.

**AND THEN READ THE DIALOGS AGAIN, BECAUSE FOUR HAD SHIPPED SINCE THE LAST
READ.** `dialogs2.js` walked the boards, the workbench and Settings, and
nothing in it could reach the four newest — the fact row's pen, "Note
something else", "Add related thing…" and the keyboard table — because **two
of them are not on a screen at all**: they open off a node that has been
picked or a row that has been written, and a walk of `data-act` buttons on
tabs never arrives. Same gap `lightlook.js` had, one layer in: *the surface
that proves a rule is the surface nobody thought to visit.* Two faults, both
in v69's own dialog:

- **A screen may not say something the reader can see is untrue.** "Add
  related thing…" is offered on **any** node the menu opens on, so under a
  title reading *Add something to Reference photo* the message went on to say
  "so it belongs with **that step** without coming before it" — a photograph
  is not a step and never will be. The reasoning holds for any host, so the
  noun goes rather than being made conditional.
- **Name the record, not its type.** `thingDialog` titled itself "Edit thing"
  and `nodeDialog` "Edit step", where every other edit dialog in the app says
  which one you are looking at — "Edit Lenovo Legion", "Edit “Serial”", "Edit
  N. Haddad". A generic noun in a title reads as a placeholder somebody forgot
  to fill in, and on a forty-node board it is the one thing you would want the
  dialog to confirm before you start typing over a name.

**A `| head -N` ON A TEST IS A KILLED TEST THAT REPORTS EXIT 0.** The first
run of that walk was read through `| sed … | head -90`: `head` closed the pipe
at ninety lines, `node` died of EPIPE part-way through printing a dialog, and
the shell reported the pipeline's exit status — `head`'s, which is 0. Eight
dialogs and the script's own `ERRORS:` line were simply absent, and absent
looks exactly like nothing to report. This file already says a sweep must read
the exit code and that silence is not success; the same rule applies to the
pipe you read a script through. **Write to a file and grep the file.**

**AND THEN COUNT TO ONE.** A count of one is where a bare plural shows, and a
source scan for it drowns in state keys, ids and comments — so `ones.js`
builds a book where **every countable thing is exactly one**, walks every
screen, every strip page, every board and every confirmation dialog, and reads
the rendered text. It found ten sites: "a procedure · 1 steps", "0 of 1 steps
done", "waiting 1 days", "across 1 claimants", "1 procedures · 1 runs · 1
claimants · 1 benches" in Settings, "written across 1 things", and "every 1
days" on a daily backup (`everyWords()` and `everyDaysWords()` are the one
place that interval is put into words now, because it is printed in five).

Reading its output found three more that no regex would catch, all in the one
sentence somebody reads before pressing Delete:

- **A sentence has to agree with itself.** "The 1 stretch logged against it
  stay exactly as they are" pluralised the count and left both verbs alone;
  "The 1 board that name them are untouched" did it twice.
- **A small count in prose is a WORD**, which is this app's habit everywhere
  else (`numWord`) — "Its 2 boards", "2 boards are filed under it". A figure
  in a tile or a heading stays a figure; prose spells it out.
- **A sentence about nothing should not be printed.** "Its 0 benches and 0
  boards stay exactly as they are" — a job with nothing filed under it now
  reads "Nothing is filed under it."

Two cheap rules stand in for the grammar, since there is no linter here: a
digit followed by a countable noun inside a sentence, and a singular noun
followed by a plural verb. And the dialog walk had the `if (!el) return` fault
in its first version — it hunted for each button by walking tabs and printed
"(no route on this book)" for eight of the nine, reporting nothing wrong. Each
is reached by its real route now and a missing route fails. **A route that has
to be searched for is not a route.**

One thing that reading it changed in the app rather than in its words:
**closing a run says what it took with it.** With nothing left to file a run
closes without asking — the archive lock guards filing and only filing, and
this is a routine act with an undo in the toast — but it can be sitting on
somebody else's court, and chasing is the first of the three forgettings. The
toast names it: "Closed One run · 1 step was still open".

`words.js` is the test, and it is the shape to copy for this kind of fault:
it walks every screen and every strip page in both states, collects the text,
and asserts on the *words* — no screen names Kit, no screen says cadence,
every "mode" is Field mode, a refusal opens a dialog whose button lands
somewhere, and the deadline tile cannot read nought above a card saying past
its date.

## The website, and the guide inside the app

Asked for "a landing page for the whole app, kinda like a professional website
since it is a website", a guide inside the app "on how to do and add
everything", and a brief to hand to whoever makes the site lively. All three
shipped; what is worth keeping is where each one lives and why.

**THE SITE IS THE STUB, NOT THE APP'S OWN INDEX.** Every app here has a root
redirect stub (`coffer.html`, `mashghal.html`, …). `mashghal2.html` was one,
and is now the site — so the URL is `/Apps/mashghal2.html` and
`/Apps/mashghal2/` is still the app, byte for byte. The alternative was making
the app's own `index.html` the landing page and moving the app to `app.html`,
and it is wrong three times over: the manifest's `start_url` is `./`, so every
install would open a marketing page; **renaming a served path is never worth a
tidier tree**, which this file already records about `garden/`; and every scan
and every driving script names `mashghal2/index.html`. The one cost is stated
rather than discovered: a bookmark to `mashghal2.html` now lands on the site,
whose first control is the app.

- **The screenshots are generated, never hand-edited.** `mashghal2/press/`
  holds eight JPEGs a capture script takes off the running app at a fixed
  viewport, and `press/README.md` names each one. Two rules learned while
  taking them: **wait the toast out** — the first pass caught "Example loaded"
  floating over Home, and a message about something that happened has no
  business in a product shot — and **look at them**, because the first pass
  also showed four tiles wrapping three-and-one inside a Home card, and a tick
  glyph on a late action that read as "done". Both were fixed in the app, which
  is the point: *a product shot is a reading of the app*.
- **The site fetches nothing either.** Same first rule as everything here. The
  display face is the app's own embedded base64 woff2, reused; 222 KB on first
  load, two requests, and the budget is written into the test.
- **`.rise` had the no-script fault, and the brief names it because the site
  shipped with it.** Hidden in CSS and revealed by script means sixteen
  sections are invisible when the script is blocked. The script's first act is
  `documentElement.classList.add("js")`, and only `.js .rise` starts hidden —
  **an enhancement layers on a page that is already complete**, never the other
  way round.
- **`.btn.go:hover` LIGHTENED A BLUE THAT CARRIES WHITE TEXT**: 2.86:1 on the
  page's one primary button, and only the hovered pass of the contrast walk
  showed it. Third time this exact fault has been recorded here
  (`.btn.primary:hover`, `.btn.loud:hover`, now this) and the fix is the same
  each time: *a hover is a token defined per theme*, never a colour written
  beside one.
- **A MINIMUM TRACK WIDTH IS A MINIMUM.** `minmax(22rem, 1fr)` is 352px, so one
  column of it was wider than a 320px phone and the page scrolled sideways —
  the identical fault the app's own `.hgrid` had at 20rem the same day.
  `minmax(min(22rem, 100%), 1fr)` lets the track give way.
- **A diagram and a block of code may scroll inside their own box**, and a
  no-horizontal-scroll test has to know that or it reports the page broken
  because a `<span>` inside a `<pre>` is past the edge. The test walks up for a
  scrollable ancestor; the document's own `scrollWidth` is what decides.
- **A line has to end at an EDGE.** The evidence chain's arrow into the
  portfolio card ended at a point *inside* the rectangle, so its head was drawn
  under the fill and read as no head at all — and the fixed version then ended
  in mid-air beside the box. Route into the nearest edge, and route into the
  TOP edge where entering the side would cross the arrow leaving it.

**THE GUIDE IS A PAGE, NOT A TOUR**, reached from the gear, from the rail, from
Settings, from the finder under every word somebody would type (guide, help,
how to, getting started, manual), and from the first screen of an empty book —
which is the one moment it is most needed. Two rules hold it:

- **It names the real control.** Every instruction quotes the words actually
  printed on the button, and `guide.js` reads its own bold labels back against
  every label the app renders and fails on one that does not exist. Two traps
  in writing that test: the scan has to look only where the guide *quotes* a
  control (`.gwhat .sub b`, `.gnote b`, `.step p b`) — the bold at the head of
  a row is the row's own title and names nothing — and it has to run on a
  **full** book, because an empty one hides "Export as CSV" and half the other
  controls, so the guide reads as naming things that are not there when in fact
  the harness could not see them.
- **The route is beside the instruction, not inside it.** `Career → Skills →
  New skill` sits in mono to the left of what the record is for. A guide
  written as prose is a guide you have to parse; a guide written as a table of
  routes is one you can scan for the row you need.

**AND A QUESTION IT CANNOT SHAPE MAY STILL BE A SEARCH.** Typing "how to" into
the finder printed only the table of the eleven questions it can be asked,
because "how" is a question word and no shape matched — with the hits for those
same words sitting unmentioned underneath. The unread branch appends the search
now. Same class as the earlier fault in the other direction, where a plain
search for "Chase the bathymetry licence renewal" was read as a question about
a person called "bathymetry licence renewal": **a box that both searches and
answers has to fall through in both directions.**

**The brief for the next round is `mashghal2/docs/design-brief-website.md`**,
and it is written to be handed over whole: the ten hard constraints first, then
what "come alive" must and must not mean here, then the tasks in order, then
how to verify. Its own argument is the one worth keeping — this app prints "not
said, and not inferred" where another would print a number, so **a site in
front of it that oversells, auto-plays and invents social proof would
contradict the product on its own front page**.

`site.js` is the test: the page with scripting **off** (every section present
and nothing invisible), both themes at rest and under the pointer, Tab through
every control checking the ring is the page's own and not Chromium's, the
anchors and every link resolving, reduced motion showing the finished state
with no transition running, five widths down to 320px, and the transferred
bytes against a stated budget. 542 checks.

## Feeding mashghal2 from a file

Asked for what Coffer's plan import does — *"a feature where I can add a JSON
file to feed the application certain data, because I want to give you my CV and
have you put it in the app"* — and Coffer's discipline is the whole of the
answer: **nothing changes until you have seen every line and pressed the
button.** `impRead(text)` reads and writes nothing; `impReport(read)` prints
what it WOULD do; `impApply(read)` is the only half that writes, and it writes
nothing the report did not print. Four rules, each one a fault already recorded
somewhere in this file:

- **IT IS ADDITIVE, AND THAT IS NOT A RESTORE.** `adoptState` replaces a book;
  this adds to one. Handed a whole backup “ one carrying `version`,
  `settings` and `forgotten` ” it refuses **and points at Restore**, because
  adding a backup to the book that already holds it would duplicate every
  record without a word. *A refusal has to carry the way out.*
- **A REFERENCE IS A NAME OR A KEY, NEVER AN ID.** Nobody writing a file by
  hand can know the app's own ids, so `"role": "GIS analyst"` resolves —
  against this file **and** against what is already in the book, which is what
  makes a second file add to the first rather than fork it. `key` is an
  optional short handle, and **both spellings always resolve**: registering
  only one of them made a row carrying a key unreachable by the name printed on
  it, so one line in a file resolved and its neighbour, naming the same record
  the other way, did not.
- **THE SAME NAME IS THE SAME RECORD.** A row whose name is already under that
  kind is reused rather than added again, and the report marks it *Already
  here*. Two bugs lived here. The seeded “already in the book” entry was
  **overwritten** by the file's own row, so every row read as new and
  “importing twice does not give you two of everything” was quietly
  untrue. And `impApply` copied fields off the row rather than taking the name
  the reader had resolved, so a **reference** — whose name IS its title and
  which carries no `name` field at all — landed nameless and printed as a
  blank row on every screen.
- **IT NAMES WHAT IT CANNOT PLACE.** An unknown list, an unknown field, a date
  that is not a date, a word outside a vocabulary, an unresolvable line end:
  each is reported against the row it came from. Guessing at any of them is the
  plausible wrong answer this whole app refuses.

**THE FORMAT IS BUILT FROM THE VALIDATOR.** `impHelpHtml()` walks `IMP_KINDS`
— the same table `impRead` validates against — so the reference table and
the rules cannot drift. A table typed out beside the code would be wrong the
first time a field was added, and the fault would be *silent*: the reader
writes what the table says and is told it is not a field. `import-format.md` is
the same table for whoever is writing the file rather than pressing the button.

Three things reading the rendered dialog found, none of them visible to an
assertion:

- **A KEY IS SOMETHING YOU TYPE, NOT A NAME OF ANYTHING.** A preview row read
  “anfeh uses QGIS” and a role's sub-line read “job: aub” — the
  internal handle, printed at the reader as though the employer were called
  aub. Both resolve to what the records are actually called now. Fixing it for
  the lines and not for the rows was half a fix.
- **ONE ENDING FOR ONE OUTCOME.** “Left out.” closed five messages where
  the ROW goes and two where a **field** goes off a row that still comes in —
  the same three words meaning opposite things in consecutive lines of one
  list. A row now says *Row left out.* and a field says *that one field is
  dropped. The row itself still comes in.*
- **A heading may not disagree with what is under it.** “Left out, and why
  — 17” counted two rows that were not left out at all. It is *What it
  could not use, and why*.

`m5import.js` is the driving test (116 assertions: the format table names every
list, broken JSON says why, a backup is turned away, the template parses and
reports no problems of its own, ten kinds of trouble are each named, the good
file lands with every reference resolved to an id, the undo takes it all back
out, a second file adds to the first, a third adds nothing, and Escape and the
focus trap work). `m5implook.js` is the other half, and it exists for the
reason `lightlook.js` had to grow one: **this dialog is not on a screen.** It
opens off the gear and then a button, so the walk that measures every screen
never arrives — *the surface that proves a rule is the surface nobody thought
to visit.* 72 checks: every run of text in both themes, at rest and under the
pointer, 390px with nothing past the edge, the last problem row reachable
inside the scrolled box, and the app's own focus ring on every control.

## Where your stuff is, and the other shape

Four things asked for at once: *"can we make things in a different form than
a list? also can you like make it more interactive? adding the ability to
store path and places where documents are linked to these, also don't forget
to make a directory tab that can be used to hook files and links and stuff in
it yk sort like a universal Telephone directory for where i have my stuff."*

### The path is a field, and the Directory is a question

**WHERE THE DOCUMENTS ARE IS A FIELD, NOT A NOUN.** `asset`, `output` and the
Library already carried `path` and `url`; every other record now does too,
through `docFields(rec, what)` written **once** in the model, because eleven
dialogs ask for the same pair and a copy per dialog would drift on the first
rewording. A project's folder is a fact about that project, the same as its
dates. `openHandle()` stays the one place that decides what “open”
means, so nothing grew a button that cannot do what it says.

**AND THE DIRECTORY IS NOT A NEW LIST.** That is the whole design, and it is
the rule this rebuild exists to enforce: a screen is a QUESTION over the one
record. So it is the **stated** half — `state.assets`, a bookmark, a drive,
a folder that belongs to no one project — plus the **derived** half, every
other record carrying a path or a link. A project's folder therefore cannot
be in the Directory and missing from the project, and renaming the project
renames its entry. A second “locations” list pointing back at records
would be two things to keep in step, which is the fault that cost this app a
whole rewrite.

**THE CHIPS ARE `openHandle()`'S OWN LADDER**, not a second reading of it:
**Links** (a url, which really opens) · **Files and folders** (a path, which
is copy-only) · **Nothing to open** (a device, a shelf). So they partition
the list, All is their sum, and the chip a row sits under can never disagree
with the button on it. A record carrying both shows under Links, because the
url is the one that opens — and the row prints the path anyway. There is a
test that adds the chips up against a walk of the record.

**On the Directory the row IS the open control**, and that is the only screen
in the app where a row does not navigate: it is a launcher, and row → page →
“Open the link” is two taps to do the one thing. The chevron beside it
still reaches the record, and a row with nothing to open is already opened by
itself, so it carries no chevron — the same action twice with one dressed as
a choice.

### A list and a grid are two questions, so the shape is a SETTING

A list answers *what is next*; a grid of cards answers *what have I got*.
Twenty skills in five groups read as a column of identical rows, which is what
its owner said. `shapedOf(kind, list, opts)` is the one place that decides,
so no screen can draw cards while the switch says rows, and `cardOf` reads
`recName`, `standOf` and `saysOf` exactly as `rowOf` does — a card and a row
cannot disagree about a record.

**It is `settings.shape`, not view state**, against this app's usual rule that
a tab lands on its list: it is how you like to READ, not where you have
navigated, so surviving a reload is the entire point. Same argument Field mode
won in the app this replaces. **What you typed into a sift box is the
opposite** and resets on a tab press, or the Directory opens on four of forty
entries with the reason two screens up.

**A card is a `<div>` with a full-bleed `<button>` inside it.** A card that can
be opened AND carries its own controls cannot be one button — the same trick
`.rowpair` uses one level down. State stays in its one channel: a pill with a
word and the card's left edge, never a coloured card.

**Past about eight entries a sift box appears** beside the switch. It reads the
name and everything already on the row (the group, the organisation, the note,
the path), so typing part of a folder finds the project it belongs to, and it
says **how many of how many** matched — a list silently shortened reads as
records having gone missing.

### Five faults, and each is a rule

- **THIS APP PASSES ONE ARGUMENT AND THE SECOND IS THE ELEMENT.** The runtime
  dispatches `APP.actions[name](el.getAttribute("data-id"), el)`, so a
  `data-v` attribute — which Coffer uses and this app does not — is read
  by nothing: the handler got the BUTTON where it expected a word.
  `settings.shape` never left “rows”, and `dirFacet` was set to an
  element, which then took the whole Directory down on
  `DIR_FACETS.filter(...)[0].word`. One spelling, the app's own. **And a facet
  this app has no word for may not take the page down**: it is cleared rather
  than read straight into `.word`.
- **SAY IT ONCE, and `cardFacts` was saying everything twice.** A skill read
  *“One project, one training, one workflow, one library entry and two
  outputs”* and then *“seven links”*; a training read *“· February
  2025”* then *“February 2025”*; a Directory card printed where it
  points in its sub-line and again in its strip. `saysOf` is thorough, so the
  only thing a card can add that a row cannot is **where the files are** —
  which is the one fact this round exists to carry. The strip is that and
  nothing else. The row had the same fault one level up: it printed the kind
  word that the section heading above it already carried.
- **A CLIP IN CHARACTERS IS NOT A CLIP IN PIXELS.** `clip(path, 42)` is the
  right guard against a 300-character path and no guard at all against a
  42-character one in a 240px card — it overflowed and was cut
  mid-character with nothing saying so. The cell ellipsises; the clip stays
  for the other case.
- **A SIFT BOX IS NOT A HERO.** At `flex: 1 1 11rem` it grew to 1200px on a
  laptop: a search field wider than the list it sifts. `flex: 0 1 22rem`.
- **AN EMPTY CHIP SAYS SO BEFORE THE SIFT BOX IS DRAWN.** Putting the sift
  guard first meant a chip holding nothing returned with the box's own
  message, which is empty when nothing is typed — so the screen rendered a
  heading and then nothing at all. The durable half of that fix is in
  `siftSays` itself rather than in three call sites: a caller that returns on
  “nothing shown” is always handed something to print.

Two more the reading found, both pre-existing and neither visible to an
assertion: **“1 of three actions on it are done”** — a digit beside a
spelled-out count, and a plural verb after a subject of one; the subject is
what is DONE, so one done takes “is”. And **a scroll container that is
Tab-focusable needs the app's own ring**, which is how `.impprev` and then
every new control here went into the one focus-ring rule the day they were
written.

**A SECOND CALLER MOVED AN ANSWER.** The finder's *where is a document* shape
read `state.lib` alone, which was the whole of “where is my stuff” while
only a library place could carry a path. It reads `directory()` now — the
same walk that screen uses — so the answer and the screen cannot disagree.
And the Directory is a tab with **no pages inside it**, so `findSects()`,
which walks `PAGES`, could not see it: a screen findable only by somebody who
already knows it is there is not a route.

**The example carries paths and links now**, on a project, a role, a training,
a workflow and a library entry, with one record holding **both** — because
the Directory is derived, so without them the one book anybody is ever shown
opened it on four pieces of equipment. *A feature with no representation in
the sample is a feature nobody can be shown.*

**`m5dir.js`** (98: the tab, the chips against a walk of the record, a path is
never an href, the row opens what it says, the chevron, the sift box keeping
its caret, the switch reaching the record and surviving a reload, the two
document fields on ten dialogs, and a path written on a project turning up in
the Directory) and **`m5dirlook.js`** (418: every run of text on the new
surfaces in both shapes and both themes, at rest and under the pointer, at
1400/390/320px, nothing past the edge, six tabs on one row, the app's own
focus ring). And **`m5phone.js` now NAMES the six tabs** rather than counting
five — *name a tab, never count one*, one level up: the count broke the day
the Directory landed and said only that the number had moved.

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

**And the inverse: a CSS rule nothing writes.** The collision scan looks for
one name declared twice; this looks for a name declared and never emitted,
which is how `span: true` came to do nothing in this app for its whole life.
The **shared runtime** emits `class="field wide"` for a spanning field and
this stylesheet defined `.field.span` — a name nothing in the app writes —
so every field declared to run the full width (a name, a date, a note, a text
area) sat in a half column, and on a phone the form was two 175px columns
each under a label and over four lines of hint. Copying the runtime verbatim
and then naming its hook something else is the same class of fault as the
`.tile` collision, inverted. The three older apps have always had
`.field.wide`; comparing their stylesheets against this one for the runtime's
own class names is worth doing after any change to the field spec.

```
python3 -c 'import re,sys
s=open("mashghal/index.html").read()
css=s[s.index("<style>"):s.index("</style>")];body=s[s.index("</style>"):]
sel=set()
for m in re.finditer(r"^\s*([.#][A-Za-z][\w-]*(?:[.:>#\[\]\w=\"\x27-]+)*)\s*(?:,|\{)",css,re.M):
  for part in re.findall(r"\.([A-Za-z][\w-]*)",m.group(1)): sel.add(part)
print([c for c in sorted(sel) if not re.search(r"[\s\"\x27.]"+re.escape(c)+r"[\s\"\x27.]",body)] or "all matched")'
```

It has the **same interpolation blind spot** as the `data-act` scan, so read
its output rather than acting on it: `t-late`, `t-dated` and `t-due` are built
as `'cal-m t-' + m.tone`, and `ic-send`, `ic-ask`, `ic-file` as
`'ic-' + n.act`. And a family of tones is not a family of dead rules — the
`p-*` pills are a palette a state picks from, so an unmatched one is a colour
nobody has needed yet. What it caught for real was `.field.wide` and one
`.sect.tiny` that had been waiting since it was written for "a few places
that still want the old legend treatment", and no place ever did.

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

**A GREEN BAR ON A LATE ROW IS THE APP CONTRADICTING ITSELF.** Home drew a
project's progress at 67% in sage inside a card whose left edge was rose and
whose own words read "past its date" — one card saying two opposite things,
and green means healthy state and nothing else. Progress is not a state, so
`barTone()` gives the bar its row's: rose when late, sage in hand, neutral
when nothing is running or the work is set down. One function, because the bar
is drawn on Home and again on a project's own Overview, and the two may not
disagree — the same reason `stateTone()` and `NODE_INK` are one ladder in two
renderings.

**A state with no channel is a state the screen does not say.** Upkeep past
its interval sat on Home as an ordinary card, indistinguishable from prose,
directly under a rose one. It is not late — nobody is waiting and nothing has
a date — it is **drift**, which is what amber is for, so `.panel.drift` is the
amber-edged sibling of `.panel.late`.

**HALF THE BUTTONS IN THIS APP ARE LINKS, so `.btn` needs
`text-decoration: none`.** `openHandle()` gives a `url` an `<a>` and a path a
`<button>`, so Quick run drew "ArcGIS Pro" plain beside "Drive — area 1" and
"Mail: harbour brochure" underlined: three controls in one row doing the same
job, wearing two different clothes, for a reason that is purely an
implementation detail.

**One question with three parts has to look like three of the same thing.**
Home's Today row went three-into-two columns on a phone, leaving the third as
a wide banner under two squares — a shape that says "two things and one other
thing". Under 560px all three are rows of the same shape, the figure beside
the words rather than over them (`.htw` wraps them, so it is one flex rule and
no second markup), which came out **shorter** than the two-column version as
well as consistent.

**A LAUNCHER BUTTON IS ONE LINE.** Not running off the side is the floor, and
a 200-character name cleared it while still turning a Quick run button into a
six-line paragraph filling the row — which passes every overflow check and is
not a launcher. `.btn.clip` clips to one line with the full name in the
`title`, and `awkward.js` asserts no button on any screen grows past 64px
tall. (Not `.chip`: that is a pill, and mixing two shapes to borrow one
property is how a class name ends up meaning two things.)

**On a phone, a row wraps its buttons onto their own line** (under 560px). A
pill, a sentence and two buttons on one line left the sentence about ten
characters wide, and an upkeep row naming a place and the thing it protects
wrapped to nine.

**ONE FOCUS RING FOR EVERY TAPPABLE THING**, applied once the way `--t` is
rather than per component. Only `.btn` and `.tab` carried the app's ring
(brass, 1px, 2px offset); every whole-row control — a board card, a calendar
cell, a Home tile, a panel row, the Repo's open control — fell back to
Chromium's default `outline: auto`, which on a deep navy surface is a pale
double ring belonging to no design in this app. `keys.js` drives the whole app
from the keyboard and asserts three things per screen: every control is a real
control (that rule was already written down, because the Jobs tab could not be
opened by keyboard at all), the focus is visible, and the ring is the app's
rather than the browser's. Everything else about the keyboard story turned out
to be sound already, which is worth knowing.

Two measuring traps it walked into first. **A scripted `.focus()` does not
match `:focus-visible`** when the last interaction was a mouse click, so
reading the style after one reports every control as unringed — it "found" the
tab bar and the finder, which both have a ring. Tab is the interaction the
rule is about, so Tab is what the test presses. And **reading a style straight
after an interaction reads the START of the transition**: `.btn` carries
`transition: var(--t)` with no property, which is `all`, so the outline
animates in from nought and every button in the app measured at `0px`.

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

**`--receded` IS NOT A TEXT COLOUR, AND THE ONLY WAY TO KNOW WAS TO MEASURE
EVERY RUN OF TEXT IN BOTH THEMES.** The app is dark-first with a real light
palette and nearly every screenshot round had been dark, so the light one was
carrying a **2.29:1** footnote on Home and Waiting — and measuring the dark one
found the same token failing there too at **3.68:1**. That is right for
something deliberately sunk (a finished step, a marker glyph beside a label
that carries the meaning) and wrong for anything a reader has to read. Three
places were reading it: the calendar's "+2 more", which is the only thing on a
cell saying the day holds more than it shows; the footnote under Home and
Waiting; and the label on the dialogs' own fold. All three take `--faint`
(6.97:1 / 5.45:1). Same lesson as the sheet's edges — *dimmer is not the same
as invisible*.

Two more the measurement found, each a rule already in this file being broken
in one place:

- **A late card was recolouring its prose.** `.bcard.late .bsub` was mute rose
  on the late tint — 4:1 against a 4.5 floor, so three of four board cards in
  the sample carried a line nobody could quite read — while the rule *a late
  row is a neutral card with a coloured edge and a pill* sat twenty lines
  above it. Left at `--faint` it is 6.35:1 and the state is said by the edge
  and the word, which is the only channel state is allowed.
- **A hardcoded colour in a rule that also reads a token breaks in one theme.**
  `.btn.primary:hover` was `background: #fbf7ef` beside `color: var(--page)`:
  on ink that is dark text on near-white at 17.5:1, and on paper it is
  `#f4f7fb` on `#fbf7ef` — **1.01:1**, so the label of the SELECTED strip page
  vanished the moment a pointer touched it. `--ink-hover` is defined per theme
  like everything else, lifting off the ink in the dark and deepening on paper
  (10.7:1). The sheet's edge tokens exist for exactly this reason.

That last one was found **by accident** — clicking a strip page leaves the
pointer on it, and the measurement that followed read 1.01:1. A rest state
never shows it, so `lightlook.js` now hovers every button on a screen and
measures it there too. It walks **up** for the background (a transparent card
over a tinted panel is where these hide) and exempts nothing: if a run of text
is on screen, a reader is meant to read it.

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

**The same rule one level up: A MEASURING SCRIPT HAS TO ASSERT THE SCREEN
RENDERED.** `lightlook.js` walks every screen measuring contrast, visited a
project page whose render was **throwing**, and passed — because a screen that
never painted has no low-contrast text on it. "Nothing found" is not "nothing
wrong". Every stop now checks the view holds something, and checks the
`pageerror` list **per stop** rather than once at the end, so the throw is
named against the screen that caused it. It had the `if (x) {}` fault too: it
opened the first job, which has no projects, and skipped the whole project
block in silence — it reads the job that actually has one out of the record
and fails if there is none.

**And the `new Function` parse check cannot see a FREE VARIABLE.** `barTone(st)`
inside `projOver` referenced a name that function never had — `st` is a local
of `renderProj` — which is legal JavaScript, parses clean, and threw at render
time so the project page simply refused to open. There is no lint here and
nothing is installed, so the only guard is that **every driving script listens
for `pageerror` and fails on it**, and that the walk actually reaches every
screen. Both of those were what caught this.

**A sweep's own pattern can cry wolf.** `grep -cE '^FAIL|[0-9]+ failed'`
matches the string `0 failed`, so a clean 26-assertion run reported as a
failure and sent me chasing a bug that was not there. `[1-9][0-9]* failed`.
A sweep nobody trusts is a sweep nobody reads — the same rule as the suite
itself, one level up.

**And a sweep must read the EXIT CODE, not only the output.** Judged by its
printed lines alone, a script that threw on a stale selector — a Playwright
timeout, no `FAIL` line, exit 1 — was reported `OK`, which is the same fault
as `if (!el) return` inside a test one level up: silence is not success. The
sweep tests `[ "$rc" -ne 0 ]` as well, and prints the `Error`/`Timeout` line
so the cause is visible without re-running.

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

**NAME A TAB, NEVER COUNT ONE.** Home taking the first slot moved every tab
along by one, and `#nav .tab:nth-child(2)` — Waiting when Boards was first —
quietly became Boards, which has no `.finding h1`: still valid CSS, pointing
at the wrong screen. `#nav .tab:last-child` was Settings and became the Repo
the day Settings moved to the gear, which broke eleven scripts at once.
`[data-tab="…"]` for a tab, `.gearbtn` for Settings, `[data-act="kit-page"]`
or `[data-act="proj-page"]` for a page inside one — Mashghal's screens are
four strips deep now and none of them is reachable by position.

**And scope a selector the rail also matches.** The rail lists boards, and its
rows come first in the document, so an unscoped `[data-act="board-open"] >>
nth=0` picks a rail row — fine on a laptop, and invisible under 880px where
`.railwork` is hidden, so the click waits thirty seconds for something that
will never be shown. `.view [data-act="board-open"]` in any script that runs
at phone width.

- `innerText` reflects `text-transform`, so a heading uppercased in CSS reads
  `SALARY` and `.includes("Salary")` is false. Write the *verdict* and its
  failure message off the same comparison, too — one helper here tested
  case-insensitively for PASS and case-sensitively for the detail line, and
  printed `"Pending" missing` beside a `PASS` for a year.
- The ledger and plan rows are `div.row` and `.card`, never `<tr>`, so
  `closest("tr")` returns null. Home's Pending rows are `.pend-row`.
- **`selectOption` matches a VALUE, not a position.** Mashghal's borrow picker
  numbers its options by their place in an unordered pool, which equalled the
  DOM index only while the list was flat — the moment it was grouped, a test
  passing the index it had just read selected a different entry and then
  failed on the node it got. Read `o.value` and pass that.
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

## mashghal2 — the rebuild, beside the original

Its owner asked to keep both: *"clone everything, and rebuild in the cloned
version … i mean keep both."* So `mashghal2/` is the round-3 rebuild and
`mashghal/` goes on being the app as it grew. The reason there are two is in
the section above — the brief describes a different app and folding it into
the old structure was the mistake — and `mashghal2/docs/README.md` says what
the directory is, the way every folder in this repo does.

**The clone had to be given its own storage, and that is not cosmetic.**
`localStorage` is scoped to the **site**, not the folder, which is exactly how
Coffer's two paths came to share one ledger and how loading the sample in one
wiped the real book in the other. A clone that kept `mashghal.v1` would repeat
that, silently, and the book it destroyed would be the original's real work.
So every name is its own: `mashghal2.v1`, `mashghal2.theme`,
`mashghal2.sync.token` / `.pass` / `.device`, `mashghal2-pics`,
`mashghal2-backups` — and `twoapps.js` is the test. It seeds the original,
opens the clone **on the same origin**, seeds that too, and fails if either
can see the other's book, if they share an IndexedDB, if the manifest `id` is
not the clone's own directory, or if the service-worker cache name is shared.
A shared theme key would be cosmetic; a shared sync key is one app holding
another's credential, and a shared IndexedDB is one app's photographs turning
up in the other.

**The build string is `wN`, not `vN`**, so a version of the rebuild can never
be mistaken for a version of the original in a commit message or on the
Settings card.

**The briefs are not copied.** They live once in `mashghal/docs/` and
`mashghal2/docs/README.md` points at them — two copies of one document is the
fault this file already records about two copies of one list.

**The launcher and the mailer are not copied either.** They are one handler
and one workflow per machine; the clone's own text still names
`mashghal/companion/`, which is where they are installed from.

### What the rebuild actually is, once it had records

`mashghal2/` is now a working app rather than a clone, and it was built in the
brief's own order because §32 is one sentence and the whole method: *"Build
canonical records, relationships, and shared derived selectors first; then make
each screen a view over that same underlying workspace."*

**Fifteen lists, the brief's own**, and `STATE_LISTS` plus `adoptState`'s
settings block are the only two places any of them is named — Coffer lost
grants out of a restored backup because two sites hand-copied one key list and
only one was updated. `Workflow`, `WorkflowNode`, `WorkflowEdge`,
`WorkflowRun` and `WorkflowRunNode` are **five separate records**, which is
the whole reason the brief separates them: a failed run keeps its failure
point without touching the reusable workflow.

**THE FREEZE IS GONE, AND WHAT REPLACED IT IS NARROWER AND SAYS MORE.** The
original froze a procedure into a run at its start, so editing a template
could never move a run under way. The brief's model has a run pointing at the
workflow's own nodes. Its real job is kept by two rules instead:

- **A node a run has entered is RETIRED, never deleted.** The run points at
  that record and nothing else says what the step was, so deleting it would
  take the history with it. It leaves the canvas and the new runs, and stays
  readable wherever an old run names it — and the confirmation says which of
  the two is about to happen and how many runs reached it.
- **A run stamps `workflowVersion`, and a structural edit bumps the
  workflow's.** So the run can SAY *"the procedure has been edited twice since
  this run started"* — which the freeze could never say, because under a
  freeze it had not been.

**AN ACTION IS ONE SHAPE, SIX TYPES, AND TWO OF THEM ARE STORED.** A task and
a piece of upkeep are the only things somebody types; `waiting`, `in_hand`,
`workflow_manual_step` and `unfiled` are derived from the runs and the person
relationships, so *"is this step done"* stays one fact with one home rather
than a runNode and an Action that can drift. `actionAll()` is where the two
halves meet, and **every derived row says so on its own face** — folding the
born and the typed into one undifferentiated list is what makes a figure stop
meaning what it says. The mapping is 1:1 and each type has exactly one rule:
`do` → in your hands, `send`/`watch` → waiting, `ask` → a manual step,
`file` → unfiled, because archiving is the forgetting that matters and is not
just another manual step.

**THE SEVEN STATES PARTITION THE LIST, so the tiles are its parts.**
`actionState()` puts every open action in exactly one of Late · Unfiled ·
Today · Waiting · Recurring · In your hands · Complete, and nothing about it
is stored — the brief says so in as many words ("Do not store a separate
isLate boolean"). That is what lets the four attention tiles be counted by
state and the groups below them be the same states: *a figure may never
disagree with its own parts*, and there is a test that adds them up.

One consequence worth keeping: the Waiting group's empty state cannot always
be the brief's own sentence. "You are not waiting on anyone." above a late
chase would be the screen contradicting itself, so it is printed only when no
open action is of type `waiting` at all, and otherwise the line points at
Late.

**A PROJECT'S STATUS IS STATED AND ITS ATTENTION IS DERIVED**, which is the
brief's split and the right one: Active · Waiting · Completed · Archived are
typed, "Drifting: only if explicitly marked; never infer it", and what is
worked out is whether the project needs attention. **But a project whose own
end date has gone by may not read "Active" over a header printing that
date** — that is derived from a figure somebody typed, which is the difference
from the inferred drift the brief forbids, and the row names the date it
missed rather than leaving a pill to be decoded.

**THE STEP ORDER IS A DEPTH, NOT A DEPTH-FIRST WALK.** A DFS from the entry
steps put the second of two parallel ways in after everything the first leads
to, so a run listed *"Bring in the control points"* after the orthophoto had
been filed — the reverse of the truth. Shortest distance from any way in is
the right measure and it ignores a back edge for free: the loop's target
already has a smaller depth and the minimum keeps it.

**A CLIP THAT CUTS MID-WORD CAN SAY THE OPPOSITE OF WHAT IT MEANT.** "It loops
while there are notes" cut at sixty characters read *"…while there are no…"*,
which is not a shortened sentence but a wrong one. `clip()` breaks at the last
space inside the limit; the worst it can then do is stop a word early. This is
the same class as a warning with no cause and a figure with no basis — and no
assertion anywhere would have caught it.

**Three more from reading every screen's text**, each one a rule already in
this file, broken in a new place:

- **SAY IT ONCE.** An action row on a project's own page printed that
  project's name in every sub-line, three inches under the heading that *is*
  the project's name; a person's page did the same with theirs. `actionRow(a,
  opts)` is told what the page already names. A job row printed its own name
  twice, because `job-add` creates a claimant of the same name.
- **AN EXTENT IS FOUR NUMBERS** and was printed as two, so a footprint read as
  a point — a smaller claim than the record makes. All four corners, unrounded,
  with the derived span stated as *"about 119 m east–west"*.
- **A WORD THE CODE USES IS NOT A WORD THE SCREEN MAY USE.** Settings counted
  the record straight off the state keys: *"21 wf nodes · four person links ·
  two schedule"*. `LIST_WORDS` is the reader's vocabulary beside the record's.
  And that same card **still said the Library and Schedule were to come, on a
  build that has both** — a screen that explains itself has to be re-read when
  what it explains changes.

**`--receded` IS NOT A TEXT COLOUR, for the fourth time.** The chevron on a
row measured 3.35:1 dark and 2.46:1 light, and it is not decoration: it is the
only thing on the row saying the row opens something. `--faint`.

**The Schedule is a view and not a store**, so `calMarks(ym)` returns the
marks in `ym` and nothing else — *a function whose name is only true for its
first caller is a trap laid for the second* — and the forward-looking
`getUpcomingSchedule()` is not stretched backwards to fill the grid, because
that would make its own name untrue. `pastMarks()` is the other half, since a
date you have MISSED is the one most worth seeing.

**Nine identity hues and eleven things to identify**, so two of them share,
and the shares are where the meanings are closest: a person and a connection
are both something you reach, a place and a file are both a section of the one
registry. Inventing a tenth hue would be a colour with no reason behind it,
and letting a section borrow sage, amber or rose is the one thing the two
channels exist to prevent.

**There is no switch bar**, so `--sbh` is nought rather than a guess. It was
rev-1's spine and it is in none of the round-3 brief and none of the poster's
twelve panels.

**What is not built is not on the bar.** Six tabs — Home · Projects ·
Workflows · Actions · Assets · Schedule — with Settings on the rail's footer,
and the node canvas, Outputs and the command bar still to come. Settings says
so in as many words. A tab leading to a screen that does not exist is the
control-that-does-nothing fault at the size of a whole section.

**The tests are `w2.js` (133 assertions, driving the real app end to end) and
`look2.js` (132, measuring every run of text in both themes at rest and under
the pointer).** Three things they caught about themselves are worth keeping,
because each is a harness fault that reported an app fault:

- **`innerText` reflects `text-transform`**, so a tile label uppercased in CSS
  reads `TO FILE` and a case-sensitive match on "To file" is always false.
- **A phrase is not an invariant.** Testing "a thing is not a step" by looking
  for a person's name in the steps panel fails, because a `send` step
  legitimately says *"with Patricia Antaki"* in its sub-line. Read the rows'
  **names**, not their whole text.
- **A reshaped screen breaks the test that drove it**, and that is not a
  regression: the Library's rows became `.arow` with a Copy button beside the
  name, so `.drow[data-act="asset-open"]` stopped matching. Fix it in the same
  change.

### The canvas, and the one undo it is allowed to have

`mashghal2/` draws a workflow as a sheet at **w3**. It is ArcGIS
ModelBuilder on purpose — a cut-corner rectangle is a process and an oval is
data, the vocabulary its owner reads professionally — and **the list is not
replaced**: one graph, two renderings, with the written-out steps behind a
fold under the sheet, which is the rendering a keyboard reads and a phone can
scan.

**THE BRIEF'S THREE CANVAS RULES ARE ALL RULES AGAINST BEING CLEVER, and each
one changed code rather than being agreed with.**

- *"node appears at current viewport center. Do not automatically connect
  it."* So `nodeDialog` **asks** what a step comes after, defaulting to
  nothing, where it used to join the new step to whatever was added last. A
  hidden auto-connection is a procedure the app wrote, and a visible
  pre-filled picker is neither hidden nor automatic.
- *"No automatic smart rearrangement."* Tidy is a button. Nothing calls a
  layout on its own, so adding one step to a forty-step procedure cannot
  throw away positions somebody placed by hand.
- *"The user owns the procedure."* Nothing infers a dependency and nothing
  draws an edge the record does not hold.

**ONE UNDO WITH TWO ROUTES, and what makes it safe is what the stack HOLDS.**
This app's standing rule is that the undo is the toast's, with no stack,
because the example, a restored copy and erasing everything all **replace**
state and a closure captured before that would mutate records the book no
longer has. The brief asks for Undo and Redo on the toolbar. Both are true at
once because every entry in `cvUndo` closes over **ids and values, never a
record object** — putting one back is a lookup that no-ops if the thing is
gone — and the stack is dropped in the three named places that swap the book,
rather than being hoped about. The toast's Undo button calls the same
`cvUndoOne()` the toolbar does and pops the same stack: *two undos for one act
is the fault two copies of one list is.*

**ONE LADDER, TWO RENDERINGS, in three more places.**

- `nodeStand(n, run)` gives the canvas footer and the run page's list the same
  word, so the sheet cannot say a step is Waiting while the words under it say
  Running. The words are the brief's own seven — Needs configuration · Ready ·
  Running · Waiting · Blocked · Complete · Failed — plus **Skipped**, because
  a branch not taken is a real state and calling it Complete would be a lie.
- `nodeActs(n, run)` is one list the inspector lays across and the right-click
  menu lays down, with a test that reads both and fails if the strings differ.
  On a **run** it is the run's own acts and nothing structural: editing the
  procedure from inside one pass through it would change every other run of
  the same workflow, which is the surprise the record's split exists to
  prevent.
- **"Needs configuration" names what is missing** — a send with nobody to send
  it to, a decision with fewer than two ways out, a filing step with nowhere
  to file. A badge nobody can act on is a conclusion with nothing attached.

**A BACK EDGE IS A DFS STACK TEST**, still, and the **arc over the top** is
how a loop reads rather than a hue: colour is the state channel and a path is
not a state. What a run actually DID is derived and inked — the source done
and the target entered — so the sheet says which way it went without storing
a second record of it.

**A POSITION IS LAYOUT AND NOT STRUCTURE**, so moving a node does not bump the
workflow's version and a drag on a run page does not claim the procedure
changed. Adding, joining, cutting and removing do bump it, and the undo
restores the version with the change.

#### What driving it and looking at it found

- **TWO RECORDS OF ONE FACT, and it had already drifted.** `CV.wf` sat beside
  `openWf` and five sites set one without the other, so the sheet came up
  empty straight after creating a workflow. The canvas reads
  `openWf`/`openRun` through `cvWfId()`/`cvRun()` and stores neither. *This is
  the same fault the whole rebuild is about, at the size of one variable.*
- **`preventDefault` ON POINTERDOWN STOPS THE BROWSER FOCUSING THE SHEET.** So
  every arrow key after a click went to the body and the canvas was a
  pointer-only screen again — the exact thing the keyboard work was for. It is
  focused by hand now, with `preventScroll`, which also removes the measured
  184 → 269px jump between `pointerdown` and `contextmenu` that cost the
  original four attempts at its menu. The node still comes from **the press**;
  that rule did not stop being true, it stopped being the only problem.
- **The first arrow key has to be able to pick a node.** The `focus` handler
  fires *before* the press that cleared the selection finishes, so clicking
  empty space left the sheet focused with nothing picked and every arrow after
  that doing nothing.
- **TWO NODES ADDED IN A ROW LANDED ON TOP OF EACH OTHER**, because the centre
  of the view does not move between two adds. The sheet read as holding one
  node, which is not "no automatic rearrangement" — it is a drawing that lies
  about what the record holds. `cvCentre()` nudges until it is clear.
- **A FORWARD EDGE TO A NODE THAT IS NOT TO THE RIGHT ROUTED BACKWARDS.** A
  decision and the step it branches to share an x, so the line left the
  source's right edge, swung out past it and came back left — a drawing saying
  the flow goes the wrong way. Which ports a line uses is geometry, not a
  constant: side to side when the target really is to the right, top to bottom
  when it is below.
- **THE PHONE OPENED ON EMPTY GRID, for two separate reasons.** A page header
  whose buttons squeezed `.ph-main` to about 110px wrapped the title to three
  lines and its one-line description to four, putting the sheet 480px down an
  800px screen — 300px of header, now 150, with the title taking the width and
  the buttons the line under it. And **the fit centred a short graph in a tall
  view**: the floor pins the zoom, so the spare room in an axis is room
  nothing can use, and half a phone of blank sheet above the first step reads
  as the work being lost. A floored fit anchors on the step that matters and
  is then pulled back so the view never shows more empty sheet than work.
- **`--receded` IS NOT A TEXT COLOUR, the fourth time.** The chevron on a row
  measured 3.35:1 dark and 2.46:1 light, and it is the only thing on the row
  saying the row opens something.
- **The menu's Remove wore a box no other row had**, because the base
  `.btn.danger` border won on equal specificity against `.cvmenu .cvmrow`.
  Two renderings of one list may not disagree about what its rows mean, and
  that includes what they are wearing.

#### Measuring a drawing, and the one way the harness lies about it

**MEASURE THE TEXT ON A NEW DRAWING YOURSELF.** A contrast walk written before
the canvas existed does not know it is there: `look2.js` reads `style.color`,
and SVG text is coloured by `fill`, so every word on the sheet was skipped and
the walk still passed. *"Nothing found" is not "nothing wrong."*

The trap in fixing it is the one already recorded: **CSS `fill` applies to
every element and its initial value is black**, so reading `fill` on an HTML
`<p>` measures black text and reports a ratio that **inverts between the two
themes** — which is the tell that the harness is wrong and not the app. So
`fill` is read for SVG `text` only, and the ground is the shape behind the
label (a node's own fill, a label's mask, or the sheet) rather than an
ancestor's background.

`cvlook.js` then prints the sheet's own numbers at **every one of the seven
state tones**, because the first two sheets it visited happened to show only
two of them and *a state colour nobody measured is a state colour nobody has
checked* — the alarm one most of all. All seven clear 4.5:1 in both themes;
the tightest is 5.02:1. Its failure stop is written to be **idempotent**, since
the record persists between the two theme passes and a stop that only works
the first time reports a fault on the second.

`cv.js` is the driving test — 59 assertions on drag, undo, redo, Connect, the
refusal, the loop, the menu against the inspector, the keyboard, a run's own
acts, Tidy and 390px. Two things it got wrong about itself first, both worth
keeping:

- **A test can pick a bad subject.** Connecting two steps failed because the
  two it chose overlapped after a drag, so a press at one node's centre was a
  press on the other — the app behaving correctly. It runs on the sample's
  laid-out sheet now.
- **A press on empty space picks NOTHING**, and asserting that a click focuses
  the sheet *and* picks a node was asserting the opposite of the rule. Letting
  go has to mean letting go; the keyboard's first key is what picks one.

## mashghal2 rebuilt again, on two nouns

Its owner said the round-3 rebuild did not feel right, and then agreed with
all four readings of why: **it had no point of view · there was too much to
learn · it looked generic · it was wrong about my work.** Three of those four
are one fault with one cause, and the cause is the one the section above
already names — except that the section above only diagnosed the *grading*.
The deeper half is this:

> **Asking "what does this app already have that answers this?" is discipline
> once and a policy never.** Seven rounds of it against documents describing a
> different app meant the record grew A LIST PER FEATURE and the bar grew A TAB
> PER LIST. Jobs, projects, workflows, wfNodes, wfEdges, runs, runNodes,
> actions, assets, people, personLinks, schedule, reports, timeEntries —
> **fourteen nouns for one person's work**, each of them a table whose name the
> reader had to learn before they could find anything. That is the whole of
> "too much to learn", and most of "no point of view".

All fourteen are the same two things.

- **A CARD** is anything with a name: a project, a step, somebody you are
  waiting on, a deadline, a laptop, a site, a scholarship.
- **A LINK** is either **then** (this comes after that) or **with** (these
  belong together, in no particular order). The two edge kinds survive from
  rev-1 unchanged, because that distinction is the one thing the model rests
  on.

**A CARD OPTS INTO BEHAVIOUR RATHER THAN HAVING A TYPE**, and the behaviours
compose: it waits on someone · has a day · files the work away · holds other
cards · opens something · comes round again. A card that waits can be late. A
card that files is what *unfiled* means. A card that holds is a project — or a
site, or a job, or a thesis — **by the same mechanism**, so the app never has
to know which. That is the whole of *"it was wrong about my work"*: the only
thing the app knows about a card's kind is the word its owner typed into it.

**NOT ONE OF THE SIX BEHAVIOURS IS STORED.** Four are read off the field that
carries them — a day makes a card dated, a name makes it waiting, an interval
makes it repeat, a path makes it openable — so there is no flag that can
disagree with the field beside it. The two with no field of their own are the
only thing stated, as one `role`, for exactly the reason `parked` is stated on
a project in the original: from the outside, a project holding nothing and a
card holding nothing are the same thing and no derivation can tell them apart.

**And the sections are gone**, which is what pays for the rest. There is no
table to navigate to, because there is one list of cards: **a screen is a
QUESTION over it.** Four of them — Now (what needs me) · Sheet (how does this
work go) · Index (what have I got) · Ask (anything else) — with Settings on the
gear, and each is the one rendering its question deserves. What is late is a
list, because that is a list. How a piece of work goes is a drafting sheet,
because that is a shape.

**Containment is one stated forward pointer and the reverse is walked**
(`c.in`, with `heldBy`/`trailOf`/`underneath` derived), the same discipline as
the old app's `atId` — and deliberately NOT a link, because a step comes AFTER
another step and a sherd is FOUND AT a site, and conflating them would list
the site among the things the step follows.

### The ladder, and the two ways it broke

Ten rungs, and they **partition**: `late · due again · not filed · today ·
yours to do · waiting · blocked · not yet due · done`, plus `thing` for a card
that is not work at all. Nothing about it is stored. Two faults, both found by
reading the rendered screen rather than by any assertion:

- **A HOLDER'S RUNG IS THE WORST OF WHAT IT HOLDS**, and its own missed date
  if that is worse. Read off its own fields alone, a project holding a late
  step printed *"Yours to do — nothing is in the way"* on its row and *"Late"*
  on its own page twelve pixels apart. Two answers to one question, which is
  the fault this whole rebuild is about, at the size of one card.
- **THE LADDER IS OVER WORK, AND A HOLDER IS NOT WORK.** Counted, the sample's
  two late steps read *"five things are late"* — three of them being the
  containers of the other two. Now answers *what needs me*, and a project does
  not need you: the step inside it does. So the tiles and the sections are one
  walk over `workCards()`, the whole book is that plus the holders, and
  Settings' own sentence says so rather than inviting a reader to add the
  parts and find they do not reach the total.
- **A SAVED QUESTION MAY NOT DISAGREE WITH A TILE.** `late` in the lens
  language matched every card on the late rung while Now counted only work, so
  the sample's own saved question answered **five under a tile reading two**.
  Every term naming a rung is marked `rung: true` and wrapped to read the
  screen's walk, and there is a test that compares the two figures.
- **THE HEADLINE COUNTS EXACTLY WHAT THE TILES SHOW.** It counted late + due +
  unfiled beside four tiles showing late, unfiled, today and yours-to-do —
  four figures that add to something other than the sentence above them. There
  is a tile per counted rung now, and the sentence names what it counted.

### Every word on the ladder has to fit a card on the sheet

*"Waiting on earlier work"* is about 130px of small caps against a 158px card,
so on the drawing it ran out of both sides of the card and straight through
the kind word beside it. Shortening the sheet's copy alone would be **two
vocabularies for one ladder**, so the ladder's own words are short and the
SENTENCE beside them carries the rest: **Blocked** over *"After Fix their
notes."* says more than the long pill did.

### The look: a drafting sheet, and one colour channel

Paper-first with a real drafting-table dark, because a drafting sheet is
paper. Square corners at 2px, **hairlines instead of fills**, one 2px rule
under every heading, small-caps letterspaced annotations everywhere a label
appears, a survey grid that pans and zooms with the work, and a **title block
at the foot of every screen** the way every site drawing has one — which is
also the honest home for the build string.

**THE MODEL EARNED A SECOND COLOUR CHANNEL BACK.** The old app spent nine hues
on identity and four on state and had to keep them rigidly apart. Here a
card's kind is **a word its owner typed**, so a hue the app assigned to a word
it has never heard of would be decoration dressed as meaning: identity is a
glyph and a word, full stop, which frees every hue for state. Oxide is late,
brass is drift, verdigris is in hand — and **waiting still carries no colour at
all**, because a card waiting three days against a five-day chase is not a
problem. There is deliberately no `.n-calm` on the sheet for the same reason.

**`--receded` IS NOT A TEXT COLOUR, for the fifth time — and this time it was
deleted.** It measured 2.63:1 on the kind word, the section counts and the
breadcrumb separator, all of which a reader has to read. Solving it for 4.6:1
landed **within one point of `--faint`**, which is the answer: a fifth grey
whose only honest value is the fourth one's does not exist. Dimmer is not the
same as invisible.

### What reading the rendered screens found

Fourteen faults, not one of them visible to an assertion. The two model ones
are above; these are the rest, and each is a class:

- **THE THEME WAS IN TWO PLACES AND THEY DISAGREED AT ONCE.** `settings.theme`
  lived in the book beside a pre-paint reader that has to read `localStorage`,
  because the main script has not loaded yet — so the reader stamped
  `data-theme` before the first paint and `paintTheme()` then REMOVED it, the
  freshly loaded book saying nothing. **Which theme this laptop shows is a
  fact about the laptop**, like sync config, not part of the record; it lives
  in `localStorage` alone now. The tell was in the harness: both themes
  measured identically.
- **A SUB-LINE IS A LINE.** Left inline it ran straight on from the kind word:
  *"Renew the visa VISAIts day was Sep 17"* — two facts welded into one word.
- **A count of nought is not worth a clause**, and a sentence about nothing
  should not be printed: *"2 cards · 0 lines"*, *"0 cards and 0 lines in the
  book"*, *"Of the cards, 0 are not work and 0 are open"*.
- **A small count in prose is a WORD**; a figure in a tile, a heading or a
  **title block** stays a figure. The prose scan reads the screen with the
  title block removed, because a drawing's metadata strip is a figure strip.
- **The verb follows the count that is the SUBJECT**, not the noun beside it:
  *"one of the seven pieces of work in it ARE done"*.
- **"nought of the three"** and **"three of the three … are done"** under the
  word *Done* are both the arithmetic showing through the sentence.
- **THE PILL CARRIES THE WORD, so the sentence beside it does not.** Every
  surface that printed a holder's standing printed its pill too: *"LATE  Late ·
  one of the seven…"*.
- **Two figures side by side must name their bases.** *"What it holds: 9"* over
  *"1 of 7 done"* is two counts a reader can see disagree; nine are the cards
  in it and seven are the ones that can come due, so the sentence says which.
- **A holder is not marked done.** Its standing is the standing of what is in
  it, so a stated `done` on the project itself would be a fact arguing with a
  derived one, with six open steps underneath it. Opening its sheet is the
  loud act instead.
- **"Look at it" is not offered on the page you are looking at**, and there is
  no second *"Open its sheet"* below the list when the header already carries
  it — the same action twice with one dressed as a choice.
- **THE TRAIL ENDS AT THE PARENT.** Its last crumb was the current sheet's own
  name, an inch above the heading that says it — a duplicate *and* a control
  that goes where you already are. At the top there is no crumb row at all,
  because its one crumb would be the heading.
- **A picker whose first answer is always refused.** The link dialog opened on
  whichever end was first in sheet order, which was usually one already
  joined, so pressing *Draw it* got a refusal. It opens on an end it can
  actually join.
- **Two sentences may not run together**: *"With N. Haddad and L. Mroueh three
  days"* read as a sentence that had lost a word.
- **A name can end in a question mark**, and *"Do we go round again?."* is a
  sentence that lost an argument with its own punctuation.
- **A reference table's left column is a literal you TYPE**, so it is mono at
  its own case: small-capped by the facts table's label style, `in:name` read
  as `IN:NAME` and stopped looking like something to type.
- **A fold's count has to be true.** *"What it does — six fields"* held seven,
  because a note is not a behaviour; the note came out of the fold, which also
  made it the one thing anybody actually types on the visible half.
- **The sample's own first saved question answered nothing.** *"Who am I
  chasing"* returned nought, because the one card that waits on a person was
  blocked by a `then` line joining it to your own writing — a line that should
  never have been drawn. A feature with no representation in the sample cannot
  be shown to anybody, and neither can one the sample accidentally suppresses.

### Driving it found five more, and four are about a canvas

- **`fill: none` IS NOT HIT-TESTABLE**, and a dashed frame with a hollow middle
  is most of a holder's area — so a press inside one went straight through to
  the grid and panned the sheet instead of picking the card. `pointer-events:
  all` keeps the frame hollow and makes its interior answer a press, which is
  the whole reason the property exists.
- **THE `<svg>` IS MOUNTED ONCE AND ONLY ITS CONTENTS ARE REDRAWN.** Rebuilding
  the box's `innerHTML` per frame destroyed the element holding the **pointer
  capture** on the FIRST move of a drag — so the card never moved, `pointerup`
  never fired on the live element, and the sheet read as a drawing that could
  be looked at and nothing more. It took the keyboard focus with it too. The
  viewBox is an attribute and the cards are the contents; neither needs a new
  element.
- **PICKING A CARD MAY NOT MOVE THE SHEET UNDER THE FINGER.** The strip is in
  the flow rather than floating, so it grows the moment a card is picked —
  which pushed every card down by the height of a row of buttons, and the next
  press landed on the grid or on a different card. A stated `min-height` is the
  fix: the empty strip is already as tall as the picked one. (The test learned
  the same rule from the other side: **a stored coordinate on a canvas is a
  coordinate about the last frame**, so it measures the node again immediately
  before each press.)
- **A CARD WITH NO POSITION HAS NEVER BEEN PLACED**, so placing it is not a
  re-layout. *"Nothing re-lays-out on its own"* is about throwing away a
  position somebody chose; seeding one nobody has chosen is the opposite, and
  without it the sample drew every card on top of every other at the origin —
  a sheet that looked like it held one card. An unplaced card among placed ones
  is nudged clear rather than re-ranking the sheet.
- **`fitted` starts as null and not `""`**, because the top sheet's own id IS
  `""` — so an empty string there meant the first sheet anybody opened was
  never fitted at all.
- **A SHORT GRAPH IS NOT CENTRED IN A TALL VIEW.** One row of cards in a 580px
  box put a quarter of a screen of blank grid above the work and another
  quarter below it, which reads as the work having been lost.
- **Moving a card picks it**, so the strip names what you just moved.

### And two the phone found

- **`align-items: flex-start` IS THE CROSS AXIS, AND IN A COLUMN THAT IS
  HORIZONTAL** — so `main` sized itself to its own content and a 320px screen
  scrolled sideways by fourteen pixels. `align-items: stretch` in the phone
  query.
- **An absolutely positioned badge needs a positioned ancestor.** `.tab` was
  not positioned, so the late count on the FIRST tab resolved against the page
  and was drawn ten pixels past the right edge of a 320px screen.
- **The rail's order is stated**, because `.railtop` is `display: contents` on
  a laptop and its children are therefore the rail's own flex items — so the
  footer, second in the markup for the phone's top row, sat second in the
  column with `margin-top: auto` pushing everything after it down.

### The old book is offered, never read

`mashghal2.v1` is w3's book and holds a different shape. It is not read, not
written and not lost: it is **offered**, once, and imported only on a tap. The
import is **additive** — nothing here is replaced and the old key is never
written to, so w3's book stays exactly where it is — and it is **lossy and
says so before it runs**, naming what it cannot carry. Time logged against a
claimant is the one thing with no card shape: hours are a sum over stretches,
not a thing with a name, and inventing a card per stretch would put six
hundred rows in the Index to say what one figure says.

### The tests

`w4.js` (30, the ladder partitions and the screens answer their questions) ·
`w4b.js` (34, driving the sheet: drag, undo, redo, the menu against the strip,
the keyboard, descending into a holder, removal keeping what was filed under
it) · `w4c.js` (58, the phone at 390/360/320, the focus ring on every
control, a book where every countable thing is exactly one, and the sheet's
own words at every state tone in both themes) · `look4.js` (60, every run of
text on every screen in both themes, at rest AND under the pointer, with
`fill` read for SVG text only) · `twoapps.js` (11, the clone and the original
cannot see each other's book).

Two harness rules this round re-earned. **`\uXXXX` in a bash heredoc is
sometimes decoded and sometimes not**, so half the source files hold a real em
dash and half hold the six-character escape — build a match string with the
real character (`D = "—"` and concatenate) and never type the escape.
And **a batch of replacements that asserts halfway through and writes at the
end loses every earlier edit**: save after each one.

## mashghal2 follows you: sync and snapshots (w8)

Asked "how do we make it more alive and working", the owner chose *working
first*: a book that lives in one browser is a book one cleared cache away from
gone. `m5/21-sync.js` is the original app's engine **ported, not rebuilt** —
sealed with PBKDF2 + AES-GCM, gzipped first, merged per record, tombstones for
deletes, pull-merge-push as one act, a 4s debounce, a 90s heartbeat — because a
second engine written from memory would be the plausible wrong answer. What
changed is what the port had to learn:

- **HOW THE BOOK IS REACHED LIVES OUTSIDE THE BOOK.** The original kept the gist
  id and device name in `state.settings`, so every act that REPLACES the book —
  the example, a restore, erasing — switched sync off, and it took a patch at
  each site. Here `mashghal2.sync.cfg` sits beside the token and passphrase in
  the vault (`localStorage`, or `sessionStorage` on a borrowed machine), so no
  replace can reach it and no backup can carry it.
- **A WHOLESALE REPLACE NEVER WRITES A TOMBSTONE.** Change tracking diffs
  against a snapshot and a vanished id becomes a tombstone, which is right for a
  delete and catastrophic for a replace: the example over a synced book would
  read as every real record deleted, everywhere. `snapOf` remembers which state
  object the snapshot was taken of; a different one rebuilds it instead.
- **A MERGED-IN RECORD IS NOT A LOCAL EDIT.** The port re-diffed after the merge,
  so every record a device merely *received* was re-stamped "now" — which lets a
  copy passed along outrank an edit a third device made in between. After a
  merge the snapshot is rebuilt, never diffed; the test asserts a received
  record keeps the sender's stamp.
- **AN EMPTY PROFILE IS NOT A NEWER ONE.** The profile is one record, stamped as
  a whole. Stamped at boot, a phone joining for the first time carried a blank
  profile newer than the real one and **blanked the owner's name on every
  device**. A profile nobody has written in stays unstamped.
- **A RECORD THAT IS HERE IS NOT DELETED** (`revived()`). A merge never leaves a
  tombstoned record in a list, so one present beside its tombstone was brought
  back — by an Undo, or a snapshot put back — and is stamped now. Without it,
  putting a snapshot back on a synced book could never undo a bad delete, the one
  job a snapshot has: the tombstone from the other device was newer than the
  restored copy. Both restores go through `adoptRestored()`, which carries the
  current tombstones in so this rule can see them.

Four refusals, each stated rather than discovered: **the example is refused on
a synced book** (invented records would travel to every device as yours);
**Erase says a synced book comes back**, and points at Wipe; **the original
app's gist is named and refused** (`mashghal.json`, a different shape of
book); and **a wrong passphrase changes nothing**, here or in the gist.

**Wipe this device sends nothing to GitHub** — the test counts requests after
the click and fails on one — and says in the dialog that wiping does not revoke
the token. **Reading never creates**: listing snapshots straight after a wipe
re-opened IndexedDB and put an empty `mashghal2-backups` back, so a read aborts
the upgrade.

**Every app-level write goes through `commit()`** (`stampRecords(); save();
syncSoon(); bkMaybe();`), because the runtime's `save()` must stay
byte-identical across five apps. A bare `save()` in app code is a write that
does not sync until the heartbeat notices.

`m5sync.js` (47): five browser contexts over one fake gist held in the script —
setup makes a sealed, compressed gist with no token, passphrase or name in it;
a second device joins and gets the book and the profile; offline edits on two
devices both survive; the newer edit of one record wins; a delete stays
deleted; the example refused; an erased synced book comes back without touching
the other; a wrong passphrase; the original's gist; a snapshot put back travels
past the tombstone; wipe clears every sync key and the database with no request;
a borrowed machine keeps its secrets in `sessionStorage` only.

## mashghal2 becomes the Workbench (w9)

The owner handed over a design package — `design_handoff_mashghal_workbench/`,
a README spec, `Workbench plan.md`, `reference/workbench-logic.js` and a
desktop and a phone prototype — and said *"take these, do them"*. It replaces
the tab-per-record-type layout with **one capture line**, **benches** (a
project as a live stream of notes, meetings, files, hours and actions), a
**record pane** with its connections drawn as a map, a Library of shelves, a
Map, a live CV and a four-step weekly review. The handoff's own plan asked for
it to become `mashghal2` without breaking a book, and the owner chose that,
keeping w8's sync, and light only for now (the dark palette is their ship).

**A PROJECTION, NOT A SECOND STORE.** The prototype runs over a flat `items[]`
and undirected pairs; this book already holds all of it in typed lists, and
the owner's CV is in them. `wbBuild()` (`m5/22-wb-model.js`) derives the
prototype's items from `state` on every render — each item's id is the
record's own ref — and every change is written back onto the list that owns
it. The prototype's rules (`parse`, `ask`, `stand`, `meta`, the shelves, the
map) are ported over that projection close to verbatim, so their words are the
spec's. What the model gained is additive and nothing is renamed: a `notes`
list (note · meeting · idea), `link` and `file` library kinds, `rstat` on a
reference (want · reading · read), `inbox` and `focusAt` on a record, `key` and
`role` on a project, status `idea`, and a `with` link (two records that belong
together, no direction). Every typed link that existed still counts as a
connection.

- **Undo writes back into the same `state` object.** `wbSnap()` clones the
  lists and the undo assigns them back in place, then `stampRecords()` —
  so an undone capture is tombstoned and an undone discard is revived, on
  every device. Replacing `state` would skip both. `m5sync.js` asserts it.
- **Focus is `focusAt` on the action, newest three win,** not the
  prototype's `focus[]` in settings, so it syncs per record like the rest.
- **The bench's weeks are the real hours**, eight weeks ending this one — the
  prototype drew a stored `HIST`; the example carries those weeks as real
  hours entries instead, and says so.
- **The reference's fixed dates are rules that land on them on 25 Sep**: a
  week out, the coming Monday, the coming Tuesday, tomorrow. The example book
  sets `settings.demo` and **the whole app lives on 25 September 2026** while
  it is loaded. That had to be the WHOLE app: pinned for the Workbench alone,
  Work called Byblos's action late while Today said it was due today — two
  readings of one book. The shared runtime's `today()` is wrapped, not edited:
  it is a function declaration in the same scope, so the binding is replaced
  and the five md5s stay identical.
- **A bench's role line is stated or read off its role and that role's
  employer**, never invented; a new bench says "New bench" because the
  prototype does.
- **The line replaced the finder** (`13-find.js` is retired, and the old Home
  with it). The line searches everything the book holds, including the kinds
  the prototype never drew (people, employers, education, workflows,
  equipment) — or a record would exist that nothing could find.

**What is not drawn is still reachable.** The Workbench has no screen for an
employer, a degree, a person, a workflow or a portfolio item, and the book
holds them: they sit under *Everything else* in the sidebar, and under **More**
on a phone, where the reference's four tabs would otherwise have left Map,
Record and Settings with no route at all — the fault Settings once had behind
a gear the phone hid. **Benches** on a phone lists every bench, because the
swipe row only shows the live ones on Today.

Found by driving and looking, each a rule already in this file:

- **A path is still never an href**, in the pane as everywhere: Copy path uses
  `copyOut()`, which falls back to a dialog, because a bare
  `navigator.clipboard.writeText` left a rejected promise unhandled.
- **A map bubble never sits on a bench.** The reference's fan put one on a
  card; it now walks further out along its own angle until clear.
- **A bench is said once.** A reference both ON a bench and LINKED to it
  printed "Thesis Thesis" — the prototype has the same duplicate.
- **"agisoft.com/forum" is not a URL**, and the Directory said so; the
  example stores it with its scheme so the link really opens.
- **An empty book gets an offer, not "No things are late, 0 in the inbox and
  0m logged"** — a sentence about nothing.
- **A sync in flight when the device is wiped sends nothing**: the write
  checks `syncOn()` after sealing, because the secrets are gone by then.
- **Reading never creates**, again: pinned images live in their own
  IndexedDB (`mashghal2-pins`, never synced, like photographs in the
  original), and listing them aborts the upgrade rather than making one.
- **The map's lines take no pointer events**, and `scroll-padding-top` keeps
  anything scrolled into view clear of the sticky top bar.

Every colour is a token in `palette.css` — the paper palette, the type and
bench colours in `oklch`, and every navy-system name aliased onto paper so the
older screens follow without a line of their CSS changing. IBM Plex Sans
(variable, 400–600) and Plex Mono 400/500 are embedded as latin woff2, fetched
once, because the app fetches nothing. The dead rail, finder and Home rules —
67 of them — were removed by the dead-CSS scan, and the old `.toasts` rule and
the Workbench's were merged into one.

The tests: `wb-line.js` (62: every parse rule's preview and toast, the
handoff's meeting example, the six questions verbatim, undo, the keys and that
none fires while typing, a reload keeps it all) · `wb-views.js` (48: shelves
and subjects, Read files a reading item as a reference, Link to… and the ×,
Copy path, the live CV and its undo, all four review steps including focus
capped at three, the map's bubbles off the benches and inside the canvas and
the focus fade, a bubble opening its bench on its filter, a pinned picture
surviving a reload and staying out of the book, and a w8-shaped book opening
unchanged with every record reachable) · `m5sync.js` now 49, with the undo
checks · `m5import.js` 116 · `m5dir.js` 89.

## mashghal2's map is a graph you can edit (w10)

Asked for the Map to be *"flexible like the workflow page"* and editable,
and — given the choice — for **every record as its own node**, the way
Obsidian draws a vault. `m5/25-wb-graph.js` is the old sheet's machinery (pan,
zoom, drag, a keyboard, a menu that is the strip laid down) over the
Workbench's projection, so every node is a record in `WB.items` and every line
is a fact the book already holds: a **link** (any `state.links` entry, solid —
the only kind drawn and cut here), **on a bench** (dashed, because it is a
field on the record; cutting it asks, and takes the record off the bench), and
later a **wiki link** (dotted, written in text).

- **WHERE A NODE SITS IS ITS OWN RECORD.** `state.spots` holds `{id: <the
  record's ref>, x, y}`. Written onto the record, a position would stamp it —
  and sync merges newer-wins per record, so dragging a node on the laptop could
  outrank the phone's edit to that same action's name; placing a graph for the
  first time would have stamped every record in the book at once. A spot syncs
  on its own and can never clobber what it positions, and `m5sync.js` asserts
  that opening the map leaves a record's `updatedAt` alone. It is layout, not
  work: `LAYOUT_LISTS` keeps it out of every count of the book, a discard takes
  its spot and the undo brings it back, and "Make it an action" moves it onto
  the new record.
- **A node with no spot has never been placed.** The first open lays the book
  out once (Fruchterman–Reingold, fixed seed, fixed rounds, then a pass that
  pushes overlapping boxes apart) and writes it down; after that a new record
  is seeded beside what it is linked to, with everything placed held still.
  Records of hidden kinds are placed too, or switching a chip on would lay out
  part of the sheet again. **The centre pull has to grow with distance**: at
  a flat 0.02 a record linked to nothing settled about 6,500 units out, because
  repulsion from sixty others falls as 1/d, and the fit shrank the whole book
  to seven-pixel labels.
- **The first view is readable; Fit is the overview.** Opening fits, then holds
  a zoom floor (0.78, 0.62 on a phone) centred on the picked node, else a late
  one, else the middle of the work.
- **Mounted once.** The `<svg>` is built once and moved into each render's
  host; only its contents are redrawn, so a render can never destroy the
  element holding a pointer capture. Selection is `wbSel` — the pane's own —
  so the sheet and the pane cannot disagree about what is picked.
- **Two undos, and they do not overlap.** The toolbar's *Undo move* and *Redo*
  are for where things sit (a drag, a Tidy), closing over ids and values and
  dropped when the book is replaced. A link, a cut or a new node changes the
  book and is undone on its toast like everything else in the Workbench.
- **`.g-box` was nearly the node's class as well as the sheet's box.** CSS
  `height` is a geometry property on an SVG `<rect>` in Chrome, so the box's
  `height: max(360px, …)` would have overridden every node's height
  attribute. The rect is `.g-rect`.
- **Crowding is the reader's to control**: kind chips (hours off by default,
  and the foot says what is switched off), *Hide what is done*, a search that
  dims what does not match, and **Only what is near it** — Obsidian's local
  graph, one or two steps out, which is also where *See it on the map* from a
  bench lands.

- **On a phone the map keeps its sheet.** The pane is a bottom sheet there,
  and opening it on every pick covered the node just picked; the strip
  carries **Details** at that width (in `grActs`, so the menu has it too) and
  the pane comes only when asked. And **the strip is one row of a stated
  height** that scrolls sideways — wrapped, it grew three lines on a pick and
  pushed the sheet 85px down under the finger, the rule w4 already wrote.
- **Name the picked node, never count one.** A picked node is drawn last so
  its ring is on top, which re-orders the DOM — so `.g-n.is-late` after a pick
  is the OTHER late node, off screen. And Playwright's `hover()` waits thirty
  seconds on a covered control; a contrast walk hovering forty chips needs a
  timeout on each, or it reads as the app hanging.

`wb-graph.js` (61: every record a node and the chips adding up to the book, a
spot written once and not again, pan and wheel zoom moving no spot, a drag
that survives a reload with Undo and Redo, drag-to-link and its toast undo,
Delete on a picked line, the bench line asking first, the menu reading the
strip, local graph one and two steps out, chips and search, the keyboard walk,
Tidy undone, a note made where you right-clicked, full screen and the Escape
stack, discard taking the spot, and at 390px nothing past the edge, a pick
that does not move the sheet and Details opening the pane) · `grlook.js` (contrast of every
new surface at rest, picked, under the pointer and in the menu, at 1400, 390
and 320px) · `m5sync.js` now 52.

## mashghal2 keeps a dropped file, and the Library has folders (w11)

Asked for *"throwing a pdf or photo on the whole page"* to put it in the
Library, and for folders to organise it; the owner chose **one tree for
Library entries and notes alike**, like a vault. `m5/26-wb-files.js`.

- **THE BYTES ARE NOT THE BOOK.** A PDF is bigger than the whole record, so it
  lives in its own IndexedDB (`mashghal2-files`) and never travels through the
  sealed gist — the call the pins and the original's photographs already made.
  The **record** syncs: a `file` entry with `blobId`, `fname`, `mime`, `size`,
  so every device knows the file exists, and the one without the bytes says
  *"The file itself is on another device"* and offers no Open that cannot
  work. A JSON import can carry a file row but never its bytes, and the format
  says so.
- **WHERE YOU ARE DECIDES WHERE IT GOES, and the scrim says which before you
  let go**: the open folder in the Library, the bench on a bench's page, the
  inbox anywhere else — the capture line's rule. `dropCtx()` carries two
  phrasings, `words` for the scrim ("into the Library") and `kept` for the
  toast ("in the Library"): the first draft reused one and printed *"Kept two
  files into the Library"*.
- **Several files are one act**, one toast, one undo — and the undo takes the
  **bytes** back too, or they would sit in storage belonging to nothing. A file
  that is not a PDF or a picture is refused **by name**, and the rest still
  come in.
- **A pin keeps its own drop.** The page-wide handler is on `document`, so a
  pin's handlers `stopPropagation`, or one picture would be pinned AND filed.
- **Removing a record does not delete its bytes; boot does.** The undo on a
  Remove toast has to bring the record back with its file, so `sweepFiles()`
  runs a few seconds after boot and deletes only bytes no record names — and
  never while the book is unreadable. Wipe deletes the database outright (and
  the pins', which w9's wipe had left behind).
- **One field says which folder anything is in.** `folders` is `{id, name,
  folderId}` and a library entry or a note carries the same `folderId`. It was
  `in` for a folder in the first draft, which would have needed its own import
  rule; the importer resolves any reference `x` into `xId`, so one name made
  folders, entries and notes import by the same line. What a folder holds is
  walked, never stored; a move into itself or anything under it is withheld by
  the picker **and** refused by the write, because a bad merge can hand the
  write a book the picker never saw.
- **Removing a folder keeps everything in it** — contents and sub-folders move
  up to where it was, the name goes to `forgotten`, the toast has the undo.
  The pocket rule.
- **What is in the tree**: every Library entry out of the inbox, and every note
  that is not a bench's own — a note filed in a folder, or one written on its
  own. A meeting on a bench is the bench's until you file it. A folder's count
  is what is in it **and under it**, and *Everything* is the whole tree: one
  walk, so the parts add up.
- **Two readings of one Library**: *By kind* (the design's shelves) and *By
  folder*. Which is `settings.libBy` — how you like to read, so it survives a
  reload, like the shape of a list. `wbLibCard()` draws an entry for both, so
  the two cannot draw one entry two ways.
- **The trail ends at the parent** and the folders inside the open one are on
  the tree, not drawn again as cards: on a phone the tree sits directly above
  the list, and the first build listed the same folders twice in one screen.
- **Move to folder…** is on the pane of anything that can be filed, and a card
  dragged onto a tree row files it (internal drags carry their own type, so the
  page-wide file drop ignores them).

`wb-files.js` (57: the scrim naming the inbox, a drop on Today, a bench and an
open folder each landing where it said, bytes in IndexedDB and not in the book,
Undo taking records and bytes, a docx refused by name, a mixed drop, the PDF
and picture previews, Save a copy, a pin keeping its own drop, tree counts,
the trail, a clashing name refused, the move picker withholding descendants,
Move to folder, drag onto a folder, removal keeping contents and Undo putting
them back, the reading surviving a reload, bytes elsewhere said in words, the
boot sweep, wipe deleting both databases, a JSON file bringing nested folders
in, and 390px) · `flook.js` (33: the tree, the drop card and the file pane in
contrast, at rest and under the pointer, at 1400, 390 and 320px).

## mashghal2 writes notes like a small wiki (w12)

Asked for *"a space to write notes in general … then tag them … like how
Obsidian works but with simple features like a Wikipedia"*. The `notes` list
already held a note, a meeting and an idea; a wiki note is the same record
with no bench and no `inbox` flag, so there is no second list. Notes is a tab
(and a More row on a phone), `m5/27-wb-notes.js`.

- **A TAG IS A WORD YOU WROTE, in either of two places.** The note's own tag
  field and any `#word` in its text both count, because that is how anybody
  who has used Obsidian writes them; `noteTags(n)` is the one union, each word
  once whatever its case. Nothing is a taxonomy to maintain — a tag exists
  because something carries it.
- **`[[Title]]` IS A LINK BY TITLE, and a backlink is walked, never stored**,
  so what the page says links here cannot disagree with the text that makes
  it. A link to a title nobody has written is drawn dashed in the late colour
  and pressing it starts that note — which is how a wiki grows. *Mentioned,
  not linked* lists the notes that name the title without the brackets.
- **A TITLE IS AN ADDRESS, so two notes may not share one.** A link to a title
  two notes carry would be a guess about which one you meant; the new-note
  dialog, the page editor and the pane's dialog all refuse a taken title (one
  rule, three doors). **And a rename carries its links**: every `[[Old]]`
  becomes `[[New]]` in the same act under the same undo, and the toast says how
  many — or every rename would break the wiki behind your back.
- **Everything is escaped first, then marked up.** The renderer knows a stated
  subset — headings, lists, bold, italic, code, quotes, links, wiki links,
  tags — and lifts code spans out before the other rules, so a `*` in code
  stays a star. `<script>` in a note is shown as text; there is a test that
  checks it never ran. **A note's `#` is an `<h2>`**, because the page's own
  title is the `<h1>`; the first draft started at `<h3>`.
- **THE LINE MAY NOT EAT A WORD.** `#anfeh` still puts a capture on the bench
  with that key; any other `#word` is a tag on a note, a meeting or an idea,
  and stays in the **title** of anything else — the first draft stripped it
  from an action and threw it away. `note: a title` makes a wiki note rather
  than an inbox one, and the preview and the toast both say *in your notes,
  tagged #…*. The line's search reads tags, so `#coast` finds what carries it.
- **The editor's conveniences are keys on its own fields.** `[[` offers the
  titles that match what follows it; Ctrl+S saves and Esc cancels without
  reaching the Workbench's own key handler. On a phone the Save row sits
  **above** the text (a CSS `order`), because below it Save was under the
  fixed capture line.
- **The map draws a wiki link dotted** (`grWikiEdges()`), a third kind of line
  beside a link and a bench, because it is written in text and is changed by
  editing the text — cutting one on the map says so rather than doing nothing.
- The example book carries a small wiki: two notes of its own, tagged, in a
  folder, linking each other and a bench's note, so the page, the backlinks
  and the dotted lines all have something to show.

`wb-notes.js` (51: the tab and its count, tag chips from field and text, a tag
and a search narrowing and saying so, the renderer, a wiki link each way, the
folder crumb, a taken title refused, `[[` suggestions, Ctrl+S, tags
de-duplicated, HTML shown as text and never run, a missing link starting its
note, Esc, a clash on save, a rename carrying three links and its undo, the
line's `note:` and `#tag`, an action keeping its `#word`, the line finding by
tag, the pane dialog's tags and title rule, Open as a page, the dotted lines,
removal, import de-duplicating tags, and the phone) · `nlook.js` (66: the
index, a tag, a page, a missing link and the editor in contrast at 1400, 390
and 320px, at rest and under the pointer).
