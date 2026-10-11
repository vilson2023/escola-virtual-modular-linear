@echo off
chcp 65001 >nul
title dumo - sincronizar .env e .env.local
cd /d "%~dp0\.."

echo.
echo ================================================
echo   dumo - sincronizar .env e .env.local
echo ================================================
echo.

if not exist ".env" (
  echo [X] Arquivo .env nao encontrado na raiz do projeto.
  echo     Crie o .env primeiro, depois rode este script.
  echo.
  pause
  exit /b 1
)

if exist ".env.local" (
  echo [1/3] Fazendo backup do .env.local atual...
  if exist ".env.local.bak" del /q ".env.local.bak" >nul 2>&1
  copy /Y ".env.local" ".env.local.bak" >nul
  echo       Backup salvo como .env.local.bak
) else (
  echo [1/3] Nenhum .env.local existente - nada para fazer backup.
)
echo.

echo [2/3] Copiando .env para .env.local...
copy /Y ".env" ".env.local" >nul
if errorlevel 1 (
  echo.
  echo [X] ERRO ao copiar. Verifique se o .env nao esta em uso.
  pause
  exit /b 1
)
echo       OK
echo.

echo [3/3] Verificando resultado...
echo.
echo --- Conteudo do .env.local ---
type ".env.local"
echo.
echo ------------------------------
echo.
echo Pronto! O .env.local agora e identico ao .env.
echo Se algo der errado, restaure o backup: copy /Y .env.local.bak .env.local
echo.
pause
