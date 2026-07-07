import { z } from 'zod';

export const registerTenantSchema = z.object({
  agencyName: z.string().min(2, 'Ajans adı en az 2 karakter olmalıdır.').max(100),
  slug: z.string().min(2, 'Slug en az 2 karakter olmalıdır.').max(50).regex(/^[a-z0-9-]+$/, 'Slug sadece küçük harf, sayı ve tire içerebilir.'),
  fullName: z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır.').max(100),
  email: z.string().trim().email('Geçerli bir e-posta adresi giriniz.'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır.')
    .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir.')
    .regex(/[a-z]/, 'Şifre en az bir küçük harf içermelidir.')
    .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir.')
});

export const loginSchema = z.object({
  email: z.string().trim().email('Geçerli bir e-posta adresi giriniz.'),
  password: z.string().min(1, 'Şifre zorunludur.')
});
