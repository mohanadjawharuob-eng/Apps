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
  transaction. Nothing can drift out of sync.
- **Never guess at money.** If a currency has no rate, an account name does not
  match, or a date is not `YYYY-MM-DD`, refuse and say why. A plausible wrong
  number is worse than a visible failure.

## Coffer's shape

Six tabs, one question each: Today, Ledger, Plan, Worth, Insights, Settings. A
tab that grows past about three cards has stopped answering one question — split
it, or give it a `subNav` the way Plan does. Overview was allowed to reach seven
blocks and became the thing everybody scrolled past.

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
