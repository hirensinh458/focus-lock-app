// FILE: src/services/timerService.ts
//
// Uses react-native-background-timer so the countdown continues
// when the app is backgrounded on Android.

import BackgroundTimer from 'react-native-background-timer';

type TickCallback = (remainingMs: number) => void;
type ExpireCallback = () => void;

interface TimerEntry {
  taskId: string;
  deadline: number;
  intervalId: number;
  onTick: TickCallback;
  onExpire: ExpireCallback;
}

class TimerService {
  private timers: Map<string, TimerEntry> = new Map();

  /**
   * Start a countdown for a task deadline.
   * Calls onTick every second with remaining ms.
   * Calls onExpire when deadline is reached.
   */
  start(
    taskId: string,
    deadline: number,
    onTick: TickCallback,
    onExpire: ExpireCallback,
  ): void {
    // Clear existing timer for this task if any
    this.stop(taskId);

    const fire = () => {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        this.stop(taskId);
        onTick(0);
        onExpire();
        return;
      }
      onTick(remaining);
    };

    // Fire immediately once
    fire();

    const intervalId = BackgroundTimer.setInterval(fire, 1000);

    this.timers.set(taskId, {
      taskId,
      deadline,
      intervalId,
      onTick,
      onExpire,
    });
  }

  /**
   * Stop a specific task's countdown
   */
  stop(taskId: string): void {
    const entry = this.timers.get(taskId);
    if (entry) {
      BackgroundTimer.clearInterval(entry.intervalId);
      this.timers.delete(taskId);
    }
  }

  /**
   * Stop all timers
   */
  stopAll(): void {
    this.timers.forEach((_, taskId) => this.stop(taskId));
    this.timers.clear();
  }

  /**
   * Check if a timer is running for a task
   */
  isRunning(taskId: string): boolean {
    return this.timers.has(taskId);
  }

  /**
   * Get remaining ms for a task (without needing callback)
   */
  getRemaining(taskId: string): number {
    const entry = this.timers.get(taskId);
    if (!entry) return 0;
    return Math.max(0, entry.deadline - Date.now());
  }
}

export const timerService = new TimerService();