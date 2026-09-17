# tools

Generators. None of this ships, and nothing in an app loads it.

| File | What it makes |
|---|---|
| `mashghal-icon.html` | Mashghal's app icon. Open it and screenshot the SVG at 192 and 512 into `../icons/` |
| `mashghal-icon-maskable.html` | The same mark with the safe-area padding Android's maskable icons need |

Bustan's icons are generated instead by a Playwright script in the session
scratchpad, which writes straight back into `../icons/` — so never sweep the
scratchpad with `for f in *.js`, because that script is not a test and it
modifies committed files.
