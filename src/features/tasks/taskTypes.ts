export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline: number; // timestamp ms
  deadlineType: 'time' | 'day';
  completed: boolean;
  completedAt?: number;
  createdAt: number;
  blockedApps: string[];
  priority: 'low' | 'medium' | 'high';
}

export type CreateTaskPayload = Omit<Task, 'id' | 'completed' | 'createdAt' | 'completedAt'>;