'use client';

import { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import { cn } from '@/lib/utils';

const PET_EMOJI: Record<string, string> = { Chien: '🐕', Chat: '🐈', Lapin: '🐇', Perroquet: '🦜', Hamster: '🐹', Tortue: '🐢' };

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
    return createAvatar(adventurer, {
      seed,
      backgroundColor: [gender === 'F' ? 'ffd5dc' : 'c0aede', 'b6e3f4', 'd1d4f9', 'ffdfbf'],
      backgroundType: ['gradientLinear'],
      hairColor: age >= 62 ? ['dddddd', 'c4c4c4'] : age >= 48 ? ['9e9e9e', '6a4e35'] : undefined,
      glassesProbability: age > 50 ? 45 : 8,
      featuresProbability: age < 10 ? 0 : 15,
      ...(gender === 'M'
        ? { hair: ['short01', 'short02', 'short03', 'short04', 'short05', 'short06', 'short07', 'short08', 'short09', 'short10', 'short11', 'short12'] as never }
        : {}),
    }).toDataUri();
  }, [seed, age, gender, species]);

  return (
    <div className={cn('relative shrink-0 overflow-hidden rounded-2xl bg-muted', dead && 'grayscale', className)}>
      {uri ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={uri} alt="" className="h-full w-full" draggable={false} />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-2xl">{PET_EMOJI[species ?? ''] ?? '🐾'}</div>
      )}
    </div>
  );
}
