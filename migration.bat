@echo off
echo.
echo ======================================================================
echo 🚀 PROFESSIONAL SUPABASE MIGRATION SYSTEM
echo ======================================================================
echo.
echo Available Commands:
echo.
echo   quick-start        - Complete migration setup wizard
echo   setup-env          - Configure Supabase environment
echo   migration-status   - Check system readiness  
echo   backup            - Create safety backup
echo   setup-supabase    - Setup Supabase storage
echo   migrate-dry-run   - Test migration (safe)
echo   migrate-live      - Execute migration
echo   rollback          - Rollback migration
echo.
echo ======================================================================

if "%1"=="" (
    echo Please specify a command. Example: migration.bat quick-start
    goto :eof
)

if "%1"=="quick-start" (
    echo Running Quick Start Migration Setup...
    node scripts/quick-start.js
    goto :eof
)

if "%1"=="setup-env" (
    echo Running Environment Setup...
    node scripts/setup-environment.js
    goto :eof
)

if "%1"=="migration-status" (
    echo Checking Migration Status...
    node scripts/migration-status.js
    goto :eof
)

if "%1"=="backup" (
    echo Creating Safety Backup...
    node scripts/create-backup.js
    goto :eof
)

if "%1"=="setup-supabase" (
    echo Setting up Supabase Storage...
    node scripts/setup-supabase-storage.js
    goto :eof
)

if "%1"=="migrate-dry-run" (
    echo Running Migration Dry Run...
    node scripts/migrate-images.js --dry-run
    goto :eof
)

if "%1"=="migrate-live" (
    echo Running LIVE Migration...
    echo WARNING: This will upload 18,279 files to Supabase!
    set /p confirm="Continue? (y/N): "
    if /i "%confirm%"=="y" (
        node scripts/migrate-images.js
    ) else (
        echo Migration cancelled.
    )
    goto :eof
)

if "%1"=="rollback" (
    echo Rolling back Migration...
    node scripts/rollback-migration.js
    goto :eof
)

echo Unknown command: %1
echo Run 'migration.bat' to see available commands.