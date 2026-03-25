import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface TTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TTextareaProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-navy focus:ring-1 focus:ring-navy/20 disabled:cursor-not-allowed disabled:bg-gray-50 ${
          error
            ? 'border-red-500 bg-red-50'
            : 'border-gray-200'
        } ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
