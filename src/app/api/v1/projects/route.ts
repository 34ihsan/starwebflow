import { NextResponse } from 'next/server';
import { getSession } from '../../../../modules/auth/auth.helpers';
import { createProjectSchema } from '../../../../modules/projects/project.schema';
import { ProjectService } from '../../../../modules/projects/project.service';

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Oturum açmanız gerekiyor.' }
      }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rawLimit = parseInt(searchParams.get('limit') || '10', 10);
    const limit = isNaN(rawLimit) ? 10 : Math.max(1, Math.min(100, rawLimit));
    const cursor = searchParams.get('cursor') || undefined;

    // Filter projects if user is client-side
    const isClientRole = ['CLIENT_OWNER', 'CLIENT_MEMBER'].includes(session.role);
    const clientIdFilter = isClientRole ? session.userId : undefined;

    const result = await ProjectService.getProjects(session.tenantId, {
      limit,
      cursor,
      clientId: clientIdFilter
    });

    return NextResponse.json({
      success: true,
      data: result.projects,
      pagination: {
        nextCursor: result.nextCursor,
        hasNextPage: !!result.nextCursor
      }
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Bir sunucu hatası oluştu.' }
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Oturum açmanız gerekiyor.' }
      }, { status: 401 });
    }

    // Role check: Only CLIENT_OWNER and AGENCY_OWNER can create projects
    const canCreate = ['CLIENT_OWNER', 'AGENCY_OWNER'].includes(session.role);
    if (!canCreate) {
      return NextResponse.json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Bu işlem için yetkiniz bulunmuyor.' }
      }, { status: 403 });
    }

    const body = await req.json();
    const validation = createProjectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Veri doğrulama hatası oluştu.',
          details: validation.error.errors.map(err => ({
            field: err.path.join('.'),
            issue: err.message
          }))
        }
      }, { status: 400 });
    }

    const project = await ProjectService.createProject(
      session.tenantId,
      session.userId, // client creating is marked as clientId
      validation.data
    );

    return NextResponse.json({
      success: true,
      data: project
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Bir sunucu hatası oluştu.' }
    }, { status: 500 });
  }
}
