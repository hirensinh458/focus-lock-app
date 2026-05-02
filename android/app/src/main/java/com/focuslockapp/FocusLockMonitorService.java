package com.focuslockapp;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;

import androidx.core.app.NotificationCompat;

import java.util.ArrayList;
import java.util.List;
import java.util.SortedMap;
import java.util.TreeMap;

public class FocusLockMonitorService extends Service {

    private static final String CHANNEL_ID = "FocusLockChannel";
    private static final int NOTIFICATION_ID = 1001;
    private static final long POLL_INTERVAL_MS = 500;

    private static volatile List<String> blockedPackages = new ArrayList<>();
    private Handler handler;
    private Runnable pollRunnable;
    private String lastBlockedApp = null;

    public static void setBlockedPackages(List<String> packages) {
        blockedPackages = new ArrayList<>(packages);
    }

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        startForeground(NOTIFICATION_ID, buildNotification());
        handler = new Handler(Looper.getMainLooper());
        startPolling();
    }

    private void startPolling() {
        pollRunnable = new Runnable() {
            @Override
            public void run() {
                checkForegroundApp();
                handler.postDelayed(this, POLL_INTERVAL_MS);
            }
        };
        handler.post(pollRunnable);
    }

    private void checkForegroundApp() {
        try {
            String foreground = getForegroundApp();
            if (foreground == null) return;
            if (foreground.equals(getPackageName())) {
                lastBlockedApp = null;
                return;
            }
            if (blockedPackages.contains(foreground)) {
                if (!foreground.equals(lastBlockedApp)) {
                    lastBlockedApp = foreground;
                    launchOverlay(foreground);
                }
            } else {
                lastBlockedApp = null;
            }
        } catch (Exception e) {
            // ignore
        }
    }

    private String getForegroundApp() {
        try {
            UsageStatsManager usm = (UsageStatsManager)
                    getSystemService(Context.USAGE_STATS_SERVICE);
            long now = System.currentTimeMillis();
            List<UsageStats> stats = usm.queryUsageStats(
                    UsageStatsManager.INTERVAL_DAILY,
                    now - 5000,
                    now
            );
            if (stats == null || stats.isEmpty()) return null;
            SortedMap<Long, UsageStats> sortedMap = new TreeMap<>();
            for (UsageStats s : stats) {
                sortedMap.put(s.getLastTimeUsed(), s);
            }
            return sortedMap.get(sortedMap.lastKey()).getPackageName();
        } catch (Exception e) {
            return null;
        }
    }

    private void launchOverlay(String blockedPackage) {
        Intent intent = new Intent(this, LockOverlayActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK |
                Intent.FLAG_ACTIVITY_CLEAR_TOP |
                Intent.FLAG_ACTIVITY_SINGLE_TOP);
        intent.putExtra("blockedPackage", blockedPackage);
        startActivity(intent);
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Focus Lock Active",
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Monitoring blocked apps");
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) manager.createNotificationChannel(channel);
        }
    }

    private Notification buildNotification() {
        Intent intent = new Intent(this, MainActivity.class);
        PendingIntent pi = PendingIntent.getActivity(
                this, 0, intent,
                PendingIntent.FLAG_IMMUTABLE
        );
        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Focus Lock Active")
                .setContentText("Blocking distracting apps...")
                .setSmallIcon(android.R.drawable.ic_lock_lock)
                .setContentIntent(pi)
                .setOngoing(true)
                .build();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (handler != null && pollRunnable != null) {
            handler.removeCallbacks(pollRunnable);
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}