# mashghal2 — what this directory is

Mashghal rebuilt as a **personal career and work hub**, beside the original
rather than on top of it, because the two are different apps and their owner
asked to keep both.

`../../mashghal/` is the app as it grew: rev-1's switch-led spine with seven
rounds of features folded into it. This one is built the other way round, in
the order the round-3 brief's §32 asks for in one sentence — *build canonical
records, relationships and shared derived selectors first; then make each
screen a view over that same underlying workspace.*

## The shape

**Three worlds, one record.**

- **Career** — who you are professionally: profile, roles and the employers
  that hold them, education, training, skills, and a timeline derived from the
  dates already on all of those.
- **Work** — what you are doing and have done: projects, workflows and the
  runs that are one execution of them, actions, people, equipment, outputs,
  employers, hours.
- **Knowledge** — the library: scripts · formulas · methods · templates ·
  references · places, also readable by subject.

**And across all three**, the Portfolio and as many CVs as you have readers —
both **selections over the record, never copies of it**, so correcting a date
once corrects it everywhere.

One relationship layer joins them: seven kinds of line (`uses`, `learned`,
`about`, `shows`, `picks`, `cites`, `withp`), each stated once in one
direction with the reverse derived, so the two can never disagree.

Nothing is scored. A skill's level is typed or blank; what the app derives is
the *evidence* — which training taught it, which projects used it, which
outputs demonstrate it — because that is checkable and a number is not.

## The bibliography

The part asked for by name. A reference is a real citation record — eighteen
fields, eleven types — because a bibliography cannot be assembled out of
prose. BibTeX and RIS paste **in**, several at once, brace-balanced, and what
cannot be placed is named rather than dropped. Five formats come **out** (a
plain author–date list, BibTeX, RIS, CSL-JSON, bare cite keys) over five
scopes (all · by subject · used on a project · about a skill · cited by one
output). The one human-readable list says in its own header that it is *not*
APA, MLA, Chicago or Harvard, because a hand-rolled named style is a plausible
wrong answer and this app would rather show a visible limit.

## Where your stuff is

Every record can say where its documents live — `path` for a folder or file
on the machine, `url` for a link — and the **Directory** tab is every one of
those in one place. It is **derived, not a list you maintain**: it fills
itself from those fields plus `state.assets`, which is the stated half (a
drive, a bookmark, a folder belonging to no project). So a project's folder
cannot be in the Directory and missing from the project.

Its chips are `openHandle()`'s own ladder — **Links** open, **Files and
folders** are copy-only because a page served over https may not open a local
file, **Nothing to open** is a device or a place — so they partition the list
and All is their sum. On this one screen the row *is* the open control, which
is the only place in the app where a row does not navigate.

## Two shapes, one switch

Every list draws as rows or as cards, and the switch sits above the list. A
list answers *what is next*; cards answer *what have I got*. It is
`settings.shape` — **a setting, not view state** — because it is how you
like to read rather than where you have navigated, so it survives a reload.
What you type into a sift box is the opposite and resets on a tab press.

## Feeding it from a file

Typing a career in one record at a time is the honest way to build one and a
poor way to *start* one, so the book takes a JSON file: **Settings → Feed it
from a file**, or the finder. `import-format.md` is the schema, and the
dialog's own **What the file looks like** prints the same table, built from the
code that validates the file so the two cannot disagree.

Four rules, each of them a fault this repo has already paid for once:

- **It is additive, and that is not a restore.** A backup replaces the book;
  this adds to it. Handed a backup it refuses and points at Restore, because
  adding one to a book that already holds it would duplicate every record
  without a word.
- **A reference is a name or a key, never an id.** Nobody writing a file can
  know the app's own ids, so `"role": "GIS analyst"` resolves — against the
  file *and* against what is already in the book, which is what makes a second
  file add to the first rather than fork it.
- **The same name is the same record.** A row whose name is already there is
  reused, not copied, and the report marks it *Already here*.
- **It names what it cannot place.** An unknown list, an unknown field, a date
  that is not a date, a reference to nothing: each is reported against its own
  row, and the message says whether the row still comes in or not.

Nothing is written until the whole report has been read, and the apply hands
back an undo on the message it prints.

## Its own storage, and why that is not cosmetic

`localStorage` is scoped to the **site**, not the folder — which is exactly
how Coffer's two paths came to share one ledger, and how loading the example
in one wiped the real book in the other. So every name here is its own:
`mashghal2.hub`, `mashghal2.theme`, and its own `pwa-mashghal2-vN` cache with
a manifest `id` and `scope` at its own directory. The build string is `wN`
rather than `vN`, so a version of the rebuild can never be mistaken for a
version of the original.

The older books written by earlier rounds of this rebuild (`mashghal2.v1`,
`mashghal2.v2`) are **offered, never read**: not loaded, not written to, not
lost. Importing is additive and lossy, and the dialog names what it cannot
carry before it runs.

## What is in this folder

| file | what it is |
|---|---|
| `README.md` | this |
| `design-brief-website.md` | a brief for the **marketing page** at `/Apps/mashghal2.html` — the showcase, with the app explicitly out of scope |
| `design-brief-app-as-site.md` | a brief for **the app's own desktop interface**, to read like a website rather than like an app |
| `import-format.md` | the JSON a file can carry, for whoever is writing one |

**The round-3 briefs are not copied here.** They live once, in
`../../mashghal/docs/`, because two copies of one document is the same fault
as two copies of one list. The launcher and the mailer are not copied either —
they are one handler and one workflow per machine, installed from
`../../mashghal/companion/` and `../../mashghal/mailer/`.

`../press/` holds the screenshots the marketing page uses. They are generated
by driving the real app, never hand-edited, and `../press/README.md` names
each one.
