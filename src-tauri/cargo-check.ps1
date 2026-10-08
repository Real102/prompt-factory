$cargoPath = Join-Path $env:USERPROFILE ".cargo\bin"
$env:PATH = "$cargoPath;" + $env:PATH
Set-Location "D:\work\Cortex\invention\prompt-factory\prompt-factory\src-tauri"
cargo check 2>&1
