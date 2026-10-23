'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Balancer from 'react-wrap-balancer';
import { useTranslation } from 'react-i18next';
import { resolveChoice } from '@/game/engine/actions';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCharacter, useRun } from './hooks';

export function EventDialog() {
  const c = useCharacter();
  const run = useRun();
  const { t } = useTranslation();
  const ev = c.pending[0];

  return (
    <Dialog open={!!ev}>
      <DialogContent hideClose onEscapeKeyDown={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()} className="max-w-md text-center">
        <AnimatePresence mode="wait">
          {ev && (
            <motion.div key={ev.eventId + c.pending.length} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <motion.div initial={{ rotate: -15, scale: 0.5 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', bounce: 0.6 }} className="text-6xl">
                {ev.icon}
              </motion.div>
              <DialogTitle>
                <Balancer>{ev.title}</Balancer>
              </DialogTitle>
              <DialogDescription className="text-base text-foreground/80">
                <Balancer>{ev.text}</Balancer>
              </DialogDescription>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('game.choose')}</p>
              <div className="flex flex-col gap-2">
                {ev.choices.map((label, i) => (
                  <Button key={label} variant={i === 0 ? 'default' : 'outline'} size="lg" onClick={() => run((ch) => resolveChoice(ch, i))}>
                    {label}
                  </Button>
                ))}
              </div>
              {c.pending.length > 1 && <p className="text-xs text-muted-foreground">+{c.pending.length - 1} autre(s) événement(s) cette année</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
