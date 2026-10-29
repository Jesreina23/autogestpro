# Script de compilacion de produccion en PowerShell
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path (Join-Path $ScriptDir "..")

Write-Host "[INFO] Generando Prisma Client..." -ForegroundColor Cyan
npx prisma generate

Write-Host "[INFO] Ejecutando Next.js build..." -ForegroundColor Cyan
npm run build

Write-Host "[OK] Compilacion completada con exito." -ForegroundColor Green

