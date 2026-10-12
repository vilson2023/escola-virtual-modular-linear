/**
 * Dados e criação do curso demo — compartilhado entre seed.ts (dev)
 * e seed-prod.ts (produção, via SEED_DEMO_COURSE=true).
 */
import { PrismaClient, ContentType } from '@prisma/client';

export const DEMO_COURSE_TITLE = 'Como transformar seu Facebook em uma máquina de vendas';

const YT = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

const modulesData = [
  {
    title: 'Módulo 1: Fundamentos da presença comercial',
    description:
      'Prepare a base: tipos de página, configurações essenciais e a identidade da sua presença no Facebook.',
    orderIndex: 1,
    priceCents: 1990, // R$ 19,90
    estimatedDurationMinutes: 90,
    lessons: [
      { title: 'Boas-vindas ao curso', contentType: ContentType.VIDEO, videoUrl: YT },
      {
        title: 'Perfil, página ou grupo: o que usar',
        contentType: ContentType.VIDEO,
        videoUrl: YT,
      },
      {
        title: 'Configurando sua página comercial',
        contentType: ContentType.TEXT,
        textContent: 'Passo a passo das configurações essenciais...',
      },
    ],
  },
  {
    title: 'Módulo 2: Estratégia de conteúdo',
    description:
      'Aprenda a planejar conteúdo que atrai o público certo e constrói autoridade para o seu negócio.',
    orderIndex: 2,
    priceCents: 2990, // R$ 29,90
    estimatedDurationMinutes: 120,
    lessons: [
      { title: 'Os 4 pilares do conteúdo', contentType: ContentType.VIDEO, videoUrl: YT },
      { title: 'Calendário de conteúdo na prática', contentType: ContentType.VIDEO, videoUrl: YT },
      {
        title: 'Exercício: planeje sua primeira semana',
        contentType: ContentType.TEXT,
        textContent: 'Exercício prático de planejamento...',
      },
      { title: 'Formatos que engajam', contentType: ContentType.VIDEO, videoUrl: YT },
    ],
  },
  {
    title: 'Módulo 3: Atraindo potenciais clientes',
    description:
      'Técnicas de atração orgânica e os primeiros passos para gerar leads qualificados.',
    orderIndex: 3,
    priceCents: 3990, // R$ 39,90
    estimatedDurationMinutes: 150,
    lessons: [
      { title: 'Entendendo o algoritmo', contentType: ContentType.VIDEO, videoUrl: YT },
      { title: 'Chamadas para ação que convertem', contentType: ContentType.VIDEO, videoUrl: YT },
      { title: 'Seu primeiro funil de leads', contentType: ContentType.VIDEO, videoUrl: YT },
    ],
  },
  {
    title: 'Módulo 4: Organizando o processo de vendas',
    description:
      'Do primeiro contato ao fechamento: scripts, organização e ferramentas simples de vendas.',
    orderIndex: 4,
    priceCents: 4990, // R$ 49,90
    estimatedDurationMinutes: 120,
    lessons: [
      { title: 'O funil de vendas no Facebook', contentType: ContentType.VIDEO, videoUrl: YT },
      {
        title: 'Scripts de atendimento',
        contentType: ContentType.TEXT,
        textContent: 'Modelos de resposta para cada situação...',
      },
      { title: 'Ferramentas de organização', contentType: ContentType.VIDEO, videoUrl: YT },
      { title: 'Estudo de caso: venda real', contentType: ContentType.VIDEO, videoUrl: YT },
    ],
  },
  {
    title: 'Módulo 5: Anúncios para acelerar resultados',
    description:
      'Primeiros passos no Gerenciador de Anúncios: público, criativo e orçamento de forma segura.',
    orderIndex: 5,
    priceCents: 3990, // R$ 39,90
    estimatedDurationMinutes: 90,
    lessons: [
      { title: 'Quando anunciar', contentType: ContentType.VIDEO, videoUrl: YT },
      { title: 'Definindo público e orçamento', contentType: ContentType.VIDEO, videoUrl: YT },
      { title: 'Lendo os primeiros resultados', contentType: ContentType.VIDEO, videoUrl: YT },
    ],
  },
  {
    title: 'Módulo 6: Escala e automação',
    description:
      'Padronize, automatize e escale sua operação comercial para crescer sem perder qualidade.',
    orderIndex: 6,
    priceCents: 4990, // R$ 49,90
    estimatedDurationMinutes: 140,
    lessons: [
      { title: 'Métricas que importam', contentType: ContentType.VIDEO, videoUrl: YT },
      { title: 'Automações com o Meta', contentType: ContentType.VIDEO, videoUrl: YT },
      {
        title: 'Plano de crescimento de 90 dias',
        contentType: ContentType.TEXT,
        textContent: 'Roteiro de evolução do seu negócio...',
      },
      { title: 'Encerramento e próximos passos', contentType: ContentType.VIDEO, videoUrl: YT },
    ],
  },
];

/**
 * Recria o curso demo (apaga o anterior pelo título e cria do zero,
 * com módulos e aulas). Retorna os IDs dos módulos na ordem.
 */
export async function createDemoCourse(prisma: PrismaClient): Promise<{
  courseId: string;
  moduleIds: string[];
}> {
  await prisma.course.deleteMany({ where: { title: DEMO_COURSE_TITLE } });

  const course = await prisma.course.create({
    data: {
      title: DEMO_COURSE_TITLE,
      description:
        'Aprenda a estruturar sua presença comercial no Facebook, desenvolver conteúdo estratégico, atrair potenciais clientes e organizar um processo de vendas.',
      shortDescription:
        'Estruture sua presença comercial no Facebook e transforme seguidores em clientes.',
      category: 'Marketing Digital',
      coverImageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
      learningObjectives:
        'Como estruturar uma página comercial profissional no Facebook.\n' +
        'Como planejar conteúdo que atrai e engaja o público certo.\n' +
        'Como transformar seguidores em leads e leads em clientes.\n' +
        'Como organizar um processo de vendas simples e repetível.',
      targetAudience:
        'Empreendedores, profissionais liberais e pequenos negócios que querem vender no Facebook.',
      prerequisites: 'Não é necessário ter experiência prévia.',
      skills:
        'Estratégia de conteúdo, Gestão de página comercial, Geração de leads, Processo de vendas',
      hasCertificate: true,
    },
  });

  const moduleIds: string[] = [];

  for (const m of modulesData) {
    const module = await prisma.module.create({
      data: {
        courseId: course.id,
        title: m.title,
        description: m.description,
        orderIndex: m.orderIndex,
        priceCents: m.priceCents,
        presentationVideoUrl: YT,
        estimatedDurationMinutes: m.estimatedDurationMinutes,
      },
    });
    moduleIds.push(module.id);

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

  return { courseId: course.id, moduleIds };
}
