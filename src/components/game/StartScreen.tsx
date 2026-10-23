'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import CountUp from 'react-countup';
import Balancer from 'react-wrap-balancer';
import { useInterval } from 'react-use';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BookOpen, Skull, Trophy, UserRoundPen } from 'lucide-react';
import { useGame } from '@/store/game';
import { initRng, newSeed, pick } from '@/game/rng';
import { randomCountry } from '@/game/engine';
import { COUNTRIES, WORLD_POPULATION_MILLIONS, birthOdds, countryName, flagOf, getCountry } from '@/game/data/countries';
import { ACHIEVEMENTS } from '@/game/data/achievements';
import { odds } from '@/lib/format';
import { play } from '@/lib/sound';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { CustomLifeForm } from './CustomLifeForm';
import { GraveyardDialog } from './GraveyardDialog';
import { AchievementsDialog } from './AchievementsDialog';
import { SettingsMenu } from './SettingsMenu';

/** Net world population growth: ~4.3 births minus ~1.9 deaths per second. */
const GROWTH_PER_SECOND = 2.4;
const BASE_POPULATION = 8_100_000_000;

function PopulationClock() {
  const [pop, setPop] = useState(BASE_POPULATION);
  const [counting, setCounting] = useState(true);
  useInterval(() => !counting && setPop((p) => p + Math.round(GROWTH_PER_SECOND * 2 * (0.6 + Math.random() * 0.8))), 2000);
  return (
    <span className="num">
      {counting ? (
        <CountUp end={BASE_POPULATION} duration={2.2} separator=" " onEnd={() => setCounting(false)} />
      ) : (
        pop.toLocaleString('fr-FR')
      )}
    </span>
  );
}

function OddsTable() {
  const top = useMemo(() => [...COUNTRIES].sort((a, b) => b.population - a.population).slice(0, 7), []);
  const max = top[0].population;
  return (
    <div className="rounded-2xl border border-foreground/80 bg-card p-5 shadow-ink">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-xl italic">Où vais-je naître&nbsp;?</h3>
        <span className="label">Probabilités</span>
      </div>
      <ul className="mt-4 space-y-2.5">
        {top.map((c, i) => (
          <motion.li key={c.code} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.06 }} className="grid grid-cols-[1.5rem_6.5rem_1fr_3.5rem] items-center gap-2 text-sm">
            <span>{flagOf(c.code)}</span>
            <span className="truncate">{c.nameFr}</span>
            <span className="h-2 overflow-hidden rounded-full bg-foreground/10">
              <motion.span
                className="block h-full rounded-full bg-foreground"
                initial={{ width: 0 }}
                animate={{ width: `${(c.population / max) * 100}%` }}
                transition={{ delay: 0.4 + i * 0.06, duration: 0.8, ease: 'easeOut' }}
              />
            </span>
            <span className="num text-right text-xs text-muted-foreground">{((c.population / WORLD_POPULATION_MILLIONS) * 100).toFixed(1)}%</span>
          </motion.li>
        ))}
      </ul>
      <p className="mt-4 border-t border-dashed border-foreground/20 pt-3 text-xs text-muted-foreground">
        Le plus rare : {flagOf('IS')} Islande, <span className="num">1 sur {odds(birthOdds('IS'))}</span>.
      </p>
    </div>
  );
}

function Ticker() {
  const items = useMemo(() => [...COUNTRIES].sort((a, b) => a.nameFr.localeCompare(b.nameFr)), []);
  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((c) => (
        <span key={c.code} className="flex items-center gap-2 whitespace-nowrap px-4 text-xs">
          <span>{flagOf(c.code)}</span>
          <span className="font-medium">{c.nameFr}</span>
          <span className="num text-muted-foreground">1/{odds(birthOdds(c.code))}</span>
          <span className="pl-4 text-foreground/25">✦</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="overflow-hidden border-y border-foreground/80 bg-card py-2.5">
      <div className="marquee flex w-max">
        {row}
        {row}
      </div>
    </div>
  );
}

export function StartScreen() {
  const { t, i18n } = useTranslation();
  const newLife = useGame((s) => s.newLife);
  const graveyard = useGame((s) => s.graveyard);
  const unlocked = useGame((s) => s.unlocked);
  const [rolling, setRolling] = useState<null | { flag: string; code?: string }>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [graveOpen, setGraveOpen] = useState(false);
  const [achOpen, setAchOpen] = useState(false);

  const rollBirth = async () => {
    if (rolling) return;
    void play('click');
    const seed = newSeed();
    initRng(seed);
    const code = randomCountry();
    // A slot-machine of flags before the reveal.
    for (let i = 0; i < 18; i++) {
      setRolling({ flag: flagOf(pick(COUNTRIES).code) });
      await new Promise((r) => setTimeout(r, 40 + i * 9));
    }
    setRolling({ flag: flagOf(code), code });
    void play('special');
    await new Promise((r) => setTimeout(r, 1800));
    await newLife({ seed, countryCode: code });
    setRolling(null);
  };

  const unlockedCount = Object.keys(unlocked).length;

  return (
    <main className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
        <span className="font-display text-lg italic">1/8&nbsp;milliards</span>
        <SettingsMenu />
      </header>

      <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-5 pb-12 pt-4 lg:grid-cols-[1.25fr_1fr]">
        <div className="space-y-8">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="label flex items-center gap-2">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
            Recensement mondial · {format(new Date(), 'd MMMM yyyy', { locale: fr })}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
            className="font-display text-[clamp(2.8rem,8vw,6rem)] font-medium leading-[0.92] tracking-tight"
          >
            Tu seras <em className="text-primary">un</em> humain
            <br />
            sur
          </motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-[clamp(1.9rem,5.5vw,3.6rem)] font-medium leading-none tracking-tight">
            <PopulationClock />
          </motion.div>
          <p className="max-w-lg text-lg text-muted-foreground">
            <Balancer>{t('app.tagline')} Études, amours, carrière, crimes, fortune : une vie entière, année après année.</Balancer>
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center" id="tour-start">
            <Button size="xl" onClick={rollBirth} disabled={!!rolling} className="group shadow-ink-sm hover:-translate-y-0.5 hover:shadow-ink">
              {t('start.random')}
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </Button>
            <p className="max-w-[14rem] text-xs text-muted-foreground">{t('start.randomHint')} — comme dans la vraie vie.</p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
            <button onClick={() => setCustomOpen(true)} className="flex items-center gap-1.5 underline-offset-4 hover:underline">
              <UserRoundPen className="h-4 w-4" /> {t('start.custom')}
            </button>
            <button onClick={() => setGraveOpen(true)} className="flex items-center gap-1.5 underline-offset-4 hover:underline">
              <Skull className="h-4 w-4" /> {t('start.graveyard')} <span className="num text-muted-foreground">({graveyard.length})</span>
            </button>
            <button onClick={() => setAchOpen(true)} className="flex items-center gap-1.5 underline-offset-4 hover:underline">
              <Trophy className="h-4 w-4" /> {t('start.achievements')} <span className="num text-muted-foreground">{unlockedCount}/{ACHIEVEMENTS.length}</span>
            </button>
            <Link href="/guide" className="flex items-center gap-1.5 underline-offset-4 hover:underline">
              <BookOpen className="h-4 w-4" /> {t('start.guide')}
            </Link>
          </nav>
        </div>

        <motion.div initial={{ opacity: 0, rotate: 2, y: 20 }} animate={{ opacity: 1, rotate: 0, y: 0 }} transition={{ delay: 0.15, type: 'spring', bounce: 0.3 }}>
          <OddsTable />
        </motion.div>
      </section>

      <Ticker />

      <AnimatePresence>
        {rolling && (
          <motion.div
            className="paper fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 p-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="label">{rolling.code ? 'Félicitations, tu es né·e en' : t('start.rolling')}</p>
            <motion.div
              key={rolling.flag + (rolling.code ?? '')}
              initial={{ scale: rolling.code ? 0.3 : 0.9, rotate: rolling.code ? -20 : 0 }}
              animate={{ scale: rolling.code ? 1.15 : 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.6 }}
              className="text-[7rem] leading-none sm:text-[9rem]"
            >
              {rolling.flag}
            </motion.div>
            {rolling.code && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <h2 className="font-display text-5xl font-medium italic sm:text-6xl">{countryName(rolling.code, i18n.language)}</h2>
                <p className="num text-sm text-muted-foreground">
                  1 chance sur {odds(birthOdds(rolling.code))} · {getCountry(rolling.code).population.toLocaleString('fr-FR')} M d’habitants · espérance de vie {getCountry(rolling.code).lifeExpectancy} ans
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={customOpen} onOpenChange={setCustomOpen}>
        <DialogContent>
          <DialogTitle>{t('start.custom')}</DialogTitle>
          <DialogDescription>Choisis qui tu seras… ou laisse le destin décider de certains détails.</DialogDescription>
          <CustomLifeForm onDone={() => setCustomOpen(false)} />
        </DialogContent>
      </Dialog>
      <GraveyardDialog open={graveOpen} onOpenChange={setGraveOpen} />
      <AchievementsDialog open={achOpen} onOpenChange={setAchOpen} />
    </main>
  );
}
