# Script de ejecucion en PowerShell para entorno de desarrollo
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path (Join-Path $ScriptDir "..")

$env:NEXT_TELEMETRY_DISABLED = "1"
Write-Host "[INFO] Iniciando entorno de desarrollo de AutoGest Pro (Turbopack activo)..." -ForegroundColor Cyan

if (-not (Test-Path ".env")) {
    Write-Host "[ADVERTENCIA] Archivo .env no encontrado. Generando copia desde .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Dependencias no encontradas. Ejecutando npm install..." -ForegroundColor Cyan
    npm install
}

Write-Host "[INFO] Servidor disponible en http://localhost:3000" -ForegroundColor Green
npm run dev

