'use client';

import { interact, interactionsFor } from '@/game/engine/actions';
import { relationLabel } from '@/game/engine/helpers';
import { money } from '@/lib/format';
import { statColor } from '@/lib/utils';
import { useUi } from '@/store/ui';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar } from '../Avatar';
import { useCharacter, useRun } from '../hooks';

export function PersonDrawer() {
  const c = useCharacter();
  const run = useRun();
  const personId = useUi((s) => s.personId);
  const openPerson = useUi((s) => s.openPerson);
  const p = c.relations.find((r) => r.id === personId);

  return (
    <Drawer open={!!p} onOpenChange={(o) => !o && openPerson(null)}>
      <DrawerContent title={p ? `${p.firstName} ${p.lastName}` : 'Relation'}>
        {p && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar seed={p.id + p.firstName} age={p.age} gender={p.gender} species={p.species} dead={!p.alive} className="h-20 w-20" />
              <div className="min-w-0">
                <h3 className="font-display text-xl font-bold">
                  {p.firstName} {p.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {relationLabel(p)} · {p.alive ? `${p.age} ans` : `décédé·e à ${p.age} ans`}
                </p>
                {p.job && <p className="text-sm text-muted-foreground">💼 {p.job}</p>}
              </div>
            </div>
            {p.alive && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <Stat label="Relation" value={p.closeness} />
                {p.relation !== 'pet' && <Stat label="Apparence" value={p.looks} />}
                {p.relation !== 'pet' && <Stat label="Intelligence" value={p.smarts} />}
                {p.relation !== 'pet' && p.age >= 18 && (
                  <div className="flex items-center justify-between rounded-xl bg-muted px-3 py-2">
                    <span>Argent</span>
                    <span className="font-semibold">{money(p.money)}</span>
                  </div>
                )}
                {p.together !== undefined && (p.relation === 'partner' || p.relation === 'spouse') && (
                  <div className="flex items-center justify-between rounded-xl bg-muted px-3 py-2">
                    <span>Ensemble depuis</span>
                    <span className="font-semibold">{p.together} an(s)</span>
                  </div>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {interactionsFor(c, p).map((a) => (
                <Button
                  key={a.id}
                  variant={a.id === 'argue' || a.id === 'breakup' ? 'outline' : 'secondary'}
                  className="justify-start"
                  onClick={() => run((ch) => interact(ch, p.id, a.id))}
                >
                  <span>{a.icon}</span> {a.label}
                </Button>
              ))}
            </div>
            {!p.alive && <p className="text-center text-sm text-muted-foreground">🕯️ Repose en paix.</p>}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1 rounded-xl bg-muted px-3 py-2">
      <div className="flex justify-between">
        <span>{label}</span>
        <span className="font-semibold" style={{ color: statColor(value) }}>
          {Math.round(value)}%
        </span>
      </div>
      <Progress value={value} color={statColor(value)} className="h-1.5" />
    </div>
  );
}
