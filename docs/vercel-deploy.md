# Deploy na Vercel — dumo

Guia passo a passo para colocar o dumo no ar. O deploy em si é feito pelo engenheiro pela UI da Vercel — este documento prepara tudo para que seja "1 clique + colar envs".

## Pré-requisitos

- Repositório no GitHub: https://github.com/vilson2023/escola-virtual-modular-linear
- Conta na Vercel (já existe) conectada ao GitHub
- Banco de produção no Neon (já criado — **não é o mesmo do dev**)
- Conta no Asaas em **sandbox** (para esta primeira fase)

## Passo 1 — Importar o repositório na Vercel

1. Acesse https://vercel.com/new
2. Selecione o repositório `escola-virtual-modular-linear`
3. Framework preset: **Next.js** (detectado automaticamente)
4. **Não faça deploy ainda** — primeiro configure as envs (Passo 2)

## Passo 2 — Configurar as variáveis de ambiente

Em **Settings → Environment Variables**, cadastre todas as envs abaixo (referência completa em `.env.production.example`). Marque todas para **Production**, **Preview** e **Development**.

| Variável              | Descrição                                                             |
| --------------------- | --------------------------------------------------------------------- |
| `DATABASE_URL`        | Connection string **pooled** do Neon de **produção** (nunca a do dev) |
| `AUTH_SECRET`         | Segredo do Auth.js — gere com `openssl rand -base64 32`               |
| `AUTH_URL`            | URL da aplicação, ex.: `https://SEU-DOMINIO.vercel.app`               |
| `NEXTAUTH_URL`        | Mesma URL acima (compatibilidade com Auth.js v5 beta)                 |
| `NEXT_PUBLIC_APP_URL` | Mesma URL acima (usada em `metadataBase` para OG tags)                |
| `ASAAS_API_KEY`       | Chave da API do Asaas **sandbox** (prefixo `aact_hmlg_`)              |
| `ASAAS_API_URL`       | `https://api-sandbox.asaas.com/v3` (sandbox)                          |
| `ASAAS_WEBHOOK_TOKEN` | Token de validação do webhook — gere com `openssl rand -hex 24`       |
| `ADMIN_EMAIL`         | E-mail do admin de produção (usado uma vez no seed)                   |
| `ADMIN_PASSWORD`      | Senha forte (mín. 8 caracteres) do admin de produção                  |
| `ADMIN_NAME`          | Nome de exibição do admin de produção                                 |

⚠️ **Nunca** use a `DATABASE_URL` do ambiente de desenvolvimento em produção.

## Passo 3 — Deploy

1. Clique em **Deploy**
2. Aguarde ~3–5 minutos
3. O script `vercel-build` roda automaticamente: `prisma migrate deploy` (aplica as migrations no Neon de prod) → `prisma generate` → `next build`
4. **Se a migration falhar, o deploy falha — isso é proposital**, para descobrirmos problemas antes de ir ao ar. Nesse caso, veja os logs e relate o erro.

> **Nota sobre `channel_binding=require`:** se a connection string do Neon tiver esse parâmetro e o migrate falhar na Vercel, remova `&channel_binding=require` da `DATABASE_URL` nas envs.

## Passo 4 — Criar o admin de produção

Após o deploy, crie o usuário admin rodando localmente (com a connection string de produção):

```bash
ADMIN_EMAIL=voce@dumo.com ADMIN_PASSWORD=SenhaForte123 DATABASE_URL=<neon-prod> npm run db:seed:prod
```

O script faz upsert: pode ser rodado de novo para **redefinir a senha** do admin (a senha antiga é substituída). Guarde a senha em local seguro — ela não é exibida novamente.

> **Demo em produção:** para popular também o curso demo (1 curso com 6 módulos, útil para demonstrar a plataforma), adicione `SEED_DEMO_COURSE=true` ao comando. Remova essa env quando for publicar conteúdo de verdade.

## Passo 5 — Atualizar `AUTH_URL` e `NEXT_PUBLIC_APP_URL`

Com o domínio real da Vercel em mãos (ex.: `https://escola-virtual-modular-linear.vercel.app`):

1. Atualize `AUTH_URL`, `NEXTAUTH_URL` e `NEXT_PUBLIC_APP_URL` nas envs
2. Faça **Redeploy** (Deployments → ⋯ → Redeploy)

## Passo 6 — Configurar o webhook do Asaas

No painel do Asaas: **Integrações → Webhooks → Novo webhook**:

- **URL:** `https://SEU-DOMINIO.vercel.app/api/webhooks/asaas`
- **Token:** o mesmo valor de `ASAAS_WEBHOOK_TOKEN`
- **Eventos:** `PAYMENT_RECEIVED`, `PAYMENT_CONFIRMED`, `PAYMENT_OVERDUE`, `PAYMENT_REFUNDED`

## Passo 7 — Checklist pós-deploy

- [ ] Login do admin funciona com as credenciais do Passo 4
- [ ] Criar o primeiro curso pelo painel admin
- [ ] Cadastrar um aluno pela tela pública de cadastro
- [ ] Testar o checkout de um módulo com **PIX** (sandbox)
- [ ] Confirmar que o webhook chega (status da compra muda para `PAID` sem polling)
- [ ] Concluir um módulo 100% e verificar o certificado
