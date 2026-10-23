'use client';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { StatKey } from '@/game/types';
import { getDisease } from '@/game/data/health';
import { cn, statColor } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';
import { useCharacter } from './hooks';

const STATS: { key: StatKey; icon: string; hint: string }[] = [
  { key: 'health', icon: '❤️', hint: 'À zéro, c’est la mort. Va chez le médecin et fais du sport.' },
  { key: 'happiness', icon: '😊', hint: 'Influencé par ton couple, ton argent, ton travail et tes loisirs.' },
  { key: 'smarts', icon: '🧠', hint: 'Augmente à l’école et à la bibliothèque. Ouvre les meilleures carrières.' },
  { key: 'looks', icon: '💅', hint: 'Aide en amour et pour certains métiers. Décline avec l’âge.' },
  { key: 'fitness', icon: '💪', hint: 'Ralentit le vieillissement. Requise pour les métiers physiques.' },
];

const TICKS = 20;

/** A bar made of 20 ink ticks, like a hand-filled gauge. */
export function TickBar({ value, className }: { value: number; className?: string }) {
  const filled = Math.round((value / 100) * TICKS);
  const color = statColor(value);
  return (
    <div className={cn('flex h-3 gap-[2px]', className)}>
      {Array.from({ length: TICKS }, (_, i) => (
        <motion.span
          key={i}
          className="flex-1 rounded-[2px]"
          initial={false}
          animate={{ backgroundColor: i < filled ? color : 'hsl(var(--foreground) / 0.09)', scaleY: i < filled ? 1 : 0.7 }}
          transition={{ duration: 0.3, delay: i * 0.012 }}
        />
      ))}
    </div>
  );
}

export function StatsPanel({ compact }: { compact?: boolean }) {
  const c = useCharacter();
  const { t } = useTranslation();
  return (
    <div id="tour-stats" className={cn('rounded-2xl border border-foreground/10 bg-card', compact ? 'p-3' : 'p-4')}>
      <div className={cn('grid gap-x-6', compact ? 'grid-cols-1 gap-y-1.5' : 'grid-cols-1 gap-y-2 sm:grid-cols-2')}>
        {STATS.map(({ key, icon, hint }) => {
          const v = c.stats[key];
          return (
            <Tooltip key={key} content={hint}>
              <div className="grid cursor-help grid-cols-[6.5rem_1fr_2.5rem] items-center gap-3">
                <span className="truncate text-xs font-medium">
                  <span className="mr-1.5">{icon}</span>
                  {t(`stats.${key}`)}
                </span>
                <TickBar value={v} />
                <motion.span key={v} initial={{ scale: 1.35 }} animate={{ scale: 1 }} className="num text-right text-xs font-semibold" style={{ color: statColor(v) }}>
                  {v}
                </motion.span>
              </div>
            </Tooltip>
          );
        })}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px]">
          <Tooltip content="Le karma récompense les bonnes actions… et punit les mauvaises.">
            <span className="num cursor-help rounded-full border border-foreground/15 px-2 py-0.5">☯ karma {Math.round(c.karma)}</span>
          </Tooltip>
          {c.diseases.map((d) => {
            const info = getDisease(d.id);
            return (
              <Tooltip key={d.id} content={`${info.name} depuis ${d.years} an(s). Consulte un médecin (onglet Activités).`}>
                <span className="cursor-help rounded-full bg-danger/10 px-2 py-0.5 font-medium text-danger">
                  {info.icon} {info.name}
                </span>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </div>
  );
}
