Write-Host "`n=== Testing API Response Structure ===" -ForegroundColor Cyan

try {
    Start-Sleep -Seconds 1
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/villas-json?limit=3" -ErrorAction Stop
    
    Write-Host "✅ API Call Successful" -ForegroundColor Green
    Write-Host "Total villas in response: $($response.data.villas.Count)" -ForegroundColor White
    
    foreach($v in $response.data.villas) {
        Write-Host "`n📍 Villa: $($v.name)" -ForegroundColor Yellow
        Write-Host "   Slug: $($v.slug)" -ForegroundColor Gray
        
        $imgCount = if($v.images) { $v.images.Count } else { 0 }
        $heroCount = if($v.hero) { $v.hero.Count } else { 0 }
        $extCount = if($v.ext) { $v.ext.Count } else { 0 }
        
        if($imgCount -gt 0) {
            Write-Host "   ✅ Images array: $imgCount images" -ForegroundColor Green
            Write-Host "      First: $($v.images[0].Substring(0, 70))..." -ForegroundColor Gray
        } else {
            Write-Host "   ❌ Images array: EMPTY or MISSING" -ForegroundColor Red
        }
        
        Write-Host "   Hero: $heroCount, Ext: $extCount" -ForegroundColor Gray
        
        # Check if images array has correct structure
        if($v.images -and $v.images.Count -gt 0) {
            $isVercelBlob = $v.images[0] -match 'blob.vercel-storage.com'
            if($isVercelBlob) {
                Write-Host "   ✅ Using Vercel Blob URLs" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️  Not using Vercel Blob URLs" -ForegroundColor Yellow
            }
        }
    }
    
    Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Make sure dev server is running on port 3000" -ForegroundColor Yellow
}
