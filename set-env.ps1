$cargoPath = Join-Path $env:USERPROFILE ".cargo\bin"
$env:PATH = "$cargoPath;" + $env:PATH
$env:RUSTUP_HOME = Join-Path $env:USERPROFILE ".rustup"
$env:CARGO_HOME = Join-Path $env:USERPROFILE ".cargo"
