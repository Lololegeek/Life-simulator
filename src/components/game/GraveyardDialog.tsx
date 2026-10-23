'use client';

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useGame } from '@/store/game';
import { flagOf, getCountry } from '@/game/data/countries';
import { money } from '@/lib/format';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { RIBBONS } from './ribbons';

const PAGE = 15;

export function GraveyardDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const graveyard = useGame((s) => s.graveyard);
  const [shown, setShown] = useState(PAGE);
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) setShown((n) => n + PAGE);
  }, [inView]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogTitle>🪦 Cimetière</DialogTitle>
        <DialogDescription>Toutes les vies que tu as vécues.</DialogDescription>
        <div className="mt-4 space-y-2">
          {graveyard.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Personne n’est encore enterré ici.</p>}
          {graveyard.slice(0, shown).map((g) => {
            const ribbon = RIBBONS[g.ribbon];
            return (
              <div key={g.id + g.diedAt} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <div className="text-3xl">{flagOf(g.countryCode)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold">{g.name}</span>
                    {g.generation > 1 && <span className="text-[10px] text-muted-foreground">G{g.generation}</span>}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {g.birthYear}–{g.birthYear + g.age} · {g.age} ans · {getCountry(g.countryCode).nameFr} · {g.job ?? 'sans emploi'}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">Mort·e {g.cause} · {money(g.netWorth)}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{ribbon?.icon ?? '🙂'}</div>
                  <div className="text-[10px] font-semibold">{ribbon?.label}</div>
                </div>
              </div>
            );
          })}
          {shown < graveyard.length && <div ref={ref} className="h-8" />}
          {graveyard.length > 0 && (
            <p className="pt-2 text-center text-[11px] text-muted-foreground">
              Dernière visite : {format(new Date(graveyard[0].diedAt), 'PPPp', { locale: fr })}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
