import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { BlockableApp } from './blockerTypes';

const { AppBlockerModule } = NativeModules;

let eventEmitter: NativeEventEmitter | null = null;
if (Platform.OS === 'android' && AppBlockerModule) {
  eventEmitter = new NativeEventEmitter(AppBlockerModule);
}

export const blockerService = {
  /**
   * Check if UsageStats permission is granted
   */
  async hasUsageStatsPermission(): Promise<boolean> {
    if (Platform.OS !== 'android' || !AppBlockerModule) return false;
    try {
      return await AppBlockerModule.hasUsageStatsPermission();
    } catch {
      return false;
    }
  },

  /**
   * Open system settings for Usage Access
   */
  requestUsageStatsPermission(): void {
    if (Platform.OS !== 'android' || !AppBlockerModule) return;
    AppBlockerModule.requestUsageStatsPermission();
  },

  /**
   * Check if Accessibility Service is enabled
   */
  async hasAccessibilityPermission(): Promise<boolean> {
    if (Platform.OS !== 'android' || !AppBlockerModule) return false;
    try {
      return await AppBlockerModule.hasAccessibilityPermission();
    } catch {
      return false;
    }
  },

  /**
   * Open Accessibility Settings
   */
  requestAccessibilityPermission(): void {
    if (Platform.OS !== 'android' || !AppBlockerModule) return;
    AppBlockerModule.requestAccessibilityPermission();
  },

  /**
   * Get the current foreground app package name
   */
  async getCurrentForegroundApp(): Promise<string | null> {
    if (Platform.OS !== 'android' || !AppBlockerModule) return null;
    try {
      return await AppBlockerModule.getCurrentForegroundApp();
    } catch {
      return null;
    }
  },

  /**
   * Start monitoring for blocked apps
   */
  startMonitoring(blockedPackages: string[]): void {
    if (Platform.OS !== 'android' || !AppBlockerModule) return;
    AppBlockerModule.startMonitoring(blockedPackages);
  },

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (Platform.OS !== 'android' || !AppBlockerModule) return;
    AppBlockerModule.stopMonitoring();
  },

  /**
   * Update list of blocked packages at runtime
   */
  updateBlockedPackages(packages: string[]): void {
    if (Platform.OS !== 'android' || !AppBlockerModule) return;
    AppBlockerModule.updateBlockedPackages(packages);
  },

  /**
   * Bring Focus Lock app to foreground (to block)
   */
  bringToForeground(): void {
    if (Platform.OS !== 'android' || !AppBlockerModule) return;
    AppBlockerModule.bringToForeground();
  },

  /**
   * Subscribe to blocked app detection events from native
   */
  onBlockedAppDetected(callback: (event: { packageName: string }) => void) {
    if (!eventEmitter) return { remove: () => {} };
    const subscription = eventEmitter.addListener('onBlockedAppDetected', callback);
    return subscription;
  },

  /**
   * Get list of all installed apps (user-launchable only)
   */
  async getInstalledApps(): Promise<BlockableApp[]> {
    if (Platform.OS !== 'android' || !AppBlockerModule) {
      console.warn('getInstalledApps only available on Android');
      return [];
    }
    try {
      return await AppBlockerModule.getInstalledApps();
    } catch (error) {
      console.error('Failed to get installed apps', error);
      return [];
    }
  },
};