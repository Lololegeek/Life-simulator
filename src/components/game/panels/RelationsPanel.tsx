'use client';

import type { Person } from '@/game/types';
import { relationLabel } from '@/game/engine/helpers';
import { cn, statColor } from '@/lib/utils';
import { useUi } from '@/store/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar } from '../Avatar';
import { useCharacter } from '../hooks';

const GROUPS: { title: string; kinds: Person['relation'][] }[] = [
  { title: '💞 Amour', kinds: ['spouse', 'partner', 'ex'] },
  { title: '👨‍👩‍👧 Famille', kinds: ['mother', 'father', 'sibling', 'child'] },
  { title: '🤝 Amis', kinds: ['friend'] },
  { title: '🐾 Animaux', kinds: ['pet'] },
];

export function PersonRow({ p, onClick }: { p: Person; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn('flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-muted', !p.alive && 'opacity-50')}>
      <Avatar seed={p.id + p.firstName} age={p.age} gender={p.gender} species={p.species} dead={!p.alive} className="h-11 w-11" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate font-semibold">
            {p.firstName} {p.lastName}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">{p.alive ? `${p.age} ans` : '✝'}</span>
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {relationLabel(p)}
          {p.job && p.alive ? ` · ${p.job}` : ''}
        </div>
        {p.alive && <Progress value={p.closeness} color={statColor(p.closeness)} className="mt-1 h-1.5" />}
      </div>
    </button>
  );
}

export function RelationsPanel() {
  const c = useCharacter();
  const openPerson = useUi((s) => s.openPerson);
  return (
    <div className="space-y-3">
      {GROUPS.map((g) => {
        const people = c.relations.filter((r) => g.kinds.includes(r.relation)).sort((a, b) => Number(b.alive) - Number(a.alive));
        if (!people.length) return null;
        return (
          <Card key={g.title}>
            <CardHeader>
              <CardTitle>{g.title}</CardTitle>
              <span className="text-xs text-muted-foreground">{people.filter((p) => p.alive).length}</span>
            </CardHeader>
            <CardContent className="space-y-1 pt-2">
              {people.map((p) => (
                <PersonRow key={p.id} p={p} onClick={() => openPerson(p.id)} />
              ))}
            </CardContent>
          </Card>
        );
      })}
      {c.relations.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Tu es seul·e au monde…</p>}
      <p className="px-2 text-center text-xs text-muted-foreground">Astuce : trouve l’amour via l’onglet Activités → Application de rencontre.</p>
    </div>
  );
}
