export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (Math.abs(diffMins) < 1) {
    return 'now';
  }

  if (Math.abs(diffMins) < 60) {
    return diffMins > 0 ? `in ${diffMins}m` : `${Math.abs(diffMins)}m ago`;
  }

  if (Math.abs(diffHours) < 24) {
    return diffHours > 0 ? `in ${diffHours}h` : `${Math.abs(diffHours)}h ago`;
  }

  return diffDays > 0 ? `in ${diffDays}d` : `${Math.abs(diffDays)}d ago`;
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function isDue(date: Date): boolean {
  return new Date(date) <= new Date();
}
