import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/modules/auth/auth.service';

export async function GET(req: Request) {
  try {
    const email = 'sinan.guenay@starwebflow.com';
    const name = 'Sinan Günay';
    const password = 'StarWebflow2026!';

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } }
    });

    let tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          id: 'starwebflow-agency',
          name: 'StarWebFlow Agency',
          slug: 'starwebflow-agency',
        }
      });
    }

    const passwordHash = await AuthService.hashPassword(password);

    if (existing) {
      const user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          passwordHash,
          role: 'SUPER_ADMIN',
          emailVerified: true,
          name
        }
      });
      return NextResponse.json({
        success: true,
        message: 'SUPER_ADMIN_PASSWORD_UPDATED',
        user: { email: user.email, role: user.role }
      });
    }

    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email,
        name,
        passwordHash,
        role: 'SUPER_ADMIN',
        emailVerified: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'SUPER_ADMIN_CREATED',
      user: { email: user.email, role: user.role }
    });
  } catch (error: any) {
    console.error('Bootstrap admin error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Server error' }, { status: 500 });
  }
}
