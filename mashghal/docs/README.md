# Mashghal — the papers

Nothing in here is served. The app is `../index.html`, its worker is `../sw.js`
and its manifest is `../manifest.webmanifest`. Two directories beside them are
also not the app but *are* meant to be taken away and installed:
`../companion/` (the `mashghal://` handler for Windows) and `../mailer/` (the
scheduled digest).

| File | What it is |
|---|---|
| [`design-brief.md`](./design-brief.md) | The brief that went out, deliberately withholding the existing look |
| [`design-system.md`](./design-system.md) | What came back and what was chosen. The deep-navy palette, the two colour channels, the state ladder |
| [`design-rounds/`](./design-rounds/) | The rounds themselves, as they were reviewed |
| [`spec-request-round-3.md`](./spec-request-round-3.md) | What to ask the poster's author for next: a per-screen build spec, with the constraints that make an answer buildable |
| [`design-brief-round-3.md`](./design-brief-round-3.md) | What came back: the per-screen spec — one question per screen, its regions in order, its row anatomy, its states and its exact empty-state strings |
| [`product-concept-round-3.md`](./product-concept-round-3.md) | What came back beside it: what the system IS — the relationship model, the node types, the data model, and what Mashghal is NOT |

The two round-3 files are **briefs, not documentation**. Where either
disagrees with `../../CLAUDE.md`, CLAUDE.md is the app and they are the ask;
several of their proposals were folded or refused on purpose and the reasons
are in CLAUDE.md. They arrived as `.docx` and were converted whole — every
paragraph of both originals is present, checked — with the tree diagrams and
record schemas fenced as code, because Word had styled each of their lines as
a separate Heading 1.

The two pages in `design-rounds/` are the design tool's output and open
stand-alone: `palette-directions.html` is evening ink beside the quieter one,
and `board-five-ways.html` is the sheet in five treatments. Both expect a
`support.js` that was never committed and both pull webfonts from Google, so
they are history rather than anything the app depends on — which is why they do
not sit inside the served directory.
