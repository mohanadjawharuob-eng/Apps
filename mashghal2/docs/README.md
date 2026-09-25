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

**The round-3 briefs are not copied here.** They live once, in
`../../mashghal/docs/`, because two copies of one document is the same fault
as two copies of one list. The launcher and the mailer are not copied either —
they are one handler and one workflow per machine, installed from
`../../mashghal/companion/` and `../../mashghal/mailer/`.

`../press/` holds the screenshots the marketing page uses. They are generated
by driving the real app, never hand-edited, and `../press/README.md` names
each one.
