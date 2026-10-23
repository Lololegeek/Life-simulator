'use client';

import { useMemo, useState } from 'react';
import { groupBy } from 'lodash-es';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useGame } from '@/store/game';
import { ACHIEVEMENTS } from '@/game/data/achievements';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const ORDER = ['commun', 'rare', 'épique', 'légendaire'] as const;
const RARITY_VARIANT = { commun: 'muted', rare: 'default', épique: 'warning', légendaire: 'danger' } as const;

export function AchievementsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const unlocked = useGame((s) => s.unlocked);
  const [filter, setFilter] = useState<'all' | 'got' | 'missing'>('all');
  const grouped = useMemo(() => groupBy(ACHIEVEMENTS, 'rarity'), []);
  const got = Object.keys(unlocked).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogTitle>🏆 Succès</DialogTitle>
        <DialogDescription>
          {got} / {ACHIEVEMENTS.length} débloqués, toutes vies confondues.
        </DialogDescription>
        <Progress value={(got / ACHIEVEMENTS.length) * 100} className="mt-3" />
        <div className="mt-3 flex gap-1.5">
          {(['all', 'got', 'missing'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn('rounded-full px-3 py-1 text-xs font-semibold', filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
              {{ all: 'Tous', got: 'Obtenus', missing: 'À obtenir' }[f]}
            </button>
          ))}
        </div>
        <div className="mt-4 space-y-5">
          {ORDER.map((rarity) => {
            const list = (grouped[rarity] ?? []).filter((a) => (filter === 'all' ? true : filter === 'got' ? unlocked[a.id] : !unlocked[a.id]));
            if (!list.length) return null;
            return (
              <section key={rarity}>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{rarity}</h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  {list.map((a) => {
                    const at = unlocked[a.id];
                    return (
                      <div key={a.id} className={cn('flex items-center gap-3 rounded-xl border border-border p-3', !at && 'opacity-50 grayscale')}>
                        <div className="text-3xl">{at ? a.icon : '🔒'}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold">{a.name}</span>
                            <Badge variant={RARITY_VARIANT[a.rarity]}>{a.rarity}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{a.description}</p>
                          {at && <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(at, { locale: fr, addSuffix: true })}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
