'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { getYesterday, formatDate, formatDisplayDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HomeProps } from '@/lib/types';
import { saveLog as saveLogToDb } from '@/lib/supabase/actions';

export default function Home({ activities, initialLog }: HomeProps) {
  const yesterday = getYesterday();
  const yesterdayDateStr = formatDate(yesterday);

  const [selectedActivities, setSelectedActivities] = useState<string[]>(
    initialLog?.activities || []
  );
  const [isSaved, setIsSaved] = useState(!!initialLog);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleActivity = (activityId: string) => {
    if (isSaved) return;
    setSelectedActivities((prev) =>
      prev.includes(activityId) ? prev.filter((id) => id !== activityId) : [...prev, activityId]
    );
  };

  const saveLog = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await saveLogToDb(yesterdayDateStr, selectedActivities);
      setIsSaved(true);
    } catch {
      setError('Error al guardar. Intentá de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='min-h-screen flex flex-col max-w-2xl mx-auto'>
      {/* Header */}
      <div className='p-4 md:p-8 pb-6'>
        <div className='flex items-center justify-between mb-4'>
          <h1 className='text-2xl font-medium font-mono text-primary'>Trackizky</h1>
          {isSaved && (
            <Link
              href='/history'
              className='text-sm text-foreground hover:underline underline-offset-2 transition-colors'
            >
              Stats
            </Link>
          )}
        </div>
        <p className='text-sm text-foreground/60'>Ayer — {formatDisplayDate(yesterday)}</p>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto px-4 md:px-8 pb-24 md:pb-32'>
        {isSaved ? (
          <Card className='mb-6 text-center'>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-center gap-2 text-foreground/80 mb-4'>
                <Check className='h-5 w-5' color='var(--primary)' />
                <span>Ayer ya fue registrado</span>
              </div>
              <Link
                href='/history'
                className='text-sm text-foreground/60 hover:text-foreground transition-colors underline'
              >
                Ver estadísticas
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {error && (
              <div className='p-4 mb-4 rounded-lg border border-red-500/50 bg-red-500/10 text-foreground'>
                {error}
              </div>
            )}

            <div className='space-y-6 mb-6'>
              {activities.map((activity) => (
                <Button
                  key={activity.id}
                  onClick={() => toggleActivity(activity.id)}
                  variant={selectedActivities.includes(activity.id) ? 'default' : 'outline'}
                  className={`w-full p-6 text-left justify-start ${
                    selectedActivities.includes(activity.id) ? 'bg-foreground text-background' : ''
                  }`}
                >
                  {activity.label}
                </Button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Sticky Save Button */}
      {!isSaved && (
        <div className='fixed bottom-0 left-0 right-0 p-4 md:p-8 bg-background border-t border-foreground/20 max-w-2xl mx-auto'>
          <Button
            onClick={saveLog}
            disabled={isSaving}
            className='w-full p-4 bg-primary text-primary-foreground hover:opacity-90'
            size='lg'
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      )}
    </div>
  );
}
