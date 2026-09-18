# Coffer — the papers

Nothing in here is served. The app is `../index.html`, its worker is `../sw.js`
and its manifest is `../manifest.webmanifest`; everything else about Coffer
lives here so that the app directory holds only what a browser loads.

| File | What it is |
|---|---|
| [`handbook.md`](./handbook.md) | What Coffer does and why each part exists — the one to read first |
| [`plan-format.md`](./plan-format.md) | The written plan format the importer accepts. Linked from the root README and documented again inside the import dialog |
| [`plan-prompt.md`](./plan-prompt.md) | Instructions to hand an AI so it writes a plan the importer will take |
| [`design-system.md`](./design-system.md) | The Press system: tokens, type ramp, the one shadow. `CLAUDE.md` points at this |
| [`design-brief-round-1.md`](./design-brief-round-1.md) | The brief that was sent for the first design round |
| [`design-brief-round-2.md`](./design-brief-round-2.md) | The second round — the three screens the first one did not cover |

The `.dc.html` bundles those briefs name (`Coffer B - Press.dc.html` and its
siblings) were the design tool's own files and were never committed here.
`design-system.md` is the record of what they said.
