# What to ask ChatGPT for — the round-3 UI/UX spec

Paste everything below the line into ChatGPT, in the same conversation that
produced the twelve-panel poster. It asks for a **build spec**, not another
picture: the poster has been implemented and the gap left is in the parts a
poster cannot carry — interaction, states, empty states, what happens on a
phone, and what each screen must NOT contain.

Keep this file. The answer that comes back belongs beside it as
`design-brief-round-3.md`.

---

You designed a twelve-panel concept poster for an app called **Mashghal** — "My
Archaeological Workspace". It has since been built as a real, working app, and
I need you to turn that poster into a **precise UI/UX specification I can hand
to a developer**. Not more pictures, not a mood board: words, per screen, at
the level of "this region holds this, in this order, and here is what it says
when it is empty".

## 1. What the app actually is

It is a **workspace for everything one person's professional work touches** —
not a task manager and not a calendar. Its owner is an archaeologist and
geospatial specialist working across several employers, a thesis, a visa and
freelance work at once. The app holds:

- the **projects** and the procedures/workflows that carry them out
- the **people** he is waiting on, and what is outstanding with each
- the **things** the work is made of and made with: datasets, orthophotos,
  point clouds, documents, sites, artifacts, features, surveys, laptops, a
  total station, field kit
- the **software, web services and files** he opens every day, as a launcher
- a **knowledge library** — and this is the part that needs to grow most; see
  §4
- **what the work produced**: what was filed, the written reports, the hours
- **hours**, owed to several claimants, derived from logged stretches of work

"A hub for everything related to work" is the owner's own phrase. Anything
your spec proposes should be judged against that, not against "a nicer to-do
list".

## 2. Hard constraints — a spec that breaks these cannot be built

These are not preferences. They are what the app is:

1. **One HTML file, offline, no dependencies.** No React, no Tailwind, no
   icon library, no Google Fonts, no CDN of any kind, nothing installed,
   nothing fetched at runtime. Every icon is hand-written inline SVG. Every
   font is either a system stack or already embedded.
2. **No server and no account.** Everything lives in the browser on that
   device. Sync is optional and goes through an encrypted GitHub gist.
   There is no backend to call, no API key anywhere, no login, no "share
   with your team", no notifications, no AI/model features. Do not propose
   any of those.
3. **Nothing is invented.** The app never estimates, averages, or fills a gap
   with a plausible number. Where a fact is unknown the screen says so in
   words. Do not design anything that implies data the app cannot know
   (activity heatmaps of "productivity", predicted completion dates,
   automatic status inference from elapsed time).
4. **Figures are derived, never stored.** Any number on a screen is computed
   from the record at render time. Two screens showing the same figure must
   be showing the same computation.
5. **Works on a 390px phone**, one-handed, in bright sun, offline. Seven
   bottom tabs is the measured maximum. Anything that only works at 1440px
   is not a design, it is half of one.
6. **Light and dark are both first-class**, with real contrast (4.5:1 for
   body text, measured).

## 3. What exists today — so you spec the delta, not a rebuild

Tabs (bottom bar on a phone, sidebar on a laptop):

| Section | Holds |
|---|---|
| **Home** | mission control: what is late today, active projects with progress, one-tap launchers, where you were, recent things |
| **Projects** | every project, worst-first; a second page lists Jobs (employers). A project opens on Overview · Work · Tasks · Things · People |
| **Workflows** | procedures and runs of them, drawn on an ArcGIS-ModelBuilder-style node canvas (steps are cut-corner rectangles, things are ovals, two edge kinds: sequence and association) |
| **Actions** | what happens next: what is late, what is unfiled, what is in your hands, what you are waiting on, typed tasks, recurring upkeep |
| **Assets** | one registry read six ways — Devices · Apps · Sites · Files · Library · Connections. A row opens the thing; `openHandle()` decides whether that means a URL, a local launcher, or copy-the-path |
| **Schedule** | a month grid plus an Upcoming list, all derived; nothing can be typed into it |
| **Outputs** | what the work produced: Filed · Reports · Hours |

Plus a workbench (things, people, upkeep, vocabulary), a command bar
(Ctrl+K) that searches the record and answers ten shapes of question
deterministically, and Settings on a gear.

## 4. The Library is the part that must grow — spec it first and in most detail

Today the Library is the same asset registry read by subject: you write topics
onto a dataset or a document and the Library lists subjects, then what is under
each. That is too thin for what it is for.

What it should become is **the place where everything reusable lives** —
knowledge that outlives any one project:

- **Excel/spreadsheet formulas** — the array formula that reshapes a survey
  export, with a note on what it assumes
- **Scripts**: Python that pulls EXIF out of a folder of photos, a batch
  rename, an ArcPy snippet, a GDAL command line, a PowerShell one-liner
- **Methods and procedures written as prose** — how to georeference a 1916
  aerial, the workflow for a bathymetric survey
- **References**: papers, manuals, standards, tutorials, links
- **Templates**: a report skeleton, a metadata sheet, a naming convention

So the spec needs to answer, concretely:

- What is the **shape of one library entry**? A snippet of code and a PDF
  reference are not the same object — do they share a card, and what does
  each show?
- How is a code snippet **displayed** (monospace block, syntax colour,
  wrapping, how long before it collapses) and how is it **used** — copy to
  clipboard is obvious; what else?
- How is it **organised** — by subject, by language, by what it is for? Both?
  What does the landing screen of the Library look like, and what does the
  reader see before they have typed anything?
- How do you **find the one you want** six months later, when you remember
  "the thing that renames photos" and nothing else?
- How does an entry connect to the rest of the app — the project it came out
  of, the dataset it was written for, the workflow step it belongs to?
- What does it look like on a **phone**, where a 40-line script cannot be read?
- What is the **empty state**, and what is the first thing a new reader is
  invited to put in?

Be opinionated. Say what you would cut.

## 5. What I need per section

For **each** of: Home · Projects (list, and a project's own pages) · Workflows
(the list, and the node canvas) · Actions · Assets (each of its six sections) ·
Schedule · Outputs · the Library (§4) · the command bar · Settings — write:

1. **The one question this screen answers.** One sentence. If you cannot
   write it, the screen should not exist.
2. **Layout regions, in order**, at laptop width: what is at the top, what is
   beside what, what is below the fold. Say which region is the biggest and
   why.
3. **Every component on it**, described as: what it shows, where its data
   comes from, and what happens when you tap it.
4. **The row/card anatomy** — for each list on that screen, what is on the
   left, in the middle, on the right; what is a pill, what is an icon, what is
   a figure.
5. **States**: loading is irrelevant (everything is local), so instead —
   empty, one item, many items, an error or a refusal, and the "this is late /
   this is drifting / this is fine" states.
6. **What it says when it is empty.** Exact words, not "an empty state".
7. **The phone layout at 390px**: what stacks, what is dropped, what becomes
   a sheet.
8. **What must NOT be on this screen**, and why — the thing a designer would
   reflexively add that would be wrong here.

## 6. Visual direction — the part the poster carried best

The built app uses a deep navy dark theme with a real light theme, one
identity-colour-per-section rule, and state shown as a coloured left edge plus
a pill carrying a word. Tell me, specifically:

- Where the app should be **more visual than it is**: which screens are
  currently a wall of rows that should carry a chart, a thumbnail, a map
  crop, a progress shape, a diagram.
- Exactly **what those visuals should be**, given that they can only be drawn
  with inline SVG/CSS from data the app already holds. (Good: a project's
  progress as a shape; a survey's extent as a sparkline; a file's provenance
  as a small graph. Bad: a photo of a map, an illustration, an icon set.)
- **Iconography**: describe each icon in words (what it depicts) rather than
  naming a library, because every one has to be drawn by hand.
- **Density**: this app leans dense. Say where density is right and where it
  should open out.
- **Motion**: there is one 120ms transition and `prefers-reduced-motion` is
  honoured. Say if anything deserves more, and what.

## 7. Interactions — the thing a poster cannot show

Be explicit about:

- What a **tap on a row** does, everywhere — open a page, open the thing, or
  select it. (Today it differs by section, deliberately; tell me if that is
  wrong.)
- **Drag**: what can be dragged, and onto what.
- **Keyboard**: the whole app is operable from a keyboard today, including the
  node canvas. Say what shortcuts should exist that do not.
- **The node canvas specifically**: adding a node, connecting two, branching,
  looping back, selecting, and what a long-press or right-click should do.
- **Long-press / swipe on a phone**: what, if anything.
- **Undo**: every destructive act currently confirms and offers an undo in a
  toast. Say where that is the wrong shape.

## 8. Format of your answer

Markdown. One `##` heading per section from §5, in that order. Inside each,
the eight numbered headings from §5, in that order. Use tables for row
anatomy. Quote **exact strings** for anything that appears on screen — I will
use them verbatim. Where you are unsure, say "either X or Y, and here is how
to choose" rather than picking silently.

Do not restate the poster. Assume I have it in front of me. Start from what it
could not say.
