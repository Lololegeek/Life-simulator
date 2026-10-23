'use client';

import { useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import prettyMs from 'pretty-ms';
import { saveAs } from 'file-saver';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { Command, Download, GraduationCap, Menu, RotateCcw, Settings, Skull, Trophy, Upload } from 'lucide-react';
import { useGame } from '@/store/game';
import { useUi } from '@/store/ui';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select } from '@/components/ui/select';
import { GraveyardDialog } from './GraveyardDialog';
import { AchievementsDialog } from './AchievementsDialog';
import { startTutorial } from './tutorial';

export function SettingsMenu({ inGame = false }: { inGame?: boolean }) {
  const { t } = useTranslation();
  const settingsOpen = useUi((s) => s.settingsOpen);
  const setSettings = useUi((s) => s.setSettings);
  const setPalette = useUi((s) => s.setPalette);
  const [grave, setGrave] = useState(false);
  const [ach, setAch] = useState(false);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const exportSave = useGame((s) => s.exportSave);
  const importSave = useGame((s) => s.importSave);
  const quitLife = useGame((s) => s.quitLife);

  const doExport = () => {
    saveAs(new Blob([exportSave()], { type: 'application/json' }), `vie-${new Date().toISOString().slice(0, 10)}.json`);
    toast.success('Sauvegarde exportée');
  };

  const doImport = async (file: File) => {
    const ok = importSave(await file.text());
    if (ok) toast.success('Sauvegarde importée !');
    else toast.error('Fichier de sauvegarde invalide.');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Menu" id="tour-menu" className="bg-card/80 backdrop-blur">
            <Menu className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => setSettings(true)}>
            <Settings className="h-4 w-4" /> {t('menu.settings')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setPalette(true)}>
            <Command className="h-4 w-4" /> {t('menu.commands')} <kbd className="ml-auto text-[10px] text-muted-foreground">Ctrl K</kbd>
          </DropdownMenuItem>
          {inGame && (
            <DropdownMenuItem onSelect={() => setTimeout(() => startTutorial(), 150)}>
              <GraduationCap className="h-4 w-4" /> {t('menu.tutorial')}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => setAch(true)}>
            <Trophy className="h-4 w-4" /> {t('start.achievements')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setGrave(true)}>
            <Skull className="h-4 w-4" /> {t('start.graveyard')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={doExport}>
            <Download className="h-4 w-4" /> {t('menu.export')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> {t('menu.import')}
          </DropdownMenuItem>
          {inGame && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-danger" onSelect={() => setConfirmQuit(true)}>
                <RotateCcw className="h-4 w-4" /> {t('menu.newLife')}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void doImport(f);
          e.target.value = '';
        }}
      />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettings} />
      <GraveyardDialog open={grave} onOpenChange={setGrave} />
      <AchievementsDialog open={ach} onOpenChange={setAch} />
      <Dialog open={confirmQuit} onOpenChange={setConfirmQuit}>
        <DialogContent className="max-w-sm">
          <DialogTitle>Abandonner cette vie ?</DialogTitle>
          <DialogDescription>Ton personnage actuel sera perdu à jamais (il n’ira même pas au cimetière).</DialogDescription>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmQuit(false)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={() => { quitLife(); setConfirmQuit(false); }}>{t('common.confirm')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const settings = useGame((s) => s.settings);
  const update = useGame((s) => s.updateSettings);
  const playtime = useGame((s) => s.playtimeMs);
  const seed = useGame((s) => s.character?.seed);
  const resetAll = useGame((s) => s.resetAll);
  const [confirm, setConfirm] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogTitle>⚙️ {t('menu.settings')}</DialogTitle>
        <DialogDescription>
          {t('menu.playtime')} : {prettyMs(playtime, { compact: false, unitCount: 2, secondsDecimalDigits: 0 })}
        </DialogDescription>
        <div className="mt-5 space-y-5">
          <Row label={t('menu.theme')}>
            <Switch checked={resolvedTheme === 'dark'} onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')} />
          </Row>
          <Row label={t('menu.sound')}>
            <Switch checked={settings.sound} onCheckedChange={(v) => update({ sound: v })} />
          </Row>
          <div className="space-y-1">
            <span className="text-sm font-medium">{t('menu.volume')}</span>
            <Slider value={[settings.volume * 100]} max={100} step={5} disabled={!settings.sound} onValueChange={([v]) => update({ volume: v / 100 })} />
          </div>
          <Row label={t('menu.language')}>
            <Select
              className="w-40"
              value={settings.lang}
              onValueChange={(v) => update({ lang: v as 'fr' | 'en' })}
              options={[
                { value: 'fr', label: '🇫🇷 Français' },
                { value: 'en', label: '🇬🇧 English (UI)' },
              ]}
            />
          </Row>
          {seed && (
            <div className="flex items-center gap-4 rounded-xl bg-muted p-3">
              <div className="rounded-lg bg-white p-1.5">
                <QRCodeSVG value={`life-simulator:seed:${seed}`} size={72} />
              </div>
              <div className="min-w-0 text-sm">
                <div className="font-medium">{t('menu.seed')}</div>
                <code className="break-all text-xs text-muted-foreground">{seed}</code>
              </div>
            </div>
          )}
          <div className="border-t border-border pt-4">
            {!confirm ? (
              <Button variant="outline" className="w-full text-danger" onClick={() => setConfirm(true)}>
                {t('menu.reset')}
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm">{t('menu.resetConfirm')}</p>
                <div className="flex gap-2">
                  <Button variant="ghost" className="flex-1" onClick={() => setConfirm(false)}>{t('common.cancel')}</Button>
                  <Button variant="danger" className="flex-1" onClick={() => { resetAll(); setConfirm(false); onOpenChange(false); }}>
                    {t('common.confirm')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </div>
  );
}
