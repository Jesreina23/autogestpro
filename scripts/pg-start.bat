@echo off
set "BIN_DIR=C:\Desarrollo\pgsql\bin"
set "DATA_DIR=C:\Desarrollo\pgsql\data"
set "LOG_FILE=C:\Desarrollo\pgsql\server.log"

if not exist "%BIN_DIR%\pg_ctl.exe" (
    echo Error: PostgreSQL no se encuentra en %BIN_DIR%
    pause
    exit /b 1
)

echo Iniciando servidor PostgreSQL local en puerto 5432...
"%BIN_DIR%\pg_ctl.exe" -D "%DATA_DIR%" -l "%LOG_FILE%" start
echo Servidor PostgreSQL iniciado.

