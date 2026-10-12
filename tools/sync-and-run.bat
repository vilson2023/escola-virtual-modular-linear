@echo off
chcp 65001 >nul
title dumo - sincronizar e rodar
cd /d "%~dp0\.."

echo.
echo ================================================
echo   dumo - sincronizar e rodar
echo ================================================
echo.

echo [1/7] Matando processos Node orfaos...
taskkill /F /IM node.exe /T >nul 2>&1
echo      OK
echo.

echo [2/7] Descartando mudancas locais em arquivos de dependencia...
git checkout -- package-lock.json 2>nul
git checkout -- package.json 2>nul
echo      OK
echo.

echo [3/7] Baixando novidades do GitHub...
git pull origin main
if errorlevel 1 (
  echo.
  echo ERRO no git pull. Verifique a mensagem acima.
  pause >nul
  exit /b 1
)
echo.

echo [4/7] Reinstalando dependencias (pode demorar ~30s)...
call npm install
if errorlevel 1 (
  echo.
  echo ERRO no npm install. Verifique a mensagem acima.
  pause >nul
  exit /b 1
)
echo.

echo [5/7] Verificando envs...
call "%~dp0check-env.bat" < nul
if errorlevel 1 (
  echo.
  echo [X] ENVS INCOMPLETAS ou com formato invalido. Corrija o .env e rode de novo.
  echo     Dica: rode fix-env.bat para sincronizar .env -^> .env.local
  pause >nul
  exit /b 1
)
echo      OK
echo.

echo [6/7] Aplicando migrations e regenerando Prisma Client...
call npx prisma migrate deploy
call npx prisma generate
if errorlevel 1 (
  echo.
  echo ERRO no prisma. Verifique a mensagem acima.
  pause >nul
  exit /b 1
)
echo.

echo [7/7] Iniciando o servidor de desenvolvimento...
echo.
echo      Abra http://localhost:3000 no navegador
echo      Pressione Ctrl+C nesta janela para parar.
echo.

call npm run dev

echo.
echo Servidor encerrado.
pause
