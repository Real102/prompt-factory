$cargoPath = Join-Path $env:USERPROFILE ".cargo\bin"
$env:PATH = "$cargoPath;" + $env:PATH

Set-Location "D:\work\Cortex\invention\prompt-factory\prompt-factory"

Write-Host "=== TypeScript type check ==="
pnpm exec tsc --noEmit 2>&1
$tscExit = $LASTEXITCODE
Write-Host "=== tsc exit code: $tscExit ==="
