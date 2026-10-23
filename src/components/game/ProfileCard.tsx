'use client';

import CountUp from 'react-countup';
import { sumBy } from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { Lock, Star } from 'lucide-react';
import { countryName, flagOf } from '@/game/data/countries';
import { currentTitle, fullName, netWorth } from '@/game/engine/helpers';
import { money } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar } from './Avatar';
import { useCharacter } from './hooks';

function Money({ value }: { value: number }) {
  return (
    <CountUp
      end={value}
      duration={0.8}
      preserveValue
      formattingFn={(v) => money(Math.round(v))}
      className={cn('tabular-nums', value < 0 && 'text-danger')}
    />
  );
}

export function ProfileCard({ compact, className }: { compact?: boolean; className?: string }) {
  const c = useCharacter();
  const { t, i18n } = useTranslation();
  const nw = netWorth(c);
  const stocks = sumBy(Object.entries(c.holdings), ([s, n]) => n * (c.market.prices[s] ?? 0));

  return (
    <Card id="tour-profile" className={cn('flex items-center gap-3 p-3', className)}>
      <Avatar seed={c.id + c.firstName} age={c.age} gender={c.gender} className={compact ? 'h-14 w-14' : 'h-20 w-20'} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className={cn('truncate font-display font-bold', compact ? 'text-base' : 'text-xl')}>{fullName(c)}</h2>
          {c.generation > 1 && <Badge variant="muted">G{c.generation}</Badge>}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {flagOf(c.countryCode)} {c.city}, {countryName(c.countryCode, i18n.language)} · {currentTitle(c)}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="font-display font-extrabold">{t('game.years', { count: c.age })}</span>
          <Popover>
            <PopoverTrigger className="rounded-md font-semibold text-success underline-offset-2 hover:underline">
              <Money value={c.money} />
            </PopoverTrigger>
            <PopoverContent>
              <h4 className="mb-2 font-display font-bold">{t('game.netWorth')} : {money(nw)}</h4>
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
            <span className="flex items-center gap-1 text-xs text-warning">
              <Star className="h-3 w-3 fill-current" /> {c.fame}
            </span>
          )}
          {c.prison && (
            <Badge variant="danger">
              <Lock className="h-3 w-3" /> {t('game.prison', { count: c.prison.yearsLeft })}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}

function Line({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn('font-semibold tabular-nums', value < 0 && 'text-danger')}>{money(value)}</dd>
    </div>
  );
}
