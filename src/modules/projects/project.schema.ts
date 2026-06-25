import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(3, 'Proje başlığı en az 3 karakter olmalıdır.').max(100, 'Proje başlığı en fazla 100 karakter olmalıdır.'),
  briefData: z.record(z.any()).optional()
});

export const updateProjectSchema = z.object({
  title: z.string().min(3, 'Proje başlığı en az 3 karakter olmalıdır.').max(100).optional(),
  briefData: z.record(z.any()).optional(),
  status: z.enum(['briefing', 'in_progress', 'review', 'completed', 'paused']).optional(),
  managerId: z.string().uuid('Geçersiz yönetici ID.').optional().nullable()
});
