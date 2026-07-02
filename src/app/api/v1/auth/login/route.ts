import { NextResponse } from 'next/server';
import { loginSchema } from '../../../../../modules/auth/auth.schema';
import { AuthService } from '../../../../../modules/auth/auth.service';
import { signJWT } from '../../../../../modules/auth/auth.jwt';
import { getJwtSecret } from '../../../../../lib/config';
import { verifyRecaptcha } from '@/lib/recaptcha';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { recaptchaToken, ...loginBody } = body;

    // reCAPTCHA doğrulaması
    if (recaptchaToken) {
      const captcha = await verifyRecaptcha(recaptchaToken);
      if (!captcha.success) {
        return NextResponse.json({
          success: false,
          error: { code: 'RECAPTCHA_FAILED', message: captcha.error || 'Bot doğrulaması başarısız.' }
        }, { status: 400 });
      }
    }

    const result = loginSchema.safeParse(loginBody);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Giriş verileri doğrulanırken hata oluştu.',
          details: result.error.errors.map(err => ({
            field: err.path.join('.'),
            issue: err.message
          }))
        }
      }, { status: 400 });
    }

    const user = await AuthService.login(result.data);

    // Create JWT Session
    const payload = {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
      name: user.name,
      email: user.email,
    };
    const token = await signJWT(payload, getJwtSecret(), 86400);

    const response = NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        role: user.role
      }
    }, { status: 200 });

    // Set Session Token httpOnly Cookie
    response.cookies.set('next-auth.session-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 1 Day
      path: '/'
    });

    return response;

  } catch (error: any) {
    let code = 'INTERNAL_ERROR';
    let message = 'Bir sunucu hatası oluştu.';
    let status = 500;

    if (error.message === 'INVALID_CREDENTIALS') {
      code = 'INVALID_CREDENTIALS';
      message = 'E-posta adresi veya şifre hatalı.';
      status = 401;
    } else if (error.message === 'PASSWORD_REQUIRED') {
      code = 'PASSWORD_REQUIRED';
      message = 'Şifre alanı zorunludur.';
      status = 400;
    } else if (error.message === 'EMAIL_NOT_VERIFIED') {
      code = 'EMAIL_NOT_VERIFIED';
      message = 'E-posta adresiniz henüz doğrulanmamıştır. Lütfen gelen kutunuzdaki onay bağlantısına tıklayın.';
      status = 403;
    }

    return NextResponse.json({
      success: false,
      error: { code, message }
    }, { status });
  }
}
