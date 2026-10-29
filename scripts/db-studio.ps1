# Script para iniciar Prisma Studio en PowerShell
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path (Join-Path $ScriptDir "..")

Write-Host "[INFO] Iniciando Prisma Studio en http://localhost:5555 ..." -ForegroundColor Cyan
npx prisma studio

