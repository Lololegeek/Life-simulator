'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useCharacter } from './hooks';

export function AgeButton({ onAge, compact }: { onAge: () => void; compact?: boolean }) {
  const c = useCharacter();
  const { t } = useTranslation();
  const blocked = c.pending.length > 0;
  return (
    <motion.button
      id="tour-age"
      whileTap={{ y: 3, boxShadow: '0px 0px 0 hsl(var(--primary))' }}
      onClick={onAge}
      disabled={blocked}
      style={{ boxShadow: '0 4px 0 hsl(var(--primary))' }}
      className={cn(
        'group relative flex w-full items-center justify-between overflow-hidden rounded-full bg-foreground pl-6 pr-2 text-background transition disabled:cursor-not-allowed disabled:opacity-60',
        compact ? 'h-14' : 'h-16',
      )}
    >
      <span className="flex flex-col items-start leading-none">
        <span className={cn('font-display font-medium italic', compact ? 'text-xl' : 'text-2xl')}>{blocked ? (compact ? 'Décide d’abord…' : t('game.pendingEvent')) : t('game.age')}</span>
        {!blocked && !compact && <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] opacity-60">Espace · une année passe</span>}
      </span>
      <span className={cn('flex items-center justify-center gap-1 rounded-full bg-primary font-mono font-semibold text-primary-foreground', compact ? 'h-10 px-4 text-sm' : 'h-12 px-5')}>
        <AnimatePresence mode="popLayout">
          <motion.span key={c.age} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }}>
            {c.age}
          </motion.span>
        </AnimatePresence>
        <span>→</span>
        <span>{c.age + 1}</span>
      </span>
    </motion.button>
  );
}
