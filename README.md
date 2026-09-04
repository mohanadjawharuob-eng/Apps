# Apps

Five small offline web apps. They run entirely in the browser on your own device —
no account, no server, nothing sent anywhere.

**Live at:** https://mohanadjawharuob-eng.github.io/Apps/

| App | What it does | Data key |
|---|---|---|
| [Daybook](./daybook/) | Tasks, today's focus, habit streaks | `daybook.v2` |
| [Coffer](./coffer/) | Ledger, budgets, plans, goals, debts, investments, grants | `coffer.v2` |
| [Kitchen](./kitchen/) | Weekly meal plan, one merged shopping list | `kitchen.v1` |
| [Timesheet](./timesheet/) | Hours per client, then invoice them | `timesheet.v1` |
| [Bustan](./garden/) | Plants, watering by real weather, seasonal almanac | `bustan.v1` |

Two things worth knowing about before changing anything here:
[`CLAUDE.md`](./CLAUDE.md) for the conventions every app follows, and
[`ROADMAP.md`](./ROADMAP.md) for what is built, what is queued, and what was
turned down and why.

## Layout

Each app is one self-contained directory, and that is deliberate — a single
worker covering the whole folder claims every app at once, and then only the
first one you install actually installs.

```
<app>/index.html            the entire app, one file
<app>/manifest.webmanifest  id, scope and icons; scope is the app's own directory
<app>/sw.js                 offline shell, cache-first, own cache namespace
<app>.html                  redirect stub for the bare /Apps/<app> URL
icons/                      192, 512 and maskable 512 per app
index.html                  this launcher; not installable, on purpose
```

## Coffer plans

Coffer takes a written financial plan — budgets, expected income, commitments,
savings goals and grants — and scores what you actually spend against it. The
format is plain text you can write in Word or a notes app; it is documented in
[`coffer/PLAN-FORMAT.md`](./coffer/PLAN-FORMAT.md) and inside the import dialog
itself. Nothing is applied until a preview has shown every line, and a line
whose currency, account or date cannot be resolved blocks the import rather than
being guessed at. To have an AI write one for you, paste
[`coffer/PLAN-PROMPT.md`](./coffer/PLAN-PROMPT.md) into it.

Coffer is organised as six tabs, one question each: **Today** (log something,
and see where the day and month are going) · **Ledger** (what happened) ·
**Plan** (what is coming — the outlook, budgets, bills, income, goals, grants
and the plan itself) · **Worth** (accounts, investments, debts, net worth) ·
**Insights** (patterns across the whole ledger) · **Settings**.

## Seeing forward

**Plan › Outlook** projects eighteen months instead of dividing savings by a
burn rate: every contract starts and stops on its own date, income is weighted
by how likely it is, and the month the money runs out is marked on the line. A
switch beside each income line answers "what if this doesn't renew" without a
second plan to keep in step.

**"Can I afford it?"** answers with routes rather than yes or no — pay now,
instalments with the markup shown against the sticker price, save up to a month
that still leaves three months of cover, trim a budget, or take it from a
pocket — with what each does to the date you run out. Nothing is logged; it is
a question, not an entry.

## Money that is not spending money

Three kinds of money are held apart from the day-to-day, each for its own
reason.

**Investments** (Worth › Investments) are accounts with a hand-set value. Money
going in is a *transfer*, so saving never shows up as spending; what comes back
is income. Valuations are dated, so checking a price today does not rewrite
last March. Net worth counts what a holding is worth; the runway never does.

**Grants** (Plan › Grants) are money in your account that is not yours. The
unspent balance is out of your net worth, the spending is out of your burn rate
and out of your own budgets, and it lives in a pocket marked as spoken for.
Split an award into the headings you have to report against and Coffer tracks
each one, warns when a deadline is close with money unspent, and says when you
have gone past the award with your own money.

**Committed pockets** are yours, but earmarked — still in net worth, out of the
runway.

## Bustan

The fifth app is newer than the other four and works a little differently, so it
is worth saying how.

- **Plant art is drawn, not stored.** `sprites.js` holds sixteen plant
  archetypes that paint onto a 20x20 grid; a species supplies a palette and a
  few proportions. Fifty-five plants across five growth stages cost a few
  kilobytes and no image requests.
- **Watering runs on evapotranspiration.** Open-Meteo publishes ET0 for a set
  of coordinates - millimetres of water the air pulled out of a reference
  surface that day. Scaled by crop coefficient, sun exposure and pot type, that
  gives a real soil water balance per plant, with rainfall subtracted. It is
  why the app goes quiet after a wet night.
- **It is the only app here that uses the network,** and it treats that as an
  enhancement. Every screen renders from the last cached forecast; the service
  worker refuses to cache weather responses, because a stale forecast served
  silently is worse than none.

## Moved from `deep/apps/`

These apps used to live in the `deep` repo under `/deep/apps/`. Both addresses are
on the same site, and the apps save to `localStorage`, which browsers scope to the
site rather than to a folder — so **the data carried over on its own**. Installing
from the new address opens each app with everything already in it. Nothing to
export, nothing to re-enter.

Two things were renamed to keep the old and new installs from fighting while both
exist on one device:

- **Manifest `id`** — `/deep/apps/<app>/` became `/Apps/<app>/`, so the browser
  treats the new install as its own app rather than a confusing duplicate.
- **Cache namespace** — `<app>-v1` became `pwa-<app>-v1`. The old workers delete
  any cache whose name starts with `<app>-` and the old folder-wide tombstone
  deletes anything starting with `apps-`, so the new prefix has to avoid both or
  the two installs would keep wiping each other's offline copy.

The old copies are still in place at `deep/apps/` and still work. Delete them once
you have reinstalled from here and confirmed your entries are present.

## Installing

Open an app itself — not this launcher — then Chrome menu **⋮ → Install app**.
On iPhone: Share → Add to Home Screen. Android files installed web apps in the
**app drawer**, not always on the home screen.

## Serving

GitHub Pages, from the default branch, root directory. HTTPS is required: service
workers and geolocation both refuse to run without it.
