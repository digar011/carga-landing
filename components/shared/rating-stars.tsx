interface TRatingStarsProps {
  rating: number;
  total: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles: Record<'sm' | 'md' | 'lg', { star: string; text: string }> = {
  sm: { star: 'text-sm', text: 'text-xs' },
  md: { star: 'text-base', text: 'text-sm' },
  lg: { star: 'text-xl', text: 'text-base' },
};

export function RatingStars({ rating, total, size = 'md' }: TRatingStarsProps) {
  const styles = sizeStyles[size];

  if (total === 0) {
    return (
      <span className={`${styles.text} text-gray-400`}>
        Sin calificaciones
      </span>
    );
  }

  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="inline-flex items-center gap-1">
      <span className={styles.star} aria-hidden="true">
        {'★'.repeat(fullStars)}
        {hasHalf && '★'}
        {'☆'.repeat(emptyStars)}
      </span>
      <span className={`${styles.text} font-medium text-gray-700`}>
        {rating.toFixed(1)}
      </span>
      <span className={`${styles.text} text-gray-400`}>
        ({total} {total === 1 ? 'viaje' : 'viajes'})
      </span>
    </div>
  );
}
