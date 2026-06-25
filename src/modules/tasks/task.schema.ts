import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(3, 'Görev başlığı en az 3 karakter olmalıdır.').max(100),
  description: z.string().optional(),
  assigneeId: z.string().uuid('Geçersiz görev sorumlusu ID.').optional(),
  dueDate: z.string().datetime('Geçersiz tarih formatı (ISO 8601 olmalıdır).').optional()
});

export const updateTaskSchema = z.object({
  title: z.string().min(3, 'Görev başlığı en az 3 karakter olmalıdır.').max(100).optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'doing', 'review', 'done']).optional(),
  assigneeId: z.string().uuid('Geçersiz görev sorumlusu ID.').optional().nullable(),
  dueDate: z.string().datetime('Geçersiz tarih formatı (ISO 8601 olmalıdır).').optional().nullable()
});
