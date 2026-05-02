import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addTask, completeTask, deleteTask, setTasks, selectPendingTasks, selectOverdueTasks, selectCompletedTasks, selectAllTasks } from '../features/tasks/taskSlice';
import { taskService } from '../features/tasks/taskService';
import { CreateTaskPayload } from '../features/tasks/taskTypes';

export function useTasks() {
  const dispatch = useAppDispatch();
  const allTasks = useAppSelector(selectAllTasks);
  const pendingTasks = useAppSelector(selectPendingTasks);
  const overdueTasks = useAppSelector(selectOverdueTasks);
  const completedTasks = useAppSelector(selectCompletedTasks);

  // Load & persist
  useEffect(() => {
    taskService.loadTasks().then(tasks => dispatch(setTasks(tasks)));
  }, [dispatch]);

  useEffect(() => {
    taskService.saveTasks(allTasks);
  }, [allTasks]);

  const createTask = (payload: CreateTaskPayload) => dispatch(addTask(payload));
  const markComplete = (id: string) => dispatch(completeTask(id));
  const removeTask = (id: string) => dispatch(deleteTask(id));

  return { pendingTasks, overdueTasks, completedTasks, createTask, markComplete, removeTask };
}