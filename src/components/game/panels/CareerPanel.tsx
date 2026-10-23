'use client';

import { useMemo, useState } from 'react';
import { groupBy } from 'lodash-es';
import { GraduationCap, Briefcase, TrendingUp, LogOut, Palmtree, BookOpenCheck, DoorOpen } from 'lucide-react';
import { EDU_LABEL, MAJORS, getMajor } from '@/game/data/education';
import { getJob, jobTitle } from '@/game/data/jobs';
import { applyJob, askRaise, dropOut, enroll, jobOptions, nextDegree, quitJob, retire, studyHarder, workHarder } from '@/game/engine/actions';
import { local } from '@/game/engine/helpers';
import { money } from '@/lib/format';
import { cn, statColor } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useCharacter, useRun } from '../hooks';

export function CareerPanel() {
  const c = useCharacter();
  const run = useRun();
  const [showLocked, setShowLocked] = useState(false);
  const e = c.education;
  const next = nextDegree(c);
  const options = useMemo(() => jobOptions(c), [c]);
  const byCat = groupBy(options.filter((o) => showLocked || !o.locked), (o) => o.job.category);
  const job = c.career ? getJob(c.career.jobId) : null;

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" /> Études
          </CardTitle>
          <Badge variant="muted">{EDU_LABEL[e.highest]}</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {e.enrolled ? (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">
                  {EDU_LABEL[e.enrolled]}
                  {getMajor(e.major) && ['bachelor', 'master', 'doctorate'].includes(e.enrolled) && ` · ${getMajor(e.major)!.icon} ${getMajor(e.major)!.name}`}
                </span>
                <span className="text-xs text-muted-foreground">encore {e.yearsLeft} an(s)</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Résultats scolaires</span>
                  <span style={{ color: statColor(e.performance) }}>{Math.round(e.performance)}%</span>
                </div>
                <Progress value={e.performance} color={statColor(e.performance)} />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => run(studyHarder)} disabled={!!c.prison}>
                  <BookOpenCheck className="h-4 w-4" /> Étudier plus
                </Button>
                {(c.age >= 16 || ['bachelor', 'master', 'doctorate'].includes(e.enrolled)) && (
                  <Button size="sm" variant="outline" onClick={() => run(dropOut)}>
                    <DoorOpen className="h-4 w-4" /> Abandonner
                  </Button>
                )}
              </div>
            </>
          ) : next && c.age >= 17 && !c.prison ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Inscris-toi en <strong className="text-foreground">{EDU_LABEL[next].toLowerCase()}</strong>. Frais annuels payés par toi (ou un prêt étudiant).
              </p>
              <div className="grid grid-cols-2 gap-2">
                {MAJORS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => run((ch) => enroll(ch, m.id))}
                    className={cn('rounded-xl border border-border p-2 text-left transition hover:border-primary hover:bg-primary/5', c.stats.smarts < m.minSmarts - 15 && 'opacity-50')}
                  >
                    <div className="text-sm font-semibold">
                      {m.icon} {m.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      🧠 {m.minSmarts}+ · {money(local(c, m.tuition))}/an
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {c.age < 6 ? 'Trop jeune pour l’école. Profite !' : e.highest === 'doctorate' ? 'Tu as atteint le plus haut niveau d’études. Respect.' : c.prison ? 'Impossible d’étudier en prison.' : 'Pas d’inscription possible pour le moment.'}
            </p>
          )}
          {e.degrees.filter((d) => d.level !== 'primary').length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {e.degrees
                .filter((d) => d.level !== 'primary')
                .map((d) => (
                  <Badge key={d.level + d.age}>
                    🎓 {EDU_LABEL[d.level]}
                    {d.major && d.level !== 'secondary' ? ` ${getMajor(d.major)?.name}` : ''} ({d.age} ans)
                  </Badge>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" /> Emploi
          </CardTitle>
          {c.retired && <Badge variant="success">Retraité·e · {money(c.pension)}/an</Badge>}
        </CardHeader>
        <CardContent className="space-y-3">
          {c.career && job ? (
            <>
              <div className="flex items-center gap-3">
                <div className="text-4xl">{job.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{jobTitle(job.id, c.career.level)}</div>
                  <div className="text-xs text-muted-foreground">
                    {money(c.career.salary)}/an · {c.career.years} an(s) · échelon {c.career.level + 1}/{job.levels.length}
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Performance</span>
                  <span style={{ color: statColor(c.career.performance) }}>{Math.round(c.career.performance)}%</span>
                </div>
                <Progress value={c.career.performance} color={statColor(c.career.performance)} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => run(workHarder)}>
                  <TrendingUp className="h-4 w-4" /> Travailler dur
                </Button>
                <Button size="sm" variant="secondary" onClick={() => run(askRaise)}>
                  💸 Augmentation
                </Button>
                <Button size="sm" variant="outline" onClick={() => run(quitJob)}>
                  <LogOut className="h-4 w-4" /> Démissionner
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{c.prison ? 'Tu travailles à la buanderie de la prison… gratuitement.' : 'Tu n’as pas d’emploi.'}</p>
          )}
          {c.age >= 55 && !c.retired && (
            <Button size="sm" variant="success" onClick={() => run(retire)}>
              <Palmtree className="h-4 w-4" /> Prendre ma retraite
            </Button>
          )}
        </CardContent>
      </Card>

      {!c.prison && c.age >= 13 && (
        <Card>
          <CardHeader>
            <CardTitle>Offres d’emploi</CardTitle>
            <button className="text-xs font-semibold text-primary" onClick={() => setShowLocked((v) => !v)}>
              {showLocked ? 'Masquer verrouillées' : 'Tout afficher'}
            </button>
          </CardHeader>
          <CardContent>
            {Object.keys(byCat).length === 0 && <p className="text-sm text-muted-foreground">Aucune offre accessible. Étudie ou attends d’être plus âgé·e.</p>}
            <Accordion type="multiple" defaultValue={Object.keys(byCat).slice(0, 1)}>
              {Object.entries(byCat).map(([cat, list]) => (
                <AccordionItem key={cat} value={cat}>
                  <AccordionTrigger>
                    {cat} <span className="ml-2 mr-auto text-xs font-normal text-muted-foreground">({list.length})</span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-1.5">
                    {list.map((o) => (
                      <div key={o.job.id} className={cn('flex items-center gap-3 rounded-xl border border-border p-2', o.locked && 'opacity-55')}>
                        <span className="text-2xl">{o.job.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold">{o.title}</div>
                          <div className="truncate text-[11px] text-muted-foreground">
                            {o.locked ?? `${money(o.salary)}/an · chances ${Math.round(o.odds * 100)}%`}
                            {o.job.fame ? ' · ⭐' : ''}
                          </div>
                        </div>
                        <Button size="sm" variant={o.locked ? 'ghost' : 'outline'} disabled={!!o.locked || c.career?.jobId === o.job.id} onClick={() => run((ch) => applyJob(ch, o.job.id))}>
                          Postuler
                        </Button>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
