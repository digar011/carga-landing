import { forwardRef, type SelectHTMLAttributes } from 'react';

interface TSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, TSelectProps>(
  ({ className = '', error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full appearance-none rounded-lg border bg-white px-4 py-3 text-sm text-gray-800 outline-none transition-colors focus:border-navy focus:ring-1 focus:ring-navy/20 disabled:cursor-not-allowed disabled:bg-gray-50 ${
          error
            ? 'border-red-500 bg-red-50'
            : 'border-gray-200'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';
