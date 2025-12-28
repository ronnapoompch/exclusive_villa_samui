try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/villas-json?limit=2" -TimeoutSec 10
    
    Write-Host "`n=== API TEST SUCCESS ===" -ForegroundColor Green
    Write-Host "Total: $($response.total) villas" -ForegroundColor Cyan
    Write-Host "Source: $($response.source)" -ForegroundColor Cyan
    
    Write-Host "`nFirst Villa:" -ForegroundColor Yellow
    Write-Host "  Name: $($response.villas[0].name)" -ForegroundColor White
    Write-Host "  Bedrooms: $($response.villas[0].bedrooms)" -ForegroundColor White
    Write-Host "  Images: $($response.villas[0].images.Count)" -ForegroundColor White
    
    $heroUrl = $response.villas[0].heroImage
    $displayUrl = $heroUrl.Substring(0, [Math]::Min(95, $heroUrl.Length))
    Write-Host "  Hero: $displayUrl..." -ForegroundColor Green
    
    # Count URLs
    $json = $response | ConvertTo-Json -Depth 10 -Compress
    $blobCount = ([regex]::Matches($json, 'blob\.vercel-storage\.com')).Count
    $cloudinaryCount = ([regex]::Matches($json, 'cloudinary\.com')).Count
    
    Write-Host "`n=== URL Verification ===" -ForegroundColor Yellow
    Write-Host "  Vercel Blob URLs: $blobCount" -ForegroundColor Green
    Write-Host "  Cloudinary URLs: $cloudinaryCount" -ForegroundColor $(if ($cloudinaryCount -eq 0) { 'Green' } else { 'Red' })
    
    if ($cloudinaryCount -eq 0 -and $blobCount -gt 0) {
        Write-Host "`n✅ PERFECT! API is using 100% Vercel Blob URLs!" -ForegroundColor Green
    } elseif ($cloudinaryCount -gt 0) {
        Write-Host "`n❌ WARNING: Still has Cloudinary URLs!" -ForegroundColor Red
    }
    
} catch {
    Write-Host "`n❌ Error testing API: $_" -ForegroundColor Red
    exit 1
}
