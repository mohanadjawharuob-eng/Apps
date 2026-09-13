# Mashghal launcher — opens what a bench needs.
#
# THE RULE THIS FILE EXISTS TO ENFORCE: nothing executable ever arrives from
# the web. This handler is given one opaque bench id and does nothing with it
# but look it up in a file on this machine. Paths and URLs come only from that
# file, which you wrote by exporting a kit from the app. A handler that ran
# what a link told it to run would be a remote-code-execution hole registered
# on your own laptop.

param([string]$Url)

$KitDir = Join-Path $env:USERPROFILE "Mashghal"

function Fail($msg) { Write-Host $msg -ForegroundColor Red; Start-Sleep -Seconds 6; exit 1 }

if (-not $Url) { Fail "Nothing was passed. Expected mashghal://enter/<id>." }

# Accept exactly one shape, and read exactly one field out of it.
if ($Url -notmatch '^mashghal://enter/([A-Za-z0-9]{1,64})/?$') {
  Fail "Refusing '$Url'. This handler accepts mashghal://enter/<id> and nothing else."
}
$BenchId = $Matches[1]

if (-not (Test-Path $KitDir)) { Fail "No kit folder at $KitDir. Export a kit from Mashghal and save it there." }

$bench = $null
foreach ($f in Get-ChildItem -Path $KitDir -Filter *.json -File) {
  try { $kit = Get-Content $f.FullName -Raw | ConvertFrom-Json } catch { continue }
  if ($kit.benches -and $kit.benches.PSObject.Properties.Name -contains $BenchId) {
    $bench = $kit.benches.$BenchId
    break
  }
}
if (-not $bench) { Fail "No bench '$BenchId' in any kit under $KitDir. Re-export the kit from Mashghal." }

Write-Host "Bench: $($bench.label)" -ForegroundColor Cyan

foreach ($s in $bench.software) {
  if (-not $s.path) { Write-Host "  (skipped $($s.label) — no path recorded)"; continue }
  if (-not (Test-Path -LiteralPath $s.path)) {
    Write-Host "  MISSING  $($s.label): $($s.path)" -ForegroundColor Yellow
    continue
  }
  Write-Host "  opening  $($s.label)"
  Start-Process -FilePath $s.path
}

foreach ($l in $bench.links) {
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
