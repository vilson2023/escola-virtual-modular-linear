@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
title dumo - normalizar chave do Asaas no .env
cd /d "%~dp0\.."

echo.
echo ================================================
echo   dumo - normalizar ASAAS_API_KEY no .env
echo ================================================
echo.

if not exist ".env" (
  echo [X] Arquivo .env nao encontrado na raiz do projeto.
  pause
  exit /b 1
)

echo [1/4] Fazendo backup do .env como .env.bak...
if exist ".env.bak" del /q ".env.bak" >nul 2>&1
copy /Y ".env" ".env.bak" >nul
echo      Backup: .env.bak
echo.

echo [2/4] Lendo ASAAS_API_KEY atual...
set "OLD_KEY="
for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
  if "%%a"=="ASAAS_API_KEY" set "OLD_KEY=%%b"
)

if "!OLD_KEY!"=="" (
  echo [X] Nao encontrei a linha ASAAS_API_KEY no .env.
  pause
  exit /b 1
)

:: Remove aspas
set "OLD_KEY=!OLD_KEY:"=!"
:: Remove barra invertida de escape
set "OLD_KEY=!OLD_KEY:\$=$!"
:: Remove $ inicial
if "!OLD_KEY:~0,1!"=="$" set "OLD_KEY=!OLD_KEY:~1!"

echo      Chave normalizada: !OLD_KEY:~0,15!...  ^(comprimento: leia abaixo^)
echo.

echo [3/4] Reescrevendo .env...
:: Cria .env.new sem a linha antiga, depois adiciona a nova
set "FOUND="
type nul > ".env.new"
for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
  if "%%a"=="ASAAS_API_KEY" (
    echo ASAAS_API_KEY="!OLD_KEY!">> ".env.new"
    set "FOUND=1"
  ) else (
    if "%%b"=="" (
      echo %%a>> ".env.new"
    ) else (
      echo %%a=%%b>> ".env.new"
    )
  )
)

:: Se nao achou a linha (nao deveria acontecer), adiciona ao final
if "!FOUND!"=="" (
  echo ASAAS_API_KEY="!OLD_KEY!">> ".env.new"
)

:: Substitui .env pelo .env.new
move /Y ".env.new" ".env" >nul

echo      OK
echo.

echo [4/4] Verificando novo conteudo (primeiros 15 chars):
for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
  if "%%a"=="ASAAS_API_KEY" (
    set "NEW_KEY=%%b"
    set "NEW_KEY=!NEW_KEY:"=!"
    echo      ASAAS_API_KEY="!NEW_KEY:~0,15!..."  ^(sem $ nem \^)
  )
)
echo.

echo ----------------------------------------------
echo  Pronto! Agora rode fix-env.bat para copiar
echo  o .env normalizado para o .env.local.
echo.
echo  Restaurar o backup (se precisar):
echo    copy /Y .env.bak .env
echo ----------------------------------------------
echo.
pause
