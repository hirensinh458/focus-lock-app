package com.focuslockapp

import android.app.ActivityManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.*
import android.content.pm.PackageManager

class AppBlockerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "AppBlockerModule"

    @ReactMethod
    fun hasUsageStatsPermission(promise: Promise) {
        val appOps = reactApplicationContext.getSystemService(Context.APP_OPS_SERVICE) as android.app.AppOpsManager
        val mode = appOps.checkOpNoThrow(android.app.AppOpsManager.OPSTR_GET_USAGE_STATS, android.os.Process.myUid(), reactApplicationContext.packageName)
        promise.resolve(mode == android.app.AppOpsManager.MODE_ALLOWED)
    }

    @ReactMethod
    fun requestUsageStatsPermission() {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactApplicationContext.startActivity(intent)
    }

    @ReactMethod
    fun getCurrentForegroundApp(promise: Promise) {
        val usageStatsManager = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val currentTime = System.currentTimeMillis()
        val stats = usageStatsManager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, currentTime - 1000 * 10, currentTime)
        if (stats != null) {
            val sortedStats = stats.sortedByDescending { it.lastTimeUsed }
            if (sortedStats.isNotEmpty()) {
                promise.resolve(sortedStats[0].packageName)
                return
            }
        }
        promise.resolve(null)
    }

    @ReactMethod
    fun startMonitoring(blockedPackages: ReadableArray) {
        // Start foreground service and polling (simplified – in real app you'd use a Service)
    }

    @ReactMethod
    fun stopMonitoring() { }

    @ReactMethod
    fun bringToForeground() {
        val intent = reactApplicationContext.packageManager.getLaunchIntentForPackage(reactApplicationContext.packageName)
        intent?.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        reactApplicationContext.startActivity(intent)
    }

    @ReactMethod
    fun getInstalledApps(promise: Promise) {
        try {
            val packageManager = reactApplicationContext.packageManager
            val packages = packageManager.getInstalledApplications(PackageManager.GET_META_DATA)
            val appList = mutableListOf<HashMap<String, String>>()
            
            for (pkg in packages) {
                if (packageManager.getLaunchIntentForPackage(pkg.packageName) != null) {
                    val appInfo = hashMapOf(
                        "packageName" to pkg.packageName,
                        "displayName" to packageManager.getApplicationLabel(pkg).toString()
                    )
                    appList.add(appInfo)
                }
            }
            // Sort alphabetically by display name
            appList.sortBy { it["displayName"] }
            promise.resolve(appList)
        } catch (e: Exception) {
            promise.reject("GET_APPS_ERROR", e.message)
        }
    }
}