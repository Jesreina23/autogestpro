# Script de migracion de base de datos en PowerShell
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path (Join-Path $ScriptDir "..")

Write-Host "[INFO] Ejecutando Prisma Migrate dev..." -ForegroundColor Cyan
npx prisma migrate dev

Write-Host "[INFO] Regenerando cliente de Prisma..." -ForegroundColor Cyan
npx prisma generate

Write-Host "[OK] Base de datos sincronizada correctamente." -ForegroundColor Green

