'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ErrorBoundary } from 'react-error-boundary';
import { useInterval } from 'react-use';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { useTranslation } from 'react-i18next';
import { useGame } from '@/store/game';
import { bus } from '@/lib/bus';
import { configureSound, play } from '@/lib/sound';
import { getAchievement } from '@/game/data/achievements';
import { Splash } from './Splash';
import { StartScreen } from './StartScreen';
import { GameScreen } from './GameScreen';
import { DeathScreen } from './DeathScreen';
import { CommandPalette } from './CommandPalette';
import { Button } from '@/components/ui/button';

function Crash({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  const quit = useGame((s) => s.quitLife);
  return (
    <div className="bg-aurora flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="text-6xl">💥</div>
      <h1 className="font-display text-2xl font-bold">L’univers a planté</h1>
      <p className="max-w-md text-sm text-muted-foreground">{error.message}</p>
      <div className="flex gap-2">
        <Button onClick={resetErrorBoundary}>Réessayer</Button>
        <Button variant="outline" onClick={() => { quit(); resetErrorBoundary(); }}>Abandonner cette vie</Button>
      </div>
    </div>
  );
}

export function GameRoot() {
  const hydrated = useGame((s) => s.hydrated);
  const character = useGame((s) => s.character);
  const settings = useGame((s) => s.settings);
  const addPlaytime = useGame((s) => s.addPlaytime);
  const { i18n } = useTranslation();

  useEffect(() => {
    configureSound({ enabled: settings.sound, volume: settings.volume });
  }, [settings.sound, settings.volume]);

  useEffect(() => {
    if (i18n.language !== settings.lang) void i18n.changeLanguage(settings.lang);
    document.documentElement.lang = settings.lang;
  }, [settings.lang, i18n]);

  useInterval(() => {
    if (document.visibilityState === 'visible' && useGame.getState().character?.alive) addPlaytime(10_000);
  }, 10_000);

  useEffect(() => {
    const onAchievement = ({ id }: { id: string }) => {
      const a = getAchievement(id);
      if (!a) return;
      void play('achievement');
      toast(`Succès débloqué : ${a.name}`, { description: a.description, icon: a.icon, duration: 5000 });
      if (a.rarity === 'épique' || a.rarity === 'légendaire') confetti({ particleCount: 120, spread: 80, origin: { y: 0.3 } });
    };
    const onDeath = () => void play('death');
    const onCelebrate = () => confetti({ particleCount: 160, spread: 100, origin: { y: 0.6 } });
    bus.on('achievement', onAchievement);
    bus.on('death', onDeath);
    bus.on('celebrate', onCelebrate);
    return () => {
      bus.off('achievement', onAchievement);
      bus.off('death', onDeath);
      bus.off('celebrate', onCelebrate);
    };
  }, []);

  if (!hydrated) return <Splash />;

  const screen = !character ? 'start' : character.alive ? 'game' : 'death';

  return (
    <ErrorBoundary FallbackComponent={Crash}>
      <AnimatePresence mode="wait">
        <motion.div
          key={screen === 'game' ? `game-${character?.id}` : screen}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          {screen === 'start' && <StartScreen />}
          {screen === 'game' && <GameScreen />}
          {screen === 'death' && <DeathScreen />}
        </motion.div>
      </AnimatePresence>
      <CommandPalette />
    </ErrorBoundary>
  );
}
