import { z } from 'zod';

export const moduleSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(200),
  description: z.string().max(2000).optional().or(z.literal('')),
  orderIndex: z.coerce.number().int().positive('A ordem deve ser um número positivo'),
  priceCents: z.coerce.number().int().min(0, 'Preço inválido'),
  presentationVideoUrl: z
    .string()
    .url('URL inválida')
    .optional()
    .or(z.literal('')),
});

export type ModuleInput = z.infer<typeof moduleSchema>;
