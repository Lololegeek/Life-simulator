'use client';

import { useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip as ChartTooltip, YAxis } from 'recharts';
import { CATALOG, STOCKS } from '@/game/data/catalog';
import { buyItem, buyStock, sellAsset, sellStock } from '@/game/engine/actions';
import { local } from '@/game/engine/helpers';
import { money } from '@/lib/format';
import { cn, statColor } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCharacter, useRun } from '../hooks';

export function AssetsPanel() {
  const c = useCharacter();
  const run = useRun();
  const adult = c.age >= 18 && !c.prison;

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle>🔑 Mes biens</CardTitle>
          <span className="text-xs text-muted-foreground">{c.assets.length}</span>
        </CardHeader>
        <CardContent className="space-y-2">
          {c.assets.length === 0 && <p className="text-sm text-muted-foreground">Tu ne possèdes rien… pour l’instant.</p>}
          {c.assets.map((a) => {
            const icon = CATALOG.find((x) => x.id === a.catalogId)?.icon;
            const diff = a.value - a.purchasePrice;
            return (
              <div key={a.id} className="flex items-center gap-3 rounded-xl border border-foreground/10 p-2">
                <span className="text-3xl">{icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{a.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    Valeur {money(a.value)} <span className={diff >= 0 ? 'text-success' : 'text-danger'}>({diff >= 0 ? '+' : ''}{money(diff)})</span>
                  </div>
                  <Progress value={a.condition} color={statColor(a.condition)} className="mt-1 h-1" />
                </div>
                <Button size="sm" variant="outline" disabled={!!c.prison} onClick={() => run((ch) => sellAsset(ch, a.id))}>
                  Vendre
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🛍️ Boutique</CardTitle>
          {!adult && <span className="text-xs text-muted-foreground">Dès 18 ans</span>}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="house">
            <TabsList>
              <TabsTrigger value="house">🏠 Immobilier</TabsTrigger>
              <TabsTrigger value="car">🚗 Véhicules</TabsTrigger>
            </TabsList>
            {(['house', 'car'] as const).map((kind) => (
              <TabsContent key={kind} value={kind} className="mt-3 space-y-1.5">
                {CATALOG.filter((i) => i.kind === kind).map((i) => {
                  const price = local(c, i.price);
                  const afford = c.money >= price;
                  return (
                    <div key={i.id} className={cn('flex items-center gap-3 rounded-xl border border-foreground/10 p-2', !afford && 'opacity-55')}>
                      <span className="text-2xl">{i.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{i.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {money(price)} · bonheur +{i.happiness} · entretien {Math.round(i.upkeep * 1000) / 10}%/an
                        </div>
                      </div>
                      <Button size="sm" disabled={!adult || !afford} onClick={() => run((ch) => buyItem(ch, i.id))}>
                        Acheter
                      </Button>
                    </div>
                  );
                })}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📈 Bourse</CardTitle>
          <span className="text-xs text-muted-foreground">Cours à l’année</span>
        </CardHeader>
        <CardContent className="space-y-2">
          {STOCKS.map((s) => (
            <StockRow key={s.symbol} symbol={s.symbol} name={s.name} icon={s.icon} disabled={!adult} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function StockRow({ symbol, name, icon, disabled }: { symbol: string; name: string; icon: string; disabled: boolean }) {
  const c = useCharacter();
  const run = useRun();
  const [open, setOpen] = useState(false);
  const [pct, setPct] = useState(10);
  const history = c.market.history[symbol] ?? [];
  const price = c.market.prices[symbol];
  const prev = history.at(-2) ?? price;
  const change = ((price - prev) / prev) * 100;
  const shares = c.holdings[symbol] ?? 0;
  const value = shares * price;
  const data = history.map((v, i) => ({ i, v }));
  const color = change >= 0 ? '#22c55e' : '#ef4444';
  const amount = Math.max(0, Math.round((Math.max(0, c.money) * pct) / 100));

  return (
    <div className="rounded-xl border border-foreground/10 p-2">
      <button className="flex w-full items-center gap-3 text-left" onClick={() => setOpen((o) => !o)}>
        <span className="text-2xl">{icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold">{symbol}</span>
            <span className="truncate text-[11px] text-muted-foreground">{name}</span>
          </div>
          <div className="text-[11px]">
            {price.toFixed(2)} $ <span style={{ color }}>{change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%</span>
            {shares > 0 && <span className="ml-2 font-semibold text-primary">Détenu : {money(Math.round(value))}</span>}
          </div>
        </div>
        <div className="h-10 w-24">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`g-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis hide domain={['dataMin', 'dataMax']} />
              <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#g-${symbol})`} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </button>
      {open && (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <YAxis hide domain={['auto', 'auto']} />
                <ChartTooltip formatter={(v: number) => `${v.toFixed(2)} $`} labelFormatter={() => ''} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#g-${symbol})`} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-xs">
            <span>Investir {pct}% de ton argent</span>
            <span className="font-semibold">{money(amount)}</span>
          </div>
          <Slider value={[pct]} min={1} max={100} onValueChange={([v]) => setPct(v)} disabled={disabled || c.money <= 0} />
          <div className="grid grid-cols-3 gap-2">
            <Button size="sm" disabled={disabled || amount <= 0} onClick={() => run((ch) => buyStock(ch, symbol, amount))}>
              Acheter
            </Button>
            <Button size="sm" variant="secondary" disabled={disabled || shares <= 0} onClick={() => run((ch) => sellStock(ch, symbol, 0.5))}>
              Vendre 50%
            </Button>
            <Button size="sm" variant="outline" disabled={disabled || shares <= 0} onClick={() => run((ch) => sellStock(ch, symbol, 1))}>
              Tout vendre
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
