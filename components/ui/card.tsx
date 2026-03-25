import type { HTMLAttributes } from 'react';

interface TCardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  className = '',
  padding = 'md',
  children,
  ...props
}: TCardProps) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
