# Focus Lock — Production React Native App

## Architecture Overview

**State Management**: Redux Toolkit
- Chosen over Context API because:
  - App has multiple interacting feature slices (tasks + blocker)
  - Selectors need to be composed (blocked apps derived from task state)
  - DevTools debugging is essential for timer/blocker state

**Persistence**: AsyncStorage (task data is simple JSON, no relations needed)

**Background Timers**: `react-native-background-timer` (runs JS timers even when app is backgrounded on Android)

**App Blocking**: Dual-layer strategy:
1. `UsageStatsManager` polling (1s interval) — detects foreground app
2. `AccessibilityService` window events — real-time interception

---

## Project Structure

```
focus-lock-app/
├── index.js                          # RN entry point
├── src/
│   ├── App.tsx                       # Root with Redux Provider
│   ├── app/
│   │   ├── index.tsx                 # Home screen (task list)
│   │   └── tasks/
│   │       ├── create.tsx            # Create task screen
│   │       └── detail.tsx            # Task detail + timer screen
│   ├── components/
│   │   ├── TaskCard.tsx              # Task list item
│   │   ├── Timer.tsx                 # Countdown display
│   │   ├── BlockScreen.tsx           # Full-screen block overlay
│   │   ├── PermissionBanner.tsx      # Permission request banner
│   │   └── EmptyState.tsx            # Empty list states
│   ├── features/
│   │   ├── tasks/
│   │   │   ├── taskSlice.ts          # Redux slice (CRUD + selectors)
│   │   │   ├── taskService.ts        # AsyncStorage persistence
│   │   │   └── taskTypes.ts          # TypeScript interfaces
│   │   └── appBlocker/
│   │       ├── blockerSlice.ts       # Redux slice for blocking state
│   │       └── blockerService.ts     # JS bridge to native module
│   ├── navigation/
│   │   └── AppNavigator.tsx          # React Navigation stack
│   ├── store/
│   │   ├── index.ts                  # Redux store config
│   │   └── hooks.ts                  # Typed useDispatch/useSelector
│   ├── hooks/
│   │   ├── useTasks.ts               # Task CRUD + persistence hook
│   │   ├── useTimer.ts               # Per-task countdown hook
│   │   └── useBlocker.ts             # Permission + blocking hook
│   ├── services/
│   │   ├── storage.ts                # AsyncStorage wrapper
│   │   └── timerService.ts           # BackgroundTimer manager
│   ├── utils/
│   │   └── helpers.ts                # Format, compute utilities
│   └── constants/
│       └── config.ts                 # Colors, keys, app list
├── android/
│   └── app/src/main/
│       ├── java/com/focuslock/
│       │   ├── AppBlockerModule.kt   # ★ Native module (UsageStats + events)
│       │   ├── AppBlockerPackage.kt  # ★ Registers module with RN bridge
│       │   ├── FocusLockAccessibilityService.kt  # ★ Window interception
│       │   └── MainApplication.kt    # Registers AppBlockerPackage
│       ├── AndroidManifest.xml       # All permissions declared
│       └── res/
│           ├── xml/accessibility_service_config.xml
│           └── values/strings.xml
└── package.json
```

---

## Setup Instructions

### 1. Install dependencies
```bash
npm install
# or
yarn install
```

### 2. Install pods (iOS — skip for Android-only)
```bash
cd ios && pod install && cd ..
```

### 3. Link native modules
```bash
npx react-native link react-native-background-timer
npx react-native link react-native-vector-icons
```

### 4. Run on Android
```bash
npx react-native run-android
```

---

## Android Native Module Registration

The `AppBlockerPackage` is already added in `MainApplication.kt`:

```kotlin
override fun getPackages(): List<ReactPackage> =
    PackageList(this).packages.apply {
        add(AppBlockerPackage())  // ← This registers AppBlockerModule
    }
```

**What each Kotlin file does:**

| File | Purpose |
|------|---------|
| `AppBlockerModule.kt` | Exposes methods to JS: check permissions, start/stop monitoring, get foreground app, emit events |
| `AppBlockerPackage.kt` | Registers `AppBlockerModule` with RN's bridge |
| `FocusLockAccessibilityService.kt` | Second blocking layer — intercepts window changes and launches FocusLock when blocked app is detected |

---

## Required Android Permissions

| Permission | Why |
|-----------|-----|
| `PACKAGE_USAGE_STATS` | Read which app is in foreground (requires user grant in Settings) |
| `QUERY_ALL_PACKAGES` | List installed apps for blocker configuration |
| `FOREGROUND_SERVICE` | Keep background timer alive |
| `RECEIVE_BOOT_COMPLETED` | Restart blocking after reboot |
| `WAKE_LOCK` | Prevent CPU sleep during timer |
| `BIND_ACCESSIBILITY_SERVICE` | Window change events for real-time blocking |

---

## User Flow

```
1. App opens → check permissions
   - Missing Usage Stats? → show banner → open Settings
   - Missing Accessibility? → show banner → open Settings

2. Create Task:
   - Title, description, priority
   - Deadline (specific time OR end of day)
   - Select apps to block (from preset list)

3. Task active:
   - Countdown timer runs (in background via BackgroundTimer)
   - Native module polls foreground app every 1 second
   - If blocked app detected → emit JS event → show BlockScreen + bring FocusLock forward
   - AccessibilityService also intercepts window changes as backup

4. Task completed:
   - User marks complete → blocked apps are unblocked immediately
   - Monitoring continues for other active tasks

5. Task overdue:
   - Timer hits 0 → task marked overdue
   - Apps remain blocked (task still incomplete)
   - User must complete task manually to unblock
```

---

## Adding a New Blocked App

In `src/constants/config.ts`, add to `DEFAULT_BLOCKED_APPS`:

```typescript
{ packageName: 'com.example.app', displayName: 'Example App', isSelected: false },
```

To dynamically list installed apps, call:
```typescript
const apps = await blockerService.getInstalledApps();
```

---

## Key Design Decisions

- **Dual blocking strategy**: UsageStats for detection + AccessibilityService for real-time interception ensures no blocked app can slip through even if polling is delayed.
- **Event-driven**: Native module only emits `onBlockedAppDetected` when a *new* blocked app is detected, not on every poll tick — prevents spam.
- **Redux selectors derive blocked list**: `selectCurrentlyBlockedApps` automatically computes which packages to block based on active (non-completed, non-expired) tasks — no manual sync needed.
- **Timer cleanup**: `timerService` ensures interval is cleared when component unmounts, preventing memory leaks.