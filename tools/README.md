# Ferramentas de desenvolvimento (Windows)

Scripts para o Vilson rodar o projeto dumo sem precisar digitar comandos.

## sync-and-run.bat — uso diário

É o script principal. Faça o seguinte:

1. Dê **duplo clique** em `tools\sync-and-run.bat`.

Ele faz tudo sozinho, nesta ordem:

1. Descarta mudanças locais em `package.json` / `package-lock.json` (evita conflito no pull)
2. Baixa as novidades do GitHub (`git pull origin main`)
3. Reinstala as dependências (`npm install`)
4. Inicia o servidor de desenvolvimento (`npm run dev`)

Se der erro em algum passo, o script mostra a mensagem e espera você ler antes de fechar.

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
