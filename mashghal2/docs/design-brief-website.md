# Brief: make the Mashghal website come alive

**For:** whoever is asked next to work on the marketing site.
**Deliverable:** one file — `/Apps/mashghal2.html` — still with no dependencies.
**Not in scope:** the app itself (`/Apps/mashghal2/index.html`). If something here
would need an app change, say so and stop; do not change both in one pass.

Hand this whole document over as the instruction. It is written to be handed
over, so it states the constraints before the wishes — a brief that lists only
wishes gets a beautiful page that cannot ship.

---

## 0. What exists now, so you are not told to build it twice

`/Apps/mashghal2.html` is a finished, honest landing page. It has:

- a sticky header (mark, anchor nav, a theme toggle, and the way in);
- a hero with the one-sentence promise and four claims;
- eight real screenshots of the running app, in a browser frame, taken by
  `m5shots.js` and living in `mashghal2/press/`;
- the three worlds (Career · Work · Knowledge) as cards;
- the library's six kinds, then the bibliography with two real code blocks —
  BibTeX going in, the plain author–date list coming out;
- the evidence chain as an inline SVG;
- the command bar's question shapes as rows;
- two phone shots;
- four numbered getting-started steps;
- the four honest limits and a seven-question FAQ;
- a closing card and a footer.

It is **static**. Nothing on it moves except a one-shot fade-and-rise on scroll
and a theme toggle. That is what this brief is for.

**Read the page before changing it.** Then open the app itself and use it for
five minutes. Almost every bad idea for this site comes from not having done
the second thing.

---

## 1. The hard constraints. These are not preferences

Break one of these and the work cannot be merged.

1. **No dependencies. Nothing is fetched.** No CDN, no npm, no Google Fonts, no
   analytics, no fonts or scripts or stylesheets from another origin. The whole
   repository's first rule. The display face is already embedded as a base64
   woff2; reuse it, do not add a second one.
2. **One file.** Everything inline in `mashghal2.html`: markup, styles, script.
   The only external references are the `mashghal2/press/*.jpg` screenshots and
   the icons, which are in this repository.
3. **It must work with JavaScript off.** Every section must be readable and
   every link usable with no script at all. Anything the script adds is an
   enhancement layered on a page that was already complete. Concretely: an
   element that animates in must be **visible by default** and hidden only
   after the script has confirmed it can reveal it again — never the other way
   round. (The current `.rise` gets this *wrong on purpose* in the CSS and
   right in the reduced-motion query; fixing it properly is a task below.)
4. **`prefers-reduced-motion: reduce` is honoured for everything.** Not
   "reduced" — honoured. The reader sees the finished state immediately, with
   no movement, no parallax, no auto-advancing anything. This is one media
   query at the top of the stylesheet and it must cover any new animation you
   add. Test it: DevTools → Rendering → Emulate `prefers-reduced-motion`.
5. **Both themes are real.** The bare `:root` carries the dark values; a
   `prefers-color-scheme: light` query *and* `:root[data-theme="light"]` both
   carry the light ones, so the toggle wins in either direction. **Never
   hardcode a colour beside a token in the same rule** — that is how this
   repository once shipped a button whose label vanished at 1.01:1 in one theme.
   Every new colour is a token, defined in all three places.
6. **Every run of text clears 4.5:1** (3:1 for text at 24px, or 18.66px bold),
   in both themes, **at rest and under the pointer**. A hover state is where
   this breaks, because a rest state never shows it. Measure it; do not judge
   it by eye.
7. **Every interactive thing takes a visible focus ring** — the page's own, not
   the browser's `outline: auto`. Tab all the way through the page in both
   themes and watch where the focus actually goes. A scripted `.focus()` does
   **not** match `:focus-visible` after a mouse click, so press Tab.
8. **No horizontal scroll at 390, 360 and 320 px.** Assert it, do not eyeball
   it: `document.documentElement.scrollWidth <= window.innerWidth`. A diagram
   may scroll *inside its own box*; the document may not.
9. **Say nothing the app cannot do.** This is the one that matters most. There
   is no account, no sync, no notification and no server. If a section implies
   otherwise it is worse than a missing section. When you are unsure whether a
   claim is true, open the app and check, or cut the claim.
10. **No dark patterns.** No countdown, no fake scarcity, no "1,200 people are
    using this", no invented testimonial, no logo wall of institutions that
    have not agreed to be on it, no cookie banner (there are no cookies), no
    newsletter modal. There is nothing to sell here: the app is free and opens
    in one tap.

---

## 2. What "come alive" should mean here, and what it must not

The app this site is for is quiet, dense and honest. A site with bouncing
gradients in front of it would be a promise the product does not keep — and the
first thing a visitor does is press the button, so the site has about eight
seconds to be *clear*, not to be impressive.

So: **alive means it responds, not that it performs.**

**Do:**

- make things respond to the pointer and the keyboard immediately and
  consistently;
- let the page reveal itself as you move down it, once, gently;
- make the diagrams and numbers *do* the thing they describe;
- make the screenshots feel like the app rather than like pictures of it.

**Do not:**

- auto-play anything that loops for ever in the reader's peripheral vision;
- parallax the background against the content;
- animate text letter by letter;
- use a scroll-jacking full-page section snap;
- put a floating chat bubble, a spinning logo, or a particle field anywhere;
- animate anything on a timer the reader did not start.

**The test for any effect:** would it still be worth having on the fifth visit?
If it would be tiresome by then, it is decoration, and this page has none.

---

## 3. The tasks, in the order worth doing them

### 3.1 Fix the no-script fault first

`.rise` currently sets `opacity: 0` in CSS and the script adds `.in`. With
scripting off, those sections are invisible. Invert it: the stylesheet shows
everything, and the script adds a class to `<html>` (e.g. `.js`) as its very
first act; only `.js .rise` starts hidden. Then no reader ever loses content to
a blocked or failed script. Keep the reduced-motion query as the second guard.

### 3.2 A hero that demonstrates instead of describing

The strongest thing this product does is answer a question in words with no
model behind it. Build a **small, real, self-contained demo** in the hero, to
the right of the text (and below it on a phone):

- a text field that looks exactly like the app's command bar;
- four or five suggestion chips: `what needs me` · `what evidence do I have for
  photogrammetry` · `which projects used the orthophoto workflow` · `where is
  the Anfeh working folder`;
- pressing one types it out and shows the answer the real app gives, including
  the app's own `read as: …` line;
- a seeded fixture of about a dozen records inline in the page, so the demo
  answers from data rather than from a lookup table of strings;
- a line under it: **“This is the page's own copy of five of the app's question
  shapes. The app has eleven.”** — because the demo must not overstate what it
  is.

Constraints: it is typed by the reader or by pressing a chip, never on a timer.
It must be keyboard-operable. It must degrade to a static list of the example
questions with scripting off. And it must not claim to be the app — an "Open
Mashghal" button sits right beside it.

If that is too large, the fallback is much smaller and still good: make the
existing question rows in the **Ask it** section expand in place to show the
answer the app gives. Same rule about not overstating.

### 3.3 Make the evidence chain draw itself

The inline SVG in **Evidence** is the clearest thing on the page and it is
inert. When it scrolls into view, draw it: each box fades up in order, each
connector strokes on (`stroke-dasharray` / `stroke-dashoffset`), about 900 ms
for the whole chain, once, and never again on that visit.

Then make it *readable on purpose*: hovering or focusing a box dims the others
and prints one line of plain English underneath — *"Training taught this skill.
Two records in the example say so."* Each box becomes a `<button>` so a
keyboard reaches it. Reduced motion: the finished diagram, immediately, with
the hover behaviour intact.

### 3.4 Let the screenshots breathe

Eight JPEGs stacked down a page read as a gallery. Two changes:

- **One frame, several screens.** In the library section and again in the work
  section, put two or three shots behind a small tab strip inside the same
  browser frame (*References · Scripts · By subject*), so the frame stays put
  and its contents change. Cross-fade at 180 ms. Tabs are real buttons, with
  `aria-selected`, arrow-key navigation, and the first tab's image eagerly
  loaded and the rest lazy.
- **A caption that earns its place.** Every frame already has a `figcaption`
  that says something true and specific. Keep that discipline: a caption that
  only repeats the heading above it should be cut, not rewritten.

Do not add a lightbox. Do not add a carousel that advances itself.

### 3.5 Numbers that count up, but only the honest ones

There is one place a figure belongs on this page: a strip under the hero, or
before the limits, stating what the app actually is. Use figures that are true
and checkable, and **say where each comes from**:

- `16` record types
- `7` kinds of relationship
- `5` bibliography formats
- `0` network requests after the first load

Count them up over ~700 ms when they scroll into view, once. No fake precision,
no rounding up, and nothing about users, downloads or stars — there are none to
report, and inventing them would break §1.10.

### 3.6 One consistent press, everywhere

Adopt the app's own discipline: a single transition token (`--t`), applied once
to every tappable thing rather than per component, with a small `:active`
give. Audit what is there now — the buttons transition, the cards mostly do
not, the FAQ rows do not. Make it one rule and one feel. A `<details>` that
snaps open while the button beside it eases is the kind of inconsistency that
reads as unfinished without anybody being able to say why.

### 3.7 Progress, and where you are

Two small honest ones:

- a 2px reading-progress line under the sticky header, `transform: scaleX()`
  driven by scroll, `will-change: transform`, and nothing else;
- the anchor nav marks the section you are actually in (`IntersectionObserver`,
  not a scroll-position calculation), with `aria-current="true"` so it is not
  only a colour.

### 3.8 The theme toggle should feel like a switch

It works and it is abrupt. Cross-fade the page's colours over ~180 ms by
putting the transition on `background-color` and `color` for `body` and the
card surfaces — not `transition: all`, which will animate layout properties and
cost frames. Swap the icon between a sun and a moon so the control says which
state it is offering. Keep the pre-paint reader in `<head>`: without it the page
flashes the wrong theme, which is worse than an abrupt toggle.

### 3.9 The one thing to add if there is time

A **short section on what the record looks like** — the plan's own §32
argument, stated for a visitor rather than a developer: one professional
record, and the screens as questions over it. A small interactive diagram: the
sixteen record types as chips; press one and the lines to what it can connect
to light up, with the reverse reading printed. It is the app's model, made
touchable, and it is the honest answer to "why is this different from a to-do
list".

---

## 4. Content rules for anything you write

The site's voice is the app's voice, and it has rules:

- **State the limit before somebody finds it.** "A backup file is the only way
  it reaches a second machine" belongs *in* the FAQ, not behind it.
- **A small count in prose is a word** ("four steps", not "4 steps"); a figure
  in a tile or a heading stays a figure.
- **Never a bare plural after one.** "One reference", "one project".
- **No em dash where a full stop will do**, and never two in a sentence.
- **Do not name a screen that does not exist.** The tabs are Home · Career ·
  Work · Library · Show, and Settings is on the gear. Check before you write.
- **No "revolutionary", no "seamless", no "unleash", no "powerful".** Say what
  it does.
- Every heading should survive being read alone, because most will be.

---

## 5. How to verify, before saying it is done

The repository's own habits apply. There is no build step and no test runner;
you drive the real page.

```
cd /home/user/Apps && python3 -m http.server 8899
NODE_PATH=$(npm root -g) node <script>.js
```

Write one script, `site.js`, and make it fail rather than print. It must:

1. load the page with **JavaScript disabled** and assert every section's text
   is present and no element is invisible;
2. load it normally and assert **no `pageerror` and no console error** — a
   measuring script that does not check this passes a page that is throwing;
3. measure **every run of text** in both themes, at rest and under the pointer,
   and fail under 4.5:1 (3:1 for large text). Read `fill` for SVG text only:
   CSS `fill` applies to every element and its initial value is black, so
   reading it on an HTML `<p>` measures black text and reports a ratio that
   *inverts between the themes* — which is the tell that the harness is wrong
   and not the page;
4. press **Tab** all the way through in both themes and assert every stop has a
   visible ring that is not `outline-style: auto`. Read the style **after** the
   transition has finished, or you measure `0px` on everything;
5. assert **no horizontal scroll** at 1360, 900, 660, 390, 360 and 320 px;
6. emulate **reduced motion** and assert the final state is present with no
   transition running;
7. drive every new interactive thing — the tabs, the demo, the diagram — by
   keyboard alone;
8. assert the page still makes **zero network requests** besides its own
   images and icons (`page.on("request")`, and fail on any other origin);
9. print the total transferred bytes. The page is about 105 KB today, over half
   of it the embedded font. **Keep it under 350 KB** including the screenshots
   it eagerly loads; lazy-load the rest.

Then do the thing no assertion can do: **read the rendered page**, in both
themes, at 1360 px and at 390 px, top to bottom, out loud if you can. Every
fault this repository has found in its own copy at this stage — a sentence that
lost a word, a figure disagreeing with the list under it, a count of nought in
a clause, a screen named that no longer exists — was invisible to every
assertion and obvious on sight.

---

## 6. Where the pieces are

```
/Apps/mashghal2.html            the site. One file. This is what you edit.
/Apps/mashghal2/                the app. Do not edit it for this brief.
/Apps/mashghal2/press/*.jpg     the screenshots the site uses
/Apps/mashghal2/docs/           this brief, and the round-3 briefs
/Apps/CLAUDE.md                 the repository's rules. Read it; it is the
                                reason most of the constraints above exist.
```

The screenshots are regenerated, not hand-edited: the capture script drives the
real app, loads the example, waits for the toast to clear and shoots at a fixed
viewport. If a screen changes, re-run it rather than cropping an old picture.

---

## 7. The one paragraph to keep in mind

This app's whole argument is that it will not tell you something it does not
know. It prints "not said, and not inferred" where another app would print a
number. A site in front of it that oversells, auto-plays and invents social
proof would contradict the product on its own front page — and a visitor who
notices that has learned something true about neither. Make it feel alive by
making it *responsive, legible and specific*. That is the same taste the app
was built with, and it is the brief.
