/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useUser } from '~/contexts/user-context';
import { IconifyIcon } from '~/lib/IconfiyIcon';
import AuthenticationDialog from '../dialogs/Authentication/AuthenticationDialog';
import ProfileDialog from '../dialogs/ProfileDialog';
import FavoriteItemsDialog from '../dialogs/FavoriteItems/FavoriteItemsDialog';
import OrdersDialog from './OrdersDialog';
import ProductModal from '../dialogs/ProductModal';
import { MenuProduct } from '~/lib/utils';

type Props = {
  open: boolean;
  onClose: () => void;
  onOpenOrders: () => void;
  storeSlug?: string;
};

export default function UserDrawer({ open, onClose }: Props) {
  const { user } = useUser(); // adjust if your context shape differs
  const panelRef = useRef<HTMLDivElement | null>(null);
  const isLoggedIn = !!user && !user?.isGuest;
  const [dialogs, setDialogs] = useState<{ login: boolean; register: boolean; favoriteItems: boolean; profile: boolean; orders: boolean; singleProductDetails: boolean }>(
    {
      login: false,
      register: false,
      favoriteItems: false,
      profile: false,
      orders: false,
      singleProductDetails: false,
    }
  );
  const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(null);
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
  const go = (path: string) => {
    if (path === 'orders') {
      setDialogs((prev) => ({ ...prev, orders: true }));
      // onClose();
      return;
    } else if (path === 'favorites') {
      setDialogs((prev) => ({ ...prev, favoriteItems: true }));
      // onClose();
      return;
    } else if (path === 'profile') {
      setDialogs((prev) => ({ ...prev, profile: true }));
      // onClose();
      return;
    }
    // onClose();
  };
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
                <div className='text-sm text-gray-500'>Hey, </div>
                <div className='font-semibold text-gray-900'>{displayName}</div>
                {/* {user?.email && <div className='text-sm text-gray-600'>{user.email}</div>} */}
              </div>

              <button className='rounded-md p-2 hover:bg-gray-100' onClick={onClose} aria-label='Close drawer'>
                <X className='h-5 w-5' />
              </button>
            </div>

            <nav className='p-2'>
              {isLoggedIn ? (
                <>
                  <button
                    className='flex w-full gap-x-2 items-center rounded-lg px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-100 text-left'
                    onClick={() => go('profile')}>
                    <IconifyIcon icon='bxs:user' className='text-icon  size-6' />
                    Profile
                  </button>
                  <button
                    className=' w-full flex gap-x-2 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-100 text-left'
                    onClick={() => go('orders')}>
                    <IconifyIcon icon='heroicons-solid:shopping-bag' className='text-icon  size-6' />
                    Orders
                  </button>
                  <button
                    className='flex w-full items-center gap-x-2 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-100 text-left'
                    onClick={() => go('favorites')}>
                    <IconifyIcon icon='mdi:book-favorite' className='text-icon  size-5.5' />
                    Favorite Products
                  </button>
                </>
              ) : (
                <>
                  <div className='px-4 pt-2 text-xs text-gray-500'>Login to view profile and favorites.</div>
                  <div className='flex gap-x-2'>
                    <DrawerLink label='Login' onClick={() => setDialogs((prev) => ({ ...prev, login: true }))} />
                    <DrawerLink label='Create account' onClick={() => setDialogs((prev) => ({ ...prev, register: true }))} />
                  </div>
                </>
              )}
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
            <a href='https://get-paypoint.de' target='_blank' rel='noopener noreferrer' className='flex items-center justify-center gap-2 text-xs text-gray-500'>
              <span className='italic'>Powered by</span>
              <img src='/paypoint.png' alt='PayPoint' className='h-14 w-auto object-contain opacity-80' />
            </a>
          </div>
        </div>
      </aside>
      {dialogs.login && <AuthenticationDialog isOpen={dialogs.login} handleOpenChange={(open) => setDialogs((prev) => ({ ...prev, login: open }))} />}
      {dialogs.register && <AuthenticationDialog isOpen={dialogs.register} handleOpenChange={(open) => setDialogs((prev) => ({ ...prev, register: open }))} isRegistration={true} />}
      {dialogs.profile && <ProfileDialog isOpen={dialogs.profile} handleOpenChange={(open) => setDialogs((prev) => ({ ...prev, profile: open }))} />}
      {dialogs.favoriteItems && (
        <FavoriteItemsDialog
          isOpen={dialogs.favoriteItems}
          handleOpenChange={(open) => setDialogs((prev) => ({ ...prev, favoriteItems: open }))}
          openProductDetailsCallback={(product: MenuProduct) => {
            setSelectedProduct(product);
            setDialogs((prev) => ({ ...prev, singleProductDetails: true }));
          }}
        />
      )}
      {dialogs.orders && <OrdersDialog onOpenChange={(open) => setDialogs((prev) => ({ ...prev, orders: open }))} open={dialogs.orders} />}
      {dialogs.singleProductDetails && (
        <ProductModal product={selectedProduct} isOpen={dialogs.singleProductDetails} onClose={() => setDialogs((prev) => ({ ...prev, singleProductDetails: false }))} />
      )}
    </div>
  );
}

function DrawerLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className='block w-full rounded-lg px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-100'>
      {label}
    </button>
  );
}
