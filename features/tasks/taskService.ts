// FILE: src/features/tasks/taskService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from './taskTypes';
import { STORAGE_KEYS } from '../../constants/config';

export const taskService = {
  /**
   * Load all tasks from AsyncStorage
   */
  async loadTasks(): Promise<Task[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Task[];
      return parsed;
    } catch (err) {
      console.error('[taskService] loadTasks error:', err);
      return [];
    }
  },

  /**
   * Save all tasks to AsyncStorage
   */
  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (err) {
      console.error('[taskService] saveTasks error:', err);
    }
  },

  /**
   * Clear all tasks (used for reset)
   */
  async clearTasks(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.TASKS);
    } catch (err) {
      console.error('[taskService] clearTasks error:', err);
    }
  },

  /**
   * Get overdue and pending task IDs
   */
  getTaskStatuses(tasks: Task[]): {
    pending: string[];
    overdue: string[];
    completed: string[];
  } {
    const now = Date.now();
    return {
      pending: tasks.filter(t => !t.completed && t.deadline > now).map(t => t.id),
      overdue: tasks.filter(t => !t.completed && t.deadline <= now).map(t => t.id),
      completed: tasks.filter(t => t.completed).map(t => t.id),
    };
  },

  /**
   * Get all package names that should currently be blocked
   * (tasks that are active = not completed AND not overdue)
   */
  getActivelyBlockedPackages(tasks: Task[]): string[] {
    const now = Date.now();
    const activeTasks = tasks.filter(t => !t.completed && t.deadline > now);
    const blocked = new Set<string>();
    activeTasks.forEach(task => task.blockedApps.forEach(pkg => blocked.add(pkg)));
    return Array.from(blocked);
  },
};