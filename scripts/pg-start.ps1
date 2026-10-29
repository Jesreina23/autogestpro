$binDir = "C:\Desarrollo\pgsql\bin"
$dataDir = "C:\Desarrollo\pgsql\data"
$logFile = "C:\Desarrollo\pgsql\server.log"

if (-not (Test-Path "$binDir\pg_ctl.exe")) {
    Write-Error "PostgreSQL no se encuentra en $binDir"
    exit 1
}

Write-Host "Iniciando servidor PostgreSQL local en puerto 5432..." -ForegroundColor Cyan
& "$binDir\pg_ctl.exe" -D $dataDir -l $logFile start
Write-Host "Servidor PostgreSQL iniciado correctamente." -ForegroundColor Green

