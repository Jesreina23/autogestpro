@echo off
set "BIN_DIR=C:\Desarrollo\pgsql\bin"
set "DATA_DIR=C:\Desarrollo\pgsql\data"

if not exist "%BIN_DIR%\pg_ctl.exe" (
    echo Error: PostgreSQL no se encuentra en %BIN_DIR%
    pause
    exit /b 1
)

echo Deteniendo servidor PostgreSQL local...
"%BIN_DIR%\pg_ctl.exe" -D "%DATA_DIR%" stop
echo Servidor detenido.

