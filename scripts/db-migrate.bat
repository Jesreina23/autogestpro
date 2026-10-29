@echo off
setlocal
cd /d "%~dp0\.."

echo [INFO] Sincronizando esquema de base de datos con Prisma Migrate...

call npx prisma migrate dev
call npx prisma generate

if %errorlevel% neq 0 (
    echo [ERROR] La migracion de la base de datos no pudo completarse.
    pause
    exit /b %errorlevel%
)

echo [OK] Base de datos sincronizada y cliente actualizado.
pause

