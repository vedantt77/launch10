import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMRR(mrr: number): string {
  if (mrr >= 1000000) {
    return `$${(mrr / 1000000).toFixed(1)}M MRR`;
  } else if (mrr >= 1000) {
    return `$${(mrr / 1000).toFixed(1)}K MRR`;
  }
  return `$${mrr.toFixed(0)} MRR`;
}