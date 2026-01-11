import * as React from 'react';

import { cn } from '~/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot='textarea'
      className={cn(
        'rounded-lg border-2 border-gray-200 bg-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:border-none disabled:cursor-not-allowed disabled:opacity-50   flex field-sizing-content min-h-16 w-full  px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-none md:text-sm',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
