import { prisma } from '@/lib/prisma';

/**
 * Regra 4 do spec: o certificado é emitido quando 100% das aulas de TODOS
 * os módulos do curso estão concluídas pelo aluno. Não existem certificados
 * parciais. A regra é literal: só conta progresso — na prática o guard de
 * acesso já garante que o aluno só conclui aulas de módulos comprados.
 */
export async function canIssueCertificate(userId: string, courseId: string): Promise<boolean> {
  const totalLessons = await prisma.lesson.count({
    where: { module: { courseId } },
  });

  if (totalLessons === 0) return false;

  const completedLessons = await prisma.studentProgress.count({
    where: {
      userId,
      completed: true,
      lesson: { module: { courseId } },
    },
  });

  return completedLessons === totalLessons;
}

/**
 * Gera um código legível único, ex.: DUMO-2026-A3F9B2.
 */
function generateCertificateCode(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem ambíguos (0/O, 1/I)
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DUMO-${year}-${suffix}`;
}

/**
 * Se o aluno concluiu 100% do curso, emite (uma única vez) e devolve o
 * certificado. Chamadas repetidas retornam o mesmo código (idempotente).
 * Se ainda não há direito ao certificado, retorna null.
 */
export async function getOrCreateCertificate(
  userId: string,
  courseId: string,
): Promise<{ code: string; issuedAt: Date } | null> {
  if (!(await canIssueCertificate(userId, courseId))) return null;

  const existing = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { code: true, issuedAt: true },
  });
  if (existing) return existing;

  // Gera código até encontrar um que não colida (improvável, mas barato).
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCertificateCode();
    try {
      const created = await prisma.certificate.create({
        data: { userId, courseId, code },
        select: { code: true, issuedAt: true },
      });
      return created;
    } catch {
      // colisão de código único → tenta de novo
    }
  }

  return null;
}

/**
 * Lista os certificados já emitidos para o aluno (para o dashboard).
 */
export async function getCertificatesForStudent(userId: string) {
  return prisma.certificate.findMany({
    where: { userId },
    orderBy: { issuedAt: 'desc' },
    include: { course: { select: { title: true } } },
  });
}
