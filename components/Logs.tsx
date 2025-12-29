import { HistoryProps, LogEntry } from '@/lib/types';
import {
  formatDisplayDate,
  formatMonthYear,
  getActivityLabel,
  groupLogsByMonthYear,
  parseDateString,
} from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const Logs = ({ activities, logs }: HistoryProps) => {
  const groupedLogs = groupLogsByMonthYear(logs);


  const sortedGroups = Array.from(groupedLogs.entries()).sort((a, b) => {
    const dateA = parseDateString(a[1][0].date);
    const dateB = parseDateString(b[1][0].date);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <Accordion type='single' collapsible className='w-full'>
      {sortedGroups.map(([monthYear, monthLogs]) => (
        <AccordionItem key={monthYear} value={monthYear}>
          <AccordionTrigger className='font-mono text-primary uppercase text-xl'>{monthYear}</AccordionTrigger>
          <AccordionContent>
            <div className='space-y-4'>
              {monthLogs.map((log) => (
                <div key={log.date}>
                  <div className='font-mono text-primary/70 mb-2'>{formatDisplayDate(log.date)}</div>
                  <div className='flex flex-wrap gap-4'>
                    {log.activities.length === 0 ? (
                      <span className='text-foreground/40 text-sm'>Sin actividades</span>
                    ) : (
                      log.activities.map((activityId) => (
                        <span key={activityId} className='py-1 text-sm text-muted-foreground'>
                          {getActivityLabel(activityId, activities)}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
