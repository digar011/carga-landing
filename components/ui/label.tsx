import type { LabelHTMLAttributes } from 'react';

interface TLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  optional?: boolean;
}

export function Label({
  className = '',
  children,
  required,
  optional,
  ...props
}: TLabelProps) {
  return (
    <label
      className={`mb-1.5 block text-sm font-semibold text-gray-700 ${className}`}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
      {optional && (
        <span className="ml-1 font-normal text-gray-400">(opcional)</span>
      )}
    </label>
  );
}
