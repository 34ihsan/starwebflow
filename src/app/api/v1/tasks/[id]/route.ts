import { NextResponse } from 'next/server';
import { getSession } from '../../../../../modules/auth/auth.helpers';
import { updateTaskSchema } from '../../../../../modules/tasks/task.schema';
import { TaskService } from '../../../../../modules/tasks/task.service';

interface RouteContext {
  params: { id: string };
}

// GET /api/v1/tasks/[id]
// Returns a single task by ID (with parent project included for context).
// Access: All authenticated users belonging to the tenant.
export async function GET(req: Request, { params }: RouteContext) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Oturum açmanız gerekiyor.' } },
        { status: 401 }
      );
    }

    const task = await TaskService.getTaskById(session.tenantId, params.id);

    return NextResponse.json({ success: true, data: task }, { status: 200 });

  } catch (error: any) {
    if (error.message === 'TASK_NOT_FOUND') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Görev bulunamadı.' } },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Bir sunucu hatası oluştu.' } },
      { status: 500 }
    );
  }
}

// PUT /api/v1/tasks/[id]
// Updates a task.
// Agency: Can update all fields.
// Client: Can only transition status from 'review' -> 'done' | 'todo' (enforced in service layer).
export async function PUT(req: Request, { params }: RouteContext) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Oturum açmanız gerekiyor.' } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = updateTaskSchema.safeParse(body);

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

    const task = await TaskService.updateTask(
      session.tenantId,
      params.id,
      validation.data,
      session.role,
      session.userId
    );

    return NextResponse.json({ success: true, data: task }, { status: 200 });

  } catch (error: any) {
    if (error.message === 'TASK_NOT_FOUND') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Görev bulunamadı.' } },
        { status: 404 }
      );
    }
    if (error.message === 'CLIENT_UNAUTHORIZED_FIELDS') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'İstemci rolü bu alanları güncelleyemez.' } },
        { status: 403 }
      );
    }
    if (error.message === 'CLIENT_INVALID_STATUS_TRANSITION') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_STATUS_TRANSITION',
            message: 'İstemci yalnızca "review" durumundaki görevleri "done" veya "todo" olarak güncelleyebilir.',
          },
        },
        { status: 422 }
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

// DELETE /api/v1/tasks/[id]
// Soft-deletes (hard-deletes in MVP) a task.
// Access: Agency roles only (AGENCY_OWNER, AGENCY_MEMBER).
export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Oturum açmanız gerekiyor.' } },
        { status: 401 }
      );
    }

    // Role check: Clients cannot delete tasks
    const isClient = ['CLIENT_OWNER', 'CLIENT_MEMBER'].includes(session.role);
    if (isClient) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Bu işlem için yetkiniz bulunmuyor.' } },
        { status: 403 }
      );
    }

    await TaskService.deleteTask(session.tenantId, params.id);

    return new NextResponse(null, { status: 204 });

  } catch (error: any) {
    if (error.message === 'TASK_NOT_FOUND') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Görev bulunamadı.' } },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Bir sunucu hatası oluştu.' } },
      { status: 500 }
    );
  }
}
