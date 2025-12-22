'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { formatDisplayDate, getActivityLabel } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { HistoryProps } from '@/lib/types';

export default function History({ logs, activities }: HistoryProps) {
  const renderNoLogs = () => (
    <div className='text-center py-12'>
      <p className='text-foreground/60'>No hay registros aún</p>
    </div>
  );

  const renderLogs = () =>
    logs.map((log) => (
      <Card key={log.date}>
        <CardHeader className='font-mono text-primary'>
          {formatDisplayDate(new Date(log.date))}
        </CardHeader>
        <CardContent className='flex flex-wrap gap-4'>
          {log.activities.length === 0 ? (
            <span className='text-foreground/40 text-sm'>Sin actividades</span>
          ) : (
            log.activities.map((activityId) => (
              <span key={activityId} className='px-3 py-1 bg-muted text-sm rounded-full'>
                {getActivityLabel(activityId, activities)}
              </span>
            ))
          )}
        </CardContent>
      </Card>
    ));

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
        {logs.length === 0 ? renderNoLogs() : renderLogs()}
      </div>
    </div>
  );
}
