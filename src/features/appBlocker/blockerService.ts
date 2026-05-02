import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { BlockableApp } from './blockerTypes';

const { AppBlockerModule } = NativeModules;

let eventEmitter: NativeEventEmitter | null = null;
if (Platform.OS === 'android' && AppBlockerModule) {
  eventEmitter = new NativeEventEmitter(AppBlockerModule);
}

export const blockerService = {
  async hasUsageStatsPermission(): Promise<boolean> {
    if (Platform.OS !== 'android' || !AppBlockerModule) return false;
    try { return await AppBlockerModule.hasUsageStatsPermission(); }
    catch { return false; }
  },

  requestUsageStatsPermission(): void {
    if (Platform.OS !== 'android' || !AppBlockerModule) return;
    AppBlockerModule.requestUsageStatsPermission();
  },

  async hasAccessibilityPermission(): Promise<boolean> {
    if (Platform.OS !== 'android' || !AppBlockerModule) return false;
    try { return await AppBlockerModule.hasAccessibilityPermission(); }
    catch { return false; }
  },

  requestAccessibilityPermission(): void {
    if (Platform.OS !== 'android' || !AppBlockerModule) return;
    AppBlockerModule.requestAccessibilityPermission();
  },

  async hasOverlayPermission(): Promise<boolean> {
    if (Platform.OS !== 'android' || !AppBlockerModule) return false;
    try { return await AppBlockerModule.hasOverlayPermission(); }
    catch { return false; }
  },

  requestOverlayPermission(): void {
    if (Platform.OS !== 'android' || !AppBlockerModule) return;
    AppBlockerModule.requestOverlayPermission();
  },

  async getCurrentForegroundApp(): Promise<string | null> {
    if (Platform.OS !== 'android' || !AppBlockerModule) return null;
    try { return await AppBlockerModule.getCurrentForegroundApp(); }
    catch { return null; }
  },

  startMonitoring(blockedPackages: string[]): void {
    if (Platform.OS !== 'android' || !AppBlockerModule) return;
    AppBlockerModule.startMonitoring(blockedPackages);
  },

  stopMonitoring(): void {
    if (Platform.OS !== 'android' || !AppBlockerModule) return;
    AppBlockerModule.stopMonitoring();
  },

  updateBlockedPackages(packages: string[]): void {
    if (Platform.OS !== 'android' || !AppBlockerModule) return;
    AppBlockerModule.updateBlockedPackages(packages);
  },

  bringToForeground(): void {
    if (Platform.OS !== 'android' || !AppBlockerModule) return;
    AppBlockerModule.bringToForeground();
  },

  onBlockedAppDetected(callback: (event: { packageName: string }) => void) {
    if (!eventEmitter) return { remove: () => {} };
    return eventEmitter.addListener('onBlockedAppDetected', callback);
  },

  async getInstalledApps(): Promise<BlockableApp[]> {
    if (Platform.OS !== 'android' || !AppBlockerModule) return [];
    try { return await AppBlockerModule.getInstalledApps(); }
    catch { return []; }
  },
};