'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/components/Shell';
import { unlock } from '@/lib/supabase/actions';

export default function Gate({ today }: { today: string }) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    const message = await unlock(code);
    if (message) {
      setError(message);
      setPending(false);
      return;
    }
    router.refresh();
  };

  return (
    <div className='relative min-h-screen'>
      <div className='pointer-events-none min-h-screen select-none blur-md' aria-hidden='true'>
        <Shell today={today} logs={[]} tasks={[]} />
      </div>
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
        <form onSubmit={submit} className='w-full max-w-sm border border-foreground/20 bg-background p-6'>
          <h1 className='font-mono text-xl text-primary'>Trackizky</h1>
          <label className='mt-6 block'>
            <span className='mb-2 block font-mono text-sm'>Código</span>
            <input
              autoFocus
              autoComplete='off'
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className='w-full border border-foreground/20 bg-transparent px-3 py-2 font-mono outline-none focus:border-primary'
            />
          </label>
          {error && <p className='mt-3 font-mono text-sm text-destructive'>{error}</p>}
          <button
            type='submit'
            disabled={pending}
            className='mt-6 w-full bg-primary px-4 py-3 font-mono text-primary-foreground disabled:opacity-50'
          >
            {pending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
