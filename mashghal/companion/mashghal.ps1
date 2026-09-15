# Mashghal launcher — opens what a bench, a step, or a thing needs.
#
# THE RULE THIS FILE EXISTS TO ENFORCE: nothing executable ever arrives from
# the web. This handler is given one opaque id and does nothing with it but
# look it up in a file on this machine. Paths and URLs come only from that
# file, which you wrote by saving the launcher table out of the app. A handler
# that ran what a link told it to run would be a remote-code-execution hole
# registered on your own laptop.
#
# The id can name three kinds of thing now — a bench, a live step, or a thing
# with a path — and the URL shape has not changed by one character because of
# it. There is simply one more table on this machine to look in. Widening what
# a link may SAY is the thing that would be dangerous; widening what the
# machine already knows is not.

param([string]$Url)

$KitDir = Join-Path $env:USERPROFILE "Mashghal"

function Fail($msg) { Write-Host $msg -ForegroundColor Red; Start-Sleep -Seconds 6; exit 1 }

if (-not $Url) { Fail "Nothing was passed. Expected mashghal://enter/<id>." }

# Accept exactly one shape, and read exactly one field out of it.
if ($Url -notmatch '^mashghal://enter/([A-Za-z0-9]{1,64})/?$') {
  Fail "Refusing '$Url'. This handler accepts mashghal://enter/<id> and nothing else."
}
$WantId = $Matches[1]

if (-not (Test-Path $KitDir)) { Fail "No folder at $KitDir. Save the launcher table out of Mashghal into it." }

# Three tables, one shape each. A kit exported per mode has only 'benches',
# which is why that name is still read first and unchanged: an older file on
# somebody's machine has to keep working.
$entry = $null
foreach ($f in Get-ChildItem -Path $KitDir -Filter *.json -File) {
  try { $kit = Get-Content $f.FullName -Raw | ConvertFrom-Json } catch { continue }
  foreach ($table in @('benches', 'steps', 'things')) {
    $map = $kit.$table
    if (-not $map) { continue }
    if ($map.PSObject.Properties.Name -contains $WantId) {
      $entry = $map.$WantId
      break
    }
  }
  if ($entry) { break }
}
if (-not $entry) {
  Fail "Nothing called '$WantId' in any table under $KitDir. Save the launcher table again from Mashghal — it reads the file, not the app."
}

Write-Host "$($entry.label)" -ForegroundColor Cyan

foreach ($s in $entry.software) {
  if (-not $s.path) { Write-Host "  (skipped $($s.label) — no path recorded)"; continue }
  if (-not (Test-Path -LiteralPath $s.path)) {
    Write-Host "  MISSING  $($s.label): $($s.path)" -ForegroundColor Yellow
    continue
  }
  Write-Host "  opening  $($s.label)"
  Start-Process -FilePath $s.path
}

foreach ($l in $entry.links) {
  # Only schemes a browser would follow, so the lookup file cannot be turned
  # into an instruction to run a program.
  if ($l.url -notmatch '^(https?|obsidian|mailto|ms-outlook)://|^mailto:') {
    Write-Host "  REFUSED  $($l.label): unsupported scheme" -ForegroundColor Yellow
    continue
  }
  Write-Host "  opening  $($l.label)"
  Start-Process $l.url
}

Start-Sleep -Seconds 2
