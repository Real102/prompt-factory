$cargoPath = Join-Path $env:USERPROFILE ".cargo\bin"
$env:PATH = "$cargoPath;" + $env:PATH
$env:RUSTUP_HOME = Join-Path $env:USERPROFILE ".rustup"
$env:CARGO_HOME = Join-Path $env:USERPROFILE ".cargo"

Set-Location "D:\work\Cortex\invention\prompt-factory\prompt-factory\src-tauri"

Write-Host "=== Running cargo check ==="
cargo check 2>&1
Write-Host "=== Exit code: $LASTEXITCODE ==="
