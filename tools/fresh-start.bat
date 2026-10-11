@echo off
chcp 65001 >nul
title dumo - reset completo (usar se algo der errado)
cd /d "%~dp0\.."

echo.
echo ================================================
echo   dumo - reset completo
echo   ATENCAO: apaga node_modules e reinstala tudo
echo ================================================
echo.
echo Pressione Ctrl+C agora se nao quiser continuar.
echo.
pause

echo [1/3] Apagando node_modules...
if exist node_modules rmdir /s /q node_modules
echo      OK
echo.

echo [2/3] Instalando dependencias do zero (pode demorar 2-3 min)...
call npm install
if errorlevel 1 (
  echo.
  echo ERRO no npm install.
  pause >nul
  exit /b 1
)
echo.

echo [3/3] Gerando Prisma Client...
call npx prisma generate
echo.

echo Tudo pronto. Agora use o sync-and-run.bat para rodar.
pause
