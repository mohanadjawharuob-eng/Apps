# Writing a plan for Coffer

A plan is what you *meant* to do. Coffer already records what you actually did;
importing a plan puts the two side by side on the **Plan** tab.

Write it as plain text — in Word, in Notes, in a message to yourself — and paste
it into **Plan → Import a plan**. Coffer shows you every line and what it will do
before anything is changed, and nothing is applied while a single line is broken.

## The shape

```
# Plan: Cyprus move
covers: 2026-09 to 2027-08
review_by: 2027-02-01

## Budgets
- Groceries: 400
- Transport: 120
- Housing: 700 EUR
- Subscriptions: 60
- Subscriptions > Spotify: 12

## Income
- Salary: 45,000,000 LBP monthly into Wallet from 2026-09-25
- Contract: 2000 monthly into Wallet from 2026-09-01 until 2027-03-31
- Possible grant: 5000 at 40% once into Wallet from 2026-11-15

## Commitments
- Rent: 700 EUR monthly from BoC current, Housing, from 2026-09-01
- Gym: 29 monthly from Wallet, Health, from 2026-09-05

## Goals
- Cyprus deposit: 3000 by 2027-02-28
- Emergency fund: 5000
```

All four sections are optional. Every entry is one line:

```
- <name>: <amount> [CUR] [frequency] [into|from <account>] [, <category>] [by|from <date>]
```

Everything after the amount can come in any order.

## The rules, and why they are strict

| Part | Rule |
|---|---|
| **amount** | Required. `400`, `45,000,000` and `$400` all read the same. |
| **currency** | A three-letter code after the amount. It **must already have a rate** under Settings › Exchange rates — otherwise the line is refused rather than converted at a rate nobody chose. The rate is then frozen into the plan, so changing it later never re-values a plan you already imported. |
| **frequency** | `weekly`, `monthly`, `yearly` or `once` — the four Coffer keeps. Monthly if omitted. `fortnightly` and `quarterly` are refused by name rather than silently rounded. See below for what `once` means. |
| **account** | `into Wallet` for income, `from Wallet` for a commitment; a pocket is `from Bank › Cyprus`. Matched case-insensitively against the accounts you actually have. An unknown name is an error listing the ones that exist; a closed account is refused. |
| **category** | After a comma: `, Housing`. Leave it out and Coffer uses the entry's own name if that names a category, otherwise guesses from it and tells you which it picked. A category that doesn't exist is offered as a tickbox, never created behind your back. |
| **date** | `from 2026-09-01` or `by 2027-06-30`. Always `YYYY-MM-DD`. **"next March" is refused** — a date guessed at is a date that is quietly wrong. |

A budget line's name *is* its category.

## For income that is not a salary

| Written | Means |
|---|---|
| `once` as the frequency | a lump sum on one date — a grant, a bonus, a project fee. It is **not** averaged into a monthly figure, because pretending a one-off is a monthly rate is exactly what makes contract income look like a salary. |
| `until 2027-03-31` | a terminal date. Projections stop there instead of assuming the contract runs forever, and Coffer warns you when an income line is about to end with nothing scheduled after it. |
| `at 40%` | how likely this is. A line at 40% counts as 40% of its value in the headline and says so, which means guaranteed and possible income can live in one plan instead of forcing two near-identical files. |

## Sub-budgets

`Subscriptions > Spotify: 12` caps one charge inside a parent category. The
parent is what transactions are actually filed under, so a sub-budget is kept as
a **breakdown** of the parent rather than a budget of its own — when
Subscriptions runs over you can see which line to cut. The parent must be a
category that exists.

## Review date

`review_by: 2027-02-01` at the top ties the plan to a real decision point — a
contract renewal, a move. Within 45 days the Plan tab says so, prominently, so
regenerating it is not left to memory.

## Scenarios

A plan can inherit from the one already imported and replace only the sections it
mentions:

```
# Plan: Contract lost
extends: current

## Income
- Stopgap: 600 monthly into Wallet from 2027-04-01
```

Budgets, commitments and goals are taken from the parent as they stand, so a
branching future does not mean two near-duplicate files kept in step by hand.
Lines the scenario drops are listed in the preview as *no longer in the plan* —
the records they created stay where they are, because they may have been logged
against; only the plan stops tracking them.

## Running it more than once

Every line is keyed by its section and name, and the records it creates are
stamped with that key. Re-importing an edited plan **updates the same entries
instead of making second copies**, so it is safe to run whenever the plan
changes. A goal's `saved` figure is never overwritten — that is real money you
already put aside.

**Plan → Copy it back out** writes the stored plan back into this format, so a
plan imported months ago can be edited and re-imported without retyping it.

## JSON instead

A file starting with `{` is read as JSON with the same four keys:

```json
{
  "name": "Cyprus move",
  "from": "2026-09", "to": "2027-08",
  "budgets":     [{ "category": "Groceries", "amount": 400 }],
  "income":      [{ "name": "Salary", "amount": 45000000, "currency": "LBP",
                    "frequency": "monthly", "account": "Wallet", "date": "2026-09-25" }],
  "commitments": [{ "name": "Rent", "amount": 700, "currency": "EUR",
                    "frequency": "monthly", "account": "BoC current",
                    "category": "Housing", "date": "2026-09-01" }],
  "goals":       [{ "name": "Cyprus deposit", "amount": 3000, "date": "2027-02-28" }]
}
```

Both forms go through exactly the same validation.

## What it does *not* do

- **Accounts and pockets** — a plan attaches to accounts you already have.
- **Changes part-way through** — "rent becomes €700 from March" is not expressible;
  budgets are one figure per category with no time dimension. Re-import an
  edited plan when the figure changes.
- **.docx** — Word files are a ZIP of XML and prose inside them still would not
  parse. Copy the text out and paste it; that works from anywhere.
