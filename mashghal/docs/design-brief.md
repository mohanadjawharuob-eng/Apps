# Mashghal — design brief

This describes what the app *is* and what it has to make true. It deliberately
says nothing about how it currently looks. A working implementation exists, and
its visual decisions are withheld on purpose — the point of this brief is to see
what someone else would imagine, not to have the existing one described back.

Every constraint below is behavioural. Where something must be legible, the
brief says *what* has to be distinguishable and never *how*.

---

## Who it is for

One person: an archaeologist in Tripoli, Lebanon, doing an MA, running six
working relationships off one laptop and one phone. Paid GIS work for a
university project; a second university two floating days a week; occasional
heritage work that arrives without warning; a foundation; a thesis; and a life
underneath that belongs to none of them.

He is precise, technically literate, and designs things himself. He reads
node-graph editors professionally. He will catch a wrong figure and he will not
tolerate an app that is confidently wrong.

## The one sentence

**Work leaves a wake, and Mashghal holds the wake.**

Every stretch of work generates things that must follow it: a copy sent to
certain people, a file put somewhere, a person told, a decision taken, a
document produced. Today those live in memory and get dropped. The app's job is
to **generate them from the record** rather than ask anyone to remember them.

Asked directly what actually gets forgotten, he named three things, and they are
the whole design target:

1. **Chasing the people he sent things to.**
2. **Getting back to a piece of work and knowing where he was in it.**
3. **Filing, at the end.**

Anything that does not serve one of those three is not the point of this app.

## The model — four nouns, and no fifth

- **A board** is either a *procedure* (written once, reusable) or a *run* of one
  (one pass through it, with its own history).
- **A node** is either a *step* — something you do, send, wait on, decide, or
  file — or a *thing*: a person, a file, a photograph, a piece of equipment, a
  note.
- **An edge** is either *sequence* (this follows that) or *association* (these
  are related, with no ordering implied whatsoever).
- **A due** is a step of a live run that is waiting on you. It is always derived
  and never typed.

There is no "add task" button anywhere in the app, and there must not be one.
Everything that appears in a list of things-to-do was born from a procedure or
from the passage of time.

## The thing that makes it not a task manager

A procedure is **a graph, not a checklist**. This came from the owner's own
first example, a brochure, and a list could not hold it:

> design it → send a draft to two named people → fix their notes → send a second
> version and ask for a backup → **do we repeat the cycle or stop?** → if repeat,
> back to fixing notes → if stop, file the final version → watch the printing →
> archive

That contains a send that opens a wait on named people, a decision, and a loop
back to an earlier step. A second example — digitising aerial photographs across
areas and years — sits at **four steps at once**: two finished, one waiting on an
upload with nobody to chase, one in hand, and a dated meeting on Friday.

So the design has to carry, at minimum:

- a run that is at **several places at once**, not one cursor
- **sequence and association as visibly different relationships** — the point of
  association is that a reference photograph or a pair of headphones can hang off
  a step *without becoming something that comes before it*
- a **decision with named exits**, one of which goes backwards
- steps that wait on **people**, steps that wait on **nothing in particular**,
  and steps that happen **on a date**

The owner asked for this to be directly manipulable as a diagram, and gave his
own reference: **ArcGIS ModelBuilder**, which he uses professionally. Take that
as a statement about *how he thinks* — spatially, in connected objects he can
arrange — not as an instruction to copy a piece of software.

## What each screen has to answer

**The work itself.** Which steps exist, how they connect, what is done, what is
in hand, what is late, and what hangs off what. This is where a procedure is
written and where a run is read.

**What is waiting.** One question: *what is late and who am I waiting on?* Worst
first. This is the screen he opens standing up, and most days it is the only one
he needs.

**The vocabulary.** His employers, his kinds of work, the pairings of the two,
and the categories a board can belong to. Every one of these is his to add,
rename and remove — the app ships knowing none of them.

**Everything else about the book.** Backups, the worked example, erasing.

## What must be distinguishable at a glance

Stated as differences, not as colours or shapes:

- **Finished** work versus work **still live**. Finished work should recede;
  what is live should be the first thing the eye lands on.
- **Late** versus **merely waiting**. A step waiting three days with a five-day
  chase is fine. The same step at six days is not, and that difference must be
  the loudest thing on any screen it appears on. Late outranks everything.
- **Waiting on a person** versus **waiting on the world**. One can be chased,
  the other can only be watched.
- **A step** versus **a thing**. You should never mistake a person for a piece
  of work.
- **Sequence** versus **association**. See above — this is the distinction the
  whole model rests on.
- A run that is **finished but not filed**. It has nothing in hand and looks
  complete, and it is not. It must stay visible and slightly wrong-looking.

## Two surfaces, one app

**At the desk**, on a Windows laptop: this is where a procedure is written and
where the shape of a run is understood. Arranging things spatially is worth the
screen it takes.

**Standing up**, on the phone: this is where he asks what is late and marks
things done. He should never be asked to lay out a diagram on a phone. He should
still be able to *look* at one.

It is the same data and the same app, not two products.

## Rules that cannot be designed away

- **A run freezes its procedure the moment it starts.** Editing a procedure can
  never move a run already under way, and a run's own attachments never leak back
  into the procedure.
- **Nothing advances on its own.** A decision is answered by a person, never
  inferred from how long something has sat. Every change is a deliberate act.
- **A run cannot be closed while a filing step is undone.** The app says which
  step, and why. This is deliberately slightly annoying: filing is the thing that
  gets forgotten.
- **Silence is not always failure.** A step with no chase interval can wait for
  ever without being called late, because nobody ever said when to chase it. The
  app must not invent urgency.
- **Nothing is scored.** No streaks, no percentages-as-grades, no productivity
  number, no encouragement. He is not a project to be optimised.
- **It never guesses.** If it cannot work something out, it says so and stops. A
  plausible wrong figure is worse than a visible gap.
- **It cannot reach him.** There is no server and no notifications. Whatever is
  late is simply waiting when he next opens the app, and the app should be honest
  about that rather than implying it will chase him.

## Hard constraints on the build

- **One HTML file.** No framework, no build step, no bundler, no dependencies,
  nothing fetched from a CDN at runtime. Webfonts from a font host are the one
  permitted exception.
- **Entirely offline.** Installs to a phone home screen, opens with no network,
  stores everything in the browser on the device.
- **Dark.** He asked for it explicitly. Minimal, no decorative borders,
  purpose-built rather than a generic dashboard.
- **Works at 400px wide** and on a laptop screen, from the same markup.

## What it must not become

- A generic task manager with categories bolted on.
- Anything that auto-schedules, auto-fills, or acts before being told.
- Anything that treats an open-ended application or an unanswered email as a
  settled task with a due date.
- A dashboard of figures about himself.

## Open questions worth an opinion

1. **Repetition across a set.** Some work is one step run over a grid — a layer
   type, across areas, across three photographic years. Drawn as one node per
   cell that is forty nodes on one board. Is there a form that holds a small
   matrix inside a single step without becoming a spreadsheet?

2. **The shape of a decision.** A decision has named exits and one of them goes
   backwards, creating a visible cycle. How should a loop read, so that "we have
   been round this twice" is apparent without counting?

3. **Waiting, on a phone, in one screen.** Four or five live things across three
   or four runs, each with a different reason for waiting and a different clock.
   What is the least that can be shown and still be enough to act on?

4. **The two surfaces.** How much should the desk view and the phone view
   resemble each other? They answer genuinely different questions.

5. **How a procedure gets written in the first place.** The owner types his
   processes as prose with arrows between them. The gap between that and a
   connected diagram is the app's steepest moment, and nothing about it is
   settled.
