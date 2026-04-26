// FILE: src/features/appBlocker/blockerService.ts

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { AppBlockerModule } = NativeModules;

// Event emitter for native → JS events
let eventEmitter: NativeEventEmitter | null = null;

if (Platform.OS === 'android' && AppBlockerModule) {
  eventEmitter = new NativeEventEmitter(AppBlockerModule);
}

export interface ForegroundAppEvent {
  packageName: string;
}

export const blockerService = {
  /**
   * Check if UsageStatsManager permission is granted
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
   * Open the Usage Access settings page so user can grant permission
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
   * Get the currently active (foreground) app package name
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
   * Start background monitoring — native side polls every second
   * and emits 'onForegroundAppChanged' events
   */
  startMonitoring(blockedPackages: string[]): void {
    if (Platform.OS !== 'android' || !AppBlockerModule) return;
    AppBlockerModule.startMonitoring(blockedPackages);
  },

  /**
   * Stop background monitoring
   */
  stopMonitoring(): void {
    if (Platform.OS !== 'android' || !AppBlockerModule) return;
    AppBlockerModule.stopMonitoring();
  },

  /**
   * Update the list of blocked packages at runtime
   */
  updateBlockedPackages(packages: string[]): void {
    if (Platform.OS !== 'android' || !AppBlockerModule) return;
    AppBlockerModule.updateBlockedPackages(packages);
  },

  /**
   * Bring Focus Lock app to foreground (kicks blocked app out)
   */
  bringToForeground(): void {
    if (Platform.OS !== 'android' || !AppBlockerModule) return;
    AppBlockerModule.bringToForeground();
  },

  /**
   * Subscribe to foreground app change events from native
   */
  onBlockedAppDetected(callback: (event: ForegroundAppEvent) => void) {
    if (!eventEmitter) return { remove: () => {} };
    const sub = eventEmitter.addListener('onBlockedAppDetected', callback);
    return sub;
  },

  /**
   * Get list of installed apps from device (for custom selection)
   */
  async getInstalledApps(): Promise<Array<{ packageName: string; displayName: string }>> {
    if (Platform.OS !== 'android' || !AppBlockerModule) return [];
    try {
      return await AppBlockerModule.getInstalledApps();
    } catch {
      return [];
    }
  },
};