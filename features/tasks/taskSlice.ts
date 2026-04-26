// FILE: src/features/tasks/taskSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, CreateTaskPayload, UpdateTaskPayload } from './taskTypes';
import { v4 as uuidv4 } from 'uuid';
import { TASK_STATUS } from '../../constants/config';

interface TaskState {
  tasks: Task[];
  activeTaskId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  activeTaskId: null,
  isLoading: false,
  error: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Load persisted tasks from storage
    setTasks(state, action: PayloadAction<Task[]>) {
      state.tasks = action.payload;
    },

    // Create new task
    addTask(state, action: PayloadAction<CreateTaskPayload>) {
      const newTask: Task = {
        id: uuidv4(),
        title: action.payload.title,
        description: action.payload.description,
        deadline: action.payload.deadline,
        deadlineType: action.payload.deadlineType,
        completed: false,
        createdAt: Date.now(),
        blockedApps: action.payload.blockedApps,
        priority: action.payload.priority,
      };
      state.tasks.unshift(newTask);
    },

    // Update existing task
    updateTask(state, action: PayloadAction<UpdateTaskPayload>) {
      const index = state.tasks.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = { ...state.tasks[index], ...action.payload.updates };
      }
    },

    // Mark task complete
    completeTask(state, action: PayloadAction<string>) {
      const task = state.tasks.find(t => t.id === action.payload);
      if (task) {
        task.completed = true;
        task.completedAt = Date.now();
      }
    },

    // Delete task
    deleteTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
    },

    // Undo complete
    uncompleteTask(state, action: PayloadAction<string>) {
      const task = state.tasks.find(t => t.id === action.payload);
      if (task) {
        task.completed = false;
        task.completedAt = undefined;
      }
    },

    setActiveTask(state, action: PayloadAction<string | null>) {
      state.activeTaskId = action.payload;
    },

    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setTasks,
  addTask,
  updateTask,
  completeTask,
  deleteTask,
  uncompleteTask,
  setActiveTask,
  setLoading,
  setError,
} = taskSlice.actions;

export default taskSlice.reducer;

// Selectors
export const selectAllTasks = (state: { tasks: TaskState }) => state.tasks.tasks;

export const selectPendingTasks = (state: { tasks: TaskState }) =>
  state.tasks.tasks.filter(t => !t.completed && t.deadline > Date.now());

export const selectOverdueTasks = (state: { tasks: TaskState }) =>
  state.tasks.tasks.filter(t => !t.completed && t.deadline <= Date.now());

export const selectCompletedTasks = (state: { tasks: TaskState }) =>
  state.tasks.tasks.filter(t => t.completed);

export const selectTaskById = (id: string) => (state: { tasks: TaskState }) =>
  state.tasks.tasks.find(t => t.id === id);

export const selectActiveTask = (state: { tasks: TaskState }) => {
  if (!state.tasks.activeTaskId) return null;
  return state.tasks.tasks.find(t => t.id === state.tasks.activeTaskId) ?? null;
};

// Get all blocked apps from all active (non-completed, non-overdue) tasks
export const selectCurrentlyBlockedApps = (state: { tasks: TaskState }): string[] => {
  const now = Date.now();
  const activeTasks = state.tasks.tasks.filter(
    t => !t.completed && t.deadline > now
  );
  const blocked = new Set<string>();
  activeTasks.forEach(task => task.blockedApps.forEach(pkg => blocked.add(pkg)));
  return Array.from(blocked);
};