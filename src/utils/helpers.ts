export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return h > 0 ? `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}` : `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

export function formatDeadline(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

export function getPriorityColor(priority: string): string {
  switch(priority) {
    case 'high': return '#FF3860';
    case 'medium': return '#FFB020';
    default: return '#00D97E';
  }
}