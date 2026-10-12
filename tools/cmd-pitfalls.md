# Armadilhas do cmd que já morderam este projeto

Referência rápida para quem mexer nos scripts `.bat` da pasta `tools/`.
Cada item abaixo é uma pegadinha real que já quebrou um script aqui.

## 1. Parênteses em `echo` dentro de blocos `if ( ... )`

O cmd conta parênteses de forma ingênua ao parsear um bloco. Um `echo` com
texto como `(formato antigo)` dentro de um bloco `if` fecha o bloco no
meio e o restante do arquivo vira lixo sintático.

**Erro típico:** `. foi inesperado neste momento.`

**Solução:** não use parênteses literais em textos de `echo` dentro de
blocos. Substitua por travessão ou escapar com `^(` e `^)`.

```bat
:: ERRADO (dentro de um bloco if):
echo   [OK] formato antigo (funciona, mas nao recomendado)

:: CERTO:
echo   [OK] formato antigo - funciona, mas nao recomendado
```

Fora de blocos (nível superior do arquivo) parênteses em `echo` funcionam,
mas o hábito seguro é evitar.

## 2. `findstr /C:"..."` com aspas dentro de blocos `if`

Semelhante ao item 1: aspas e caracteres especiais dentro do `/C:"..."`
de um `findstr` dentro de bloco `if` quebram o parse. O `findstr` também
não lê bem linhas com aspas escapadas.

**Solução:** para inspecionar conteúdo de linha, use PowerShell escrevendo
o resultado num arquivo temporário e leia com `set /p` (padrão usado nos
scripts desta pasta):

```bat
powershell -Command "... Write-Output $valor" > "%TEMP%\dumo-out.txt" 2>nul
set "VALOR="
if exist "%TEMP%\dumo-out.txt" set /p VALOR=<"%TEMP%\dumo-out.txt"
del /q "%TEMP%\dumo-out.txt" >nul 2>&1
```

## 3. `for /f in ('comando')` com aspas/parênteses no comando interno

Capturar a saída de um comando com `for /f` quebra quando o comando tem
aspas duplas internas ou parênteses (o cmd não reconhece `\"` como escape
e fecha o bloco no primeiro `)`).

**Erro típico:** `$v foi inesperado neste momento.`

**Solução:** mesmo padrão do item 2 — PowerShell → arquivo temporário →
`set /p`. Evite `for /f` para capturar saída de comandos complexos.

## 4. LF vs CRLF em arquivos `.env`

Arquivos salvos com quebra de linha Unix (LF) — o Bloco de Notas às vezes
salva assim — não são lidos corretamente pelo `for /f` do cmd.

**Como identificar:** rodapé do Bloco de Notas mostra `Unix (LF)` em vez
de `Windows (CRLF)`.

**Solução:** rode `tools/convert-env-to-crlf.bat` para converter `.env` e
`.env.local` para CRLF (faz backup `.lfbak`). Os scripts novos leem as
variáveis via PowerShell, que lê LF sem problema, mas manter CRLF evita
surpresas com qualquer ferramenta do ecossistema Windows.

## 5. `$` no `.env` (dotenv-expand)

O Next.js usa `dotenv-expand`, que interpreta `$` como referência de
variável. A chave do Asaas começa com `$aact_...` e pode ser zerada.

**Solução:** colar a chave **sem o `$` inicial** (`aact_...`). O código
(`src/server/payments/asaas.ts`) adiciona o `$` automaticamente. Os
formatos antigos (`\$aact_` e `$aact_`) ainda funcionam, mas são frágeis.
Veja também o `strip-asaas-key.bat`.

## 6. `echo texto > arquivo` grava espaço extra

`echo texto > arquivo` grava o texto **mais um espaço** antes do CRLF
(o espaço antes do `>` faz parte da saída). Isso corrompe valores de
arquivos de configuração.

**Solução:** `echo texto>arquivo` (sem espaço antes do `>`).

## 7. Chamar `node`/`npm` sem `call` dentro de `.bat`

Em máquinas onde `node`/`npm` no PATH são shims `.cmd` (instalação padrão
do npm), chamar `node script.js` dentro de um `.bat` "rouba" o fluxo: o
script atual termina naquele ponto e o restante do `.bat` não executa.

**Solução:** use `call node ...` / `call npm ...` dentro de scripts `.bat`.
Em máquinas onde são `.exe` o `call` é inofensivo — mantenha sempre.

```bat
:: ERRADO:
npm install

:: CERTO:
call npm install
```

## 8. Processos filhos não sobrevivem ao fim da sessão

Servidores e processos longos iniciados a partir de um shell de agente
podem ser encerrados quando a sessão termina. Para deixar o servidor dev
rodando de forma destacada, prefira iniciar o `node.exe` diretamente

```powershell
Start-Process -FilePath 'C:\Program Files\nodejs\node.exe' `
  -ArgumentList 'node_modules/next/dist/bin/next','dev' `
  -WorkingDirectory 'C:\caminho\do\projeto' -WindowStyle Hidden
```

## 9. `npx prisma generate` falha com EPERM enquanto o servidor roda

O `query_engine-windows.dll.node` fica travado pelo processo Node do
servidor dev. O Windows não deixa renomear/substituir o arquivo.

**Solução:** pare o servidor (`taskkill //F //IM node.exe //T`), rode o
`prisma generate`, suba o servidor de novo.
