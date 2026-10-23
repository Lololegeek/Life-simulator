'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { addYears, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { LogEntry } from '@/game/types';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { useCharacter } from './hooks';

type Row = { kind: 'year'; age: number } | { kind: 'entry'; entry: LogEntry };

const TONE: Record<LogEntry['tone'], string> = {
  good: 'border-l-success',
  bad: 'border-l-danger',
  neutral: 'border-l-border',
  special: 'border-l-primary bg-primary/5',
};

export function LifeLog({ className }: { className?: string }) {
  const c = useCharacter();
  const parentRef = useRef<HTMLDivElement>(null);

  const rows = useMemo(() => {
    const out: Row[] = [];
    let last = -1;
    for (const entry of c.log) {
      if (entry.age !== last) {
        out.push({ kind: 'year', age: entry.age });
        last = entry.age;
      }
      out.push({ kind: 'entry', entry });
    }
    if (last !== c.age) out.push({ kind: 'year', age: c.age });
    return out;
  }, [c.log, c.age]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (i) => (rows[i].kind === 'year' ? 34 : 56),
    overscan: 12,
  });

  useEffect(() => {
    virtualizer.scrollToIndex(rows.length - 1, { align: 'end' });
  }, [rows.length, virtualizer]);

  const birth = new Date(c.birthYear, 0, 1);

  return (
    <Card id="tour-log" className={cn('overflow-hidden', className)}>
      <div ref={parentRef} className="h-full overflow-y-auto px-3 py-2">
        <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
          {virtualizer.getVirtualItems().map((v) => {
            const row = rows[v.index];
            return (
              <div
                key={v.key}
                data-index={v.index}
                ref={virtualizer.measureElement}
                className="absolute left-0 top-0 w-full"
                style={{ transform: `translateY(${v.start}px)` }}
              >
                {row.kind === 'year' ? (
                  <div className="flex items-center gap-2 pb-1 pt-3">
                    <span className="font-display text-sm font-extrabold text-primary">Âge {row.age}</span>
                    <span className="text-[11px] text-muted-foreground">{format(addYears(birth, row.age), 'yyyy', { locale: fr })}</span>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                ) : (
                  <div className={cn('mb-1.5 flex gap-2 rounded-r-lg border-l-4 py-1.5 pl-2.5 pr-2 text-sm leading-snug', TONE[row.entry.tone])}>
                    {row.entry.icon && <span className="shrink-0">{row.entry.icon}</span>}
                    <span>{row.entry.text}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
