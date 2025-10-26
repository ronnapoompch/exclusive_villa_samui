# Vercel Environment Variables Setup Script
# Run this to set up all required environment variables for production

Write-Host "`n=== Vercel Production Environment Setup ===" -ForegroundColor Cyan
Write-Host "This will set up environment variables for production deployment`n" -ForegroundColor Yellow

# Critical Variables
Write-Host "[1/8] DATABASE_URL (Supabase)" -ForegroundColor Green
Write-Host "Get from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/database" -ForegroundColor Gray
$dbUrl = Read-Host "Enter DATABASE_URL"
if ($dbUrl) {
    $dbUrl | vercel env add DATABASE_URL production
    Write-Host "✓ DATABASE_URL added`n" -ForegroundColor Green
}

Write-Host "[2/8] NEXTAUTH_SECRET" -ForegroundColor Green
Write-Host "Current value: exclusive-villa-samui-nextauth-secret-production-ready-2024" -ForegroundColor Gray
$secret = Read-Host "Enter NEXTAUTH_SECRET (or press Enter for default)"
if (!$secret) { $secret = "exclusive-villa-samui-nextauth-secret-production-ready-2024" }
$secret | vercel env add NEXTAUTH_SECRET production
Write-Host "✓ NEXTAUTH_SECRET added`n" -ForegroundColor Green

Write-Host "[3/8] NEXTAUTH_URL" -ForegroundColor Green
$authUrl = "https://exclusive-villa-samui.vercel.app"
$authUrl | vercel env add NEXTAUTH_URL production
Write-Host "✓ NEXTAUTH_URL = $authUrl`n" -ForegroundColor Green

Write-Host "[4/8] STRIPE_SECRET_KEY (Test Mode)" -ForegroundColor Green
Write-Host "Current test key from .env.local" -ForegroundColor Gray
$stripeKey = Read-Host "Enter STRIPE_SECRET_KEY"
if ($stripeKey) {
    $stripeKey | vercel env add STRIPE_SECRET_KEY production
    Write-Host "✓ STRIPE_SECRET_KEY added`n" -ForegroundColor Green
}

Write-Host "[5/8] CLOUDINARY_API_SECRET" -ForegroundColor Green
Write-Host "Current: -QJ7eDsEVVOLnGLCZCuNTW1IrPI" -ForegroundColor Gray
$cloudSecret = Read-Host "Enter CLOUDINARY_API_SECRET (or press Enter for default)"
if (!$cloudSecret) { $cloudSecret = "-QJ7eDsEVVOLnGLCZCuNTW1IrPI" }
$cloudSecret | vercel env add CLOUDINARY_API_SECRET production
Write-Host "✓ CLOUDINARY_API_SECRET added`n" -ForegroundColor Green

Write-Host "[6/8] RESEND_API_KEY" -ForegroundColor Green
Write-Host "Current: re_NdtkWJW4_GDKNnuSx92cbPEAEFmWGmTws" -ForegroundColor Gray
$resendKey = Read-Host "Enter RESEND_API_KEY (or press Enter for default)"
if (!$resendKey) { $resendKey = "re_NdtkWJW4_GDKNnuSx92cbPEAEFmWGmTws" }
$resendKey | vercel env add RESEND_API_KEY production
Write-Host "✓ RESEND_API_KEY added`n" -ForegroundColor Green

Write-Host "[7/8] ADMIN_PASSWORD" -ForegroundColor Green
$adminPass = Read-Host "Enter ADMIN_PASSWORD (for admin login)"
if ($adminPass) {
    $adminPass | vercel env add ADMIN_PASSWORD production
    Write-Host "✓ ADMIN_PASSWORD added`n" -ForegroundColor Green
}

Write-Host "[8/8] ENCRYPTION_KEY" -ForegroundColor Green
Write-Host "Enter 64-character hex key for encryption" -ForegroundColor Gray
$encKey = Read-Host "Enter ENCRYPTION_KEY (or press Enter to skip)"
if ($encKey) {
    $encKey | vercel env add ENCRYPTION_KEY production
    Write-Host "✓ ENCRYPTION_KEY added`n" -ForegroundColor Green
}

Write-Host "`n=== Setup Complete! ===" -ForegroundColor Cyan
Write-Host "Ready to deploy to production with:" -ForegroundColor Yellow
Write-Host "  vercel --prod`n" -ForegroundColor Green
