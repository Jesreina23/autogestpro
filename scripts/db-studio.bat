@echo off
setlocal
cd /d "%~dp0\.."

echo [INFO] Iniciando Prisma Studio en http://localhost:5555 ...
call npx prisma studio
pause

