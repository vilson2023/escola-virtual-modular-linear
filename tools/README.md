# Ferramentas de desenvolvimento (Windows)

Scripts para o Vilson rodar o projeto dumo sem precisar digitar comandos.

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
