/**
 * Format number as Argentine peso amount
 */
export function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format distance in km
 */
export function formatDistance(km: number): string {
  return `${km.toLocaleString('es-AR')} km`;
}

/**
 * Format relative time in Spanish
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return 'Ahora';
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;

  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format rating as string with star
 */
export function formatRating(rating: number, totalViajes: number): string {
  if (totalViajes === 0) return 'Sin calificaciones';
  return `${rating.toFixed(1)} (${totalViajes} ${totalViajes === 1 ? 'viaje' : 'viajes'})`;
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
