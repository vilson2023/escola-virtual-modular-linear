import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createDemoCourse } from './demo-course';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // ---------- USERS ----------
  const adminPassword = await bcrypt.hash('admin123', 10);
  const studentPassword = await bcrypt.hash('aluno123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@evml.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@evml.com',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      status: 'ACTIVE',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'aluno@evml.com' },
    update: {},
    create: {
      name: 'Aluno Demo',
      email: 'aluno@evml.com',
      passwordHash: studentPassword,
      role: UserRole.STUDENT,
      status: 'ACTIVE',
    },
  });

  console.log(`👤 Admin: ${admin.email} (senha: admin123)`);
  console.log(`👤 Aluno: ${student.email} (senha: aluno123)`);

  // ---------- COURSE + MODULES + LESSONS ----------
  const { moduleIds } = await createDemoCourse(prisma);
  console.log(`📚 Curso demo recriado (${moduleIds.length} módulos)`);

  // ---------- PURCHASES DEMO ----------
  // Limpa compras anteriores do aluno demo para re-seed idempotente
  await prisma.studentPurchase.deleteMany({ where: { userId: student.id } });

  const [m1, m2, m3] = moduleIds;

  await prisma.studentPurchase.create({
    data: { userId: student.id, moduleId: m1, statusPayment: 'PAID', purchasedAt: new Date() },
  });
  await prisma.studentPurchase.create({
    data: { userId: student.id, moduleId: m2, statusPayment: 'PAID', purchasedAt: new Date() },
  });
  await prisma.studentPurchase.create({
    data: { userId: student.id, moduleId: m3, statusPayment: 'PENDING' },
  });

  console.log('💳 Compras demo: M1 e M2 PAID · M3 PENDING');

  console.log('✅ Seed concluído.');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
