'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useGame } from '@/store/game';
import type { ActionResult, Character } from '@/game/types';
import { play } from '@/lib/sound';
import { bus } from '@/lib/bus';

/** The current character. Only use below a component that checked it exists. */
export function useCharacter(): Character {
  return useGame((s) => s.character) as Character;
}

export function feedback(r: NonNullable<ActionResult>) {
  const tone = r.tone ?? 'neutral';
  void play(tone === 'neutral' ? 'click' : tone);
  const opts = { icon: r.icon, duration: 3500 };
  if (tone === 'good') toast.success(r.text, opts);
  else if (tone === 'bad') toast.error(r.text, opts);
  else if (tone === 'special') {
    toast(r.text, { ...opts, className: 'font-semibold' });
    bus.emit('celebrate', { kind: 'promotion' });
  }
  else toast(r.text, opts);
}

/** Run an engine action against the current character, with sound + toast feedback. */
export function useRun() {
  const act = useGame((s) => s.act);
  return useCallback(
    (fn: (c: Character) => ActionResult | undefined | void) => {
      const r = act(fn);
      if (r) feedback(r);
      return r;
    },
    [act],
  );
}
