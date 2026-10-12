'use server';

import { requireAuth } from '@/server/auth/session';
import { getOrCreateCertificate } from '@/server/services/certificate';

export async function issueCertificateAction(
  courseId: string,
): Promise<{ ok: true; code: string } | { error: string }> {
  const user = await requireAuth();

  const certificate = await getOrCreateCertificate(user.id, courseId);
  if (!certificate) {
    return { error: 'Você ainda não concluiu todas as aulas do curso' };
  }

  return { ok: true, code: certificate.code };
}
