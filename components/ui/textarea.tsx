import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[100px] w-full rounded-md border border-pizarra-200 bg-marfil px-4 py-3 text-sm text-pizarra-800 placeholder:text-pizarra-400',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dorado-400 focus-visible:border-dorado-400',
        'disabled:cursor-not-allowed disabled:opacity-50 transition',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

export { Textarea };
