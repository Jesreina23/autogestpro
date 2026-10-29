$binDir = "C:\Desarrollo\pgsql\bin"
$dataDir = "C:\Desarrollo\pgsql\data"

if (-not (Test-Path "$binDir\pg_ctl.exe")) {
    Write-Error "PostgreSQL no se encuentra en $binDir"
    exit 1
}

Write-Host "Deteniendo servidor PostgreSQL local..." -ForegroundColor Yellow
& "$binDir\pg_ctl.exe" -D $dataDir stop
Write-Host "Servidor PostgreSQL detenido." -ForegroundColor Green

