@echo off
chcp 65001 >nul
title dumo - verificar .env
cd /d "%~dp0\.."

echo.
echo ================================================
echo   dumo - verificar .env
echo ================================================
echo.

call :check_file ".env"
call :check_file ".env.local"

echo.
echo Se aparecer algum PROBLEMA acima, corrija o arquivo correspondente.
echo Lembre-se: a ASAAS_API_KEY comeca com $, entao precisa de escape: \$aact_...
echo.
pause
exit /b 0

:check_file
setlocal
set "FILE=%~1"
echo --- %FILE% ---

if not exist "%FILE%" (
  echo   [X] Arquivo nao existe
  goto :eof
)

findstr /C:"DATABASE_URL=" "%FILE%" >nul
if errorlevel 1 (
  echo   [X] DATABASE_URL nao encontrada
) else (
  echo   [OK] DATABASE_URL presente
)

findstr /C:"AUTH_SECRET=" "%FILE%" >nul
if errorlevel 1 (
  echo   [X] AUTH_SECRET nao encontrada
) else (
  echo   [OK] AUTH_SECRET presente
)

findstr /C:"ASAAS_API_KEY=" "%FILE%" >nul
if errorlevel 1 (
  echo   [X] ASAAS_API_KEY nao encontrada
  goto :check_asaas_done
)

set "KEYLINE="
for /f "usebackq delims=" %%a in (`findstr /C:"ASAAS_API_KEY=" "%FILE%"`) do set "KEYLINE=%%a"
set "ESCAPED=%KEYLINE:\$aact_=MARK%"
set "RAW=%KEYLINE:$aact_=MARK%"

if not "%ESCAPED%"=="%KEYLINE%" (
  echo   [OK] ASAAS_API_KEY presente e com escape correto
) else if not "%RAW%"=="%KEYLINE%" (
  echo   [!] ASAAS_API_KEY encontrada MAS sem escape. O $ deve ser \$
  echo       Correto:   ASAAS_API_KEY="\$aact_..."
  echo       Incorreto: ASAAS_API_KEY="$aact_..."
) else (
  echo   [!] ASAAS_API_KEY encontrada mas em formato nao reconhecido
  echo       Esperado:  ASAAS_API_KEY="\$aact_..."
)
:check_asaas_done

findstr /C:"ASAAS_API_URL=" "%FILE%" >nul
if errorlevel 1 (
  echo   [X] ASAAS_API_URL nao encontrada
) else (
  echo   [OK] ASAAS_API_URL presente
)

echo.
endlocal
goto :eof
