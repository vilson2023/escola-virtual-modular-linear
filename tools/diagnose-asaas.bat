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

echo [1/3] Lendo ASAAS_API_KEY do .env.local via PowerShell...
echo.

:: Usa PowerShell para ler a chave (le bem LF e CRLF).
:: O resultado vai para um arquivo temporario porque o for /f
:: do cmd quebra com aspas/parenteses no comando interno.
powershell -Command "$c = Get-Content '.env.local' | Where-Object { $_ -match '^ASAAS_API_KEY=' }; if ($c) { $v = $c -replace '^ASAAS_API_KEY='; $v = $v.Trim([char]34).Trim(); $v = $v -replace '^\\\$','$'; Write-Output $v }" > "%TEMP%\dumo-asaas-key.txt" 2>nul
set "ASAAS_KEY="
if exist "%TEMP%\dumo-asaas-key.txt" set /p ASAAS_KEY=<"%TEMP%\dumo-asaas-key.txt"
del /q "%TEMP%\dumo-asaas-key.txt" >nul 2>&1

if "%ASAAS_KEY%"=="" (
  echo [X] Nao consegui ler ASAAS_API_KEY.
  pause
  exit /b 1
)

:: Metadados (comprimento + prefixo)
powershell -Command "$k = '%ASAAS_KEY%'; Write-Host ('length=' + $k.Length + ' prefix=' + $k.Substring(0, [Math]::Min(15, $k.Length)))"

echo.
echo [2/3] Testando com curl direto no Asaas...
echo.
curl.exe -s -o "%TEMP%\asaas-test.json" -w "      HTTP Status: %%{http_code}\n" ^
  "https://api-sandbox.asaas.com/v3/customers?limit=1" ^
  -H "access_token: %ASAAS_KEY%" ^
  -H "Content-Type: application/json"

echo.
echo [3/3] Resposta (primeiros 300 chars):
echo.
if exist "%TEMP%\asaas-test.json" (
  powershell -Command "Get-Content '%TEMP%\asaas-test.json' -Raw | ForEach-Object { $_.Substring(0, [Math]::Min(300, $_.Length)) }"
  del /q "%TEMP%\asaas-test.json" >nul 2>&1
) else (
  echo      (sem resposta)
)
echo.

echo ----------------------------------------------
echo  HTTP 200 = chave OK (problema no Next)
echo  HTTP 401 = chave invalida no .env.local
echo ----------------------------------------------
echo.
pause
