$cargoPath = Join-Path $env:USERPROFILE ".cargo\bin"
$env:PATH = "$cargoPath;" + $env:PATH
$env:RUSTUP_HOME = Join-Path $env:USERPROFILE ".rustup"
$env:CARGO_HOME = Join-Path $env:USERPROFILE ".cargo"

Set-Location "D:\work\Cortex\invention\prompt-factory\prompt-factory"

Write-Host "=== Installing frontend dependencies ==="
pnpm install

Write-Host "=== Checking Rust compilation ==="
Set-Location "src-tauri"
cargo check 2>&1
$cargoExitCode = $LASTEXITCODE
Set-Location ".."

Write-Host "=== Done. cargo check exit code: $cargoExitCode ==="
