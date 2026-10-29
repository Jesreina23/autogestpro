# Script de inicializacion y preparacion completa en PowerShell
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path (Join-Path $ScriptDir "..")

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "[SETUP] Inicializacion integral del sistema AutoGest Pro" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

if (-not (Test-Path ".env")) {
    Write-Host "[INFO] Creando archivo .env desde .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
} else {
    Write-Host "[OK] Archivo .env detectado." -ForegroundColor Green
}

Write-Host "[INFO] Instalando dependencias de Node.js..." -ForegroundColor Cyan
npm install

Write-Host "[INFO] Generando cliente tipado de Prisma ORM..." -ForegroundColor Cyan
npx prisma generate

Write-Host "===================================================" -ForegroundColor Green
Write-Host "[OK] Configuracion inicial completada con exito." -ForegroundColor Green
Write-Host "Para iniciar el proyecto ejecute scripts\dev.ps1" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

