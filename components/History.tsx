import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { HistoryProps } from '@/lib/types';
import Heatmap from './heatmap';
import { Logs } from './Logs';

export default function History({ logs, activities }: HistoryProps) {
  const renderNoLogs = () => (
    <div className='text-center py-12'>
      <p className='text-foreground/60'>No hay registros aún</p>
    </div>
  );

  return (
    <div className='min-h-screen bg-background flex flex-col max-w-2xl mx-auto'>
      {/* Header */}
      <div className='p-4 md:p-8 pb-6'>
        <div className='flex items-center justify-between mb-4'>
          <h1 className='text-2xl font-medium font-mono text-primary'>Historial</h1>
          <Link
            href='/'
            className='flex items-center gap-2 text-sm text-foreground hover:underline underline-offset-2 transition-colors'
          >
            <ArrowLeft className='h-4 w-4' />
            <span>Volver</span>
          </Link>
        </div>
      </div>
      <div className='space-y-4 px-4 md:px-8'>
        <Heatmap activities={activities} logs={logs} />
        {logs.length === 0 ? renderNoLogs() : <Logs activities={activities} logs={logs} />}
      </div>
    </div>
  );
}
