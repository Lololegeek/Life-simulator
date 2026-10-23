'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { QRCodeSVG } from 'qrcode.react';
import { CartesianGrid, Legend, Line, LineChart, Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Download, RotateCcw } from 'lucide-react';
import { useGame } from '@/store/game';
import { computeRibbon } from '@/game/engine/death';
import { children, fullName, jobName, netWorth } from '@/game/engine/helpers';
import { countryName, flagOf } from '@/game/data/countries';
import { EDU_LABEL } from '@/game/data/education';
import { getAchievement } from '@/game/data/achievements';
import { money } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from './Avatar';
import { useCharacter } from './hooks';

const LINES = [
  { key: 'health', name: 'Santé', color: '#ef4444' },
  { key: 'happiness', name: 'Bonheur', color: '#f59e0b' },
  { key: 'smarts', name: 'Intelligence', color: '#6366f1' },
  { key: 'looks', name: 'Apparence', color: '#ec4899' },
  { key: 'fitness', name: 'Forme', color: '#10b981' },
];

export function DeathScreen() {
  const c = useCharacter();
  const { t, i18n } = useTranslation();
  const quitLife = useGame((s) => s.quitLife);
  const continueAsChild = useGame((s) => s.continueAsChild);
  const tombRef = useRef<HTMLDivElement>(null);
  const [emblaRef, embla] = useEmblaCarousel({ align: 'start', dragFree: true });
  const ribbon = computeRibbon(c);
  const heirs = children(c).filter((k) => k.alive);
  const lastJob = jobName(c) ?? c.jobHistory.at(-1)?.title ?? 'Aucun';

  const download = async () => {
    if (!tombRef.current) return;
    const dataUrl = await toPng(tombRef.current, { pixelRatio: 2, cacheBust: true });
    const blob = await (await fetch(dataUrl)).blob();
    saveAs(blob, `${fullName(c).replace(/\s+/g, '-')}-faire-part.png`);
  };

  return (
    <main className="min-h-dvh px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-5">
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', bounce: 0.3 }}>
          <div ref={tombRef} className="relative overflow-hidden rounded-t-[10rem] rounded-b-2xl border border-foreground/80 bg-card px-6 pb-8 pt-14 text-center shadow-ink sm:px-12">
            <div className="dotgrid pointer-events-none absolute inset-0 opacity-30" />
            <div className="relative space-y-4">
              <p className="label">✝ {t('death.title')} ✝</p>
              <Avatar seed={c.id + c.firstName} age={c.age} gender={c.gender} dead className="mx-auto h-28 w-28" />
              <h1 className="font-display text-4xl font-medium tracking-tight sm:text-6xl">{fullName(c)}</h1>
              <p className="num text-lg text-muted-foreground">
                {flagOf(c.birthCountry)} {c.birthYear} — {c.birthYear + c.age} · {c.age} ans
              </p>
              <p className="mx-auto max-w-lg text-sm">
                Né·e à {c.countriesLived.length > 1 ? countryName(c.birthCountry, i18n.language) : `${c.city}, ${countryName(c.birthCountry, i18n.language)}`}, mort·e {c.causeOfDeath}.
              </p>
              <motion.div
                initial={{ scale: 2.2, opacity: 0, rotate: -18 }}
                animate={{ scale: 1, opacity: 1, rotate: -6 }}
                transition={{ delay: 0.5, type: 'spring', bounce: 0.45 }}
                className="mx-auto inline-flex flex-col items-center rounded-lg border-[3px] border-double border-primary px-6 py-2 text-primary"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Verdict</span>
                <span className="font-display text-3xl font-semibold uppercase italic">
                  {ribbon.icon} {ribbon.label}
                </span>
              </motion.div>
              <p className="text-sm italic text-muted-foreground">« {ribbon.description} »</p>
              <div className="grid grid-cols-2 gap-2 text-left sm:grid-cols-4">
                <Fact label="Patrimoine" value={money(netWorth(c))} />
                <Fact label="Métier" value={lastJob} />
                <Fact label="Études" value={EDU_LABEL[c.education.highest]} />
                <Fact label="Enfants" value={String(children(c).length)} />
                <Fact label="Pays habités" value={c.countriesLived.map(flagOf).join(' ')} />
                <Fact label="Karma" value={`${Math.round(c.karma)} / 100`} />
                <Fact label="Célébrité" value={`${c.fame} / 100`} />
                <Fact label="Casier" value={c.criminalRecord.length ? `${c.criminalRecord.length} condamnation(s)` : 'Vierge'} />
              </div>
              <div className="flex items-center justify-center gap-3 pt-2 text-left">
                <div className="rounded-lg bg-white p-1">
                  <QRCodeSVG value={`life-simulator:seed:${c.seed}`} size={56} />
                </div>
                <div className="text-[11px] text-muted-foreground">
                  1 sur 8 milliards · graine <code>{c.seed}</code>
                  <br />
                  Génération {c.generation} de la famille {c.lastName}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button size="lg" variant="primary" className="flex-1" onClick={quitLife}>
            <RotateCcw className="h-5 w-5" /> {t('death.newLife')}
          </Button>
          <Button size="lg" variant="outline" onClick={download}>
            <Download className="h-5 w-5" /> {t('death.download')}
          </Button>
        </div>
        {heirs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>🌳 Continuer la lignée</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {heirs.map((k) => (
                <Button key={k.id} variant="secondary" onClick={() => continueAsChild(k.id)}>
                  <Avatar seed={k.id + k.firstName} age={k.age} gender={k.gender} className="h-6 w-6 rounded-md" />
                  {t('death.asChild', { name: `${k.firstName} (${k.age} ans)` })}
                </Button>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>🏆 {t('death.achievements')}</CardTitle>
            {c.lifeAchievements.length > 2 && (
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => embla?.scrollPrev()}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => embla?.scrollNext()}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {c.lifeAchievements.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('death.noAchievements')}</p>
            ) : (
              <div ref={emblaRef} className="overflow-hidden">
                <div className="flex gap-2">
                  {c.lifeAchievements.map((id) => {
                    const a = getAchievement(id);
                    if (!a) return null;
                    return (
                      <div key={id} className="w-36 shrink-0 rounded-xl border border-foreground/10 p-3 text-center">
                        <div className="text-3xl">{a.icon}</div>
                        <div className="mt-1 text-xs font-semibold">{a.name}</div>
                        <div className="text-[10px] text-muted-foreground">{a.rarity}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📊 {t('death.chart')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={c.history}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="age" fontSize={11} />
                  <YAxis domain={[0, 100]} fontSize={11} width={30} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} labelFormatter={(a) => `Âge ${a}`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {LINES.map((l) => (
                    <Line key={l.key} isAnimationActive={false} type="monotone" dataKey={l.key} name={l.name} stroke={l.color} dot={false} strokeWidth={2} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={c.history}>
                  <defs>
                    <linearGradient id="nw" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3d8b5c" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#3d8b5c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="age" fontSize={11} />
                  <YAxis fontSize={11} width={56} tickFormatter={(v: number) => money(v, true)} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [money(v), 'Patrimoine']} labelFormatter={(a) => `Âge ${a}`} />
                  <Area isAnimationActive={false} type="monotone" dataKey="netWorth" stroke="#3d8b5c" fill="url(#nw)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📜 Derniers instants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            {c.log.slice(-6).map((l) => (
              <p key={l.id}>
                <span className="mr-2 text-xs font-semibold text-muted-foreground">{l.age} ans</span>
                {l.icon} {l.text}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-foreground/15 px-1 pt-2">
      <div className="label">{label}</div>
      <div className="truncate text-sm font-medium">{value}</div>
    </div>
  );
}
