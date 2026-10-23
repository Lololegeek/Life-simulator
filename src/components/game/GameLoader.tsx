'use client';

import dynamic from 'next/dynamic';
import { Splash } from './Splash';

// The game lives entirely in the browser (IndexedDB save, Web Audio, canvas…)
const GameRoot = dynamic(() => import('./GameRoot').then((m) => m.GameRoot), { ssr: false, loading: () => <Splash /> });

export function GameLoader() {
  return <GameRoot />;
}
