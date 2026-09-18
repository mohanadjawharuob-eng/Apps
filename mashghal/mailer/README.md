# The digest mail

The one thing that can reach you while the app is closed. A browser cannot send
email — there is no SMTP from a page, and no way to run code when the tab is
gone — so this runs on GitHub's schedule instead of on a server you keep alive.

## What it can and cannot say

It reads `digest.json` from your sync gist, which the app writes on every sync
and which contains **numbers only**: how many things are late, how far past the
worst one is, how many runs are unfiled, how much upkeep is overdue. No label,
no name, no note. The mail says *"3 things are late, the worst by 9 days"* and
tells you to open the app.

That is deliberate. The digest is not encrypted, because a scheduled job cannot
hold your passphrase without that being a worse risk than the file. So the file
is written to be worth nothing to anybody: it could leak in full and reveal
nothing about the work, the people, or the employers. The sealed book sits
beside it in the same gist and is never read here.

## Setting it up

1. Make a **private** repository. This is the part that holds a credential.
2. Save `digest.yml` as `.github/workflows/digest.yml` in it.
3. Add three repository secrets under Settings → Secrets and variables →
   Actions:
   - `GIST_ID` — the gist id Mashghal shows in Settings → Sync
   - `MAIL_USER` — the Gmail address to send from and to
   - `MAIL_PASS` — a Gmail **app password**, not your account password
4. Edit the `cron` line to your own morning. It is in UTC.

Nothing else in Mashghal depends on any of this. Skip it and what is late is
simply waiting when you next open the app, which the app says plainly.

## What this is not

- **It is not reliable.** Free-tier scheduled workflows are delayed under load,
  sometimes by hours, and GitHub disables them after 60 days of no activity in
  the repository. Treat the mail as a nudge that usually arrives, never as the
  thing that stops something being forgotten.
- **It is not a server.** It cannot read your book, change anything, or answer.
- **The app password is a credential.** It can send mail as you. It belongs in
  GitHub Secrets and nowhere else — never in Mashghal, never in the browser,
  and never in the public Apps repository.
