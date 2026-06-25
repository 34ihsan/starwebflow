import { NextResponse } from 'next/server';
import { getSession } from '../../../../../modules/auth/auth.helpers';
import { updateProjectSchema } from '../../../../../modules/projects/project.schema';
import { ProjectService } from '../../../../../modules/projects/project.service';

export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Oturum açmanız gerekiyor.' }
      }, { status: 401 });
    }

    const { projectId } = params;
    const project = await ProjectService.getProjectById(session.tenantId, projectId);

    // IDOR / Client Role Check: Clients can only access their own projects
    const isClientRole = ['CLIENT_OWNER', 'CLIENT_MEMBER'].includes(session.role);
    if (isClientRole && project.clientId !== session.userId) {
      return NextResponse.json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Bu projeye erişim yetkiniz bulunmuyor.' }
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: project
    }, { status: 200 });

  } catch (error: any) {
    if (error.message === 'PROJECT_NOT_FOUND') {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Proje bulunamadı.' }
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Bir sunucu hatası oluştu.' }
    }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Oturum açmanız gerekiyor.' }
      }, { status: 401 });
    }

    const { projectId } = params;
    const project = await ProjectService.getProjectById(session.tenantId, projectId);

    const isClientRole = ['CLIENT_OWNER', 'CLIENT_MEMBER'].includes(session.role);

    // 1. Ownership and authorization checks
    if (isClientRole) {
      if (project.clientId !== session.userId) {
        return NextResponse.json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Bu projeyi güncelleme yetkiniz bulunmuyor.' }
        }, { status: 403 });
      }
      if (session.role !== 'CLIENT_OWNER') {
        return NextResponse.json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Sadece proje sahibi projeyi güncelleyebilir.' }
        }, { status: 403 });
      }
    }

    const body = await req.json();
    const validation = updateProjectSchema.safeParse(body);

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

    // 2. Safe field assignment (Restriction for client roles)
    let updateData = validation.data;
    if (isClientRole) {
      // Clients cannot change status or assign managerId
      updateData = {
        title: updateData.title,
        briefData: updateData.briefData
      };
    }

    const updatedProject = await ProjectService.updateProject(
      session.tenantId,
      projectId,
      updateData
    );

    return NextResponse.json({
      success: true,
      data: updatedProject
    }, { status: 200 });

  } catch (error: any) {
    if (error.message === 'PROJECT_NOT_FOUND') {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Proje bulunamadı.' }
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Bir sunucu hatası oluştu.' }
    }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: { params: { projectId: string } }) {
  return PUT(req, context);
}
