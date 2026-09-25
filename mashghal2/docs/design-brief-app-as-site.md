# Brief: make the app itself read like a website, on a PC

**For:** whoever is asked next to redesign Mashghal's desktop interface.
**Deliverable:** one file — `/Apps/mashghal2/index.html` — still with no
dependencies and still one file.
**Not in scope:** the marketing page at `/Apps/mashghal2.html`. That one is
finished. This brief is about the app.

Hand this whole document over as the instruction. Constraints come before
wishes, because a brief that lists only wishes produces a beautiful screen that
cannot ship.

---

## 0. Why this brief exists, and what the last one got wrong

There is already a brief in this folder called `design-brief-website.md`. It is
about the **marketing page** — a separate file that shows screenshots of the
app and links into it. Its own first lines put the app explicitly out of scope.

That was the wrong half. A page of screenshots is a poster; the thing somebody
actually looks at for an hour a day is the app, and on a PC it currently looks
like an app: a 232-pixel left rail of tabs against a content column that starts
at the left edge and runs to whatever width the window happens to be. It works.
It does not read like something that was designed.

**So: this brief is the same standard of care, aimed at the interface itself.**

---

## 1. The hard constraints. Breaking one of these means it cannot be merged

1. **One file, no dependencies, nothing fetched.** `mashghal2/index.html` holds
   the markup, the styles and the script. No CDN, no npm, no Google Fonts, no
   icon library. The display face is already embedded as a base64 woff2 — reuse
   it, do not add a second.
2. **THE SHARED RUNTIME IS BYTE-IDENTICAL ACROSS FIVE APPS AND MAY NOT BE
   TOUCHED.** The block beginning `Shared runtime for all of these apps` is
   copied verbatim into daybook, kitchen, timesheet, mashghal and mashghal2.
   This is the test, and five identical hashes is the pass:

   ```
   for f in daybook kitchen timesheet mashghal mashghal2; do
     sed -n '/Shared runtime for all of these apps/,/^<\/script>$/p' $f/index.html |
     sed '$d' | md5sum
   done
   ```

   So `openModal`, `toast`, `confirmAction`, `backupDialog`, `restoreDialog`,
   `trapOverlay`, the field spec and `renderNav` are all fixed. Anything the
   redesign needs from them is done in the app's own code instead — the way
   `railWork()` already fills the rail rather than editing `renderNav`.
3. **`renderNav()` owns the tab markup.** It emits, into `#nav`:
   `<button class="tab" data-tab="ID"><span class="ico">svg</span><span>Label</span></button>`.
   A top navigation bar is therefore a **restyle and a re-placement of `#nav`**,
   not a rewrite. If you find yourself wanting to change what `renderNav` emits,
   stop — you are about to break four other apps.
4. **The record does not change.** No state key is renamed, no list is added or
   removed, nothing is migrated. `STATE_LISTS` and `adoptState` stay as they
   are. This is a layout and typography pass, and a book written yesterday must
   open in it unchanged.
5. **`APP.actions` is the only place a figure moves, and this pass should not
   need a single new one.** If the redesign wants a new action, that is the
   signal that it has stopped being a redesign. (`data-act` names may be
   *reused* in new places freely — that is what they are for.)
6. **No feature may be dropped to make a screen prettier.** Every one of the
   twenty-odd pages still answers its question in full: Career (Profile ·
   Experience · Education · Training · Skills · Timeline) · Work (Projects ·
   Workflows · Actions · People · Equipment · Outputs · Employers · Hours) ·
   Library (six kinds plus By subject) · Show (Portfolio · CVs), plus every
   record's own page, the guide, Settings and the finder. If something has to
   move, it moves somewhere nameable and the brief for the change says where.
7. **Both themes are real, and every run of text clears 4.5:1** (3:1 at 24px,
   or 18.66px bold), **at rest and under the pointer.** Never hardcode a colour
   beside a token in the same rule — that exact shortcut has cost this repo
   three vanished button labels, the most recent at 2.86:1. Every new colour is
   a token defined in all three theme blocks.
8. **Every interactive thing is a real control with the app's own focus ring.**
   No `<div data-act>`. The whole app is driven by keyboard today and must still
   be. A scripted `.focus()` does not match `:focus-visible` after a mouse
   click, so press Tab when you check.
9. **THE PHONE MAY NOT REGRESS.** Under 880px the current layout is measured
   and paid for: five tabs on one row, the mark, name, search and gear sharing
   one line, about 122px of chrome on a 780px screen, no sideways scroll at
   390, 360 or 320px. This brief is about the PC. The phone layout stays, and
   the test that proves it must still pass.
10. **Say nothing the app cannot do.** No account, no sync, no notifications,
    no server. A redesign that adds a "Share" button or an avatar menu with a
    sign-out in it is describing a different product.

---

## 2. What "like a website" means here — and the tension to hold

The instruction was: *make the PC interface read like a website rather than
like an app.* That is the right instinct and it needs one distinction to be
useful, because **a website is read and an app is used**, and Mashghal is both:

- **The reading screens** — the Library and its six kinds, By subject, a
  library entry's own page, the Timeline, Skills, a record's page, the
  Portfolio, a CV, the guide — are things you *look at*. These should get the
  full treatment: a measure, real typographic hierarchy, space, cards, a
  section header worth the name.
- **The working screens** — Actions, Projects, Hours, the finder — are things
  you *scan and act on*. Density is the point. These get the same type scale,
  the same spacing rhythm and the same chrome, but **not** a hero and not
  fewer rows per screen. A screen that shows me six late things at a glance
  must not become a screen that shows me two beautifully.

**The one-line test for any change: does it take fewer scrolls to learn the
same thing?** If a screen got prettier and taller, it got worse.

**Do:**

- give the content a **measure** — it currently runs to the window's full width,
  so on a 2560px monitor a sub-line is 200 characters long and unreadable;
- build a real **type scale** with range at the top. The app has four steps
  (`--fs-xs` `--fs-sm` `--fs-md` `--fs-lg`) which is right for cards and has no
  display size at all, so every section header is the same size as a card
  heading;
- use the **space** a desktop has, in a rhythm rather than ad hoc margins;
- make each section's top a **header block** that states where you are;
- use **card grids** where you browse and **rows** where you scan;
- give the app a **footer**, which is the honest home for the build string and
  the one place "this browser only" belongs in full.

**Do not:**

- animate anything on a timer the reader did not start;
- add a marketing hero, a testimonial, a gradient mesh or a floating anything;
- centre body text, or set prose below 14px;
- replace a working control with a prettier one that does less;
- make the reader hover to discover a control (there is no hover on a touch
  screen, and this repo has already fixed that fault once).

---

## 3. The tasks, in the order worth doing them

### 3.1 The shell: the rail becomes a top bar, and the content gets a measure

This is the change that does most of the work, and it is the one decision in
this brief that the owner can reverse: **the left rail is the single most
app-like thing on the screen.** A website has a horizontal bar at the top, a
centred column under it, and a footer.

So, above 880px:

- `.rail` stops being a 232px sticky column and becomes a **full-width sticky
  bar**: the mark and name at the left, `#nav` as a horizontal row of tabs in
  the middle, the finder as a real-looking search control and the gear at the
  right. `#nav` keeps exactly the markup `renderNav` gives it.
- `.view` gets `width: min(1180px, 100% - 3rem); margin-inline: auto` and a
  generous top and bottom padding.
- `.railwork` (the Quick rows) has nowhere sensible to live in a bar, and
  should not become a dropdown nobody opens. **Every one of its six actions
  already exists as a button on the screen it belongs to**, so the rail's copy
  is the second one — delete it, and check each of the six is still reachable:
  Search or ask (the bar's own search), New project, New action, New script,
  Paste a reference, Export a bibliography, and How to use Mashghal (the gear
  or the footer).
- The footer is new: the build string, "this browser only", and links to the
  guide, Settings and the marketing page.

Below 880px, nothing changes. The phone already has a top bar; this makes the
desktop agree with it rather than diverge from it.

**Check before you start:** `railWork()` writes `#railWork` and `#railFoot` in
app code, and `navSnap`-style view state lives in module-level variables. Read
`railWork()` and the `.railtop` / `.railhead` rules first — the phone's
one-line header is built out of them and is easy to break by accident.

### 3.2 A type scale with a top end

Add two display steps above `--fs-lg` (something like `--fs-xl` and
`--fs-2xl`), define them with `clamp()` so they hold at 1180px and at 900px,
and use them for a section header and a record's title. Then go through every
place that currently reaches for `--fs-lg` and decide which of the three it
wants. Do not add a sixth step because one card looked wrong; a scale with
eleven sizes chosen a card at a time is exactly what this repo threw out once.

Prose measure: body text at 15–16px on a desktop, not 14. The app is read.

### 3.3 Section headers worth the name

Every tab currently opens with `pageHeadOf(title, sub, acts)` — a heading, a
sub-line and a row of buttons, all at card scale, immediately followed by the
strip of pages. On a website that top block is where you learn where you are.

Give it: the section name at display size, its one line at prose size on a
readable measure, the primary action as the one emphatic control, and the strip
below it as a proper tab strip rather than a row of small pills. One shape, one
function, every section — `pageHeadOf` is already that function, so this is a
restyle of one helper and its CSS rather than twenty edits.

### 3.4 Cards where you browse, rows where you scan

- **Card grids:** the Library's six kinds, By subject, Portfolio, CVs,
  Equipment, Outputs, Employers, Training, Education. These are collections you
  look through. A card carries the identity tile at size, the name, the
  sub-line, and its state pill.
- **Rows stay rows:** Actions, Hours' tables, the Timeline (it is a timeline),
  Projects (worst-first is the point, and a grid destroys an ordering).
- **`rowOf()` is one function that every list in the app draws through.** Add
  `cardOf()` beside it, reading the same record and the same
  `standOf`/`saysOf`, so a card and a row can never disagree about what a
  record is. Do not fork the data path to get a different shape.

### 3.5 A record's page as an article

A record page is the most website-like thing in the app already: a title, some
facts, then sections of related things. Make it read like one.

- The title at display size, with the kind and state as a line under it rather
  than a cramped row of pills.
- The facts table (`factRows`) is currently a two-column table at card scale.
  As a proper definition list with the label small-capped and the value at
  prose size, it becomes the thing you actually read.
- The linked sections ("Skills it used", "What it produced", "What it cites")
  become cards in a grid, each with its own heading — and every one keeps the
  small `×` that cuts the line, which is easy to lose in a restyle and is the
  only way to take a line back out.
- Two columns above about 1000px: the record and its facts on the left, what it
  is connected to on the right. One column below that.

### 3.6 Home as a front page

Home is already four cards and the right four questions. On a desktop it can be
the thing that makes the whole app feel designed: a greeting at display size,
the alarms full width, then the four cards in a two-by-two grid that uses the
width instead of stretching to it. Every card keeps its one route in — that
rule is tested, and a card that answers a question without being a way to it is
a dead end.

### 3.7 Empty states that look designed

There are about twenty of them and they all go through `emptyLines(pair)` — a
finding then the one thing to do. They are currently a panel of two grey lines.
Give that helper a shape: the finding at prose size, the instruction quieter
under it, and the button it names *beside* it rather than only mentioned. One
helper, twenty screens.

### 3.8 The finder as the app's search

It works and it is the best thing in the app. On a desktop bar it should look
like a site's search: a real-looking field at the centre or right of the bar
that opens the existing overlay. It must stay a `<button>` — a real `<input>`
in the bar would be a second place to type one query, and two copies of one
control is a fault this repo has paid for. Keep `Ctrl K`, keep `/`.

### 3.9 One press feel, defined once

`--t` is the only transition and it should be applied once to every tappable
thing rather than per component, with a small `:active` give, and
`prefers-reduced-motion` honoured once for all of it. Audit what is there: the
buttons respond, most cards do not, `<details>` snaps. A screen where half the
things react is what "unfinished" looks like without anybody being able to name
why.

### 3.10 What NOT to do, listed because each is tempting

- **Do not add a dashboard.** Home is four questions and they are the right
  four.
- **Do not add a sidebar back inside the content** to hold the strip. The strip
  is horizontal and belongs under the header.
- **Do not collapse the five tabs into three with dropdowns.** Five is already
  the answer to a bar a phone can carry, and a menu hides the thing the reader
  is looking for.
- **Do not put a search field and a command palette on the same screen.** One
  box, two behaviours, already built.
- **Do not restyle the dialogs' insides.** They are the shared runtime.

---

## 4. Content rules, for any words you change

- **Do not name a screen that does not exist.** The tabs are Home · Career ·
  Work · Library · Show; Settings and the guide are on the gear. Check before
  you write, and grep the old word after any rename.
- **A small count in prose is a word** ("four steps"); a figure in a tile or a
  heading stays a figure.
- **Never a bare plural after one.** "One reference", "one project".
- **Say it once.** A sub-line may not repeat the heading above it, and a
  record's own page may not print that record's name in every row's sub-line.
- **An empty list names the button that fills it**, and never "the button
  above".
- **A figure may never disagree with its own parts.** If a tile says four and
  the list under it has five rows, the tile is wrong, not the list.

---

## 5. How to verify, before saying it is done

No build step and no test runner: you drive the real app.

```
cd /home/user/Apps && python3 -m http.server 8899
NODE_PATH=$(npm root -g) node <script>.js
```

**The existing suites must all still pass, unchanged except where a selector
genuinely moved** — and a selector moving is not a regression, so fix it in the
same change:

- `m5smoke` — every screen, every strip page, every record page renders and
  throws nothing
- `m5cite` (51) — the bibliography: paste, all five formats, every scope
- `m5drive` (77) — a career built from an empty book, every action that moves a
  figure, removal with undo, a backup round-trip
- `m5phone` (170) — 390/360/320, the tab bar on one row, the focus ring, the
  focus trap, and a book where every countable thing is exactly one
- `guide` (29) — the guide names only controls that exist
- `m5look` (5,380 runs of text) — both themes, at rest and under the pointer

**Then write one new script, `shape.js`, and make it fail rather than print.**
It must assert what this brief actually claims:

1. above 1400px, the content column is **bounded** — read `.view`'s own
   `getBoundingClientRect().width` and fail if it is within 100px of the
   window;
2. the tabs are in a **horizontal** row above 880px (compare their `top`
   values) and still in one row at 390px;
3. no screen scrolls sideways at 1400, 1180, 900, 660, 390, 360 and 320px;
4. `#nav`'s markup still matches what `renderNav` emits — a literal string
   comparison against the runtime's template, so a rewrite of it is caught;
5. the six former Quick actions are each still reachable by a click somewhere,
   named one at a time and failing on the one that is not;
6. every section's header block exists and carries exactly one emphatic
   control;
7. the footer carries the build string;
8. the five-app runtime md5 is unchanged.

And then the thing no assertion does: **read every rendered screen**, in both
themes, at 1400px and at 390px, on an empty book and on the example. Every
fault this repo has found at this stage — a sentence that lost a word, a figure
disagreeing with the list under it, a count of nought in a clause, a screen
naming a place that no longer exists — was invisible to every assertion and
obvious on sight. Take screenshots and look at them.

---

## 6. Where the pieces are

```
/Apps/mashghal2/index.html      the app. This is what you edit.
/Apps/mashghal2.html            the marketing page. Out of scope here.
/Apps/mashghal2/press/*.jpg     screenshots of the app; regenerate, never crop
/Apps/mashghal2/docs/           this brief, and the earlier ones
/Apps/CLAUDE.md                 the repo's rules, and the reason most of the
                                constraints above exist. Read it.
```

The stylesheet is one `<style>` block near the top of the file; the app's own
code is the first `<script>`, the shared runtime is the block after the comment
banner in the same script, and the service-worker registration is the last
script. **Bump `CACHE` in `mashghal2/sw.js` to `pwa-mashghal2-v6` and the
`BUILD` string with it** — a fix that is not in a new cache is a fix the
browser never sees.

Four scans to run after any reshape, all documented in CLAUDE.md: orphan
functions, `data-act` without a handler, bare single-class CSS declared twice,
and CSS declared but never written. The last two catch the two faults a restyle
actually produces.

---

## 7. The one paragraph to keep in mind

The app's argument is that it will not tell you something it does not know: it
prints *"not said, and not inferred"* where another app prints a number. That
is a quiet, careful, specific thing, and the interface should look like it was
made by somebody who meant it — which is not the same as looking impressive.
Give it a measure, a scale, space and a consistent press, and it will read as
designed. Add a hero to a working screen and it will read as a brochure that
you have to work inside.
