import { forwardRef, type ButtonHTMLAttributes } from 'react';

type TButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type TButtonSize = 'sm' | 'md' | 'lg';

interface TButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TButtonVariant;
  size?: TButtonSize;
}

const variantStyles: Record<TButtonVariant, string> = {
  primary:
    'bg-navy text-white hover:bg-navy-dark disabled:bg-navy/50',
  secondary:
    'bg-gold text-white hover:bg-gold-dark disabled:bg-gold/50',
  outline:
    'border-2 border-navy text-navy bg-transparent hover:bg-navy hover:text-white disabled:opacity-50',
  ghost:
    'text-gray-600 hover:bg-gray-100 hover:text-navy disabled:opacity-50',
  danger:
    'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300',
};

const sizeStyles: Record<TButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
};

export const Button = forwardRef<HTMLButtonElement, TButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
