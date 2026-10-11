import { PrismaClient, UserRole, ContentType } from '@prisma/client';
import bcrypt from 'bcryptjs';

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

  // ---------- COURSE ----------
  // Apaga o curso demo anterior (se existir) para permitir re-seed limpo
  await prisma.course.deleteMany({
    where: { title: 'Curso Demo: Fundamentos' },
  });

  const course = await prisma.course.create({
    data: {
      title: 'Curso Demo: Fundamentos',
      description:
        'Curso de demonstração com 3 módulos lineares. Use para testar o fluxo Pay-As-You-Go.',
    },
  });

  // ---------- MODULES + LESSONS ----------
  const modulesData = [
    {
      title: 'Módulo 1: Introdução',
      description: 'Conceitos básicos e visão geral.',
      orderIndex: 1,
      priceCents: 9700, // R$ 97,00
      presentationVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      lessons: [
        {
          title: 'Boas-vindas',
          contentType: ContentType.VIDEO,
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        },
        {
          title: 'Como funciona a plataforma',
          contentType: ContentType.TEXT,
          textContent: 'Texto explicativo da plataforma...',
        },
        {
          title: 'Primeiros passos',
          contentType: ContentType.VIDEO,
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        },
      ],
    },
    {
      title: 'Módulo 2: Prática',
      description: 'Mão na massa.',
      orderIndex: 2,
      priceCents: 14700, // R$ 147,00
      presentationVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      lessons: [
        {
          title: 'Exercício 1',
          contentType: ContentType.VIDEO,
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        },
        {
          title: 'Exercício 2',
          contentType: ContentType.VIDEO,
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        },
      ],
    },
    {
      title: 'Módulo 3: Avançado',
      description: 'Conteúdo avançado e encerramento.',
      orderIndex: 3,
      priceCents: 19700, // R$ 197,00
      presentationVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      lessons: [
        {
          title: 'Aula avançada',
          contentType: ContentType.VIDEO,
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        },
        {
          title: 'Encerramento',
          contentType: ContentType.TEXT,
          textContent: 'Texto de encerramento...',
        },
      ],
    },
  ];

  for (const m of modulesData) {
    const module = await prisma.module.create({
      data: {
        courseId: course.id,
        title: m.title,
        description: m.description,
        orderIndex: m.orderIndex,
        priceCents: m.priceCents,
        presentationVideoUrl: m.presentationVideoUrl,
      },
    });

    let order = 1;
    for (const l of m.lessons) {
      await prisma.lesson.create({
        data: {
          moduleId: module.id,
          title: l.title,
          contentType: l.contentType,
          videoUrl: l.videoUrl ?? null,
          textContent: l.textContent ?? null,
          orderIndex: order++,
        },
      });
    }
  }

  console.log(`📚 Curso criado: ${course.title} (${modulesData.length} módulos)`);

  // ---------- PURCHASE DEMO ----------
  const firstModule = await prisma.module.findFirst({
    where: { courseId: course.id, orderIndex: 1 },
  });

  if (firstModule) {
    await prisma.studentPurchase.upsert({
      where: {
        userId_moduleId: { userId: student.id, moduleId: firstModule.id },
      },
      update: {},
      create: {
        userId: student.id,
        moduleId: firstModule.id,
        statusPayment: 'PAID',
        purchasedAt: new Date(),
      },
    });
    console.log(`💳 Compra demo: aluno acessa "${firstModule.title}"`);
  }

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
