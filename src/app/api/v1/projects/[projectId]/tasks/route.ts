import { NextResponse } from 'next/server';
import { getSession } from '../../../../../../modules/auth/auth.helpers';
import { createTaskSchema } from '../../../../../../modules/tasks/task.schema';
import { TaskService } from '../../../../../../modules/tasks/task.service';

interface RouteContext {
  params: { projectId: string };
}

// GET /api/v1/projects/[projectId]/tasks
// Lists all tasks for a given project.
// Access: All authenticated users belonging to the tenant (IDOR protected inside service).
export async function GET(req: Request, { params }: RouteContext) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Oturum açmanız gerekiyor.' } },
        { status: 401 }
      );
    }

    const { projectId } = params;
    const tasks = await TaskService.getTasksByProjectId(session.tenantId, projectId);

    return NextResponse.json({ success: true, data: tasks }, { status: 200 });

  } catch (error: any) {
    if (error.message === 'PROJECT_NOT_FOUND') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Proje bulunamadı.' } },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Bir sunucu hatası oluştu.' } },
      { status: 500 }
    );
  }
}

// POST /api/v1/projects/[projectId]/tasks
// Creates a new task under a project.
// Access: Agency roles only (AGENCY_OWNER, AGENCY_MEMBER). Clients cannot create tasks.
export async function POST(req: Request, { params }: RouteContext) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Oturum açmanız gerekiyor.' } },
        { status: 401 }
      );
    }

    // Role check: Clients cannot create tasks
    const isClient = ['CLIENT_OWNER', 'CLIENT_MEMBER'].includes(session.role);
    if (isClient) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Bu işlem için yetkiniz bulunmuyor.' } },
        { status: 403 }
      );
    }

    const { projectId } = params;

    const body = await req.json();
    const validation = createTaskSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Veri doğrulama hatası oluştu.',
            details: validation.error.errors.map((err) => ({
              field: err.path.join('.'),
              issue: err.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    const task = await TaskService.createTask(session.tenantId, projectId, validation.data);

    return NextResponse.json({ success: true, data: task }, { status: 201 });

  } catch (error: any) {
    if (error.message === 'PROJECT_NOT_FOUND') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Proje bulunamadı.' } },
        { status: 404 }
      );
    }
    if (error.message === 'INVALID_ASSIGNEE') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_ASSIGNEE', message: 'Belirtilen sorumlu bu tenant\'a ait değil.' } },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Bir sunucu hatası oluştu.' } },
      { status: 500 }
    );
  }
}
