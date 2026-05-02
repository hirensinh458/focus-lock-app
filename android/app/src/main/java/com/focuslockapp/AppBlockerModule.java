package com.focuslockapp;

import android.app.AppOpsManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.text.TextUtils;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class AppBlockerModule extends ReactContextBaseJavaModule {

    private static final String MODULE_NAME = "AppBlockerModule";

    public AppBlockerModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    // ─── Get Installed Apps ──────────────────────────────────────────────────

    @ReactMethod
    public void getInstalledApps(Promise promise) {
        try {
            PackageManager pm = getReactApplicationContext().getPackageManager();
            Intent intent = new Intent(Intent.ACTION_MAIN, null);
            intent.addCategory(Intent.CATEGORY_LAUNCHER);

            List<ResolveInfo> apps = pm.queryIntentActivities(intent, 0);

            // Sort alphabetically
            Collections.sort(apps, new Comparator<ResolveInfo>() {
                @Override
                public int compare(ResolveInfo a, ResolveInfo b) {
                    return a.loadLabel(pm).toString()
                            .compareToIgnoreCase(b.loadLabel(pm).toString());
                }
            });

            WritableArray result = Arguments.createArray();
            for (ResolveInfo info : apps) {
                String packageName = info.activityInfo.packageName;
                if (packageName.equals("com.focuslockapp")) continue;

                String appName = info.loadLabel(pm).toString();
                WritableMap map = Arguments.createMap();
                map.putString("packageName", packageName);
                map.putString("displayName", appName);
                result.pushMap(map);
            }
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to get installed apps: " + e.getMessage());
        }
    }

    // ─── Usage Stats Permission ──────────────────────────────────────────────

    @ReactMethod
    public void hasUsageStatsPermission(Promise promise) {
        try {
            Context context = getReactApplicationContext();
            AppOpsManager appOps = (AppOpsManager) context.getSystemService(Context.APP_OPS_SERVICE);
            int mode = appOps.checkOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    android.os.Process.myUid(),
                    context.getPackageName()
            );
            promise.resolve(mode == AppOpsManager.MODE_ALLOWED);
        } catch (Exception e) {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void requestUsageStatsPermission() {
        try {
            Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getReactApplicationContext().startActivity(intent);
        } catch (Exception e) {
            // ignore
        }
    }

    // ─── Accessibility Permission ────────────────────────────────────────────

    @ReactMethod
    public void hasAccessibilityPermission(Promise promise) {
        try {
            Context context = getReactApplicationContext();
            String serviceName = context.getPackageName()
                    + "/" + FocusLockAccessibilityService.class.getName();
            int enabled = 0;
            try {
                enabled = Settings.Secure.getInt(
                        context.getContentResolver(),
                        Settings.Secure.ACCESSIBILITY_ENABLED
                );
            } catch (Settings.SettingNotFoundException e) {
                enabled = 0;
            }
            if (enabled == 1) {
                String settingValue = Settings.Secure.getString(
                        context.getContentResolver(),
                        Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
                );
                if (settingValue != null) {
                    promise.resolve(settingValue.contains(serviceName));
                    return;
                }
            }
            promise.resolve(false);
        } catch (Exception e) {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void requestAccessibilityPermission() {
        try {
            Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getReactApplicationContext().startActivity(intent);
        } catch (Exception e) {
            // ignore
        }
    }

    // ─── Overlay Permission ──────────────────────────────────────────────────

    @ReactMethod
    public void hasOverlayPermission(Promise promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            promise.resolve(Settings.canDrawOverlays(getReactApplicationContext()));
        } else {
            promise.resolve(true);
        }
    }

    @ReactMethod
    public void requestOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            try {
                Intent intent = new Intent(
                        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                        Uri.parse("package:" + getReactApplicationContext().getPackageName())
                );
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getReactApplicationContext().startActivity(intent);
            } catch (Exception e) {
                // ignore
            }
        }
    }

    // ─── Monitoring ──────────────────────────────────────────────────────────

    @ReactMethod
    public void startMonitoring(ReadableArray packages) {
        try {
            ArrayList<String> packageList = new ArrayList<>();
            for (int i = 0; i < packages.size(); i++) {
                packageList.add(packages.getString(i));
            }
            FocusLockMonitorService.setBlockedPackages(packageList);
            Intent intent = new Intent(
                    getReactApplicationContext(),
                    FocusLockMonitorService.class
            );
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                getReactApplicationContext().startForegroundService(intent);
            } else {
                getReactApplicationContext().startService(intent);
            }
        } catch (Exception e) {
            // ignore
        }
    }

    @ReactMethod
    public void stopMonitoring() {
        try {
            Intent intent = new Intent(
                    getReactApplicationContext(),
                    FocusLockMonitorService.class
            );
            getReactApplicationContext().stopService(intent);
            FocusLockMonitorService.setBlockedPackages(new ArrayList<>());
        } catch (Exception e) {
            // ignore
        }
    }

    @ReactMethod
    public void updateBlockedPackages(ReadableArray packages) {
        ArrayList<String> packageList = new ArrayList<>();
        for (int i = 0; i < packages.size(); i++) {
            packageList.add(packages.getString(i));
        }
        FocusLockMonitorService.setBlockedPackages(packageList);
    }

    @ReactMethod
    public void bringToForeground() {
        try {
            Context context = getReactApplicationContext();
            Intent intent = new Intent(context, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            context.startActivity(intent);
        } catch (Exception e) {
            // ignore
        }
    }

    @ReactMethod
    public void getCurrentForegroundApp(Promise promise) {
        promise.resolve(null);
    }
}