import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/modules/auth/auth.service';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ success: false, error: 'Token ve yeni şifre gereklidir.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Şifre en az 6 karakter olmalıdır.' }, { status: 400 });
    }

    // Find valid token
    const dbToken = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    });

    if (!dbToken) {
      return NextResponse.json({ success: false, error: 'Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.' }, { status: 400 });
    }

    // Hash and update password
    const hashedPassword = await AuthService.hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: dbToken.userId },
        data: {
          passwordHash: hashedPassword
        }
      }),
      prisma.passwordResetToken.update({
        where: { id: dbToken.id },
        data: {
          used: true
        }
      })
    ]);

    return NextResponse.json({ success: true, message: 'PASSWORD_RESET_SUCCESS' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ success: false, error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
