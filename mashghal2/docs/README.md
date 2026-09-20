# mashghal2 — what this directory is

The **round-3 rebuild** of Mashghal, built beside the original rather than on
top of it, because the two are different apps and its owner asked to keep
both.

`../../mashghal/` is the app as it grew: rev-1's switch-led spine with seven
rounds of features folded into it. This one starts from the two round-3
documents and follows their §32 — *build canonical records, relationships and
shared derived selectors first; then make each screen a view over that same
underlying workspace* — which is the instruction the original inverted.

**The briefs are not copied here.** They live once, in
`../../mashghal/docs/`, and are the same documents for both apps:

- `design-brief-round-3.md` — the screens, their regions, their state
  vocabulary and their exact copy (133 specified strings)
- `product-concept-round-3.md` — what the system IS: the relationship model,
  the node types, the data model, the reality rules
- `design-system.md` — the navy palette, which both apps share

Two copies of one document is the fault `CLAUDE.md` records about two copies
of one list, one level out.

## What is different about it, mechanically

- **Its own storage, entirely.** `localStorage` is scoped to the SITE and not
  the folder, so a clone that kept `mashghal.v1` would share one book with the
  original and loading the sample in either would wipe the other — which is
  exactly what happened to Coffer across its two paths. Every name is its own:
  `mashghal2.v1`, `mashghal2.theme`, `mashghal2.sync.*`, `mashghal2-pics`,
  `mashghal2-backups`.
- **Its own service worker and scope.** `pwa-mashghal2-vN`, with the manifest
  `id` and `scope` at this directory, so a browser treats it as a separate
  installable app and neither install orphans the other.
- **Its own build string.** `w` for the workspace rebuild, so a version can
  never be confused with the original's `vN`.
- **The launcher and the mailer are not duplicated** — they are one handler
  and one workflow per machine, installed from `../../mashghal/companion/` and
  `../../mashghal/mailer/`.
