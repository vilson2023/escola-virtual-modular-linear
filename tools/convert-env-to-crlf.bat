@echo off
chcp 65001 >nul
title dumo - converter .env para CRLF
cd /d "%~dp0\.."

echo.
echo ================================================
echo   dumo - converter .env e .env.local para CRLF
echo ================================================
echo.

call :convert ".env"
call :convert ".env.local"

echo.
echo Pronto! Os arquivos foram convertidos para CRLF
echo (formato Windows) e UTF-8 sem BOM.
echo.
echo Os originais estao salvos como .lfbak.
echo.
pause
exit /b 0

:convert
setlocal
set "FILE=%~1"
if not exist "%FILE%" (
  echo --- %FILE% nao existe, pulando.
  goto :eof
)

echo --- %FILE% ---

:: Detecta se tem LF sozinho (sem CR antes)
:: (resultado vai para um arquivo temporario porque o for /f
::  quebra com aspas/paranteses no comando interno)
powershell -Command "$c = Get-Content -Raw '%FILE%'; if ($c -match '[^\r]\n') { Write-Output 'LF' } else { Write-Output 'CRLF' }" > "%TEMP%\dumo-enc.txt" 2>nul
set "ENCODING="
if exist "%TEMP%\dumo-enc.txt" set /p ENCODING=<"%TEMP%\dumo-enc.txt"
del /q "%TEMP%\dumo-enc.txt" >nul 2>&1

echo    Encoding atual: %ENCODING%

if "%ENCODING%"=="CRLF" (
  echo    Ja esta em CRLF, nada a fazer.
  goto :eof
)

echo    Fazendo backup como %FILE%.lfbak...
if exist "%FILE%.lfbak" del /q "%FILE%.lfbak" >nul 2>&1
copy /Y "%FILE%" "%FILE%.lfbak" >nul

echo    Convertendo para CRLF + UTF-8 sem BOM...
powershell -Command "$c = Get-Content -Raw -Encoding UTF8 '%FILE%'; $cr = [char]13; $lf = [char]10; $crlf = [string]$cr + [string]$lf; $c = $c -replace $crlf, $lf -replace $lf, $crlf; $utf8NoBom = New-Object System.Text.UTF8Encoding $false; [System.IO.File]::WriteAllText('%FILE%', $c, $utf8NoBom)"

echo    OK

endlocal
goto :eof
