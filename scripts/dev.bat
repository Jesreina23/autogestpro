@echo off
setlocal
cd /d "%~dp0\.."

set NEXT_TELEMETRY_DISABLED=1
echo [INFO] Iniciando entorno de desarrollo de AutoGest Pro (Turbopack activo)...

if not exist ".env" (
    echo [ADVERTENCIA] No se encontro el archivo .env. Copiando desde .env.example...
    copy .env.example .env
)

if not exist "node_modules\" (
    echo [INFO] Directorio node_modules no encontrado. Instalando dependencias...
    call npm install
)

echo [INFO] Ejecutando servidor local en http://localhost:3000
npm run dev
pause

