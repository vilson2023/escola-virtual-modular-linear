# Ferramentas de desenvolvimento (Windows)

Scripts para o Vilson rodar o projeto dumo sem precisar digitar comandos.

## Ordem recomendada quando você puxa código novo do GitHub

1. `sync-and-run.bat` — sincroniza tudo e inicia o servidor
2. (se o `sync-and-run` reclamar de env) `check-env.bat` — diagnostica problemas
3. (se precisar ajustar env) edite o `.env`, depois `fix-env.bat` para sincronizar

## sync-and-run.bat — uso diário

É o script principal. Faça o seguinte:

1. Dê **duplo clique** em `tools\sync-and-run.bat`.

**O que ele faz agora (6 passos):**
1. Mata processos Node órfãos (evita erro de arquivo travado)
2. Descarta mudanças locais em `package.json`/`package-lock.json`
3. Baixa novidades do GitHub (`git pull`)
4. Reinstala dependências (`npm install`)
5. Aplica migrations e regenera Prisma Client (`prisma migrate deploy` + `prisma generate`)
6. Inicia o servidor (`npm run dev`)

Se der erro em algum passo, o script mostra a mensagem e espera você ler antes de fechar.

### check-env.bat

Verifica se os arquivos `.env` e `.env.local` estão configurados corretamente.

**Uso:** duplo clique. Um relatório aparece no terminal listando o que está OK e o que está faltando ou com formato errado.

**Por que existe:** o Next.js usa `dotenv-expand`, que interpreta `$` como início de variável. Como a chave do Asaas começa com `$aact_`, ela precisa ser escapada com `\$` para não virar string vazia. Este script avisa se o escape está faltando.

**Exemplo de saída quando está tudo OK:**

```text
--- .env ---
[OK] DATABASE_URL presente
[OK] AUTH_SECRET presente
[OK] ASAAS_API_KEY presente e com escape correto
[OK] ASAAS_API_URL presente
```

**Exemplo com problema:**

```text
--- .env ---
[OK] DATABASE_URL presente
[OK] AUTH_SECRET presente
[!] ASAAS_API_KEY encontrada MAS sem escape. O $ deve ser \$
    Correto:   ASAAS_API_KEY="\$aact_..."
    Incorreto: ASAAS_API_KEY="$aact_..."
```

**Nota:** se o formato do `.env` mudar (ex.: aspas simples em vez de aspas duplas), o `check-env.bat` pode precisar de ajuste, porque ele detecta o escape procurando a sequência `\$aact_` na linha da `ASAAS_API_KEY`.

### fix-env.bat

Sincroniza o `.env.local` com o `.env`, fazendo backup do antigo.

**Quando usar:**
- Depois de editar o `.env` (ex.: adicionar uma variável nova)
- Se o `check-env.bat` reclamar que `.env.local` está diferente do `.env`
- Se você não tem certeza se os dois arquivos estão iguais

**O que faz:**
1. Faz backup do `.env.local` atual como `.env.local.bak`
2. Copia o `.env` por cima do `.env.local`
3. Mostra o conteúdo final na tela

**Restaurar o backup (se precisar):**
```bat
copy /Y .env.local.bak .env.local
```

**Fluxo recomendado quando o Kimi adicionar uma variável nova:**
1. Você edita o `.env` (adiciona a variável)
2. Duplo clique em `fix-env.bat` → `.env.local` fica igual
3. Duplo clique em `sync-and-run.bat` → servidor reinicia

### Sobre a chave do Asaas e o `$`

A chave do Asaas começa com `$` (ex.: `$aact_hmlg_...`). O Next.js usa `dotenv-expand`, que interpreta `$` como variável — e isso pode zerar a env.

**Solução recomendada:** cole a chave **sem o `$` inicial** no `.env`:

```text
ASAAS_API_KEY="aact_hmlg_..." ← sem o $
```

O código (`src/server/payments/asaas.ts`) adiciona o `$` automaticamente.

Formatos antigos (com `\$` ou com `$`) continuam sendo aceitos, mas são mais frágeis.

### diagnose-asaas.bat

Testa a `ASAAS_API_KEY` direto no Asaas via curl, sem passar pelo Next.js. Mostra o comprimento e o prefixo da chave lida (sem vazar o valor) e o HTTP status da resposta.

- **HTTP 200** = a chave é válida; o problema está no carregamento pelo Next.
- **HTTP 401** = a chave em si está inválida; gere uma nova no painel do Asaas.

Funciona com qualquer um dos formatos de chave (com ou sem `$`/escape — o script normaliza antes de testar).

### report-env.bat

Gera um arquivo `env-report.txt` na raiz do projeto com o diagnóstico completo do ambiente: arquivos presentes, metadados das variáveis (comprimento e prefixo — nunca valores), commit atual e versões de Node/npm.

**Uso:** duplo clique, depois abra o `env-report.txt` e cole o conteúdo no chat do engenheiro. O arquivo é ignorado pelo Git (está no `.gitignore`).

## fresh-start.bat — versão de emergência

Use **só quando algo der errado**: erro estranho de dependência, projeto não inicia, coisa que não resolve com o script normal.

O que ele faz:

1. **Apaga a pasta `node_modules`** (todas as dependências)
2. Reinstala tudo do zero (pode demorar 2–3 minutos)
3. Regenera o Prisma Client

Depois dele, volte a usar o `sync-and-run.bat` normalmente.

## Como parar o servidor

Pressione **Ctrl+C** na janela do script, ou simplesmente **feche a janela**.

## Onde ver o site

Com o servidor rodando, abra **http://localhost:3000** no navegador.

---

**Nota:** estes scripts vivem dentro do repositório. O `sync-and-run.bat` faz `git pull` no início, então se o próprio script mudar no futuro, ele se atualiza sozinho.
