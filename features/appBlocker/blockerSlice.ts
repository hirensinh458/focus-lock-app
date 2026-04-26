// FILE: src/features/appBlocker/blockerSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BlockableApp, DEFAULT_BLOCKED_APPS } from '../../constants/config';

interface BlockerState {
  availableApps: BlockableApp[];
  isBlockingActive: boolean;
  hasUsageStatsPermission: boolean;
  hasAccessibilityPermission: boolean;
  currentForegroundApp: string | null;
  isBlockScreenVisible: boolean;
  blockedByTaskId: string | null;
}

const initialState: BlockerState = {
  availableApps: DEFAULT_BLOCKED_APPS,
  isBlockingActive: false,
  hasUsageStatsPermission: false,
  hasAccessibilityPermission: false,
  currentForegroundApp: null,
  isBlockScreenVisible: false,
  blockedByTaskId: null,
};

const blockerSlice = createSlice({
  name: 'blocker',
  initialState,
  reducers: {
    setUsageStatsPermission(state, action: PayloadAction<boolean>) {
      state.hasUsageStatsPermission = action.payload;
    },

    setAccessibilityPermission(state, action: PayloadAction<boolean>) {
      state.hasAccessibilityPermission = action.payload;
    },

    setBlockingActive(state, action: PayloadAction<boolean>) {
      state.isBlockingActive = action.payload;
    },

    setCurrentForegroundApp(state, action: PayloadAction<string | null>) {
      state.currentForegroundApp = action.payload;
    },

    showBlockScreen(state, action: PayloadAction<{ taskId: string }>) {
      state.isBlockScreenVisible = true;
      state.blockedByTaskId = action.payload.taskId;
    },

    hideBlockScreen(state) {
      state.isBlockScreenVisible = false;
      state.blockedByTaskId = null;
    },

    toggleAppSelection(state, action: PayloadAction<string>) {
      const app = state.availableApps.find(a => a.packageName === action.payload);
      if (app) {
        app.isSelected = !app.isSelected;
      }
    },

    setAppSelections(state, action: PayloadAction<string[]>) {
      state.availableApps = state.availableApps.map(app => ({
        ...app,
        isSelected: action.payload.includes(app.packageName),
      }));
    },

    setAvailableApps(state, action: PayloadAction<BlockableApp[]>) {
      state.availableApps = action.payload;
    },
  },
});

export const {
  setUsageStatsPermission,
  setAccessibilityPermission,
  setBlockingActive,
  setCurrentForegroundApp,
  showBlockScreen,
  hideBlockScreen,
  toggleAppSelection,
  setAppSelections,
  setAvailableApps,
} = blockerSlice.actions;

export default blockerSlice.reducer;

export const selectAvailableApps = (state: { blocker: BlockerState }) =>
  state.blocker.availableApps;

export const selectSelectedApps = (state: { blocker: BlockerState }) =>
  state.blocker.availableApps.filter(a => a.isSelected).map(a => a.packageName);

export const selectIsBlockScreenVisible = (state: { blocker: BlockerState }) =>
  state.blocker.isBlockScreenVisible;

export const selectBlockedByTaskId = (state: { blocker: BlockerState }) =>
  state.blocker.blockedByTaskId;

export const selectPermissions = (state: { blocker: BlockerState }) => ({
  usageStats: state.blocker.hasUsageStatsPermission,
  accessibility: state.blocker.hasAccessibilityPermission,
});