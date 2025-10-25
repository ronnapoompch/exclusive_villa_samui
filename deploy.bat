@echo off
REM 🚀 Windows Production Deployment Script for Exclusive Villa Samui

echo 🏖️ Exclusive Villa Samui - Production Deployment
echo =================================================

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js is not installed
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ npm is not installed
    pause
    exit /b 1
)

echo ✅ Requirements check passed

REM Install dependencies
echo 📦 Installing dependencies...
call npm ci --only=production
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed

REM Generate Prisma client
echo 🔧 Generating Prisma client...
call npx prisma generate
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)
echo ✅ Prisma client generated

REM Build the application
echo 🏗️ Building application...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to build application
    pause
    exit /b 1
)
echo ✅ Application built successfully

REM Run database migrations
echo 🗄️ Running database migrations...
call npx prisma migrate deploy
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to run migrations
    pause
    exit /b 1
)
echo ✅ Database migrations completed

REM Seed database (optional)
echo 🌱 Seeding database...
if exist "prisma\seed.ts" (
    call npm run prisma:seed
    if %ERRORLEVEL% neq 0 (
        echo ⚠️ Warning: Database seeding failed, but continuing...
    ) else (
        echo ✅ Database seeded
    )
) else (
    echo ⚠️ No seed file found, skipping...
)

echo.
echo 🎉 Deployment completed successfully!
echo 🌐 Your application is ready to start
echo.
echo To start the application:
echo npm start
echo.
echo To start as Windows service:
echo npm install -g node-windows
echo.

pause