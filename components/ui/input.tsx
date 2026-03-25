import { forwardRef, type InputHTMLAttributes } from 'react';

interface TInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, TInputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-navy focus:ring-1 focus:ring-navy/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
          error
            ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200'
            : 'border-gray-200'
        } ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
