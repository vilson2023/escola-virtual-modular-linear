@echo off
chcp 65001 >nul
title dumo - verificar .env
cd /d "%~dp0\.."
setlocal EnableDelayedExpansion

echo.
echo ================================================
echo   dumo - verificar .env
echo ================================================
echo.

set "PROBLEMAS=0"

call :check_file ".env"
call :check_file ".env.local"

echo.
if "%PROBLEMAS%"=="1" (
  echo [X] Foram encontrados PROBLEMAS acima. Corrija antes de subir o servidor.
  echo     Formato recomendado da chave: ASAAS_API_KEY="aact_..."  sem $
) else (
  echo [OK] Tudo certo com os arquivos de ambiente.
)
echo.
pause
if "%PROBLEMAS%"=="1" (exit /b 1) else (exit /b 0)

:check_file
set "FILE=%~1"
echo --- %FILE% ---

if not exist "%FILE%" (
  echo   [X] Arquivo nao existe
  set "PROBLEMAS=1"
  echo.
  goto :eof
)

findstr /C:"DATABASE_URL=" "%FILE%" >nul
if errorlevel 1 (
  echo   [X] DATABASE_URL nao encontrada
  set "PROBLEMAS=1"
) else (
  echo   [OK] DATABASE_URL presente
)

findstr /C:"AUTH_SECRET=" "%FILE%" >nul
if errorlevel 1 (
  echo   [X] AUTH_SECRET nao encontrada
  set "PROBLEMAS=1"
) else (
  echo   [OK] AUTH_SECRET presente
)

:: Le o valor da ASAAS_API_KEY via PowerShell (funciona com LF e CRLF)
powershell -Command "$c = Get-Content '%FILE%' | Where-Object { $_ -match '^ASAAS_API_KEY=' }; if ($c) { $v = $c -replace '^ASAAS_API_KEY='; $v = $v.Trim([char]34).Trim(); Write-Output $v }" > "%TEMP%\dumo-check.txt" 2>nul
set "KEYVAL="
if exist "%TEMP%\dumo-check.txt" set /p KEYVAL=<"%TEMP%\dumo-check.txt"
del /q "%TEMP%\dumo-check.txt" >nul 2>&1

if not defined KEYVAL (
  echo   [X] ASAAS_API_KEY nao encontrada
  set "PROBLEMAS=1"
) else if "!KEYVAL!"=="" (
  echo   [X] ASAAS_API_KEY encontrada mas VAZIA
  set "PROBLEMAS=1"
) else (
  set "P5=!KEYVAL:~0,5!"
  set "P6=!KEYVAL:~0,6!"
  set "P7=!KEYVAL:~0,7!"
  if "!P5!"=="aact_" (
    echo   [OK] ASAAS_API_KEY presente - formato: aact_... ou $aact_... ou \$aact_...
  ) else if "!P6!"=="$aact_" (
    echo   [OK] ASAAS_API_KEY presente - formato antigo $aact_... funciona, mas o recomendado e sem $: aact_...
  ) else if "!P7!"=="\$aact_" (
    echo   [OK] ASAAS_API_KEY presente - formato antigo \$aact_... funciona, mas o recomendado e sem $: aact_...
  ) else (
    echo   [!] ASAAS_API_KEY tem formato desconhecido - nao comeca com aact_, $aact_ ou \$aact_
    set "PROBLEMAS=1"
  )
)

findstr /C:"ASAAS_API_URL=" "%FILE%" >nul
if errorlevel 1 (
  echo   [X] ASAAS_API_URL nao encontrada
  set "PROBLEMAS=1"
) else (
  echo   [OK] ASAAS_API_URL presente
)

:: Webhook: ausencia so gera aviso (nao bloqueia o servidor)
powershell -Command "$c = Get-Content '%FILE%' | Where-Object { $_ -match '^ASAAS_WEBHOOK_TOKEN=' }; if ($c) { $v = $c -replace '^ASAAS_WEBHOOK_TOKEN='; $v = $v.Trim([char]34).Trim(); if ($v.Length -gt 0) { Write-Output 'presente' } else { Write-Output 'vazio' } } else { Write-Output 'ausente' }" > "%TEMP%\dumo-whk.txt" 2>nul
set "WHK="
if exist "%TEMP%\dumo-whk.txt" set /p WHK=<"%TEMP%\dumo-whk.txt"
del /q "%TEMP%\dumo-whk.txt" >nul 2>&1

if "%WHK%"=="presente" (
  echo   [OK] ASAAS_WEBHOOK_TOKEN presente
) else if "%WHK%"=="vazio" (
  echo   [!] ASAAS_WEBHOOK_TOKEN vazio - necessario para webhook em producao
) else (
  echo   [!] ASAAS_WEBHOOK_TOKEN ausente - necessario para webhook em producao
)

echo.
goto :eof
