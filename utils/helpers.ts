// FILE: src/utils/helpers.ts

export function formatDeadline(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow =
    date.toDateString() === new Date(now.getTime() + 86400000).toDateString();

  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) return `Today at ${timeStr}`;
  if (isTomorrow) return `Tomorrow at ${timeStr}`;
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  if (hours > 0) return `${hh}:${mm}:${ss}`;
  return `${mm}:${ss}`;
}

export function formatRelativeTime(timestamp: number): string {
  const diffMs = timestamp - Date.now();
  const absDiff = Math.abs(diffMs);

  const minutes = Math.floor(absDiff / 60000);
  const hours = Math.floor(absDiff / 3600000);
  const days = Math.floor(absDiff / 86400000);

  const past = diffMs < 0;

  if (minutes < 1) return past ? 'just now' : 'in seconds';
  if (minutes < 60) return past ? `${minutes}m ago` : `in ${minutes}m`;
  if (hours < 24) return past ? `${hours}h ago` : `in ${hours}h`;
  return past ? `${days}d ago` : `in ${days}d`;
}

export function getDeadlineProgressPercent(createdAt: number, deadline: number): number {
  const total = deadline - createdAt;
  const elapsed = Date.now() - createdAt;
  if (total <= 0) return 100;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

export function getPriorityColor(priority: 'low' | 'medium' | 'high'): string {
  switch (priority) {
    case 'high': return '#FF3860';
    case 'medium': return '#FFB020';
    case 'low': return '#00D97E';
  }
}

export function isTaskOverdue(deadline: number): boolean {
  return deadline < Date.now();
}

export function endOfDay(date: Date = new Date()): number {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}