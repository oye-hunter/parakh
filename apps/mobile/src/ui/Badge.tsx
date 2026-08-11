import { StyleSheet, View } from 'react-native';
import { color, radius, riskColor, space, type RiskLevel } from '@parakh/tokens';

import { Text } from './Text';

/**
 * Risk badge — the signature component.
 *
 * Two rules from DESIGN.md that matter more than they look:
 *   · the label is always LOW / MEDIUM / HIGH, never a bare number
 *   · confidence sits *beside* the badge, never inside it — two separate facts
 *     get two separate treatments
 */

const styles = StyleSheet.create({
  pill: {
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  outline: { borderWidth: 1.5, backgroundColor: 'transparent' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  label: { letterSpacing: 0.8 },
});

export function RiskBadge({
  level,
  confidence,
  outline,
}: {
  level: RiskLevel;
  confidence?: number | null;
  /** Historical snapshots render outlined, to read as past rather than live. */
  outline?: boolean;
}) {
  const tint = riskColor[level];

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.pill,
          outline ? [styles.outline, { borderColor: tint }] : { backgroundColor: tint },
        ]}
      >
        <Text variant="micro" style={[styles.label, { color: outline ? tint : color.lumenCream }]}>
          {level}
        </Text>
      </View>
      {confidence != null && (
        <Text variant="dataSm" tone="fog">
          {confidence.toFixed(2)}
        </Text>
      )}
    </View>
  );
}

/* ─────────────────────────── case status ─────────────────────────── */

export type CaseStatus = 'pending' | 'edd_queue' | 'approved' | 'declined' | 'escalated' | 'under_review';

const STATUS: Record<string, { label: string; fill?: string; ink: string; border?: string }> = {
  pending: { label: 'Pending', ink: color.fog, border: color.fog },
  edd_queue: { label: 'In EDD queue', ink: color.vastInk, border: color.vastInk },
  under_review: { label: 'Under Review', ink: color.vastInk, border: color.vastInk },
  approved: { label: 'Approved', fill: color.forestInk, ink: color.lumenCream },
  declined: { label: 'Declined', ink: color.riskHigh, border: color.riskHigh },
  escalated: { label: 'Escalated', fill: color.vastInk, ink: color.lumenCream },
};

/**
 * Status is deliberately quieter than risk. If both shouted, neither would read
 * — so filled pills are reserved for terminal states and everything else is an
 * outline.
 */
export function StatusPill({ status }: { status: CaseStatus | string }) {
  const s = STATUS[status] ?? {
    label: String(status ?? 'Pending').replace(/_/g, ' '),
    ink: color.fog,
    border: color.fog,
  };

  return (
    <View
      style={[
        styles.pill,
        { paddingVertical: 5, paddingHorizontal: 12 },
        s.fill ? { backgroundColor: s.fill } : { borderWidth: 1, borderColor: s.border ?? color.fog },
      ]}
    >
      <Text variant="caption" style={{ color: s.ink, fontSize: 12 }}>
        {s.label}
      </Text>
    </View>
  );
}
