'use client';

import { useEffect, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useMedia } from 'react-use';
import { useDrag } from '@use-gesture/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Briefcase, HeartHandshake, House, Newspaper, Sparkles } from 'lucide-react';
import { useGame } from '@/store/game';
import { TAB_ORDER, useUi, type TabId } from '@/store/ui';
import { play } from '@/lib/sound';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileCard } from './ProfileCard';
import { StatsPanel } from './StatsPanel';
import { LifeLog } from './LifeLog';
import { AgeButton } from './AgeButton';
import { EventDialog } from './EventDialog';
import { SettingsMenu } from './SettingsMenu';
import { CareerPanel } from './panels/CareerPanel';
import { RelationsPanel } from './panels/RelationsPanel';
import { ActivitiesPanel } from './panels/ActivitiesPanel';
import { AssetsPanel } from './panels/AssetsPanel';
import { PersonDrawer } from './panels/PersonDrawer';
import { startTutorial } from './tutorial';

const TAB_ICONS: Record<TabId, React.ElementType> = {
  life: Newspaper,
  career: Briefcase,
  relations: HeartHandshake,
  activities: Sparkles,
  assets: House,
};

function Panels({ tabs }: { tabs: TabId[] }) {
  return (
    <>
      {tabs.includes('life') && (
        <TabsContent value="life" className="flex h-full min-h-0 flex-col gap-3">
          <StatsPanel compact />
          <LifeLog className="min-h-0 flex-1" />
        </TabsContent>
      )}
      <TabsContent value="career" className="h-full overflow-y-auto pb-4">
        <CareerPanel />
      </TabsContent>
      <TabsContent value="relations" className="h-full overflow-y-auto pb-4">
        <RelationsPanel />
      </TabsContent>
      <TabsContent value="activities" className="h-full overflow-y-auto pb-4">
        <ActivitiesPanel />
      </TabsContent>
      <TabsContent value="assets" className="h-full overflow-y-auto pb-4">
        <AssetsPanel />
      </TabsContent>
    </>
  );
}

export function GameScreen() {
  const { t } = useTranslation();
  const isDesktop = useMedia('(min-width: 1024px)', false);
  const tab = useUi((s) => s.tab);
  const setTab = useUi((s) => s.setTab);
  const ageUp = useGame((s) => s.ageUp);
  const pending = useGame((s) => s.character?.pending.length ?? 0);
  const tutorialDone = useGame((s) => s.settings.tutorialDone);
  const update = useGame((s) => s.updateSettings);
  const contentRef = useRef<HTMLDivElement>(null);

  const doAge = () => {
    if (useGame.getState().character?.pending.length) return;
    ageUp();
    void play('age');
    if (!isDesktop) setTab('life');
  };

  useHotkeys('space', (e) => { e.preventDefault(); doAge(); }, { enabled: pending === 0 }, [pending, isDesktop]);
  useHotkeys('1,2,3,4,5', (e) => setTab(TAB_ORDER[Number(e.key) - 1]));

  useEffect(() => {
    if (!tutorialDone) {
      const id = setTimeout(() => startTutorial(() => update({ tutorialDone: true })), 700);
      return () => clearTimeout(id);
    }
  }, [tutorialDone, update]);

  // Swipe left / right on mobile to move between tabs.
  const bind = useDrag(
    ({ swipe: [sx] }) => {
      if (!sx) return;
      const i = TAB_ORDER.indexOf(tab);
      const next = TAB_ORDER[Math.min(TAB_ORDER.length - 1, Math.max(0, i - sx))];
      if (next !== tab) setTab(next);
    },
    { axis: 'x', filterTaps: true, swipe: { distance: 60, velocity: 0.3 } },
  );

  const rightTabs = TAB_ORDER.filter((x) => x !== 'life');
  const desktopTab = tab === 'life' ? 'career' : tab;

  if (isDesktop) {
    return (
      <div className="bg-aurora h-dvh">
        <div className="mx-auto grid h-full max-w-7xl grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-5 p-5">
          <div className="flex min-h-0 flex-col gap-4">
            <div className="flex items-start gap-3">
              <ProfileCard className="flex-1" />
              <SettingsMenu inGame />
            </div>
            <StatsPanel />
            <LifeLog className="min-h-0 flex-1" />
            <AgeButton onAge={doAge} />
          </div>
          <Tabs value={desktopTab} onValueChange={(v) => setTab(v as TabId)} className="flex min-h-0 flex-col gap-3">
            <TabsList id="tour-tabs">
              {rightTabs.map((id) => {
                const Icon = TAB_ICONS[id];
                return (
                  <TabsTrigger key={id} value={id}>
                    <Icon className="h-4 w-4" /> {t(`tabs.${id}`)}
                  </TabsTrigger>
                );
              })}
            </TabsList>
            <div className="min-h-0 flex-1">
              <Panels tabs={rightTabs} />
            </div>
          </Tabs>
        </div>
        <EventDialog />
        <PersonDrawer />
      </div>
    );
  }

  return (
    <div className="bg-aurora flex h-dvh flex-col">
      <div className="flex items-start gap-2 p-3 pb-2">
        <ProfileCard compact className="flex-1" />
        <SettingsMenu inGame />
      </div>
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)} className="flex min-h-0 flex-1 flex-col">
        <div {...bind()} ref={contentRef} className="min-h-0 flex-1 touch-pan-y px-3">
          <motion.div key={tab} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.18 }} className="h-full">
            <Panels tabs={TAB_ORDER} />
          </motion.div>
        </div>
        <div className="border-t border-border bg-card/90 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
          <AgeButton onAge={doAge} compact />
          <TabsList id="tour-tabs" className="mt-2">
            {TAB_ORDER.map((id) => {
              const Icon = TAB_ICONS[id];
              return (
                <TabsTrigger key={id} value={id}>
                  <Icon className="h-4 w-4" />
                  {t(`tabs.${id}`)}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
      </Tabs>
      <EventDialog />
      <PersonDrawer />
    </div>
  );
}
