'use client';

import { useMemo, useState } from 'react';
import { Command } from 'cmdk';
import Fuse from 'fuse.js';
import { useHotkeys } from 'react-hotkeys-hook';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useGame } from '@/store/game';
import { useUi, type TabId } from '@/store/ui';
import { ACTIVITIES, activityLocked, doActivity, studyHarder, workHarder } from '@/game/engine/actions';
import { play } from '@/lib/sound';
import { feedback } from './hooks';
import { startTutorial } from './tutorial';

interface Item {
  id: string;
  label: string;
  group: string;
  icon: string;
  keywords?: string;
  run: () => void;
}

export function CommandPalette() {
  const open = useUi((s) => s.paletteOpen);
  const setOpen = useUi((s) => s.setPalette);
  const setTab = useUi((s) => s.setTab);
  const setSettings = useUi((s) => s.setSettings);
  const character = useGame((s) => s.character);
  const act = useGame((s) => s.act);
  const ageUp = useGame((s) => s.ageUp);
  const newLife = useGame((s) => s.newLife);
  const [query, setQuery] = useState('');

  useHotkeys('mod+k', (e) => { e.preventDefault(); setOpen(!open); }, { enableOnFormTags: true }, [open]);

  const items = useMemo<Item[]>(() => {
    const list: Item[] = [];
    const goto = (tab: TabId, label: string, icon: string) => list.push({ id: `tab-${tab}`, label, group: 'Navigation', icon, run: () => setTab(tab) });
    if (character?.alive) {
      list.push({ id: 'age', label: 'Vieillir d’un an', group: 'Vie', icon: '⏭️', keywords: 'age year annee', run: () => { ageUp(); void play('age'); } });
      goto('life', 'Journal de vie', '📰');
      goto('career', 'Études & carrière', '💼');
      goto('relations', 'Relations', '💞');
      goto('activities', 'Activités', '✨');
      goto('assets', 'Biens & bourse', '🏠');
      if (character.education.enrolled) list.push({ id: 'study', label: 'Étudier plus dur', group: 'Vie', icon: '✏️', run: () => { const r = act(studyHarder); if (r) feedback(r); } });
      if (character.career) list.push({ id: 'work', label: 'Travailler plus dur', group: 'Vie', icon: '⏱️', run: () => { const r = act(workHarder); if (r) feedback(r); } });
      for (const a of ACTIVITIES) {
        if (activityLocked(character, a)) continue;
        list.push({ id: `act-${a.id}`, label: a.name, group: 'Activités', icon: a.icon, keywords: a.description, run: () => { const r = act((c) => doActivity(c, a.id)); if (r) feedback(r); } });
      }
      list.push({ id: 'tuto', label: 'Revoir le tutoriel', group: 'Aide', icon: '🎓', run: () => setTimeout(() => startTutorial(), 200) });
    } else {
      list.push({ id: 'born', label: 'Naître au hasard', group: 'Vie', icon: '🎲', run: () => void newLife() });
    }
    list.push({ id: 'settings', label: 'Réglages', group: 'Aide', icon: '⚙️', run: () => setSettings(true) });
    return list;
  }, [character, act, ageUp, newLife, setTab, setSettings]);

  const fuse = useMemo(() => new Fuse(items, { keys: ['label', 'keywords', 'group'], threshold: 0.4 }), [items]);
  const results = query ? fuse.search(query).map((r) => r.item) : items;
  const groups = [...new Set(results.map((r) => r.group))];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery(''); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-1/2 top-[15%] z-[80] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <DialogPrimitive.Title className="sr-only">Palette de commandes</DialogPrimitive.Title>
          <Command shouldFilter={false} loop>
            <Command.Input value={query} onValueChange={setQuery} placeholder="Que veux-tu faire ?" className="w-full border-b border-border bg-transparent px-4 py-3.5 text-sm outline-none" />
            <Command.List className="max-h-80 overflow-y-auto p-2">
              <Command.Empty className="py-8 text-center text-sm text-muted-foreground">Rien trouvé.</Command.Empty>
              {groups.map((g) => (
                <Command.Group key={g} heading={g} className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-muted-foreground">
                  {results.filter((r) => r.group === g).map((r) => (
                    <Command.Item
                      key={r.id}
                      value={r.id}
                      onSelect={() => { setOpen(false); setQuery(''); r.run(); }}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-muted"
                    >
                      <span>{r.icon}</span> {r.label}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
