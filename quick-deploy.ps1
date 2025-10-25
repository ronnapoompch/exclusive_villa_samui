#!/bin/bash

# 🚀 QUICK DEPLOY SCRIPT - เมื่อกลับจากเที่ยว
# Usage: .\quick-deploy.ps1

echo "🏖️ Welcome back! Ready to deploy Exclusive Villa Samui?"
echo "⏱️  Estimated deployment time: 5-10 minutes"
echo ""

# Step 1: System Check
echo "📋 Step 1: System Check..."
Write-Host "Checking build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Please check errors above." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green
echo ""

# Step 2: TypeScript Check  
Write-Host "Checking TypeScript..." -ForegroundColor Yellow
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ TypeScript errors found!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ TypeScript check passed!" -ForegroundColor Green
echo ""

# Step 3: Deploy to Vercel
echo "🚀 Step 2: Deploying to Vercel..."
Write-Host "Attempting Vercel deployment..." -ForegroundColor Yellow

# Try Vercel login first
vercel login
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Vercel login failed! Please login manually:" -ForegroundColor Red
    Write-Host "   1. Run: vercel login" -ForegroundColor Cyan
    Write-Host "   2. Then run: vercel --prod" -ForegroundColor Cyan
    exit 1
}

# Deploy to production
vercel --prod
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed! Please check the error above." -ForegroundColor Red
    Write-Host "💡 Try manual deployment:" -ForegroundColor Cyan
    Write-Host "   vercel --prod --force" -ForegroundColor Cyan
    exit 1
}

Write-Host "🎉 Deployment successful!" -ForegroundColor Green
echo ""

# Step 4: Final checklist
echo "📝 Step 3: Post-deployment checklist"
Write-Host "Please verify these manually in Vercel dashboard:" -ForegroundColor Yellow
Write-Host "□ Environment variables are set" -ForegroundColor Cyan
Write-Host "□ DATABASE_URL configured" -ForegroundColor Cyan  
Write-Host "□ NEXTAUTH_SECRET configured" -ForegroundColor Cyan
Write-Host "□ STRIPE_SECRET_KEY configured" -ForegroundColor Cyan
Write-Host "□ RESEND_API_KEY configured" -ForegroundColor Cyan
echo ""

Write-Host "🌐 Your website should be live at:" -ForegroundColor Green
Write-Host "   https://exclusive-villa-samui.vercel.app" -ForegroundColor Cyan
echo ""

Write-Host "🎊 Welcome back! System is LIVE! 🚀" -ForegroundColor Green
Write-Host "📱 Ready to serve 210 luxury villas to customers!" -ForegroundColor Green