$timestamp = Get-Date -Format 'yyyyMMddHHmmss'
$body = @{
    name = 'Test User Manual'
    email = "testuser$timestamp@example.com"
    password = 'Test123456'
    phone = '+66812345678'
} | ConvertTo-Json

Write-Host "Testing Register API..." -ForegroundColor Cyan
Write-Host "Email: testuser$timestamp@example.com" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri http://localhost:3000/en/api/register `
        -Method POST `
        -Body $body `
        -ContentType 'application/json'
    
    Write-Host "`nSuccess! Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "`nError occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Yellow
    }
}
