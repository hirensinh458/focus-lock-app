import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from './taskTypes';
import { STORAGE_KEYS } from '../../constants/config';

export const taskService = {
  async loadTasks(): Promise<Task[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
    return raw ? JSON.parse(raw) : [];
  },
  async saveTasks(tasks: Task[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },
};