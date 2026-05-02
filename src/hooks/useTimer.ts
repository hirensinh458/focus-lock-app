import { useEffect, useState } from 'react';
import BackgroundTimer from 'react-native-background-timer';

export function useTimer(deadline: number, isActive: boolean) {
  const [remainingMs, setRemainingMs] = useState(Math.max(0, deadline - Date.now()));
  const [isExpired, setIsExpired] = useState(deadline <= Date.now());

  useEffect(() => {
    if (!isActive) return;

    const update = () => {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        setRemainingMs(0);
        setIsExpired(true);
        BackgroundTimer.clearInterval(intervalId);
      } else {
        setRemainingMs(remaining);
      }
    };

    update(); // immediate
    const intervalId = BackgroundTimer.setInterval(update, 1000);
    return () => BackgroundTimer.clearInterval(intervalId);
  }, [deadline, isActive]);

  return { remainingMs, isExpired };
}