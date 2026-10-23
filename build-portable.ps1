$cargoPath = Join-Path $env:USERPROFILE ".cargo\bin"
$env:PATH = "$cargoPath;" + $env:PATH
$env:RUSTUP_HOME = Join-Path $env:USERPROFILE ".rustup"
$env:CARGO_HOME = Join-Path $env:USERPROFILE ".cargo"

$projectDir = "D:\work\Cortex\invention\prompt-factory\prompt-factory"
Set-Location $projectDir

Write-Host "=== 1/3 Building (tsc + vite + cargo --release) ==="
pnpm tauri build
if ($LASTEXITCODE -ne 0) {
  Write-Host "Build failed. Exit code: $LASTEXITCODE"
  exit 1
}

$exeName = "prompt-factory.exe"
$releaseDir = Join-Path $projectDir "src-tauri\target\release"
$exePath = Join-Path $releaseDir $exeName

if (!(Test-Path $exePath)) {
  Write-Host "ERROR: $exePath not found"
  exit 1
}

Write-Host "=== 2/3 Creating portable package ==="
$version = (Get-Content (Join-Path $projectDir "src-tauri\tauri.conf.json") | ConvertFrom-Json).version
$outDir = Join-Path $projectDir "build"
$pkgName = "prompt-factory-portable-v$version"
$pkgDir = Join-Path $outDir $pkgName

if (Test-Path $pkgDir) { Remove-Item $pkgDir -Recurse -Force }
New-Item -ItemType Directory -Path $outDir -Force | Out-Null
New-Item -ItemType Directory -Path $pkgDir -Force | Out-Null

Copy-Item -Path $exePath -Destination $pkgDir
New-Item -ItemType Directory -Path (Join-Path $pkgDir "data") -Force | Out-Null

Write-Host "=== 3/3 Zipping ==="
$zipPath = Join-Path $outDir "$pkgName.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path "$pkgDir\*" -DestinationPath $zipPath -CompressionLevel Optimal

Write-Host ""
Write-Host "=== Done ==="
Write-Host "Portable package: $zipPath"
Write-Host "Folder:           $pkgDir"
