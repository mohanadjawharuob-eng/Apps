# mashghal2 — what this directory is

Mashghal **rebuilt on two nouns**, beside the original rather than on top of
it, because the two are different apps and its owner asked to keep both.

`../../mashghal/` is the app as it grew: rev-1's switch-led spine with seven
rounds of features folded into it, fifteen state lists and seven tabs. This
one holds **a card and a link**, and nothing else.

## Why it is two nouns

Its owner said the round-3 rebuild did not feel right, and then agreed with
all four readings of why: it had no point of view, there was too much to
learn, it looked generic, and it was wrong about their work. Three of those
four are one fault with one cause.

Every round, a new document was read and the question asked was *"what does
this app already have that answers this?"* — so the record grew a list per
feature and the bar grew a tab per list. Jobs, projects, workflows, nodes,
edges, runs, runNodes, actions, assets, people, personLinks, schedule,
reports, timeEntries. **Fourteen nouns for one person's work**, each of them a
table whose name you had to learn before you could find anything.

All fourteen are the same two things:

- **A card.** Something with a name. A project, a step, somebody you are
  waiting on, a deadline, a laptop, a site, a scholarship.
- **A link.** Either **then** (this comes after that) or **with** (these
  belong together, in no particular order).

A card takes on **behaviour** rather than having a type — it waits on
someone, has a day, files the work away, holds other cards, opens something,
comes round again — and they compose. A card that waits can be late. A card
that files is what *unfiled* means. A card that holds is a project, or a
site, or a job, or a thesis, **by the same mechanism**, so the app never has
to know which. That is why it can no longer be wrong about the work: the only
thing it knows about a card's kind is the word its owner typed.

**Not one of the six behaviours is stored.** Four are read off the field that
carries them, so no flag can disagree with the field beside it; the two with
no field of their own — holding work, filing it away — are one stated `role`.

And the sections are gone. There is no table to navigate to, because there is
one list of cards: a screen is a **question** over it. What is late is a
list, because that is a list. How a piece of work goes is a **drafting
sheet**, because that is a shape.

## The screens

**Now · Sheet · Index · Ask**, with Settings on the gear.

| | the question | the rendering |
|---|---|---|
| **Now** | what needs me | a list, worst first |
| **Sheet** | how does this work go | ArcGIS ModelBuilder, scoped to one holder |
| **Index** | what have I got | rows, and the phone's reading of the sheet |
| **Ask** | anything else | a question over the same cards, saved as a lens |

## The look

A **drafting sheet**, not a dashboard: paper by day and a drafting table by
night, square corners, hairlines instead of fills, small-caps letterspaced
annotations, a survey grid that pans with the work, and a **title block** at
the foot of every screen the way every site drawing has one.

There is **one colour channel**, which is the model's own doing: a card's
kind is a word its owner typed, so identity is a glyph and a word and can
have no palette — which frees every hue for state. Oxide is late, brass is
drift, verdigris is in hand, and waiting carries no colour at all.

## What is different about it, mechanically

- **Its own storage, entirely.** `localStorage` is scoped to the SITE and not
  the folder, so a clone that kept the original's key would share one book
  with it and loading the sample in either would wipe the other — which is
  exactly what happened to Coffer across its two paths. Every name is its
  own: `mashghal2.v2`, `mashghal2.theme`.
- **A new key beside the old one.** `mashghal2.v1` is w3's book and holds a
  different shape. It is not read, not written and not lost: it is
  **offered**, once, and imported only on a tap — additively, and the import
  says what it cannot carry.
- **Its own service worker and scope.** `pwa-mashghal2-vN`, with the manifest
  `id` and `scope` at this directory, so a browser treats it as a separate
  installable app and neither install orphans the other.
- **Its own build string.** `w` for the rebuild, so a version can never be
  confused with the original's `vN`.

## The documents this came out of

They live once, in `../../mashghal/docs/`, and belong to both apps:

- `design-brief-round-3.md` — the screens, their regions and their exact copy
- `product-concept-round-3.md` — the relationship model and the reality rules
- `design-system.md` — the navy palette the original uses

Two copies of one document is the fault `CLAUDE.md` records about two copies
of one list, one level out. What this rebuild keeps from them is the
**discipline** — derived never stored, one selector per question, never guess
at anything, it proposes and never acts — and not their table structure,
which is the thing that went wrong.
