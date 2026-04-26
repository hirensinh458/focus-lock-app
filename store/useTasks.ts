// FILE: src/hooks/useTasks.ts

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addTask,
  completeTask,
  deleteTask,
  setTasks,
  uncompleteTask,
  updateTask,
  selectAllTasks,
  selectPendingTasks,
  selectOverdueTasks,
  selectCompletedTasks,
} from '../features/tasks/taskSlice';
import { taskService } from '../features/tasks/taskService';
import { CreateTaskPayload, UpdateTaskPayload } from '../features/tasks/taskTypes';
import { STORAGE_KEYS } from '../constants/config';

export function useTasks() {
  const dispatch = useAppDispatch();
  const allTasks = useAppSelector(selectAllTasks);
  const pendingTasks = useAppSelector(selectPendingTasks);
  const overdueTasks = useAppSelector(selectOverdueTasks);
  const completedTasks = useAppSelector(selectCompletedTasks);

  // Load persisted tasks on mount
  useEffect(() => {
    (async () => {
      const tasks = await taskService.loadTasks();
      dispatch(setTasks(tasks));
    })();
  }, [dispatch]);

  // Persist tasks whenever they change
  useEffect(() => {
    taskService.saveTasks(allTasks);
  }, [allTasks]);

  const createTask = useCallback(
    (payload: CreateTaskPayload) => {
      dispatch(addTask(payload));
    },
    [dispatch],
  );

  const markComplete = useCallback(
    (id: string) => {
      dispatch(completeTask(id));
    },
    [dispatch],
  );

  const markIncomplete = useCallback(
    (id: string) => {
      dispatch(uncompleteTask(id));
    },
    [dispatch],
  );

  const removeTask = useCallback(
    (id: string) => {
      dispatch(deleteTask(id));
    },
    [dispatch],
  );

  const editTask = useCallback(
    (payload: UpdateTaskPayload) => {
      dispatch(updateTask(payload));
    },
    [dispatch],
  );

  return {
    allTasks,
    pendingTasks,
    overdueTasks,
    completedTasks,
    createTask,
    markComplete,
    markIncomplete,
    removeTask,
    editTask,
  };
}