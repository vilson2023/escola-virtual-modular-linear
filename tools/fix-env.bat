@echo off
chcp 65001 >nul
title dumo - sincronizar .env e .env.local (merge)
cd /d "%~dp0\.."

echo.
echo ================================================
echo   dumo - sincronizar .env e .env.local (merge)
echo ================================================
echo.

if not exist ".env" (
  echo [X] Arquivo .env nao encontrado.
  pause
  exit /b 1
)

echo [1/3] Fazendo backup do .env.local...
if exist ".env.local" (
  if exist ".env.local.bak" del /q ".env.local.bak" >nul 2>&1
  copy /Y ".env.local" ".env.local.bak" >nul
  echo      Backup: .env.local.bak
) else (
  echo      Nenhum .env.local existente - vai ser criado.
)
echo.

echo [2/3] Fazendo merge (.env vence, variaveis extras do .env.local preservadas)...
powershell -Command ^
  "$envPath = '.env';" ^
  "$localPath = '.env.local';" ^
  "$extra = @();" ^
  "$keys = @{};" ^
  "if (Test-Path $localPath) {" ^
  "  Get-Content $localPath -Encoding UTF8 | ForEach-Object {" ^
  "    if ($_ -match '^([A-Z_][A-Z0-9_]*)=(.*)$') {" ^
  "      $keys[$Matches[1]] = $Matches[2];" ^
  "    } elseif ($_.Trim() -ne '') { $extra += $_ }" ^
  "  }" ^
  "};" ^
  "Get-Content $envPath -Encoding UTF8 | ForEach-Object {" ^
  "  if ($_ -match '^([A-Z_][A-Z0-9_]*)=(.*)$') {" ^
  "    $keys[$Matches[1]] = $Matches[2];" ^
  "  } elseif ($_.Trim() -ne '') { $extra += $_ }" ^
  "};" ^
  "$out = @();" ^
  "foreach ($k in $keys.Keys | Sort-Object) { $out += ($k + '=' + $keys[$k]) };" ^
  "$out += $extra;" ^
  "$utf8 = New-Object System.Text.UTF8Encoding $false;" ^
  "[System.IO.File]::WriteAllLines((Join-Path (Get-Location) $localPath), $out, $utf8)"

if errorlevel 1 (
  echo [X] Erro no merge. Restaure o backup: copy /Y .env.local.bak .env.local
  pause
  exit /b 1
)
echo      OK
echo.

echo [3/3] Verificando resultado (nomes das variaveis)...
powershell -Command "Get-Content '.env.local' -Encoding UTF8 | Where-Object { $_ -match '^[A-Z_][A-Z0-9_]*=' } | ForEach-Object { Write-Host ('  ' + $_.Split('=')[0]) }"
echo.

echo Pronto! .env.local agora tem todas as variaveis dos dois arquivos.
echo Se algo der errado: copy /Y .env.local.bak .env.local
echo.
pause
