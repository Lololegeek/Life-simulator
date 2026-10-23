'use client';

import { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { notionists } from '@dicebear/collection';
import { cn } from '@/lib/utils';

const PET_EMOJI: Record<string, string> = { Chien: '🐕', Chat: '🐈', Lapin: '🐇', Perroquet: '🦜', Hamster: '🐹', Tortue: '🐢' };
const BACKGROUNDS = ['f3d9b1', 'ecc8ae', 'cfe1d4', 'd9d6ea', 'f2c6b9', 'e7e0c9'];

/** Hand-drawn portrait, generated from a seed (dicebear "notionists"). */
export function Avatar({
  seed,
  age,
  gender,
  species,
  dead,
  className,
}: {
  seed: string;
  age: number;
  gender: 'M' | 'F';
  species?: string;
  dead?: boolean;
  className?: string;
}) {
  const uri = useMemo(() => {
    if (species) return null;
    return createAvatar(notionists, {
      seed,
      backgroundColor: BACKGROUNDS,
      beardProbability: gender === 'M' && age >= 18 ? 35 : 0,
      glassesProbability: age >= 55 ? 55 : age >= 12 ? 15 : 0,
      gestureProbability: 0,
      bodyIconProbability: 0,
    }).toDataUri();
  }, [seed, age, gender, species]);

  return (
    <div className={cn('relative shrink-0 overflow-hidden rounded-xl border border-foreground/15 bg-muted', dead && 'grayscale', className)}>
      {uri ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={uri} alt="" className="h-full w-full" draggable={false} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#e7e0c9] text-2xl">{PET_EMOJI[species ?? ''] ?? '🐾'}</div>
      )}
    </div>
  );
}
