interface TSkeletonProps {
  variant: 'card' | 'text' | 'avatar' | 'table-row';
  count?: number;
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      {/* Header: ruta + estado */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-5 w-3/4 rounded bg-gray-200" />
          <div className="h-3 w-1/2 rounded bg-gray-100" />
        </div>
        <div className="h-5 w-16 shrink-0 rounded-full bg-gray-200" />
      </div>

      {/* Badge de distancia */}
      <div className="mt-3">
        <div className="h-5 w-20 rounded-full bg-gray-100" />
      </div>

      {/* Info de carga */}
      <div className="mt-3 flex items-center gap-4">
        <div className="h-4 w-32 rounded bg-gray-100" />
        <div className="h-4 w-24 rounded bg-gray-100" />
      </div>

      {/* Precio + tiempo */}
      <div className="mt-3 flex items-end justify-between">
        <div className="h-6 w-28 rounded bg-gray-200" />
        <div className="h-3 w-16 rounded bg-gray-100" />
      </div>
    </div>
  );
}

function SkeletonText() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-4 w-full rounded bg-gray-200" />
      <div className="h-4 w-5/6 rounded bg-gray-200" />
      <div className="h-4 w-4/6 rounded bg-gray-100" />
    </div>
  );
}

function SkeletonAvatar() {
  return (
    <div className="flex animate-pulse items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-gray-200" />
      <div className="space-y-2">
        <div className="h-4 w-24 rounded bg-gray-200" />
        <div className="h-3 w-16 rounded bg-gray-100" />
      </div>
    </div>
  );
}

function SkeletonTableRow() {
  return (
    <div className="flex animate-pulse items-center gap-4 border-b border-gray-100 py-3">
      <div className="h-4 w-8 rounded bg-gray-100" />
      <div className="h-4 w-32 rounded bg-gray-200" />
      <div className="h-4 w-24 rounded bg-gray-100" />
      <div className="h-4 w-20 rounded bg-gray-200" />
      <div className="h-4 w-16 rounded bg-gray-100" />
    </div>
  );
}

const VARIANT_COMPONENTS = {
  card: SkeletonCard,
  text: SkeletonText,
  avatar: SkeletonAvatar,
  'table-row': SkeletonTableRow,
} as const;

export function Skeleton({ variant, count = 1 }: TSkeletonProps) {
  const Component = VARIANT_COMPONENTS[variant];

  return (
    <div className="space-y-4" role="status" aria-label="Cargando...">
      {Array.from({ length: count }, (_, i) => (
        <Component key={i} />
      ))}
      <span className="sr-only">Cargando...</span>
    </div>
  );
}
