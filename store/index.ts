// FILE: src/store/index.ts

import { configureStore } from '@reduxjs/toolkit';
import taskReducer from '../features/tasks/taskSlice';
import blockerReducer from '../features/appBlocker/blockerSlice';

export const store = configureStore({
  reducer: {
    tasks: taskReducer,
    blocker: blockerReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;