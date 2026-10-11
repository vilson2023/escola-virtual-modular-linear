# dumo

**Sua jornada, módulo a módulo.**

Plataforma de ensino à distância (LMS) com jornada **estritamente linear** e gamificada. O aluno compra um módulo por vez, e só destrava o próximo após concluir 100% do atual (modelo **Pay-As-You-Go**). Ao final, recebe um certificado único.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4** (via PostCSS)
- **Prisma ORM 6** + PostgreSQL (Neon)
- **Auth.js v5** (NextAuth) — Credentials Provider + JWT
- **Asaas** (sandbox) para pagamentos — PIX, boleto e cartão
- **bcryptjs** para hash de senha
- **Zod** para validação

## Como rodar localmente

### Primeira vez

1. Clone o repositório:

```bash
git clone https://github.com/vilson2023/escola-virtual-modular-linear.git
cd escola-virtual-modular-linear
```

2. Crie os arquivos `.env` e `.env.local` (peça ao Kimi o conteúdo com `DATABASE_URL`, `AUTH_SECRET` e `AUTH_URL`).
3. Para testar pagamentos, configure também `ASAAS_API_KEY` e `ASAAS_API_URL` (sandbox — ver `.env.example`).
4. Rode `npm install`.
5. Rode `npx prisma generate` e `npm run db:seed`.
6. Rode `npm run dev`.

### Uso diário (Windows)

Duplo clique em:

- `tools\sync-and-run.bat` → sincroniza com GitHub e inicia o servidor
- `tools\fresh-start.bat` → reset completo (se algo der errado)

Site em http://localhost:3000. Detalhes em [tools/README.md](tools/README.md).

## Scripts úteis

- `npm run dev` → servidor de desenvolvimento (Turbopack)
- `npm run build` → build de produção
- `npm run db:seed` → popula o banco com dados demo
- `npm run db:studio` → abre o Prisma Studio (interface visual do banco)

## Credenciais de desenvolvimento

Após rodar o seed:

- **Admin:** `admin@evml.com` / `admin123`
- **Aluno:** `aluno@evml.com` / `aluno123`

⚠️ Apenas para desenvolvimento. Serão alteradas antes do deploy.

## Roadmap

- [x] **M0** — Setup do projeto + GitHub
- [x] **M1** — Schema do banco (Prisma + Neon)
- [x] **M2a** — Autenticação (Auth.js v5)
- [x] **M2b** — Seed + área admin protegida por role
- [x] **M3a** — CRUD de Cursos
- [x] **Design** — Marca dumo + design system
- [x] **Tools** — Scripts de produtividade para Windows
- [ ] **M3b** — CRUD de Módulos dentro do curso *(em andamento)*
- [ ] **M3c** — CRUD de Aulas dentro do módulo
- [ ] **M4** — Painel do aluno: guard de acesso por compra
- [ ] **M5** — Progresso de aulas + gatilho de 100%
- [ ] **M6** — Checkout one-click + gateway de pagamento
- [ ] **M7** — Anti-cheat (bloqueio fora de ordem linear)
- [ ] **M8** — Emissão de certificado
- [ ] **M9** — UI dos 3 estados (LIBERADO / VITRINE / BLOQUEADO)
- [ ] **M10** — Deploy na Vercel

## Estrutura

```text
dumo/
├── prisma/
│   ├── schema.prisma      # Modelos do banco
│   ├── migrations/        # Histórico de migrations
│   └── seed.ts            # Dados de desenvolvimento
├── src/
│   ├── app/               # Rotas (App Router)
│   │   ├── (auth)/        # Login, cadastro
│   │   ├── admin/         # Área administrativa
│   │   ├── dashboard/     # Painel do aluno
│   │   └── api/           # Rotas de API
│   ├── components/
│   │   ├── ui/            # Design system dumo
│   │   └── admin/         # Componentes do admin
│   ├── lib/               # Prisma client, Auth config
│   ├── server/            # Actions, validators, helpers
│   └── types/             # Tipos TypeScript
└── tools/                 # Scripts .bat (Windows)
```

## Licença

Projeto privado. Todos os direitos reservados.
