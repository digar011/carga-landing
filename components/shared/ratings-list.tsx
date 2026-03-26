import { formatDate } from '@/utils/format';

interface TRatingItem {
  score: number;
  comentario: string | null;
  created_at: string;
  from_user_name: string;
}

interface TRatingsListProps {
  ratings: TRatingItem[];
}

export function RatingsList({ ratings }: TRatingsListProps) {
  if (ratings.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-gray-400">
        Todavia no tiene calificaciones.
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {ratings.map((rating, index) => (
        <div key={index} className="py-3 first:pt-0 last:pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gold" aria-hidden="true">
                {'\u2605'.repeat(rating.score)}
                {'\u2606'.repeat(5 - rating.score)}
              </span>
              <span className="text-xs font-medium text-gray-600">
                {rating.from_user_name}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {formatDate(rating.created_at)}
            </span>
          </div>
          {rating.comentario && (
            <p className="mt-1 text-sm text-gray-600">
              {rating.comentario}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
