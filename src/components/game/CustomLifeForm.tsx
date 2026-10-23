'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Fuse from 'fuse.js';
import { useDebounce } from 'use-debounce';
import { useTranslation } from 'react-i18next';
import { Shuffle } from 'lucide-react';
import { useGame } from '@/store/game';
import { COUNTRIES, birthOdds, englishName, flagOf, nativeName } from '@/game/data/countries';
import { odds } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const schema = z.object({
  firstName: z.string().trim().max(24, '24 caractères maximum').optional(),
  lastName: z.string().trim().max(24, '24 caractères maximum').optional(),
  gender: z.enum(['M', 'F', 'R']),
  countryCode: z.string(),
  seed: z
    .string()
    .trim()
    .max(32)
    .regex(/^[\w-]*$/, 'Lettres, chiffres, - et _ uniquement')
    .optional(),
});

type FormValues = z.infer<typeof schema>;

const fuse = new Fuse(
  COUNTRIES.map((c) => ({ code: c.code, fr: c.nameFr, en: englishName(c.code), native: nativeName(c.code), cities: c.cities.join(' ') })),
  { keys: ['fr', 'en', 'native', 'code', 'cities'], threshold: 0.35 },
);

export function CustomLifeForm({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const newLife = useGame((s) => s.newLife);
  const [query, setQuery] = useState('');
  const [debounced] = useDebounce(query, 150);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { gender: 'R', countryCode: '', firstName: '', lastName: '', seed: '' } });

  const selected = watch('countryCode');
  const gender = watch('gender');
  const results = useMemo(
    () => (debounced ? fuse.search(debounced).map((r) => r.item.code) : COUNTRIES.map((c) => c.code)),
    [debounced],
  );

  const onSubmit = async (v: FormValues) => {
    await newLife({
      firstName: v.firstName || undefined,
      lastName: v.lastName || undefined,
      gender: v.gender === 'R' ? undefined : v.gender,
      countryCode: v.countryCode || undefined,
      seed: v.seed || undefined,
    });
    onDone();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1 text-sm font-medium">
          {t('form.firstName')}
          <Input placeholder="Aléatoire" {...register('firstName')} />
          {errors.firstName && <span className="text-xs text-danger">{errors.firstName.message}</span>}
        </label>
        <label className="space-y-1 text-sm font-medium">
          {t('form.lastName')}
          <Input placeholder="Aléatoire" {...register('lastName')} />
          {errors.lastName && <span className="text-xs text-danger">{errors.lastName.message}</span>}
        </label>
      </div>
      <div className="space-y-1 text-sm font-medium">
        {t('form.gender')}
        <Select
          value={gender}
          onValueChange={(v) => setValue('gender', v as FormValues['gender'])}
          options={[
            { value: 'R', label: '🎲 Aléatoire' },
            { value: 'F', label: `👧 ${t('form.female')}` },
            { value: 'M', label: `👦 ${t('form.male')}` },
          ]}
        />
      </div>
      <div className="space-y-2 text-sm font-medium">
        <div className="flex items-center justify-between">
          <span>{t('form.country')}</span>
          <button type="button" className="flex items-center gap-1 text-xs text-primary" onClick={() => setValue('countryCode', '')}>
            <Shuffle className="h-3 w-3" /> {t('form.randomCountry')}
          </button>
        </div>
        <Input placeholder={t('form.searchCountry')} value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="grid max-h-48 grid-cols-2 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-3">
          {results.map((code) => {
            const c = COUNTRIES.find((x) => x.code === code)!;
            return (
              <button
                type="button"
                key={code}
                onClick={() => setValue('countryCode', code)}
                className={cn(
                  'flex items-center gap-2 rounded-xl border border-border px-2 py-1.5 text-left text-xs transition hover:bg-muted',
                  selected === code && 'border-primary bg-primary/10',
                )}
              >
                <span className="text-lg">{flagOf(code)}</span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{c.nameFr}</span>
                  <span className="block text-[10px] text-muted-foreground">1 / {odds(birthOdds(code))}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <label className="block space-y-1 text-sm font-medium">
        {t('form.seed')}
        <Input placeholder="ex. ma-vie-de-reve" {...register('seed')} />
        <span className="text-xs font-normal text-muted-foreground">{errors.seed?.message ?? t('form.seedHint')}</span>
      </label>
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        👶 {t('form.submit')}
      </Button>
    </form>
  );
}
