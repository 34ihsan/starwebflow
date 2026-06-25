import { NextResponse } from 'next/server';
import { registerTenantSchema } from '../../../../../modules/auth/auth.schema';
import { AuthService } from '../../../../../modules/auth/auth.service';
import { signJWT } from '../../../../../modules/auth/auth.jwt';
import { getJwtSecret } from '../../../../../lib/config';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerTenantSchema.safeParse(body);

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

    const { user, tenant } = await AuthService.registerTenant(result.data);

    // Create JWT Session
    const payload = {
      userId: user.id,
      tenantId: tenant.id,
      role: user.role,
      name: user.name,
      email: user.email,
    };
    const token = await signJWT(payload, getJwtSecret(), 86400);

    const response = NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        tenantId: tenant.id,
        slug: tenant.slug,
        role: user.role
      }
    }, { status: 201 });

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

    if (error.message === 'SLUG_ALREADY_EXISTS') {
      code = 'SLUG_ALREADY_EXISTS';
      message = 'Bu ajans adresi (slug) zaten kullanımda.';
      status = 400;
    } else if (error.message === 'EMAIL_ALREADY_EXISTS') {
      code = 'EMAIL_ALREADY_EXISTS';
      message = 'Bu e-posta adresi zaten kullanımda.';
      status = 400;
    }

    return NextResponse.json({
      success: false,
      error: { code, message }
    }, { status });
  }
}
