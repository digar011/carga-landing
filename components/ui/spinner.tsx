interface TSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-3',
};

export function Spinner({ size = 'md', className = '' }: TSpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-gray-200 border-t-navy ${sizeStyles[size]} ${className}`}
      role="status"
      aria-label="Cargando..."
    >
      <span className="sr-only">Cargando...</span>
    </div>
  );
}
