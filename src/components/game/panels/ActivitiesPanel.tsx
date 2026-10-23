'use client';

import { useState } from 'react';
import { groupBy } from 'lodash-es';
import { ACTIVITIES, activityCost, activityLocked, casino, commitCrime, doActivity, emigrate, emigrationCost } from '@/game/engine/actions';
import { CRIMES } from '@/game/data/health';
import { COUNTRIES, birthOdds, flagOf, getCountry, wealthFactor } from '@/game/data/countries';
import { ensureLocale } from '@/game/names';
import { local } from '@/game/engine/helpers';
import { money, odds } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select } from '@/components/ui/select';
import { Tooltip } from '@/components/ui/tooltip';
import { useCharacter, useRun } from '../hooks';

export function ActivitiesPanel() {
  const c = useCharacter();
  const run = useRun();
  const groups = groupBy(ACTIVITIES, 'category');

  return (
    <div className="space-y-3">
      {Object.entries(groups).map(([cat, list]) => {
        if (cat === 'Prison' && !c.prison) return null;
        return (
          <Card key={cat}>
            <CardHeader>
              <CardTitle>{cat}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {list.map((a) => {
                const locked = activityLocked(c, a);
                const cost = activityCost(c, a);
                return (
                  <button
                    key={a.id}
                    disabled={!!locked}
                    onClick={() => run((ch) => doActivity(ch, a.id))}
                    className={cn(
                      'flex flex-col items-start gap-0.5 rounded-xl border border-border p-2.5 text-left transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md disabled:translate-y-0 disabled:opacity-45 disabled:shadow-none',
                    )}
                  >
                    <span className="text-2xl">{a.icon}</span>
                    <span className="text-sm font-semibold leading-tight">{a.name}</span>
                    <span className="text-[11px] text-muted-foreground">{locked ?? (cost > 0 ? money(cost) : a.description)}</span>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
      {!c.prison && c.age >= 18 && <Casino />}
      {!c.prison && c.age >= 10 && (
        <Card>
          <CardHeader>
            <CardTitle>🦹 Crime</CardTitle>
            <span className="text-[11px] text-muted-foreground">Karma −, risque de prison</span>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {CRIMES.map((cr) => (
              <Button key={cr.id} variant="outline" className="h-auto justify-start py-2" disabled={c.age < cr.minAge} onClick={() => run((ch) => commitCrime(ch, cr.id))}>
                <span className="text-xl">{cr.icon}</span>
                <span className="min-w-0 text-left">
                  <span className="block truncate text-xs font-semibold">{cr.name}</span>
                  <span className="block text-[10px] font-normal text-muted-foreground">{c.age < cr.minAge ? `Dès ${cr.minAge} ans` : `Réussite ~${Math.round(cr.success * 100)}%`}</span>
                </span>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
      {!c.prison && c.age >= 18 && <Emigrate />}
    </div>
  );
}

function Casino() {
  const c = useCharacter();
  const run = useRun();
  const [game, setGame] = useState<'roulette' | 'blackjack' | 'slots'>('roulette');
  const max = Math.max(0, Math.floor(c.money));
  const [pct, setPct] = useState(10);
  const bet = Math.max(1, Math.round((max * pct) / 100));
  return (
    <Card>
      <CardHeader>
        <CardTitle>🎰 Casino</CardTitle>
        <Select
          className="h-8 w-36 text-xs"
          value={game}
          onValueChange={(v) => setGame(v as typeof game)}
          options={[
            { value: 'roulette', label: '🎡 Roulette' },
            { value: 'blackjack', label: '🃏 Blackjack' },
            { value: 'slots', label: '🍒 Machine à sous' },
          ]}
        />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Mise</span>
          <span className="font-semibold tabular-nums">{money(max > 0 ? bet : 0)}</span>
        </div>
        <Slider value={[pct]} min={1} max={100} step={1} onValueChange={([v]) => setPct(v)} disabled={max <= 0} />
        <Button className="w-full" disabled={max <= 0} onClick={() => run((ch) => casino(ch, game, bet))}>
          Jouer
        </Button>
      </CardContent>
    </Card>
  );
}

function Emigrate() {
  const c = useCharacter();
  const run = useRun();
  const [code, setCode] = useState<string>(COUNTRIES.find((x) => x.code !== c.countryCode)!.code);
  const target = getCountry(code);
  const cost = emigrationCost(c, code);
  const ratio = wealthFactor(code) / wealthFactor(c.countryCode);
  return (
    <Card>
      <CardHeader>
        <CardTitle>✈️ Émigrer</CardTitle>
        <span className="text-[11px] text-muted-foreground">Visa non garanti</span>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select
          value={code}
          onValueChange={setCode}
          options={COUNTRIES.filter((x) => x.code !== c.countryCode)
            .sort((a, b) => a.nameFr.localeCompare(b.nameFr))
            .map((x) => ({ value: x.code, label: `${flagOf(x.code)} ${x.nameFr}` }))}
        />
        <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
          <Tooltip content="Espérance de vie à la naissance">
            <div className="rounded-xl bg-muted p-2">
              <div className="font-bold">{target.lifeExpectancy} ans</div>
              <div className="text-muted-foreground">Espérance</div>
            </div>
          </Tooltip>
          <Tooltip content="Ton argent sera converti selon le coût de la vie">
            <div className="rounded-xl bg-muted p-2">
              <div className={cn('font-bold', ratio >= 1 ? 'text-success' : 'text-danger')}>×{ratio.toFixed(2)}</div>
              <div className="text-muted-foreground">Niveau de vie</div>
            </div>
          </Tooltip>
          <div className="rounded-xl bg-muted p-2">
            <div className="font-bold">1/{odds(birthOdds(code))}</div>
            <div className="text-muted-foreground">Rareté</div>
          </div>
        </div>
        <Button
          className="w-full"
          disabled={c.money < cost}
          onClick={async () => {
            await ensureLocale(target.locale);
            run((ch) => emigrate(ch, code));
          }}
        >
          Partir pour {money(cost)} {c.money < cost && `(il te manque ${money(cost - c.money)})`}
        </Button>
        <p className="text-[11px] text-muted-foreground">Salaire de référence local : {money(local(c, 40000))} → {money(Math.round(40000 * wealthFactor(code)))} là-bas.</p>
      </CardContent>
    </Card>
  );
}
