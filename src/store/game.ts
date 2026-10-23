'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createJSONStorage, persist } from 'zustand/middleware';
import { z } from 'zod';
import type { Character, LifeSummary } from '@/game/types';
import { initRng, newSeed, rngState } from '@/game/rng';
import { ensureLocale } from '@/game/names';
import { getCountry } from '@/game/data/countries';
import { ageUp, checkAchievements, createCharacter, randomCountry, summarize, type NewLifeOptions } from '@/game/engine';
import { compressedIdbStorage } from '@/lib/storage';
import { bus } from '@/lib/bus';

export interface Settings {
  sound: boolean;
  volume: number;
  lang: 'fr' | 'en';
  tutorialDone: boolean;
}

interface GameState {
  character: Character | null;
  rngState: object | null;
  graveyard: LifeSummary[];
  unlocked: Record<string, number>;
  settings: Settings;
  playtimeMs: number;
  hydrated: boolean;

  newLife: (opts?: Partial<NewLifeOptions>) => Promise<void>;
  continueAsChild: (childId: string) => Promise<void>;
  act: <T>(fn: (c: Character) => T) => T | undefined;
  ageUp: () => void;
  updateSettings: (s: Partial<Settings>) => void;
  addPlaytime: (ms: number) => void;
  quitLife: () => void;
  importSave: (json: string) => boolean;
  exportSave: () => string;
  resetAll: () => void;
}

const saveSchema = z.object({
  version: z.literal(1),
  character: z
    .object({ id: z.string(), firstName: z.string(), age: z.number(), stats: z.record(z.number()), relations: z.array(z.any()) })
    .passthrough()
    .nullable(),
  rngState: z.any().nullable(),
  graveyard: z.array(z.object({ id: z.string(), name: z.string(), age: z.number() }).passthrough()),
  unlocked: z.record(z.number()),
});

export const useGame = create<GameState>()(
  persist(
    immer((set, get) => {
      /** Runs after every mutation: achievements, burial, RNG bookkeeping. */
      const settle = () => {
        const fresh: string[] = [];
        let died: string | null = null;
        set((s) => {
          const c = s.character;
          if (!c) return;
          for (const id of checkAchievements(c)) {
            if (!s.unlocked[id]) {
              s.unlocked[id] = Date.now();
              fresh.push(id);
            }
          }
          if (!c.alive && !c.flags.buried) {
            c.flags.buried = true;
            s.graveyard.unshift(summarize(c));
            s.graveyard = s.graveyard.slice(0, 200);
            died = `${c.firstName} ${c.lastName}`;
          }
          s.rngState = rngState();
        });
        fresh.forEach((id) => bus.emit('achievement', { id }));
        if (died) bus.emit('death', { name: died });
      };

      return {
        character: null,
        rngState: null,
        graveyard: [],
        unlocked: {},
        settings: { sound: true, volume: 0.6, lang: 'fr', tutorialDone: false },
        playtimeMs: 0,
        hydrated: false,

        newLife: async (opts = {}) => {
          const seed = opts.seed?.trim() || newSeed();
          initRng(seed);
          // Draw the country first so that the name generator for that locale can be loaded.
          const drawn = randomCountry();
          const countryCode = opts.countryCode || drawn;
          await ensureLocale(getCountry(countryCode).locale);
          const c = createCharacter({ ...opts, seed, countryCode });
          set((s) => {
            s.character = c;
          });
          settle();
        },

        continueAsChild: async (childId) => {
          const parent = get().character;
          const child = parent?.relations.find((r) => r.id === childId);
          if (!parent || !child) return;
          await ensureLocale(getCountry(parent.countryCode).locale);
          const seed = `${parent.seed}-${child.firstName}`;
          initRng(seed);
          const siblings = parent.relations
            .filter((r) => r.relation === 'child' && r.id !== childId)
            .map((r) => ({ ...r, relation: 'sibling' as const }));
          const otherParent = parent.relations.find((r) => r.relation === 'spouse' || r.relation === 'partner');
          const family = [
            ...(otherParent ? [{ ...otherParent, relation: otherParent.gender === 'F' ? ('mother' as const) : ('father' as const) }] : []),
            {
              id: parent.id, firstName: parent.firstName, lastName: parent.lastName, gender: parent.gender, age: parent.age,
              relation: parent.gender === 'F' ? ('mother' as const) : ('father' as const), closeness: child.closeness, alive: false,
              looks: parent.stats.looks, smarts: parent.stats.smarts, money: 0,
            },
            ...siblings,
          ];
          const heirs = 1 + siblings.filter((s) => s.alive).length;
          const estate = Math.max(0, parent.money + parent.assets.reduce((s, a) => s + a.value, 0));
          const c = createCharacter({
            seed,
            firstName: child.firstName,
            lastName: child.lastName,
            gender: child.gender,
            countryCode: parent.countryCode,
            generation: parent.generation + 1,
            inheritance: Math.round(estate / heirs),
            family,
          });
          // The heir is already grown up: fast-forward their life so far.
          c.age = child.age;
          c.stats.looks = child.looks;
          c.stats.smarts = child.smarts;
          c.history = [{ age: c.age, ...c.stats, netWorth: c.money }];
          if (c.age >= 6) c.education.highest = c.age >= 18 ? 'secondary' : 'primary';
          if (c.age >= 6 && c.age < 18) {
            c.education.enrolled = c.age < 12 ? 'primary' : 'secondary';
            c.education.yearsLeft = c.age < 12 ? 12 - c.age : 18 - c.age;
          }
          c.log = [{ id: 'heir', age: c.age, text: `Tu reprends le flambeau de la famille ${c.lastName} après la mort de ${parent.firstName}. Tu hérites de ${Math.round(estate / heirs).toLocaleString('fr-FR')} $.`, tone: 'special', icon: '🌳' }];
          set((s) => {
            s.character = c;
          });
          settle();
        },

        act: (fn) => {
          let out: ReturnType<typeof fn> | undefined;
          set((s) => {
            if (s.character && s.character.alive) out = fn(s.character as Character);
          });
          settle();
          return out;
        },

        ageUp: () => {
          set((s) => {
            if (s.character) ageUp(s.character as Character);
          });
          settle();
        },

        updateSettings: (patch) =>
          set((s) => {
            Object.assign(s.settings, patch);
          }),

        addPlaytime: (ms) =>
          set((s) => {
            s.playtimeMs += ms;
          }),

        quitLife: () =>
          set((s) => {
            s.character = null;
          }),

        exportSave: () => {
          const { character, rngState: r, graveyard, unlocked } = get();
          return JSON.stringify({ version: 1, character, rngState: r, graveyard, unlocked }, null, 2);
        },

        importSave: (json) => {
          try {
            const parsed = saveSchema.parse(JSON.parse(json));
            set((s) => {
              s.character = parsed.character as unknown as Character;
              s.rngState = parsed.rngState;
              s.graveyard = parsed.graveyard as unknown as LifeSummary[];
              s.unlocked = parsed.unlocked;
            });
            const c = get().character;
            if (c) {
              initRng(c.seed, parsed.rngState ?? undefined);
              void ensureLocale(getCountry(c.countryCode).locale);
            }
            return true;
          } catch {
            return false;
          }
        },

        resetAll: () =>
          set((s) => {
            s.character = null;
            s.graveyard = [];
            s.unlocked = {};
            s.playtimeMs = 0;
            s.settings.tutorialDone = false;
          }),
      };
    }),
    {
      name: 'life-simulator-save',
      version: 1,
      storage: createJSONStorage(() => compressedIdbStorage),
      partialize: ({ character, rngState: r, graveyard, unlocked, settings, playtimeMs }) => ({
        character,
        rngState: r,
        graveyard,
        unlocked,
        settings,
        playtimeMs,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.character) {
          initRng(state.character.seed, state.rngState ?? undefined);
          void ensureLocale(getCountry(state.character.countryCode).locale);
        }
        useGame.setState({ hydrated: true });
      },
    },
  ),
);
