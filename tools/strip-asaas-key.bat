@echo off
chcp 65001 >nul
title dumo - normalizar chave do Asaas (.env e .env.local)
cd /d "%~dp0\.."

echo.
echo ================================================
echo   dumo - normalizar ASAAS_API_KEY (.env e .env.local)
echo ================================================
echo.
echo Converte a chave para o formato novo (sem $):
echo   \$aact_...  -^>  aact_...
echo   $aact_...   -^>  aact_...
echo.

call :strip_one ".env"
call :strip_one ".env.local"

echo.
echo ----------------------------------------------
echo  Pronto! Se algo deu errado, restaure os backups:
echo    copy /Y .env.bak .env
echo    copy /Y .env.local.bak .env.local
echo ----------------------------------------------
echo.
pause
exit /b 0

:strip_one
set "FILE=%~1"

if not exist "%FILE%" (
  echo --- %FILE% --- nao existe, pulando.
  echo.
  goto :eof
)

echo --- %FILE% ---

if exist "%FILE%.bak" del /q "%FILE%.bak" >nul 2>&1
copy /Y "%FILE%" "%FILE%.bak" >nul
echo    Backup: %FILE%.bak

powershell -Command ^
  "$path = '%FILE%';" ^
  "$raw = Get-Content -Raw -Encoding UTF8 $path -ErrorAction Stop;" ^
  "if ($raw -notmatch 'ASAAS_API_KEY=') { Write-Host '    ASAAS_API_KEY nao existe neste arquivo. Nada a fazer.'; exit 0 };" ^
  "$new = $raw -replace '\\\$aact_', 'aact_' -replace '\$aact_', 'aact_';" ^
  "if ($new -ceq $raw) { Write-Host '    Chave ja esta no formato novo (aact_...). Nada a fazer.'; exit 0 };" ^
  "$utf8 = New-Object System.Text.UTF8Encoding $false;" ^
  "[System.IO.File]::WriteAllText((Resolve-Path $path), $new, $utf8);" ^
  "Write-Host '    Chave normalizada para aact_...  OK'"

if errorlevel 1 (
  echo    [X] Erro ao normalizar %FILE%. Restaure o backup: copy /Y %FILE%.bak %FILE%
)
echo.
goto :eof
