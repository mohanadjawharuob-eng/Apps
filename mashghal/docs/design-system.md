# What came back, and what was chosen

`design-brief.md` went out deliberately withholding the existing look. Two
canvases came back: three whole-app directions and five treatments of the board.
`design/` holds both.

## The three directions

| | | verdict |
|---|---|---|
| **1a** *Mashghal — imagined* | mono throughout, cold grey on near-black | **eliminated** |
| **1b** *the quieter one* | warm paper, sentence case, one warm red | runner-up |
| **1c** *evening ink* | dark and soft, apricot and sage, panels that float | **chosen** |

**1a is gone from `design-rounds/palette-directions.html`.** It was the same mistake the
first build made: everything in one cold hue, state carried by hairlines and
uppercase mono labels, and the whole thing reading as instrument panel rather
than workshop. It was removed rather than kept for reference, because keeping it
invites drifting back toward it.

**1b is the better-looking of the two survivors and was still not chosen.** It
is paper — light, warm, sentence-case, genuinely lovely — and the owner asked
for dark in as many words. A design that contradicts a stated requirement is not
a preference to weigh; it is out. Worth revisiting only if that requirement
changes.

**1c was chosen** for three reasons beyond being the dark one:

1. **It answers the actual complaint.** State is carried by warmth and fill
   rather than by rules and labels, and panels sit on the sheet rather than
   being clamped into a grid.
2. **Its semantics are better than what was built.** Apricot replaces red, and
   **waiting is left uncoloured** — a neutral grey. That is more honest: a step
   waiting three days against a five-day chase is not a problem, and the first
   build coloured it amber as though it were. Only *late* takes colour.
3. **It has three steps of alarm, not one** — muted, mid and bright apricot — so
   "late" can be louder than "waiting" without reaching for red at all.

## The five boards

**4e *departure board* was chosen**, toned down to evening ink's palette. It is
the only dark one of the five and is essentially a louder sibling of 1c: flat
colour blocks, no outlines, readable across a room. Dropping its acid green and
signal orange for sage and apricot makes the two one thing rather than two.

The other four are all light, and two are worth naming:

- **4b *pinned cards*** — corkboard, index cards at angles, notes in Caveat. The
  most charming and the least keepable: it fights "minimal, no decorative
  borders" outright, and a handwriting face on real data ages badly.
- **4c *Swiss wall*** — white, hairline, one red. Beautiful, and the same trap as
  1a in a lighter skin.

Two things are taken from the others regardless of which shell is used:

- **4a's legend.** *"— comes after · ·· belongs with, no order"* in plain words
  at the foot of the sheet. The distinction the whole model rests on should be
  written down where the sheet can be read, not left to whoever remembers.
- **4c's habit of writing the state as a word** as well as a colour, so the
  board survives being looked at by someone who cannot separate the hues.

## The thing the design round settled

Every one of the five boards drew **a matrix inside one step** — "Digitise
layers" as a three-by-three of year against area, reading *three done, two in
hand, four to go*. That is an answer to the first open question in the brief:
the GIS grid is **not** one node per cell. It is one step holding a small
matrix, and five independent treatments all reached for it.

That is now the plan of record, and it is the one genuinely new capability the
design round asked for rather than restyled.

## Tokens to build against

Taken from 1c as drawn, not invented.

```
ground        #1b1e24      the sheet behind everything
panel         #1f242b      a card at rest
raised        #242932      a card lifted, a control
rule          #343943      a separation, used sparingly
ink           #e9e5dd      text
dim           #9a958a      secondary text, and WAITING
faint         #7d7970      tertiary, and "nobody to chase"
receded       #61656e      done work
apricot       #e0a06a      late — the only alarm
apricot-lift  #e8b183      late, when it has to shout
apricot-mute  #bb9573      the note under a late thing
apricot-deep  #58412c      a border on an apricot panel
sage          #7fb39a      in hand, healthy
sage-lift     #93c4ac      in hand, emphasised
sage-deep     #4d7566      a border on a sage panel
```

**State ladder**, in the order it must be legible:

| state | treatment |
|---|---|
| late | apricot, filled when it needs to shout |
| in hand | sage |
| waiting | **no colour** — dim grey |
| not started | faint |
| done | receded, and it sinks |

**Type.** Bricolage Grotesque 500 with negative tracking for display, names and
figures. Work Sans for the work. Newsreader for serif asides. Mono only for
what is genuinely machine-read — clocks, ids, paths.

Bricolage Grotesque is **embedded as a base64 woff2** (latin, weight 500, ~40KB)
because it is the face that carries the voice and the app must open with no
network. Work Sans and Newsreader are named first in their stacks and fall back
to system sans and Georgia — embedding all six faces came to 415KB of base64
against a 189KB app, which is not a trade worth making for two faces whose
fallbacks are close.

**Shape.** Panels round at 12px and float; pills fully round. **No shadow inside
a frame** — 1c uses none, and separation comes from fill.
