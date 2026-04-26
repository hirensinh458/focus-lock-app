// FILE: src/features/tasks/taskTypes.ts

export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline: number; // Unix timestamp in ms
  deadlineType: 'time' | 'day'; // time = specific time, day = end of day
  completed: boolean;
  completedAt?: number;
  createdAt: number;
  blockedApps: string[]; // package names
  priority: 'low' | 'medium' | 'high';
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  deadline: number;
  deadlineType: 'time' | 'day';
  blockedApps: string[];
  priority: 'low' | 'medium' | 'high';
}

export interface UpdateTaskPayload {
  id: string;
  updates: Partial<Omit<Task, 'id' | 'createdAt'>>;
}