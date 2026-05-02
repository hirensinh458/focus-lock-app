export const COLORS = {
  primary: '#FF4D00',
  background: '#0A0A0F',
  surface: '#12121A',
  border: '#2A2A3A',
  textPrimary: '#F0F0FF',
  textSecondary: '#8888AA',
  success: '#00D97E',
  warning: '#FFB020',
  danger: '#FF3860',
  white: '#FFFFFF',
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