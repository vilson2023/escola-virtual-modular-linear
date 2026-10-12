import { prisma } from '@/lib/prisma';
import type { CourseCardData } from '@/components/course/CourseCard';

/**
 * Lista os cursos para a vitrine (cards com capa, categoria,
 * quantidade de módulos e menor preço).
 */
export async function getCourseCards(): Promise<CourseCardData[]> {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      _count: { select: { modules: true } },
      modules: { select: { priceCents: true } },
    },
  });

  return courses.map((c) => ({
    id: c.id,
    title: c.title,
    shortDescription: c.shortDescription,
    description: c.description,
    category: c.category,
    coverImageUrl: c.coverImageUrl,
    hasCertificate: c.hasCertificate,
    moduleCount: c._count.modules,
    minPriceCents: c.modules.length ? Math.min(...c.modules.map((m) => m.priceCents)) : null,
  }));
}
