import { z } from 'zod';

const baseSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(200),
  contentType: z.enum(['VIDEO', 'TEXT', 'FILE']),
  orderIndex: z.coerce.number().int().positive('A ordem deve ser um número positivo'),
  videoUrl: z.string().url('URL de vídeo inválida').optional().or(z.literal('')),
  textContent: z.string().max(50000).optional().or(z.literal('')),
  fileUrl: z.string().url('URL de arquivo inválida').optional().or(z.literal('')),
});

export const lessonSchema = baseSchema.superRefine((data, ctx) => {
  if (data.contentType === 'VIDEO' && !data.videoUrl) {
    ctx.addIssue({
      code: 'custom',
      path: ['videoUrl'],
      message: 'URL do vídeo é obrigatória para aulas de vídeo',
    });
  }
  if (data.contentType === 'TEXT' && !data.textContent) {
    ctx.addIssue({
      code: 'custom',
      path: ['textContent'],
      message: 'Conteúdo do texto é obrigatório para aulas de texto',
    });
  }
  if (data.contentType === 'FILE' && !data.fileUrl) {
    ctx.addIssue({
      code: 'custom',
      path: ['fileUrl'],
      message: 'URL do arquivo é obrigatória para aulas de arquivo',
    });
  }
});

export type LessonInput = z.infer<typeof baseSchema>;
