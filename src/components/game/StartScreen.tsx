'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import CountUp from 'react-countup';
import Balancer from 'react-wrap-balancer';
import { useTranslation } from 'react-i18next';
import { BookOpen, Dices, Sparkles, Skull, Trophy, UserRoundPen } from 'lucide-react';
import { useGame } from '@/store/game';
import { initRng, newSeed, pick } from '@/game/rng';
import { randomCountry } from '@/game/engine';
import { COUNTRIES, birthOdds, countryName, flagOf, getCountry } from '@/game/data/countries';
import { ACHIEVEMENTS } from '@/game/data/achievements';
import { odds } from '@/lib/format';
import { play } from '@/lib/sound';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { CustomLifeForm } from './CustomLifeForm';
import { GraveyardDialog } from './GraveyardDialog';
import { AchievementsDialog } from './AchievementsDialog';
import { SettingsMenu } from './SettingsMenu';

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
    await new Promise((r) => setTimeout(r, 1700));
    await newLife({ seed, countryCode: code });
    setRolling(null);
  };

  const unlockedCount = Object.keys(unlocked).length;

  return (
    <main className="bg-aurora relative min-h-dvh overflow-hidden">
      <div className="globe-dots pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="absolute right-4 top-4 z-10">
        <SettingsMenu />
      </div>
      <div className="relative mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center gap-8 px-5 py-16 text-center">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.5 }} className="animate-float text-7xl sm:text-8xl">
          🌍
        </motion.div>
        <div className="space-y-3">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.3em] text-primary">Simulateur de vie</p>
          <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-7xl">{t('app.title')}</h1>
          <p className="text-lg text-muted-foreground">
            <Balancer>{t('app.tagline')}</Balancer>
          </p>
        </div>

        <Card className="w-full max-w-md bg-card/70 px-6 py-4 backdrop-blur">
          <div className="font-display text-3xl font-black tabular-nums sm:text-4xl">
            <CountUp end={8_100_000_000} duration={2.5} separator=" " />
          </div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{t('start.population')}</div>
        </Card>

        <div className="flex w-full max-w-md flex-col gap-3" id="tour-start">
          <Button size="xl" onClick={rollBirth} disabled={!!rolling} className="group w-full bg-gradient-to-r from-primary to-accent text-white">
            <Dices className="h-6 w-6 transition group-hover:rotate-180" />
            {t('start.random')}
          </Button>
          <p className="-mt-1 text-xs text-muted-foreground">{t('start.randomHint')}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Button variant="outline" onClick={() => setCustomOpen(true)}>
              <UserRoundPen className="h-4 w-4" /> <span className="truncate">{t('start.custom')}</span>
            </Button>
            <Button variant="outline" onClick={() => setGraveOpen(true)}>
              <Skull className="h-4 w-4" /> {t('start.graveyard')}
            </Button>
            <Button variant="outline" onClick={() => setAchOpen(true)}>
              <Trophy className="h-4 w-4" /> {unlockedCount}/{ACHIEVEMENTS.length}
            </Button>
            <Link href="/guide" className="contents">
              <Button variant="outline">
                <BookOpen className="h-4 w-4" /> {t('start.guide')}
              </Button>
            </Link>
          </div>
        </div>

        {graveyard.length > 0 && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" /> {graveyard.length} vie{graveyard.length > 1 ? 's' : ''} vécue{graveyard.length > 1 ? 's' : ''} jusqu’ici
          </p>
        )}
      </div>

      <AnimatePresence>
        {rolling && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background/90 p-6 text-center backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">{t('start.rolling')}</p>
            <motion.div key={rolling.flag + (rolling.code ?? '')} initial={{ scale: rolling.code ? 0.3 : 0.9, rotate: rolling.code ? -20 : 0 }} animate={{ scale: rolling.code ? 1.2 : 1, rotate: 0 }} transition={{ type: 'spring', bounce: 0.6 }} className="text-[7rem] leading-none sm:text-[9rem]">
              {rolling.flag}
            </motion.div>
            {rolling.code && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                <h2 className="font-display text-4xl font-extrabold">{countryName(rolling.code, i18n.language)}</h2>
                <p className="text-muted-foreground">
                  {t('start.odds', { odds: odds(birthOdds(rolling.code)) })} · {getCountry(rolling.code).population.toLocaleString('fr-FR')} M d’habitants
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
