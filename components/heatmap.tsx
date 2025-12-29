'use client';

import { useMemo } from 'react';
import { HistoryProps } from '@/lib/types';
import { cn, generateHeatmapDays, groupDaysByMonth } from '@/lib/utils';
import {
  Beef,
  Dumbbell,
  Book,
  Headphones,
  Pencil,
  Users,
  Volleyball,
  Gamepad,
  Motorbike,
  Wine,
  Cannabis,
  Smartphone,
  Droplet,
  PersonStanding,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  friends: Users,
  asado: Beef,
  read: Book,
  write: Pencil,
  music: Headphones,
  gym: Dumbbell,
  train: Volleyball,
  gaming: Gamepad,
  delivery: Motorbike,
  alcohol: Wine,
  weed: Cannabis,
  doomscroll: Smartphone,
  cry: Droplet,
  panic: PersonStanding,
};

const getActivityIcon = (activityId: string) => {
  return iconMap[activityId] || Users;
};

export default function Heatmap({ activities, logs }: HistoryProps) {
  const { days, activityPresence } = useMemo(() => generateHeatmapDays(logs), [logs]);

  const hasActivity = (activityId: string, dateStr: string): boolean => {
    return activityPresence.get(dateStr)?.has(activityId) || false;
  };

  const months = useMemo(() => groupDaysByMonth(days), [days]);

  return (
    <div className='w-full overflow-x-auto'>
      <div className='inline-block min-w-full'>
        <table className='border-collapse'>
          <thead>
            <tr>
              <th className='sticky left-0 z-10 bg-background p-2 text-left'></th>
              {months.map((monthGroup) => (
                <th
                  key={monthGroup.month}
                  colSpan={monthGroup.days.length}
                  className='p-2 text-xs text-muted-foreground font-normal text-center'
                >
                  {monthGroup.month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.id);
              return (
                <tr key={activity.id}>
                  <td className='sticky left-0 z-10 bg-background p-2'>
                    <div className='flex items-center justify-center'>
                      <Icon className='w-4 h-4 text-primary/50' />
                    </div>
                  </td>
                  {days.map((day) => {
                    const present = hasActivity(activity.id, day.dateStr);
                    return (
                      <td key={day.dateStr} className='p-1'>
                        <div
                          className={cn(
                            'w-4 h-4 rounded-sm border border-border/50 hover:scale-110 transition-transform',
                            present ? 'bg-primary' : 'bg-muted/50'
                          )}
                          title={`${activity.label} - ${day.date.toLocaleDateString('es-ES')}: ${
                            present ? 'Sí' : 'No'
                          }`}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
