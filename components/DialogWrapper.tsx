import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '~/lib/utils';
import { X } from 'lucide-react';

const DialogWrapper = ({
  isOpen,
  handleOpenChange,
  children,
  title,
  ContentClassName,
  HeaderClassName,
  TitleClassName,
  isWithCrossIcon = false,
}: {
  isOpen: boolean;
  handleOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title: string;
  ContentClassName?: string;
  HeaderClassName?: string;
  TitleClassName?: string;
  isWithCrossIcon?: boolean;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className={cn('max-w-5xl w-[calc(100vw-2rem)] h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] flex flex-col p-0', ContentClassName)}>
        {isWithCrossIcon ? (
          <DialogHeader className={cn('p-6  pb-0 border-b-0', HeaderClassName)}>
            <DialogTitle className={cn('text-3xl border-b py-4 md:py-8 border-gray-300 font-bold text-center flex justify-between', TitleClassName)}>
              <div></div>
              {title}
              <button className='rounded-md p-2 hover:bg-gray-100' onClick={() => handleOpenChange(false)} aria-label='Close drawer'>
                <X className='h-5 w-5' />
              </button>
            </DialogTitle>
          </DialogHeader>
        ) : (
          <DialogHeader className={cn('p-6  pb-0 border-b-0', HeaderClassName)}>
            <DialogTitle className={cn('text-3xl border-b py-4 md:py-8 border-gray-300 font-bold text-center', TitleClassName)}>{title}</DialogTitle>
          </DialogHeader>
        )}

        {children}
      </DialogContent>
    </Dialog>
  );
};

export default DialogWrapper;
