$cargoPath = Join-Path $env:USERPROFILE ".cargo\bin"
$env:PATH = "$cargoPath;" + $env:PATH
Write-Host "PATH set. Testing cargo..."
& "$cargoPath\cargo.exe" --version
Write-Host "Testing pnpm..."
pnpm --version
Write-Host "All tests passed."
