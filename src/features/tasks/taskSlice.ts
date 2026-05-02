import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, CreateTaskPayload } from './taskTypes';
import { v4 as uuidv4 } from 'uuid';

interface TaskState {
  tasks: Task[];
  activeTaskId: string | null;
}

const initialState: TaskState = {
  tasks: [],
  activeTaskId: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks(state, action: PayloadAction<Task[]>) {
      state.tasks = action.payload;
    },
    addTask(state, action: PayloadAction<CreateTaskPayload>) {
      const newTask: Task = {
        ...action.payload,
        id: uuidv4(),
        completed: false,
        createdAt: Date.now(),
      };
      state.tasks.unshift(newTask);
    },
    completeTask(state, action: PayloadAction<string>) {
      const task = state.tasks.find(t => t.id === action.payload);
      if (task) {
        task.completed = true;
        task.completedAt = Date.now();
      }
      // Stop monitoring if this was the active task
      if (state.activeTaskId === action.payload) {
        state.activeTaskId = null;
      }
    },
    deleteTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
      if (state.activeTaskId === action.payload) {
        state.activeTaskId = null;
      }
    },
    setActiveTask(state, action: PayloadAction<string | null>) {
      state.activeTaskId = action.payload;
    },
  },
});

export const { setTasks, addTask, completeTask, deleteTask, setActiveTask } =
  taskSlice.actions;
export default taskSlice.reducer;

export const selectAllTasks = (state: { tasks: TaskState }) =>
  state.tasks.tasks;
export const selectActiveTaskId = (state: { tasks: TaskState }) =>
  state.tasks.activeTaskId;
export const selectActiveTask = (state: { tasks: TaskState }) =>
  state.tasks.tasks.find(t => t.id === state.tasks.activeTaskId) ?? null;
export const selectPendingTasks = (state: { tasks: TaskState }) =>
  state.tasks.tasks.filter(t => !t.completed && t.deadline > Date.now());
export const selectOverdueTasks = (state: { tasks: TaskState }) =>
  state.tasks.tasks.filter(t => !t.completed && t.deadline <= Date.now());
export const selectCompletedTasks = (state: { tasks: TaskState }) =>
  state.tasks.tasks.filter(t => t.completed);
export const selectTaskById = (id: string) => (state: { tasks: TaskState }) =>
  state.tasks.tasks.find(t => t.id === id);