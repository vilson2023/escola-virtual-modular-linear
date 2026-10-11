@echo off
chcp 65001 >nul
title dumo - normalizar chave do Asaas no .env
cd /d "%~dp0\.."

echo.
echo ================================================
echo   dumo - normalizar ASAAS_API_KEY no .env
echo ================================================
echo.

if not exist ".env" (
  echo [X] Arquivo .env nao encontrado.
  pause
  exit /b 1
)

echo [1/3] Fazendo backup do .env como .env.bak...
if exist ".env.bak" del /q ".env.bak" >nul 2>&1
copy /Y ".env" ".env.bak" >nul
echo      OK
echo.

echo [2/3] Normalizando ASAAS_API_KEY via PowerShell...
:: O caractere de aspa dupla e montado com [char]34 para nao
:: precisar de aspas dentro do comando (que quebram o cmd)
powershell -Command ^
  "$path = '.env';" ^
  "$raw = Get-Content -Raw -Encoding UTF8 $path -ErrorAction Stop;" ^
  "$has = $raw -match 'ASAAS_API_KEY=';" ^
  "if (-not $has) { Write-Host '[X] Nao encontrei ASAAS_API_KEY no .env'; exit 1 };" ^
  "$q = [char]34;" ^
  "$raw = $raw -replace ('ASAAS_API_KEY=' + $q + '\\\$'), ('ASAAS_API_KEY=' + $q);" ^
  "$raw = $raw -replace ('ASAAS_API_KEY=' + $q + '\$'), ('ASAAS_API_KEY=' + $q);" ^
  "$utf8 = New-Object System.Text.UTF8Encoding $false;" ^
  "[System.IO.File]::WriteAllText((Resolve-Path $path), $raw, $utf8);" ^
  "Write-Host '      OK'"

if errorlevel 1 (
  echo.
  echo [X] Erro ao normalizar. Restaure o backup: copy /Y .env.bak .env
  pause
  exit /b 1
)
echo.

echo [3/3] Verificando resultado...
powershell -Command "$c = Get-Content '.env' | Where-Object { $_ -match '^ASAAS_API_KEY=' }; if ($c) { $v = $c -replace '^ASAAS_API_KEY='; $v = $v.Trim([char]34).Trim(); Write-Output $v }" > "%TEMP%\dumo-newkey.txt" 2>nul
set "NEW_KEY="
if exist "%TEMP%\dumo-newkey.txt" set /p NEW_KEY=<"%TEMP%\dumo-newkey.txt"
del /q "%TEMP%\dumo-newkey.txt" >nul 2>&1

if not "%NEW_KEY%"=="" (
  powershell -Command "$k = '%NEW_KEY%'; Write-Host ('      ASAAS_API_KEY=' + [char]34 + $k.Substring(0, [Math]::Min(15, $k.Length)) + '...' + [char]34 + '  (length=' + $k.Length + ')')"
)
echo.

echo ----------------------------------------------
echo  Pronto! Agora rode fix-env.bat para copiar
echo  o .env normalizado para o .env.local.
echo.
echo  Restaurar backup: copy /Y .env.bak .env
echo ----------------------------------------------
echo.
pause
