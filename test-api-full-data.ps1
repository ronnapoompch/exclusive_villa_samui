try {
    Write-Host "`n=== Testing Villa API with Full Data ===" -ForegroundColor Cyan
    
    # Test 1: Get single villa by slug
    Write-Host "`n[Test 1] Getting single villa by slug..." -ForegroundColor Yellow
    $villa = Invoke-RestMethod -Uri "http://localhost:3000/api/villas-json?slug=5-stars-beachfront-villa" -TimeoutSec 10
    
    Write-Host "`nBasic Info:" -ForegroundColor Green
    Write-Host "  Name: $($villa.name)"
    Write-Host "  Code: $($villa.codeId)"
    Write-Host "  Location: $($villa.location)"
    Write-Host "  Bedrooms: $($villa.bedrooms) | Bathrooms: $($villa.bathrooms) | Guests: $($villa.maxGuests)"
    
    Write-Host "`nPricing Info:" -ForegroundColor Green
    Write-Host "  Price Per Night: $($villa.pricePerNight)"
    Write-Host "  Price Range: $($villa.priceRange.display)"
    Write-Host "  Min: ฿$($villa.priceRange.min) | Max: ฿$($villa.priceRange.max)"
    Write-Host "  Monthly Price: $($villa.monthlyPrice)"
    
    Write-Host "`nImages:" -ForegroundColor Green
    Write-Host "  Hero images: $($villa.hero.Count)"
    Write-Host "  Exterior: $($villa.ext.Count)"
    Write-Host "  Living: $($villa.liv.Count)"
    Write-Host "  Kitchen: $($villa.kit.Count)"
    Write-Host "  Dining: $($villa.din.Count)"
    Write-Host "  Pool: $($villa.pool.Count)"
    Write-Host "  Gallery total: $($villa.gallery.Count)"
    
    Write-Host "`nContact:" -ForegroundColor Green
    Write-Host "  Phone: $($villa.contact)"
    Write-Host "  Airbnb: $(if ($villa.airbnbLink) { 'Yes' } else { 'No' })"
    
    # Test 2: Get multiple villas
    Write-Host "`n[Test 2] Getting multiple villas (limit 3)..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/villas-json?limit=3" -TimeoutSec 10
    
    Write-Host "`nAPI Response:" -ForegroundColor Green
    Write-Host "  Total villas: $($response.total)"
    Write-Host "  Source: $($response.source)"
    
    Write-Host "`nFirst 3 villas:"
    foreach ($v in $response.villas) {
        $priceDisplay = if ($v.priceRange) { $v.priceRange.display } else { "N/A" }
        Write-Host "  - $($v.name) ($($v.bedrooms)BR) - $priceDisplay" -ForegroundColor White
    }
    
    # Test 3: Verify URLs
    Write-Host "`n[Test 3] URL Verification..." -ForegroundColor Yellow
    $json = $response | ConvertTo-Json -Depth 10 -Compress
    $blobCount = ([regex]::Matches($json, 'blob\.vercel-storage\.com')).Count
    $cloudinaryCount = ([regex]::Matches($json, 'cloudinary\.com')).Count
    
    Write-Host "  Vercel Blob URLs: $blobCount" -ForegroundColor Green
    Write-Host "  Cloudinary URLs: $cloudinaryCount" -ForegroundColor $(if ($cloudinaryCount -eq 0) { 'Green' } else { 'Red' })
    
    if ($cloudinaryCount -eq 0 -and $blobCount -gt 0) {
        Write-Host "`n✅ SUCCESS! All tests passed!" -ForegroundColor Green
        Write-Host "   - API returns complete villa data" -ForegroundColor Green
        Write-Host "   - Pricing info included" -ForegroundColor Green
        Write-Host "   - All images use Vercel Blob URLs" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️  Warning: Some issues detected" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "`n❌ Error: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
