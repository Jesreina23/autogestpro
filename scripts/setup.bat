@echo off
setlocal
cd /d "%~dp0\.."

echo ===================================================
echo [SETUP] Inicializacion integral del sistema AutoGest Pro
echo ===================================================

if not exist ".env" (
    echo [INFO] Creando archivo .env desde .env.example...
    copy .env.example .env
) else (
    echo [OK] Archivo .env detectado.
)

echo [INFO] Instalando dependencias de Node.js...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Fallo la instalacion de dependencias.
    pause
    exit /b %errorlevel%
)

echo [INFO] Generando cliente tipado de Prisma ORM...
call npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] Fallo la generacion de Prisma Client.
    pause
    exit /b %errorlevel%
)

echo ===================================================
echo [OK] Configuracion inicial completada con exito.
echo Para iniciar el proyecto ejecute scripts\dev.bat
echo ===================================================
pause

