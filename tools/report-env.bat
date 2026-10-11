@echo off
chcp 65001 >nul
title dumo - gerar relatorio de ambiente
cd /d "%~dp0\.."

set REPORT=env-report.txt

echo dumo - relatorio de ambiente > "%REPORT%"
echo Gerado em: %DATE% %TIME% >> "%REPORT%"
echo. >> "%REPORT%"

echo === Arquivos presentes === >> "%REPORT%"
if exist ".env" (echo .env: SIM >> "%REPORT%") else (echo .env: NAO >> "%REPORT%")
if exist ".env.local" (echo .env.local: SIM >> "%REPORT%") else (echo .env.local: NAO >> "%REPORT%")
if exist ".env.example" (echo .env.example: SIM >> "%REPORT%") else (echo .env.example: NAO >> "%REPORT%")
echo. >> "%REPORT%"

echo === Variaveis no .env.local (metadados: so comprimento, nunca valores) === >> "%REPORT%"
for %%v in (DATABASE_URL AUTH_SECRET AUTH_URL ASAAS_API_KEY ASAAS_API_URL) do (
  for /f "usebackq tokens=1,* delims==" %%a in (".env.local") do (
    if "%%a"=="%%v" (
      set "VAL=%%b"
      call :write_meta %%v
    )
  )
)

echo. >> "%REPORT%"
echo === Git === >> "%REPORT%"
git rev-parse --short HEAD >> "%REPORT%" 2>&1
git log -1 --pretty=format:"%%s" >> "%REPORT%" 2>&1
echo. >> "%REPORT%"

echo. >> "%REPORT%"
echo === Node / npm === >> "%REPORT%"
call node --version >> "%REPORT%" 2>&1
call npm --version >> "%REPORT%" 2>&1
echo. >> "%REPORT%"

echo.
echo Relatorio gerado: %REPORT%
echo Abra o arquivo e cole o conteudo no chat do engenheiro.
echo.
pause
exit /b 0

:write_meta
setlocal enabledelayedexpansion
set "KEY=%~1"
set "RAW=!VAL!"
set "RAW=!RAW:\$=$!"
set "S=!RAW!"
set "LEN=0"
for /l %%i in (0,1,300) do (
  if not "!S!"=="" (
    set "S=!S:~1!"
    set /a LEN+=1
  )
)
set /a LEN=LEN-2
if %LEN% lss 0 set "LEN=0"
echo   %KEY%: length=%LEN% >> "%REPORT%"
endlocal
goto :eof
