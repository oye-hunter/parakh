import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { border, color, layout, radius, space, surface } from '@parakh/tokens';

import { Text } from './Text';

/**
 * The officer header band — the only place ink fills a surface.
 *
 * This is what replaces the dark chamber the design system originally used to
 * separate the two roles: a band, not a room. It gives the console a
 * working-tool weight while everything below stays on paper.
 */
export function HeaderBand({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: surface.band,
        paddingTop: insets.top + space.md,
        paddingBottom: space.base,
        paddingHorizontal: layout.gutter,
        borderBottomLeftRadius: radius.section,
        borderBottomRightRadius: radius.section,
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
      }}
    >
      {onBack && (
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={12}>
          <Text variant="titleSm" style={{ color: color.lumenCream }}>
            ‹
          </Text>
        </Pressable>
      )}
      <Text variant="titleSm" style={{ color: color.lumenCream, flex: 1 }} numberOfLines={1}>
        {title}
      </Text>
      {right}
    </View>
  );
}

/* ─────────────────────────── stat tile ───────────────────────────── */

/**
 * The one place the editorial serif does interface work. A 40px Fraunces
 * numeral is what keeps this dashboard from looking like every other admin
 * panel.
 */
export function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: surface.card,
        borderRadius: radius.card,
        borderWidth: border.heavy,
        borderColor: color.vastInk,
        padding: layout.cardPadding,
        gap: 2,
      }}
    >
      <Text variant="micro">{label}</Text>
      <Text variant="figure">{value}</Text>
      {hint ? (
        <Text variant="dataSm" tone="fog">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

/* ──────────────────── risk distribution bar ──────────────────────── */

const DIST = [
  { key: 'low' as const, label: 'Low', tint: color.riskLow },
  { key: 'medium' as const, label: 'Medium', tint: color.riskMedium },
  { key: 'high' as const, label: 'High', tint: color.riskHigh },
];

/** A stacked bar. Never a pie chart — DESIGN.md is explicit about that. */
export function RiskDistribution({
  distribution,
}: {
  distribution: { low: number; medium: number; high: number };
}) {
  const total = distribution.low + distribution.medium + distribution.high;

  return (
    <View style={{ gap: space.md }}>
      <View
        style={{
          flexDirection: 'row',
          height: 14,
          borderRadius: radius.pill,
          borderWidth: border.heavy,
          borderColor: color.vastInk,
          overflow: 'hidden',
          backgroundColor: surface.inset,
        }}
      >
        {total > 0 &&
          DIST.map((d) => {
            const n = distribution[d.key];
            if (n === 0) return null;
            return <View key={d.key} style={{ flex: n, backgroundColor: d.tint }} />;
          })}
      </View>

      <View style={{ flexDirection: 'row', gap: space.lg }}>
        {DIST.map((d) => (
          <View key={d.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: d.tint }} />
            <Text variant="caption" tone="charcoal">
              {d.label}
            </Text>
            <Text variant="dataSm">{distribution[d.key]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ──────────────────────── cluster banner ─────────────────────────── */

/**
 * The only bright-amber surface in the system, and it appears only when a
 * cross-application pattern trips. Its rarity is what gives it weight — if it
 * were always on screen it would be wallpaper.
 */
export function ClusterBanner({ summary, onPress }: { summary: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        backgroundColor: color.emberGlow,
        borderRadius: radius.row + 4,
        borderWidth: border.heavy,
        borderColor: color.vastInk,
        paddingVertical: 14,
        paddingHorizontal: space.base,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text variant="bodySm" style={{ fontFamily: 'Archivo_600SemiBold' }}>
        {summary}
      </Text>
    </Pressable>
  );
}

/* ───────────────────────── step progress ─────────────────────────── */

export function StepProgress({
  step,
  total,
  label,
}: {
  step: number;
  total: number;
  label: string;
}) {
  return (
    <View style={{ gap: space.sm }}>
      <View style={{ flexDirection: 'row', gap: 2 }}>
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: radius.pill,
              backgroundColor:
                i < step - 1 ? color.vastInk : i === step - 1 ? color.forestInk : surface.inset,
            }}
          />
        ))}
      </View>
      <Text variant="micro">{`Step ${step} of ${total} · ${label}`}</Text>
    </View>
  );
}

/* ───────────────────────────── misc ──────────────────────────────── */

export function Divider() {
  return <View style={{ height: 1, backgroundColor: surface.inset }} />;
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});

export function Row({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.rowBetween, style]}>{children}</View>;
}

/** Label on the left, value on the right — the review screen's building block. */
export function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.base, paddingVertical: 5 }}>
      <Text variant="caption" tone="fog" style={{ flex: 1 }}>
        {label}
      </Text>
      <Text variant={mono ? 'dataSm' : 'caption'} style={{ flex: 1.4, textAlign: 'right' }}>
        {value}
      </Text>
    </View>
  );
}
