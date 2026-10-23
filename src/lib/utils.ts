import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import chroma from 'chroma-js';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const statScale = chroma.scale(['#ef4444', '#f59e0b', '#22c55e']).mode('lch').domain([0, 50, 100]);

/** Red → amber → green colour for a 0-100 stat. */
export const statColor = (value: number) => statScale(value).hex();

export const tint = (hex: string, alpha: number) => chroma(hex).alpha(alpha).css();
