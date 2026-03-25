import type { HTMLAttributes } from 'react';

type TBadgeVariant = 'default' | 'gold' | 'green' | 'red' | 'blue' | 'gray';

interface TBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: TBadgeVariant;
}

const variantStyles: Record<TBadgeVariant, string> = {
  default: 'bg-navy/10 text-navy',
  gold: 'bg-gold/10 text-gold-dark',
  green: 'bg-green-50 text-green-700',
  red: 'bg-red-50 text-red-700',
  blue: 'bg-blue-50 text-blue-700',
  gray: 'bg-gray-100 text-gray-600',
};

export function Badge({
  className = '',
  variant = 'default',
  children,
  ...props
}: TBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
