// FILE: src/constants/config.ts

export const APP_CONFIG = {
  APP_NAME: 'Focus Lock',
  VERSION: '1.0.0',
};

export const STORAGE_KEYS = {
  TASKS: 'focus_lock_tasks',
  BLOCKED_APPS: 'focus_lock_blocked_apps',
  SETTINGS: 'focus_lock_settings',
};

export const TIMER_INTERVAL_MS = 1000; // 1 second

export const DEFAULT_BLOCKED_APPS: BlockableApp[] = [
  { packageName: 'com.instagram.android', displayName: 'Instagram', isSelected: false },
  { packageName: 'com.google.android.youtube', displayName: 'YouTube', isSelected: false },
  { packageName: 'com.facebook.katana', displayName: 'Facebook', isSelected: false },
  { packageName: 'com.twitter.android', displayName: 'Twitter / X', isSelected: false },
  { packageName: 'com.snapchat.android', displayName: 'Snapchat', isSelected: false },
  { packageName: 'com.zhiliaoapp.musically', displayName: 'TikTok', isSelected: false },
  { packageName: 'com.reddit.frontpage', displayName: 'Reddit', isSelected: false },
  { packageName: 'com.whatsapp', displayName: 'WhatsApp', isSelected: false },
  { packageName: 'com.linkedin.android', displayName: 'LinkedIn', isSelected: false },
  { packageName: 'com.netflix.mediaclient', displayName: 'Netflix', isSelected: false },
];

export interface BlockableApp {
  packageName: string;
  displayName: string;
  isSelected: boolean;
}

export const COLORS = {
  primary: '#FF4D00',
  primaryDark: '#CC3D00',
  primaryLight: '#FF7A40',
  background: '#0A0A0F',
  surface: '#12121A',
  surfaceElevated: '#1A1A26',
  border: '#2A2A3A',
  textPrimary: '#F0F0FF',
  textSecondary: '#8888AA',
  textMuted: '#44445A',
  success: '#00D97E',
  warning: '#FFB020',
  danger: '#FF3860',
  white: '#FFFFFF',
  black: '#000000',
};

export const FONTS = {
  heading: 'System',
  body: 'System',
  mono: 'Courier New',
};

export const TASK_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
} as const;

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];