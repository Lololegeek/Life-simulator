'use client';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCharacter } from './hooks';

export function AgeButton({ onAge, compact }: { onAge: () => void; compact?: boolean }) {
  const c = useCharacter();
  const { t } = useTranslation();
  const blocked = c.pending.length > 0;
  return (
    <motion.button
      id="tour-age"
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      onClick={onAge}
      disabled={blocked}
      className={cn(
        'group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-fuchsia-500 to-accent font-display font-extrabold text-white shadow-lg shadow-primary/30 transition disabled:opacity-60',
        compact ? 'h-14 text-lg' : 'h-16 text-xl',
      )}
    >
      <span className="absolute inset-0 -translate-x-full bg-white/20 transition duration-700 group-hover:translate-x-full" />
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/25">
        <Plus className="h-6 w-6" strokeWidth={3} />
      </span>
      {blocked ? t('game.pendingEvent') : t('game.age')}
      {!compact && !blocked && <kbd className="rounded-md bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold">Espace</kbd>}
    </motion.button>
  );
}
