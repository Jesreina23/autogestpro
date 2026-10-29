@echo off
setlocal
cd /d "%~dp0\.."

echo [INFO] Compilando proyecto para produccion (Next.js)...

call npx prisma generate
call npm run build

if %errorlevel% neq 0 (
    echo [ERROR] La compilacion de produccion ha fallado.
    pause
    exit /b %errorlevel%
)

echo [OK] Compilacion completada con exito.
pause

