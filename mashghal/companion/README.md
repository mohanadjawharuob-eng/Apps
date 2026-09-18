# The launcher

A browser cannot open ArcGIS Pro, and **it cannot open a file on your machine
either.** This is the smallest thing that can, and it is deliberately not an
application: a registry entry and one PowerShell script, both of which you can
read in Notepad in a minute.

It is optional. Everything else in Mashghal works without it, and the app falls
back to copying a path for you to paste into Win+R.

## Why a path does nothing without this

If you have noticed that **a link opens and a file does not**, nothing is
broken. A page served over `https://` is not allowed to navigate to
`file:///C:/…` — every browser blocks it, and Chrome blocks it *silently*, so
the tap does nothing at all and says nothing about why. It is a security rule
older than this app: a web page that could open arbitrary files on your disk
would be a very bad idea, so the browser simply refuses.

That leaves exactly two honest routes, and the Repo tab shows whichever one
you are on rather than offering a control that quietly fails:

| | what a path does |
|---|---|
| **launcher off** | the row copies the path, and says why it cannot open it |
| **launcher on** | the row *is* `mashghal://enter/<id>`, and one tap opens it |

A website or a Drive link needs none of this and never did — it is an ordinary
link, and the app has always opened those in one tap. This page is about the
other half.

## The rule it exists to enforce

**Nothing executable ever arrives from the web.** A `mashghal://` link carries
one opaque id and nothing else. The script does nothing with that id but look it
up in a file already on your machine. Every path and URL it opens comes from
that file, which you wrote by saving the launcher table out of the app.

The id can name three kinds of thing, and the URL shape is identical for all
three — that is the whole point. Widening what a link may *say* would be
dangerous; widening what the machine already knows is not.

| The id names | What opens |
|---|---|
| a **bench** | everything the craft hands you: its programs and its links |
| a **live step** | the file, the photograph and the filtered inbox linked to *that* piece of work |
| a **thing** | one registry entry with a path or a share link |

The step case is the one worth having. A bench opens ArcGIS Pro and three
bookmarks; a step opens the project file for area 1, the reference photograph
and the mail search for the person you are waiting on, and nothing else.

A handler that ran what a link told it to run would be a remote-code-execution
hole registered on your own laptop, reachable by any page you visit. This one
refuses any URL that is not exactly `mashghal://enter/<id>`, refuses an id that
is not plain letters and digits, and refuses a link whose scheme is not one a
browser would follow anyway.

## Setting it up

1. Make a folder `Mashghal` in your user folder — `C:\Users\<you>\Mashghal`.
2. Put `mashghal.ps1` in it.
3. In Mashghal, open **Settings → The launcher → Save the launcher table**, and
   put `mashghal-launch.json` into that same folder. Do this again whenever you
   change a path, add a thing, or start a run; the script reads the file, not
   the app. (The per-mode export under **the workbench → Words → a mode → For
   the launcher** still works and still covers benches, if you would rather keep
   one file per craft.)
4. Double-click `mashghal.reg` and confirm. It writes under `HKEY_CURRENT_USER`
   only, so it needs no administrator.
5. In **Settings → The launcher**, turn on the launch links.

The first time you use one, Chrome asks whether to open Mashghal. Tick the box
and it stops asking.

## When it does not work

- **Chrome never asks.** The registry entry did not take. Check
  `HKEY_CURRENT_USER\Software\Classes\mashghal` exists.
- **A window flashes and closes.** Run the script by hand to see what it says:
  `powershell -ExecutionPolicy Bypass -File $env:USERPROFILE\Mashghal\mashghal.ps1 -Url "mashghal://enter/<id>"`
- **"Nothing called … in any table".** The saved file is stale — the step you
  pressed did not exist when you saved it. Save the table again. Only **open**
  runs contribute steps, deliberately: a closed run's paths are history, and a
  lookup table is not an archive.
- **A managed laptop.** Group policy can block both custom scheme handlers and
  unsigned scripts, and there is nothing this script can do about that. Use the
  copy-path buttons instead; they need nothing installed.

## What is in the file

Labels, paths and URLs. No notes, no dates, no names of people, nothing about
how anything is going. It sits unencrypted in your user folder because the
script has to read it without a passphrase, so it is written to be worth
little: someone who reads it learns which programs you use and where your
project files live, and nothing about the work itself.

## What it does not do

It does not talk to the app, report back, or run on a schedule. It opens things
and exits. The app never learns whether it worked.
