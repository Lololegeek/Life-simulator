import type { Character } from '../types';
import { ACHIEVEMENTS } from '../data/achievements';

/** Unlock achievements earned during this life. Returns the ids that were new for this life. */
export function checkAchievements(c: Character): string[] {
  const fresh: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (c.lifeAchievements.includes(a.id)) continue;
    try {
      if (a.check(c)) {
        c.lifeAchievements.push(a.id);
        fresh.push(a.id);
      }
    } catch {
      // a check should never break the game
    }
  }
  return fresh;
}
