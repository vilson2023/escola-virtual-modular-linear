@echo off
chcp 65001 >nul
title dumo - diagnostico Asaas
cd /d "%~dp0\.."

echo.
echo ================================================
echo   dumo - diagnostico Asaas (sandbox)
echo ================================================
echo.

if not exist ".env.local" (
  echo [X] Arquivo .env.local nao encontrado.
  echo     Rode fix-env.bat primeiro.
  pause
  exit /b 1
)

echo [1/3] Lendo ASAAS_API_KEY do .env.local...
for /f "usebackq tokens=1,* delims==" %%a in (".env.local") do (
  if "%%a"=="ASAAS_API_KEY" set "ASAAS_KEY=%%b"
)

if "%ASAAS_KEY%"=="" (
  echo [X] Nao consegui ler ASAAS_API_KEY do .env.local
  pause
  exit /b 1
)

:: Remove aspas
set ASAAS_KEY=%ASAAS_KEY:"=%

:: Remove barra invertida de escape, se houver
set ASAAS_KEY=%ASAAS_KEY:\$=$%

:: Mostra comprimento e prefixo sem vazar o valor
for /f "delims=" %%c in ('powershell -Command "$k = '%ASAAS_KEY%'; Write-Host ('length=' + $k.Length + ' prefix=' + $k.Substring(0, [Math]::Min(15, $k.Length)))"') do echo      %%c

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
  powershell -Command "Get-Content '%TEMP%\asaas-test.json' -Raw | ForEach-Object { $_.Substring(0, [Math]::Min(300, $_.Length)) }"
  del /q "%TEMP%\asaas-test.json" >nul 2>&1
) else (
  echo      (sem resposta)
)
echo.

echo ----------------------------------------------
echo  HTTP 200 = chave OK (o problema e no Next)
echo  HTTP 401 = chave invalida no .env.local
echo ----------------------------------------------
echo.
pause
