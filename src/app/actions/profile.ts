'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyJWT, signJWT } from '@/modules/auth/auth.jwt';
import { getJwtSecret } from '@/lib/config';
import { AuthService } from '@/modules/auth/auth.service';

/**
 * Mevcut JWT token içindeki kullanıcıyı çözümleyip, veritabanından en güncel bilgileri döner.
 */
export async function getProfile() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('next-auth.session-token')?.value;

    if (!token) {
      return { success: false, error: 'Oturum bulunamadı' };
    }

    const payload = await verifyJWT(token, getJwtSecret());
    if (!payload || !payload.userId) {
      return { success: false, error: 'Geçersiz oturum' };
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        name: true,
        email: true,
        role: true,
      }
    });

    if (!user) {
      return { success: false, error: 'Kullanıcı bulunamadı' };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error('getProfile error:', error);
    return { success: false, error: 'Profil bilgileri alınırken hata oluştu' };
  }
}

/**
 * Kullanıcı profil bilgilerini (name, email) günceller.
 */
export async function updateProfile(data: { name: string; email: string }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('next-auth.session-token')?.value;

    if (!token) return { success: false, error: 'Oturum bulunamadı' };

    const payload = await verifyJWT(token, getJwtSecret());
    if (!payload || !payload.userId) return { success: false, error: 'Geçersiz oturum' };

    // Email başka biri tarafından kullanılıyor mu?
    if (data.email !== payload.email) {
      const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingUser) {
        return { success: false, error: 'Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.' };
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        name: data.name,
        email: data.email,
      }
    });

    // Oturumu kapatmadan JWT içindeki email ve name bilgilerini de güncelliyoruz.
    const newPayload = {
      ...payload,
      name: updatedUser.name,
      email: updatedUser.email
    };
    
    const newToken = await signJWT(newPayload, getJwtSecret(), 86400);

    cookieStore.set('next-auth.session-token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400,
      path: '/'
    });

    return { success: true, message: 'Profil başarıyla güncellendi' };
  } catch (error) {
    console.error('updateProfile error:', error);
    return { success: false, error: 'Profil güncellenirken hata oluştu' };
  }
}

/**
 * Kullanıcı şifresini değiştirir.
 */
export async function changePassword(data: { currentPassword: string; newPassword: string }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('next-auth.session-token')?.value;

    if (!token) return { success: false, error: 'Oturum bulunamadı' };

    const payload = await verifyJWT(token, getJwtSecret());
    if (!payload || !payload.userId) return { success: false, error: 'Geçersiz oturum' };

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.passwordHash) {
      return { success: false, error: 'Kullanıcı bulunamadı veya şifre ayarlanmamış' };
    }

    // Mevcut şifreyi doğrula
    const isPasswordValid = await AuthService.verifyPassword(data.currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return { success: false, error: 'Mevcut şifreniz hatalı' };
    }

    // Yeni şifreyi hashle
    const newPasswordHash = await AuthService.hashPassword(data.newPassword);

    await prisma.user.update({
      where: { id: payload.userId },
      data: { passwordHash: newPasswordHash }
    });

    return { success: true, message: 'Şifreniz başarıyla değiştirildi' };
  } catch (error) {
    console.error('changePassword error:', error);
    return { success: false, error: 'Şifre değiştirilirken hata oluştu' };
  }
}
