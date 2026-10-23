'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { addYears, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { LogEntry } from '@/game/types';
import { cn } from '@/lib/utils';
import { useCharacter } from './hooks';

type Row = { kind: 'year'; age: number } | { kind: 'entry'; entry: LogEntry };

const TONE: Record<LogEntry['tone'], string> = {
  good: 'bg-success',
  bad: 'bg-danger',
  neutral: 'bg-foreground/25',
  special: 'bg-primary',
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
    estimateSize: (i) => (rows[i].kind === 'year' ? 52 : 44),
    overscan: 12,
  });

  useEffect(() => {
    virtualizer.scrollToIndex(rows.length - 1, { align: 'end' });
  }, [rows.length, virtualizer]);

  const birth = new Date(c.birthYear, 0, 1);

  return (
    <div id="tour-log" className={cn('overflow-hidden rounded-2xl border border-foreground/10 bg-card', className)}>
      <div ref={parentRef} className="h-full overflow-y-auto px-4 pb-4 pt-1">
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
                  <div className="flex items-end gap-3 pb-1.5 pt-4">
                    <span className="w-10 text-right font-display text-3xl font-medium leading-none">{row.age}</span>
                    <span className="label pb-0.5">{row.age > 1 ? 'ans' : 'an'} · {format(addYears(birth, row.age), 'yyyy', { locale: fr })}</span>
                    <span className="mb-1.5 h-px flex-1 bg-foreground/15" />
                  </div>
                ) : (
                  <div className={cn('flex gap-3 py-1 pl-[3.25rem] text-[0.93rem] leading-snug', row.entry.tone === 'special' && 'font-medium')}>
                    <span className={cn('mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full', TONE[row.entry.tone])} />
                    <span>
                      {row.entry.icon && <span className="mr-1.5">{row.entry.icon}</span>}
                      {row.entry.text}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
