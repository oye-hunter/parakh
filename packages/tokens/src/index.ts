/**
 * Design tokens — the single source of truth, transcribed from DESIGN.md.
 *
 * Deliberately framework-free: no React, no CSS, no dependencies at all. The
 * web app turns these into Tailwind `@theme` values; the mobile app feeds them
 * straight into `StyleSheet.create`. One definition, two consumers, zero shared
 * runtime.
 *
 * Line heights and letter spacing are pre-multiplied into absolute pixels
 * because React Native takes them that way — DESIGN.md states them as ratios
 * and em, and getting that conversion wrong in each screen is exactly the bug
 * this file exists to prevent.
 */

/* ─────────────────────────────── colour ──────────────────────────── */

export const color = {
  // brand
  lavender: '#f0d7ff',
  forestInk: '#034f46',
  vastInk: '#1a1a1a',
  charcoal: '#222222',
  fog: '#8a8a80',
  emberGlow: '#ffa946',

  // the three-cream ladder — this IS the elevation system
  lumenCream: '#ffffeb',
  ledgerCream: '#f2efdc',
  lumenStone: '#e4e4d0',

  // semantic risk. State, never decoration — and never a button fill except
  // on the decision bar, where the decision *is* the risk judgment.
  riskLow: '#034f46',
  riskMedium: '#b06a0c',
  riskHigh: '#a8322a',
} as const;

export type RiskLevel = 'low' | 'medium' | 'high';

export const riskColor: Record<RiskLevel, string> = {
  low: color.riskLow,
  medium: color.riskMedium,
  high: color.riskHigh,
};

export type Severity = RiskLevel;
export const severityColor = riskColor;

/* ─────────────────────────────── surfaces ────────────────────────── */

export const surface = {
  /** Applicant flow ground — the lightest cream. */
  applicant: color.lumenCream,
  /** Officer console ground, one step deeper so cards lift off it. */
  console: color.ledgerCream,
  /** Every card, on either ground. */
  card: color.lumenCream,
  /** Evidence rows, inputs, dividers. */
  inset: color.lumenStone,
  /** The one filled-ink surface: the officer header band. */
  band: color.vastInk,
} as const;

/* ──────────────────────────────── type ───────────────────────────── */

export const font = {
  display: 'Fraunces_600SemiBold',
  ui: 'Archivo_400Regular',
  uiMedium: 'Archivo_500Medium',
  uiSemi: 'Archivo_600SemiBold',
  data: 'JetBrainsMono_400Regular',
  dataMedium: 'JetBrainsMono_500Medium',
} as const;

/**
 * The type scale. `lineHeight` and `letterSpacing` are absolute pixels.
 */
export const type = {
  micro: { fontFamily: font.uiSemi, fontSize: 11, lineHeight: 13, letterSpacing: 1.1 },
  caption: { fontFamily: font.ui, fontSize: 13, lineHeight: 18 },
  bodySm: { fontFamily: font.ui, fontSize: 15, lineHeight: 20 },
  body: { fontFamily: font.ui, fontSize: 16, lineHeight: 22 },
  /** The AI reasoning paragraph — the one place with generous leading. */
  reasoning: { fontFamily: font.ui, fontSize: 16, lineHeight: 26 },
  subheading: { fontFamily: font.uiSemi, fontSize: 18, lineHeight: 23 },
  titleSm: { fontFamily: font.display, fontSize: 22, lineHeight: 26, letterSpacing: -0.4 },
  title: { fontFamily: font.display, fontSize: 28, lineHeight: 31, letterSpacing: -0.7 },
  titleLg: { fontFamily: font.display, fontSize: 32, lineHeight: 34, letterSpacing: -0.9 },
  figure: { fontFamily: font.display, fontSize: 40, lineHeight: 40, letterSpacing: -1 },
  dataSm: { fontFamily: font.data, fontSize: 13, lineHeight: 18 },
  data: { fontFamily: font.dataMedium, fontSize: 15, lineHeight: 21 },
} as const;

export type TypeVariant = keyof typeof type;

/* ────────────────────────────── spacing ──────────────────────────── */

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
  huge: 64,
} as const;

export const radius = {
  tag: 8,
  row: 12,
  input: 12,
  button: 12,
  card: 24,
  section: 32,
  pill: 9999,
} as const;

export const layout = {
  gutter: 20,
  cardPadding: 20,
  sectionGap: 32,
  tapTargetMin: 44,
  headerBandHeight: 64,
  /** Running text stays near 62 characters. */
  measure: 62,
} as const;

export const border = {
  /** The signature. Cards and interactive elements. */
  heavy: 2,
  field: 1.5,
  hair: 1,
  /** Severity stripe on an evidence row. */
  stripe: 3,
} as const;

/* ───────────────────────────── formatting ────────────────────────── */

const pkrFormatter = new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 });

/** `85000` → `85,000`. Always render alongside a PKR label, never inside it. */
export function formatPkr(value: number): string {
  return pkrFormatter.format(Math.round(value));
}

/** `2026-08-08T09:13:25Z` → `14m ago` / `3h ago` / `2d ago`. */
export function relativeTime(iso: string, now: Date = new Date()): string {
  const minutes = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

/** `receive_business_payments` → `Receive business payments`. */
export function humanize(value: string): string {
  const spaced = value.replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
