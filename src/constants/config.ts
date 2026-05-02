export const COLORS = {
  primary: '#6C63FF',
  background: '#0D0D1A',
  surface: '#1A1A2E',
  border: '#2A2A4A',
  textPrimary: '#FFFFFF',
  textSecondary: '#8888AA',
  white: '#FFFFFF',
  danger: '#FF4444',
  success: '#4CAF50',
};

export const STORAGE_KEYS = {
  TASKS: 'focus_lock_tasks',
};

export const DEFAULT_BLOCKED_APPS: BlockableApp[] = [
  { packageName: 'com.instagram.android', displayName: 'Instagram' },
  { packageName: 'com.google.android.youtube', displayName: 'YouTube' },
  { packageName: 'com.facebook.katana', displayName: 'Facebook' },
  { packageName: 'com.twitter.android', displayName: 'Twitter/X' },
];

export interface BlockableApp {
  packageName: string;
  displayName: string;
}