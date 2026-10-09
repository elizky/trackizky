'use client';

import { useRouter } from 'next/navigation';
import { logout } from '@/lib/supabase/actions';

export default function LogoutButton() {
  const router = useRouter();

  return (
    <button
      type='button'
      className='font-mono text-sm text-foreground/70 underline'
      onClick={async () => {
        await logout();
        router.refresh();
      }}
    >
      Salir
    </button>
  );
}
