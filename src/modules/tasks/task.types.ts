export interface CreateTaskInput {
  title: string;
  description?: string;
  assigneeId?: string;
  dueDate?: string; // ISO DateTime string
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: 'todo' | 'doing' | 'review' | 'done';
  assigneeId?: string | null;
  dueDate?: string | null; // ISO DateTime string or null
}
