import { createContext, useContext } from 'react';

import type { ApplicationPayload } from './api';

/**
 * The application being filled in, held across the five steps.
 *
 * Deliberately in memory only. A half-finished KYC form contains a CNIC and an
 * income declaration; persisting that to disk on a shared agent-shop device
 * would be a worse privacy failure than losing a few minutes of typing.
 */
export type Draft = Partial<Omit<ApplicationPayload, 'meta'>> & {
  /** Seconds spent on each step — an observed signal, never declared. */
  stepTimings: number[];
};

export const emptyDraft: Draft = { stepTimings: [] };

export interface DraftContextValue {
  draft: Draft;
  update: (patch: Partial<Draft>) => void;
  reset: () => void;
  recordStep: (seconds: number) => void;
}

export const DraftContext = createContext<DraftContextValue | null>(null);

export function useDraft(): DraftContextValue {
  const ctx = useContext(DraftContext);
  if (!ctx) throw new Error('useDraft must be used inside the applicant flow');
  return ctx;
}

/* ───────────────────────────── validation ────────────────────────── */

export const CNIC_PATTERN = /^\d{5}-\d{7}-\d$/;

/** `3740512345671` → `37405-1234567-1`, as the user types. */
export function formatCnic(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 13);
  const parts = [digits.slice(0, 5), digits.slice(5, 12), digits.slice(12, 13)].filter(Boolean);
  return parts.join('-');
}

/** `2005-3-7` → `2005-03-07`; returns null if it is not a plausible date. */
export function normaliseDate(input: string): string | null {
  const m = input.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return null;
  const [, y, mo, d] = m;
  const year = Number(y);
  const month = Number(mo);
  const day = Number(d);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  if (year < 1900 || year > 2100) return null;
  return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function parseAmount(input: string): number | null {
  const n = Number(input.replace(/[^\d.]/g, ''));
  return Number.isFinite(n) && n >= 0 ? n : null;
}
