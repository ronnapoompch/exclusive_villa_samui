param([string]$VillaName = "test-villa")

if (-not $VillaName) {
    Write-Host "Usage: script villa-name"
    exit 1
}

$BaseDir = "public\villas\$VillaName"
New-Item -ItemType Directory -Path $BaseDir -Force | Out-Null

$categories = @("hero", "ext", "liv", "din", "kit", "bed1", "bed2", "bed3", "bed4", "bed5", "bath1", "bath2", "bath3", "bath4", "pool", "view", "amen")

foreach ($category in $categories) {
    $categoryPath = "$BaseDir\$category"
    New-Item -ItemType Directory -Path $categoryPath -Force | Out-Null
    Write-Host "Created: $categoryPath"
}

Write-Host ""
Write-Host "Successfully created villa folder structure for: $VillaName"