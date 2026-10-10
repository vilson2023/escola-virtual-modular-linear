import { z } from 'zod';

export const courseSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(200),
  description: z.string().max(2000).optional().or(z.literal('')),
});

export type CourseInput = z.infer<typeof courseSchema>;
