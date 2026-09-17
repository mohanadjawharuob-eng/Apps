# The Coffer Handbook

**Money you can check, on a phone that owes nobody an explanation.**

Coffer is a personal ledger built for irregular income and more than one
currency. It runs entirely in your browser, keeps no account, and sends nothing
anywhere. This is everything it does and why each part exists.

*Six screens · offline by design · no sign-in, no server · installs as an app*

---

## The premise: a ledger that refuses to guess

Most money apps are optimistic. They average what you earned, smooth what you
spent, and hand you a confident number built on a quiet assumption that this
month resembles the last one. For a salary that is roughly true. For contract
work it is a lie, and it is the lie that makes freelancers plan badly.

Coffer is built the other way round. Balances are never stored — they are worked
out from an opening figure plus every entry, so nothing can drift out of step.
Exchange rates are frozen onto each entry the moment you log it, so correcting
today's rate never rewrites last March. And where it does not know something, it
says so instead of filling the gap.

> **Five and a half months before the money runs out.**
> — Today, the runway

That is the house style: an answer in a sentence, with the working shown
underneath — `$10,078 reachable at $1,844 a month · from only 2 months of data`.
The caveat is not fine print. It is the point.

---

## The daily loop: getting a number in, in about three seconds

A bar sits at the bottom of every screen. Type roughly what happened and press
Log.

```
10$ potato
taxi 8 yesterday
coffee 3.50 friday
+2500 salary 25 jul
450000 lbp service to studio
```

It reads the amount, guesses the category from words you have used before, picks
up date words (`today`, `yesterday`, `friday`, `3 aug`, `2 days ago`) and treats
a leading `+` as money coming in. Then it shows you what it understood and
waits. **Nothing is written until you confirm**, and every part of it — category,
account or pocket, currency, date — can be corrected in the same tap.

- **One-tap buttons** — for the things you pay constantly at no fixed time: a
  taxi, a coffee, the corner shop. Fixed-amount buttons log instantly; variable
  ones ask for the figure and remember it for next time.
- **Paste a list** — one purchase per line, same shorthand. Built for copying a
  few messages out of a chat, or catching up on a pile of paper receipts at once.
- **Any currency, anywhere money moves** — every place you enter an amount takes
  a currency and freezes the rate onto that record. A lira entry shows the
  converted figure with the lira amount beneath it, so the ledger always matches
  the receipt.
- **Split one payment across categories** — a shop trip that was half groceries
  and half household is one payment and two costs. The parts must add up to the
  entry exactly; a split can never disagree with its own total.
- **Receipt photos** — attach a picture to any entry. It is downscaled and
  stored separately from the ledger, so one phone photo can never break saving
  for everything else.
- **Money you expect back** — mark an expense refundable and it leaves your
  balance but stays out of your spending and your runway until you mark it
  settled. It is listed with how many days it has been outstanding.

---

## Screen one · Today

*Am I all right at the moment?*

The opening screen leads with net worth and a runway gauge — how many months the
money lasts at your current rate — written as a sentence rather than a dial you
have to interpret. Below that:

| | |
|---|---:|
| **Total out** — everything that left this month | $1,869 |
| **True burn** — one-offs and refundables stripped out | $1,869 |
| **In · Kept · Reachable** — earned, saved, spendable | $2,703 · $834 · $10,078 |
| **Spent today**, against a typical day this month | $124 |
| **Due in the next fortnight** — bills, each loggable in a tap | 5 bills |
| **Owed back to you**, with days outstanding | $420 |

Two spending numbers appear deliberately, and they answer different questions.
**Total out** is everything that left the account. **True burn** takes off
one-offs, money you are owed back, and anything spent from a grant — it is the
only one a runway can honestly be built on.

A notices strip carries anything worth knowing: a budget running hot, a category
that moved, a rate gone stale, or a direct question the app needs answered
before a figure means anything.

> **How many days did you go in to University teaching in August? Until you
> say, none of the Transport allowance is counted.**
> — Today, notices

---

## Screen two · Ledger

*What actually happened, and when?*

Every deposit, expense and transfer, grouped into day cards that each carry
their own in and out. A row shows what it was and how much on top, where it went
and under which category underneath — plus the original figure when it was
logged in another currency.

- **Search** by description, category *or amount*. Typing `400` finds $400 and
  $399.99, matches an entry by the lira figure you actually handed over, and
  finds a share inside a split.
- **Filters** for money in, money out and transfers, with category, account and
  date range folded behind a disclosure that opens itself when something is set.
- **Per-row tools** — attach a receipt, split across categories, mark a refund
  as returned, edit, delete. Every destructive action is undoable from the toast
  that follows it.
- **Export** the filtered view as CSV. A split entry exports one line per share
  so the category column still adds up, with a column noting they were one
  payment.

### Transfers, including the ones that change currency

Moving money between accounts is a transfer, never spending. When the currency
changes, the transfer carries **both** figures — what left and what arrived — so
the rate you actually got at the changer is recorded rather than assumed. The
dialog states the rate you are getting against the one you have stored, and the
row afterwards says what the exchange cost you.

> **90,909 LBP to the USD, against 89,000 stored — the exchange cost $7.08.**
> — the transfer dialog, as you type

---

## Screen three · Plan

*What is supposed to happen next?*

Seven views, because planning irregular income needs more than a budget screen.

**Outlook — the next eighteen months, walked.** Not a straight line from today's
average. It walks month by month with every contract starting and stopping on
its own date, and marks the months where something changes. Crucially, you can
tap any income source to *leave it out* — the "what if the retainer doesn't
renew" question, answered in one tap.

**Budgets — monthly limits per category.** Each bar carries a marker showing how
far through the month you are, so a bar past its marker is running hot rather
than merely large. Categories with no budget are listed underneath so you can
set one.

**Bills — what you have committed to.** Everything that repeats, what it costs a
month, and how soon it is due. Yearly bills show their monthly equivalent. It
closes with the ratio that matters: what share of committed income the committed
bills take.

**Income — contracts and one-offs, kept apart.** A two-year contract and a lump
sum need different facts about them, so they are separate groups. A contract
records what it pays, on what cycle, when it ends, how much is left to be paid
and over how many payments — plus how likely it is to carry on, and for how long
if it does.

**Goals — and whether your pace gets you there.** A goal can be a figure you top
up by hand, or it can point at a real pocket and read its actual balance. Either
way it says what it needs per month to land on its date, and whether your recent
saving covers that.

**Grants — money that is not yours.** An award you are holding on someone else's
behalf, split into the lines it has to be spent against, each with its own
progress. It is held out of your net worth, your burn rate and your budgets —
because it is in your account but it is not your money.

**The plan — written down once, scored against reality.** A whole plain-text
format for writing your year down and importing it, then comparing what you
meant to do with what happened.

```
Budget: 420 Groceries
Bill: 950 Housing monthly on the 1st from Bank
Contract: 2400 monthly into Bank until 2027-02-28 renews 45%
Goal: 6000 Cyprus move by 2027-04-01
Grant: 9000 Heritage grant from Beit Foundation until 2027-05-30
```

### Advice — what I would change

The first thing under Plan, and the only screen that tells you something
rather than showing you something.

**This month**, as instructions rather than figures: what is expected in, what
your budget and usual spending take, what each goal is owed this month — with
a **Set aside** button that writes the transfer straight into that goal's own
pocket, the amount already filled in — and what is left for you once they are
all kept. A goal you have already fed this month reads *done*, because the app
can see the transfer; a goal you track by hand cannot be seen, so nothing is
claimed about it.

**What I would change** is a short list of proposals. Each is three lines:
what to do, what made me say it, and what changes if you agree.

> **Lower Groceries to $135**
> It is set at $300 and you have spent $120 a month over 3 months.
> That frees $165 a month toward what you are saving for, with room above what
> you actually spend.

Two things about it are worth knowing.

**It proposes and never acts.** Nothing on this screen moves a figure until
you tap *Do it*, everything it does can be undone from the toast that follows,
and *Not this* puts a proposal away for good — with a button to bring back
everything you have waved away, whenever you want it.

**It fixes the cheap things first.** Budgets that do not describe what you
actually spend get corrected before any promise is asked to move — because a
budget set at $300 for something costing $120 is a wrong number sitting inside
every figure built on it, and correcting it is free. Only if the month still
does not add up after that does it suggest moving a goal, and then the one
that costs you the least, not the biggest one.

**Worth watching** is the last part: budgets running ahead of the month, goals
past their date. Nothing to accept there — only something to know.

### Can I afford it?

Reachable from Today and from Outlook. Give it a thing and a price, and it runs
the whole projection again with that purchase inside it — then shows what each
way of paying actually costs you. Out of spare money, saving up for it,
spreading it over instalments, trimming a budget, **or putting one of your
goals back a few months**: each route is priced in what it takes out of
savings and in which promise moves, not in whether you survive it.

That last route matters more than it sounds. A goal is a promise you made
yourself with a date on it, not a bill — and if every route is measured against
savings your goals have declared untouchable, then with ambitious goals the
answer can only ever be no. So it offers the trade you are actually making:
pause the goal costing the most a month, pay for the thing out of income, and
the only price is that the goal lands later. It says how much later, and in
which month.

**It reads your month first.** If what you earn does not cover your budget and
your goals, that is the finding, and it is stated before anything about the
purchase: *you are $252 short every month already; nothing below fixes that.*
It will not answer "yes" while that is true unless the route is paid out of
income or out of spending less — money taken from savings in a month that does
not balance is not coming back.

**The card is built to be read in one glance**, top to bottom: the alarm if
there is one, the answer in a sentence and its price in a second, three tiles
for what it costs — out of savings, out of income, and what it delays — where
you stand as two figures, and then every route as a single row under two
columns you can run your eye down. Tap a row and it explains itself; the one
that costs least is first and says so.

It deliberately does not measure against everything you own. Money your goals
have already put aside, and a cushion you set yourself, are both held back
first — otherwise the tool offers up your house deposit and calls the car
affordable because the deposit exists. And with no income booked at all, it
refuses to answer rather than invent a date.

---

## Screen four · Worth

*What do I actually have?*

Net worth with its trend, then assets, debts and — separately — what is genuinely
**reachable** this month. The gap between those last two is explained in words
rather than left as a puzzle.

> **$5,990 is invested, and $8,070 sits in pockets you marked as spoken for. It
> is all yours — it is just not this month's money.**
> — Worth

### Accounts, and pockets inside them

An account is a real account. A **pocket** is a slice of one — a way of saying
what part of the balance is for, without opening a second bank account. The
account total never changes; whatever is not in a pocket shows as Not allocated.
Each pocket is marked as one of three things, and the marking is what does the
work:

| Marking | What it means |
|---|---|
| **Available** | ordinary money, counts everywhere |
| **Set aside** | earmarked for something; yours, still counted |
| **Already spoken for** | committed, and out of the runway |

Pockets can be added, edited and removed for good — removing one keeps every
entry filed in it and simply returns them to the account.

### Investments

A holding is an account with a value you set by hand, because no ledger can know
what a thing is worth. Valuations are **dated and kept**, so a March valuation
stays a March valuation and your net-worth history is not rewritten every time
you check a price.

Money going in is a transfer, not spending — buying shares is not a month where
you bled money, and it is also not a way to get richer, so the amount comes out
of an account you name. A dividend is income. Each holding shows what you put
in, what it has paid back, what it is worth now, and the gain against cost. None
of it counts toward your runway: you cannot pay rent from a pension.

### Debts

What you owe, at what rate, with the interest each one is costing you this
month. Then a payoff comparison — avalanche, snowball, or minimums only —
showing debt-free dates, total interest, and how much a chosen strategy saves
against doing nothing. It names the order to attack them in, and notes when a
small balance will clear on its minimum anyway.

---

## Screen five · Insights

*What is the pattern, and is it changing?*

Category league tables all-time and this month against last, biggest single
expenses, month-on-month movement, spending shape, and the pace you are keeping.
Where a comparison would rest on too little data, it says so instead of drawing
the line.

### The written report

One button writes the whole ledger down as a document — for an accountant, a
visa application, or reading once a quarter. It covers what you are worth and
which part is not yours, month by month with both spending numbers, the runway
and the walk forward, categories, budgets held or missed, holdings, grants,
goals and debts.

It ends with a section on what it **cannot** tell you: how many months the burn
rests on, what is still owed back to you, which exchange rates have gone stale,
whether a plan exists at all. Read it on screen, copy it, or save it as a
Markdown file. Nothing leaves the device to produce it.

---

## Screen six · Settings

*Whose data is this, and on what terms?*

**Your data, your device.** Coffer has no server and makes no network request.
Every figure lives in this browser's storage, on this phone or computer only.
Open it somewhere else and it starts empty there. Send the link to a friend and
they get their own ledger — there is nowhere for your numbers to reach them.

- **Backup and restore** — plain readable JSON, given to you as both text and a
  file. Restoring replaces everything after a confirmation. Since the only copy
  is in one browser, this is the one habit worth keeping.
- **Your cushion** — how many months of running cost you refuse to go under. It
  is what "Can I afford it?" holds back before calling anything spare.
- **Exchange rates** — the rate you *really* trade at, not the official one.
  Changing a rate only affects what you log next; anything already recorded
  keeps the rate it was logged at. A rate older than a month is flagged.
- **Where a quick log lands** — pin the account or pocket the log bar defaults
  to, or let it use whichever you log to most.
- **Appearance** — follow the phone's light and dark setting, or hold one
  whatever the phone does.
- **The sample ledger** — three months of a made-up freelancer with two
  currencies, pockets, a grant, a holding and a contract that ends, so every
  screen has something real on it. Useful for showing someone how the app works.
- **Check for an update** — the app updates itself when opened online, and this
  forces it.

---

## Underneath: six rules the arithmetic keeps

These are not settings. They are decisions baked into every figure, and they are
the reason the numbers can be trusted.

1. **Balances are derived, never stored.** Opening figure plus every entry.
   Nothing can drift. The two exceptions are stated rather than computed,
   because no ledger can know them: what a debt is at, and what a holding is
   worth.
2. **Rates are frozen per record.** Every entry keeps the rate it was logged at.
   Correcting today's rate never moves a figure already recorded, so your
   history stays what it was.
3. **Three kinds of money are not yours to spend.** Committed pockets are yours
   but out of the runway. Investments count toward what you are worth but not
   toward rent. A grant is not yours at all — out of net worth, out of burn, out
   of budgets.
4. **The projection never averages what you earned.** It uses scheduled income
   only, weighted by how likely you said it is. Averaging last quarter is
   exactly what makes freelance work look like a salary.
5. **Deleting takes the money with it, or leaves it alone.** Deleting a grant
   removes its award and its spending, because that money was never yours.
   Deleting a pocket keeps every entry and returns them to the account. The app
   knows which case is which.
6. **It never guesses at money.** No rate for a currency, an account name that
   does not match, a date that is not a date — it refuses and says why. A
   plausible wrong number is worse than a visible failure.

---

## Honestly: what it does not do

The same constraints that make it private make some things impossible, and a few
gaps are simply not built yet.

- **No sync, and no second device.** One browser is one book. There is no cloud
  copy, so the backup is the only insurance.
- **No bank connection.** Nothing is imported automatically; every figure is one
  you typed. That is the trade for having no server.
- **No reminders or notifications.** Bills due are shown when you open it, not
  pushed to you.
- **No invoices yet.** It tracks expenses you are owed back, but not work you
  have billed for and not been paid — the number a freelancer most wants.
- **No automatic tax set-aside.** You can hold tax in a committed pocket, but
  you top it up yourself; nothing skims a share off income as it lands.
- **The totalling currency is fixed.** Everything converts to one base currency.
  You can change the symbol shown, but not which currency the totals are in.

---

*Coffer — a personal ledger that runs offline, keeps no account, and states its
own basis. This handbook describes the app as it stands at build 2026-09-05a.*
