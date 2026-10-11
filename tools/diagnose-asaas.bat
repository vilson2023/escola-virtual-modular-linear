@echo off
chcp 65001 >nul
title dumo - diagnostico Asaas
cd /d "%~dp0\.."

echo.
echo ================================================
echo   dumo - diagnostico Asaas (sandbox)
echo ================================================
echo.

echo [1/3] Lendo ASAAS_API_KEY do .env.local...
for /f "usebackq tokens=1,* delims==" %%a in (".env.local") do (
  if "%%a"=="ASAAS_API_KEY" set "ASAAS_KEY=%%b"
)

if "%ASAAS_KEY%"=="" (
  echo [X] Nao consegui ler ASAAS_API_KEY do .env.local
  echo     Verifique se a linha existe.
  pause
  exit /b 1
)

:: Remove aspas externas
set ASAAS_KEY=%ASAAS_KEY:"=%

:: Remove barra invertida de escape, se houver
set ASAAS_KEY=%ASAAS_KEY:\$=$%

echo      Chave lida (mascarada): %ASAAS_KEY:~0,15%...
echo.

echo [2/3] Testando com curl direto no Asaas...
echo.
curl.exe -s -o "%TEMP%\asaas-test.json" -w "      HTTP Status: %%{http_code}\n" ^
  "https://api-sandbox.asaas.com/v3/customers?limit=1" ^
  -H "access_token: %ASAAS_KEY%" ^
  -H "Content-Type: application/json"

echo.
echo [3/3] Resposta do Asaas (primeiros 300 chars):
echo.
if exist "%TEMP%\asaas-test.json" (
  powershell -Command "Get-Content '%TEMP%\asaas-test.json' -Raw | Select-Object -First 1 | ForEach-Object { $_.Substring(0, [Math]::Min(300, $_.Length)) }"
  del /q "%TEMP%\asaas-test.json" >nul 2>&1
) else (
  echo      (sem resposta)
)
echo.

echo ----------------------------------------------
echo Se o HTTP Status foi 200: a chave e valida no
echo Asaas, mas o Next nao esta carregando ela.
echo.
echo Se o HTTP Status foi 401: a chave em si esta
echo invalida. Gere uma nova no painel do Asaas.
echo ----------------------------------------------
echo.
pause
