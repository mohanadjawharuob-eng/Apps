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

The two pages in `design-rounds/` are the design tool's output and open
stand-alone: `palette-directions.html` is evening ink beside the quieter one,
and `board-five-ways.html` is the sheet in five treatments. Both expect a
`support.js` that was never committed and both pull webfonts from Google, so
they are history rather than anything the app depends on — which is why they do
not sit inside the served directory.
