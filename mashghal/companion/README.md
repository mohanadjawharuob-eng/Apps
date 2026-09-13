# The launcher

A browser cannot open ArcGIS Pro. This is the smallest thing that can, and it
is deliberately not an application: a registry entry and one PowerShell script,
both of which you can read in Notepad in a minute.

It is optional. Everything else in Mashghal works without it, and the app falls
back to copying a path for you to paste into Win+R.

## The rule it exists to enforce

**Nothing executable ever arrives from the web.** A `mashghal://` link carries
one opaque bench id and nothing else. The script does nothing with that id but
look it up in a file already on your machine. Every path and URL it opens comes
from that file, which you wrote by exporting a kit out of the app.

A handler that ran what a link told it to run would be a remote-code-execution
hole registered on your own laptop, reachable by any page you visit. This one
refuses any URL that is not exactly `mashghal://enter/<id>`, refuses an id that
is not plain letters and digits, and refuses a link whose scheme is not one a
browser would follow anyway.

## Setting it up

1. Make a folder `Mashghal` in your user folder — `C:\Users\<you>\Mashghal`.
2. Put `mashghal.ps1` in it.
3. In Mashghal, open **Kit → a mode → For the launcher**, and save the exported
   `.json` into that same folder. Do this again whenever you change a kit; the
   script reads the file, not the app.
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
- **"No bench … in any kit".** The exported file is stale. Export it again.
- **A managed laptop.** Group policy can block both custom scheme handlers and
  unsigned scripts, and there is nothing this script can do about that. Use the
  copy-path buttons instead; they need nothing installed.

## What it does not do

It does not talk to the app, report back, or run on a schedule. It opens things
and exits. The app never learns whether it worked.
