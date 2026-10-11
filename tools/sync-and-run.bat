@echo off
chcp 65001 >nul
title dumo - sincronizar e rodar
cd /d "%~dp0\.."

echo.
echo ================================================
echo   dumo - sincronizar e rodar
echo ================================================
echo.

echo [1/4] Descartando mudancas locais em arquivos de dependencia...
git checkout -- package-lock.json 2>nul
git checkout -- package.json 2>nul
echo      OK
echo.

echo [2/4] Baixando novidades do GitHub...
git pull origin main
if errorlevel 1 (
  echo.
  echo ERRO no git pull. Verifique a mensagem acima.
  echo Pressione uma tecla para sair.
  pause >nul
  exit /b 1
)
echo.

echo [3/4] Reinstalando dependencias (pode demorar ~30s)...
call npm install
if errorlevel 1 (
  echo.
  echo ERRO no npm install. Verifique a mensagem acima.
  pause >nul
  exit /b 1
)
echo.

echo [4/4] Iniciando o servidor de desenvolvimento...
echo.
echo      Abra http://localhost:3000 no navegador
echo      Pressione Ctrl+C nesta janela para parar.
echo.

call npm run dev

echo.
echo Servidor encerrado.
pause
