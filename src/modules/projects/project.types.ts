export interface CreateProjectInput {
  title: string;
  briefData?: Record<string, any>;
}

export interface UpdateProjectInput {
  title?: string;
  briefData?: Record<string, any>;
  status?: 'briefing' | 'in_progress' | 'review' | 'completed' | 'paused';
  managerId?: string | null;
}
