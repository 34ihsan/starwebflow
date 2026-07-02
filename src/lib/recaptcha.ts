/**
 * Server-side Google reCAPTCHA v3 doğrulama utility
 * Bot skor eşiği: 0.5 (0.0 = kesin bot, 1.0 = kesin insan)
 */
export async function verifyRecaptcha(token: string): Promise<{
  success: boolean;
  score?: number;
  action?: string;
  error?: string;
}> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.error('RECAPTCHA_SECRET_KEY is not set');
    // Development'ta key yoksa geç (opsiyonel güvenlik)
    return { success: true, score: 1.0 };
  }

  if (!token) {
    return { success: false, error: 'reCAPTCHA token eksik.' };
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();

    if (!data.success) {
      console.warn('reCAPTCHA verification failed:', data['error-codes']);
      return { success: false, error: 'Bot doğrulaması başarısız.' };
    }

    // v3 skoru: 0.5 altı şüpheli bot trafiği
    const score: number = data.score ?? 0;
    if (score < 0.5) {
      console.warn(`reCAPTCHA low score (${score}) — possible bot`);
      return { success: false, score, error: 'Güvenlik doğrulaması geçilemedi. Lütfen tekrar deneyin.' };
    }

    return { success: true, score, action: data.action };
  } catch (err) {
    console.error('reCAPTCHA network error:', err);
    // Network hatasında engelleme — strict mod
    return { success: false, error: 'Doğrulama servisiyle iletişim kurulamadı.' };
  }
}
