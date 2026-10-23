'use client';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { StatKey } from '@/game/types';
import { getDisease } from '@/game/data/health';
import { statColor } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip } from '@/components/ui/tooltip';
import { useCharacter } from './hooks';

const STATS: { key: StatKey; icon: string; hint: string }[] = [
  { key: 'health', icon: '❤️', hint: 'À zéro, c’est la mort. Va chez le médecin et fais du sport.' },
  { key: 'happiness', icon: '😊', hint: 'Influencée par ton couple, ton argent, ton travail et tes loisirs.' },
  { key: 'smarts', icon: '🧠', hint: 'Augmente à l’école et à la bibliothèque. Ouvre les meilleures carrières.' },
  { key: 'looks', icon: '💅', hint: 'Aide en amour et pour certains métiers. Décline avec l’âge.' },
  { key: 'fitness', icon: '💪', hint: 'Ralentit le vieillissement. Requise pour les métiers physiques.' },
];

export function StatsPanel({ compact }: { compact?: boolean }) {
  const c = useCharacter();
  const { t } = useTranslation();
  return (
    <Card id="tour-stats" className={cn('grid gap-x-5 gap-y-2', compact ? 'grid-cols-2 p-3' : 'grid-cols-2 p-4 sm:grid-cols-3')}>
      {STATS.map(({ key, icon, hint }) => {
        const v = c.stats[key];
        return (
          <Tooltip key={key} content={hint}>
            <div className="cursor-help space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>
                  {icon} {t(`stats.${key}`)}
                </span>
                <motion.span key={v} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="tabular-nums" style={{ color: statColor(v) }}>
                  {v}%
                </motion.span>
              </div>
              <Progress value={v} color={statColor(v)} />
            </div>
          </Tooltip>
        );
      })}
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
        <Tooltip content="Le karma récompense les bonnes actions… et punit les mauvaises.">
          <span className="cursor-help">☯️ Karma {c.karma}</span>
        </Tooltip>
        {c.diseases.map((d) => {
          const info = getDisease(d.id);
          return (
            <Tooltip key={d.id} content={`${info.name} depuis ${d.years} an(s). Consulte un médecin.`}>
              <span className="cursor-help rounded-full bg-danger/10 px-1.5 py-0.5 text-danger">
                {info.icon} {info.name}
              </span>
            </Tooltip>
          );
        })}
      </div>
    </Card>
  );
}
