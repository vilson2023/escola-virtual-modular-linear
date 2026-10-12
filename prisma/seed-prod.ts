import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createDemoCourse } from './demo-course';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? 'Administrador';

  if (!email || !password) {
    console.error('❌ ADMIN_EMAIL e ADMIN_PASSWORD são obrigatórios.');
    console.error(
      '   Exemplo: ADMIN_EMAIL=voce@dumo.com ADMIN_PASSWORD=SenhaForte npm run db:seed:prod',
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('❌ A senha deve ter pelo menos 8 caracteres.');
    process.exit(1);
  }

  console.log('🌱 Seed de produção...');

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: {
      passwordHash,
      role: UserRole.ADMIN,
      status: 'ACTIVE',
    },
    create: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: UserRole.ADMIN,
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Admin pronto: ${admin.email}`);
  console.log('⚠️  Guarde a senha em local seguro. Ela não será mostrada novamente.');

  // ---------- CURSO DEMO (opcional) ----------
  // SEED_DEMO_COURSE=true popula o curso demo em produção (útil para
  // demonstrar a plataforma). Remova quando for publicar de verdade.
  if (process.env.SEED_DEMO_COURSE === 'true') {
    console.log('🌱 SEED_DEMO_COURSE=true — populando curso demo...');
    const { moduleIds } = await createDemoCourse(prisma);
    console.log(`📚 Curso demo criado em produção (${moduleIds.length} módulos)`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
