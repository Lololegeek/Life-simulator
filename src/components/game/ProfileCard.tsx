'use client';

import CountUp from 'react-countup';
import { sumBy } from 'lodash-es';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Lock, Star } from 'lucide-react';
import { countryName, flagOf } from '@/game/data/countries';
import { currentTitle, fullName, netWorth } from '@/game/engine/helpers';
import { money } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar } from './Avatar';
import { useCharacter } from './hooks';

function Money({ value }: { value: number }) {
  return <CountUp end={value} duration={0.8} preserveValue formattingFn={(v) => money(Math.round(v))} className={cn('num', value < 0 && 'text-danger')} />;
}

export function ProfileCard({ compact, className }: { compact?: boolean; className?: string }) {
  const c = useCharacter();
  const { t, i18n } = useTranslation();
  const nw = netWorth(c);
  const stocks = sumBy(Object.entries(c.holdings), ([s, n]) => n * (c.market.prices[s] ?? 0));

  return (
    <div id="tour-profile" className={cn('overflow-hidden rounded-2xl border border-foreground/80 bg-card shadow-ink-sm', className)}>
      <div className="flex items-center justify-between border-b border-dashed border-foreground/25 px-3 py-1.5">
        <span className="label">Carte de vie · {c.countryCode}</span>
        <span className="label num">N° {c.seed.toUpperCase()}</span>
      </div>
      <div className="flex items-stretch gap-3 p-3">
        <Avatar seed={c.id + c.firstName} age={c.age} gender={c.gender} className={compact ? 'h-[4.5rem] w-[4.5rem]' : 'h-24 w-24'} />
        <div className="min-w-0 flex-1">
          <div className="label">Nom</div>
          <h2 className={cn('truncate font-display font-medium leading-tight tracking-tight', compact ? 'text-xl' : 'text-[1.7rem]')}>{fullName(c)}</h2>
          <div className={cn('mt-1 grid gap-x-4 gap-y-1', compact ? 'grid-cols-1' : 'grid-cols-[auto_auto] justify-start')}>
            <p className="truncate text-xs">
              {flagOf(c.countryCode)} {c.city}, {countryName(c.countryCode, i18n.language)}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {currentTitle(c)}
              {c.generation > 1 && ` · génération ${c.generation}`}
            </p>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <Popover>
              <PopoverTrigger className="rounded-md font-semibold underline decoration-foreground/30 decoration-dashed underline-offset-4 hover:decoration-foreground">
                <Money value={c.money} />
              </PopoverTrigger>
              <PopoverContent>
                <div className="label">{t('game.netWorth')}</div>
                <div className="num mb-3 font-display text-2xl">{money(nw)}</div>
                <dl className="space-y-1 text-sm">
                  <Line label={t('game.money')} value={c.money} />
                  <Line label="Biens" value={sumBy(c.assets, 'value')} />
                  <Line label="Placements" value={Math.round(stocks)} />
                  <Line label={t('game.debt')} value={-c.debt} />
                  {c.career && <Line label="Salaire brut / an" value={c.career.salary} />}
                  {c.retired && <Line label="Pension / an" value={c.pension} />}
                </dl>
              </PopoverContent>
            </Popover>
            {c.fame > 0 && (
              <span className="num flex items-center gap-1 text-xs text-warning">
                <Star className="h-3 w-3 fill-current" /> {c.fame}
              </span>
            )}
            {c.prison && (
              <span className="flex items-center gap-1 rounded-full bg-danger px-2 py-0.5 text-[11px] font-semibold text-danger-foreground">
                <Lock className="h-3 w-3" /> {t('game.prison', { count: c.prison.yearsLeft })}
              </span>
            )}
          </div>
        </div>
        <div className="flex w-16 shrink-0 flex-col items-center justify-center border-l border-dashed border-foreground/25 pl-3">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={c.age}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -24, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.35, duration: 0.5 }}
              className="font-display text-5xl font-medium leading-none"
            >
              {c.age}
            </motion.span>
          </AnimatePresence>
          <span className="label mt-1">{c.age > 1 ? 'ans' : 'an'}</span>
        </div>
      </div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn('num font-medium', value < 0 && 'text-danger')}>{money(value)}</dd>
    </div>
  );
}
