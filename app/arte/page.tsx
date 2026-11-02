import Link from 'next/link';
import ArtBoard from '@/components/ArtBoard';
import Gate from '@/components/Gate';
import LogoutButton from '@/components/LogoutButton';
import { ArtProject, ArtTask } from '@/lib/art';
import { currentCode, getArt } from '@/lib/supabase/actions';
import { todayInAR } from '@/lib/utils';

function setupMessage(message: string): string {
  if (message.includes('art_for') || message.includes('art_tasks') || message.includes('art_projects')) {
    return 'Falta correr supabase/art.sql en el SQL editor.';
  }
  return message;
}

export default async function ArtePage() {
  const today = todayInAR();
  let code: string | null = null;
  let projects: ArtProject[] = [];
  let tasks: ArtTask[] = [];
  let errorMessage: string | null = null;

  try {
    code = await currentCode();
    if (code) {
      const art = await getArt();
      projects = art.projects;
      tasks = art.tasks;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al cargar';
    errorMessage = setupMessage(message);
  }

  if (errorMessage) {
    return (
      <main className='mx-auto max-w-2xl p-8 font-mono text-sm text-foreground/80'>{errorMessage}</main>
    );
  }

  if (!code) return <Gate today={today} />;

  return (
    <main className='mx-auto min-h-screen max-w-2xl px-4 py-8 md:px-8'>
      <header className='mb-8 flex items-center justify-between'>
        <h1 className='font-mono text-2xl text-primary'>Stats arte</h1>
        <div className='flex items-center gap-4'>
          <Link href='/' className='font-mono text-sm text-foreground/70 underline'>
            Volver
          </Link>
          <LogoutButton />
        </div>
      </header>
      <ArtBoard today={today} projects={projects} tasks={tasks} />
    </main>
  );
}
