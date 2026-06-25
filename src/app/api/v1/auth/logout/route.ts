import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    data: {
      message: 'Oturum başarıyla sonlandırıldı.'
    }
  }, { status: 200 });

  // Clear Session Cookie by setting maxAge to 0
  response.cookies.set('next-auth.session-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });

  return response;
}
