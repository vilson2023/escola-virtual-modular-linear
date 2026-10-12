# Checklist pré-deploy

Rodar antes do M10 (deploy na Vercel). Marque cada item e só prossiga com tudo ok.

## Código

- [ ] `npx next build --webpack` passa sem erros (parar o dev server antes)
- [ ] `npx tsc --noEmit` limpo
- [ ] Nenhum `console.log` de debug sobrando (buscar por `console.log` em `src/`)
- [ ] Nenhum `TODO` ou `FIXME` crítico

## Segurança

- [ ] `.env*` fora do Git (confirmar com `git status`)
- [ ] Nenhuma API key hardcoded no código
- [ ] Todas as rotas admin com `requireRole('ADMIN')` (layout `/admin` cobre; `/admin/dev-tools` ainda tem guard `NODE_ENV`)
- [ ] Todas as rotas de aluno com guard de compra (módulo/aula/checkout)
- [ ] Webhook com validação de token e idempotência

## Funcional (e2e manual em dev)

- [ ] Login / logout funcionam
- [ ] Aluno: vê M1, progride, compra M2 via PIX, completa M2, vê M3 em vitrine
- [ ] Aluno: NÃO acessa `/admin` (redirect para `/dashboard`)
- [ ] Admin: CRUD curso/módulo/aula
- [ ] Certificado: emitido ao concluir 100% do curso (idempotente)
- [ ] Webhook: recebe evento, idempotência em reenvio
- [ ] Página 404 customizada (`/pagina-inexistente`)
- [ ] Botões DEV (simular compra) NÃO aparecem em build de produção

## Envs necessárias para a Vercel

- [ ] `DATABASE_URL` (Neon — usar a **direct connection**, não pooled, para migrations)
- [ ] `AUTH_SECRET`
- [ ] `AUTH_URL` (URL da Vercel — será atualizado após o deploy)
- [ ] `NEXT_PUBLIC_APP_URL` (mesma URL pública, usada em metadata/Open Graph)
- [ ] `ASAAS_API_KEY` (produção — gerar conta real)
- [ ] `ASAAS_API_URL=https://api.asaas.com/v3` (produção)
- [ ] `ASAAS_WEBHOOK_TOKEN`

## Pós-deploy

- [ ] Webhook configurado no painel Asaas com a URL de produção
- [ ] `AUTH_URL` e `NEXT_PUBLIC_APP_URL` atualizados para o domínio real
- [ ] `npx prisma migrate deploy` executado contra o banco de produção
- [ ] Primeiro admin criado via seed manual no Neon
