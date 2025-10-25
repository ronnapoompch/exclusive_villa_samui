# Villa Image Gallery Structure Creator for PowerShell
# Usage: .\create-villa-folders.ps1 villa-name

param(
    [Parameter(Mandatory=$true)]
    [string]$VillaName
)

if (-not $VillaName) {
    Write-Host "Usage: .\create-villa-folders.ps1 villa-name" -ForegroundColor Red
    Write-Host "Example: .\create-villa-folders.ps1 new-villa" -ForegroundColor Yellow
    exit 1
}

$BaseDir = "public\villas\$VillaName"

# Create base villa directory
New-Item -ItemType Directory -Path $BaseDir -Force | Out-Null

# Create all category directories
$categories = @("hero", "ext", "liv", "din", "kit", "bed1", "bed2", "bed3", "bed4", "bed5", "bath1", "bath2", "bath3", "bath4", "pool", "view", "amen")

foreach ($category in $categories) {
    $categoryPath = "$BaseDir\$category"
    New-Item -ItemType Directory -Path $categoryPath -Force | Out-Null
    Write-Host "Created: $categoryPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "Successfully created villa folder structure for: $VillaName" -ForegroundColor Green
Write-Host ""
Write-Host "Directory structure:" -ForegroundColor Cyan
Write-Host "$BaseDir\"
foreach ($category in $categories) {
    Write-Host "├── $category\"
}
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Add your images to the appropriate category folders"
Write-Host "2. Update the villa data in VillaDetailClient.tsx"
Write-Host "3. Add the gallery object with your image paths"
Write-Host ""
Write-Host "Tip: Use descriptive filenames like hero-1.jpg, living-main.jpg, etc." -ForegroundColor Magenta