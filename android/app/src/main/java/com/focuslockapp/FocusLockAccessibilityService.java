package com.focuslockapp;

import android.accessibilityservice.AccessibilityService;
import android.content.Intent;
import android.view.accessibility.AccessibilityEvent;

import java.util.ArrayList;
import java.util.List;

public class FocusLockAccessibilityService extends AccessibilityService {

    private static volatile List<String> blockedPackages = new ArrayList<>();

    public static void setBlockedPackages(List<String> packages) {
        blockedPackages = new ArrayList<>(packages);
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event.getEventType() != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return;
        CharSequence pkg = event.getPackageName();
        if (pkg == null) return;
        String packageName = pkg.toString();
        if (packageName.equals(getPackageName())) return;
        if (blockedPackages.contains(packageName)) {
            launchOverlay(packageName);
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

    @Override
    public void onInterrupt() {}
}