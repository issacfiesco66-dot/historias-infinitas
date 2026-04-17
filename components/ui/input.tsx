import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-md border border-pizarra-200 bg-marfil px-4 py-2 text-sm text-pizarra-800 placeholder:text-pizarra-400',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dorado-400 focus-visible:border-dorado-400',
        'disabled:cursor-not-allowed disabled:opacity-50 transition',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export { Input };
