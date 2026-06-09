$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = (Resolve-Path (Join-Path $ScriptDir "..")).Path

if (-not $env:HARNESS_DB) {
    $env:HARNESS_DB = Join-Path $RepoRoot "harness.db"
}

if (-not $env:HARNESS_RUST_CLI) {
    $env:HARNESS_RUST_CLI = Join-Path $RepoRoot "scripts\\bin\\harness-cli.exe"
}

$env:HARNESS_REPO_ROOT = $RepoRoot

if (-not (Test-Path $env:HARNESS_RUST_CLI)) {
    Write-Error "Harness CLI not found at $($env:HARNESS_RUST_CLI)."
    exit 1
}

& $env:HARNESS_RUST_CLI @args
exit $LASTEXITCODE
