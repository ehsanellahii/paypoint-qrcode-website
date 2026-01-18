/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useUser } from '~/contexts/user-context';

type Props = {
  open: boolean;
  onClose: () => void;
  onOpenOrders: () => void;
};

export default function UserDrawer({ open, onClose, onOpenOrders }: Props) {
  const { user } = useUser(); // adjust if your context shape differs
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // Focus panel when opened
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : null) || 'Guest';

  return (
    <div className='fixed inset-0 z-50'>
      {/* overlay */}
      <button aria-label='Close menu' className='absolute inset-0 bg-black/30' onClick={onClose} />

      {/* panel */}
      <aside
        ref={panelRef}
        tabIndex={-1}
        role='dialog'
        aria-modal='true'
        aria-label='User menu'
        className='absolute right-0 top-0 h-full w-90 max-w-[90vw] bg-white shadow-xl outline-none flex flex-col '>
        <div className='flex-1 overflow-y-auto flex flex-col justify-between'>
          <div className=' '>
            <div className='flex items-center justify-between border-b border-gray-100 px-4 py-4'>
              <div>
                <div className='text-sm text-gray-500'>Signed in as</div>
                <div className='font-semibold text-gray-900'>{displayName}</div>
                {user?.email && <div className='text-sm text-gray-600'>{user.email}</div>}
              </div>

              <button className='rounded-md p-2 hover:bg-gray-100' onClick={onClose} aria-label='Close drawer'>
                <X className='h-5 w-5' />
              </button>
            </div>

            <nav className='p-2'>
              <button className='block w-full rounded-lg px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-100 text-left' onClick={onOpenOrders}>
                Orders
              </button>

              {/* <DrawerLink href='/support' label='Support' onClick={onClose} /> */}
              {/* <DrawerLink href='/franchise' label='Franchise' onClick={onClose} /> */}
              {/* <DrawerLink href='/profile' label='Profile' onClick={onClose} /> */}

              {/* <div className='my-3 border-t border-gray-100' /> */}

              {/* {user?.isGuest ? (
                <>
                  <DrawerLink href='/login' label='Login' onClick={onClose} />
                  <DrawerLink href='/signup' label='Create account' onClick={onClose} />
                </>
              ) : (
                <button
                  className='w-full rounded-lg px-4 py-3 text-left text-sm font-medium hover:bg-gray-100'
                  onClick={() => {
                    // logout
                    onClose();
                  }}>
                  Logout
                </button>
              )} */}
            </nav>
          </div>
          <div className='border-t border-gray-100 px-4 py-3'>
            <div className='flex items-center justify-center gap-2 text-xs text-gray-500'>
              <span className='italic'>Powered by</span>
              <img src='/paypoint.png' alt='PayPoint' className='h-14 w-auto object-contain opacity-80' />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function DrawerLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className='block w-full rounded-lg px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-100'>
      {label}
    </Link>
  );
}
