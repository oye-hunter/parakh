import { StyleSheet, View } from 'react-native';
import { border, color, radius, severityColor, space, surface, type Severity } from '@parakh/tokens';

import { Text } from './Text';

/**
 * The component this whole project is judged on.
 *
 * Three lines, and the middle one is the point: `evidence` always carries the
 * concrete declared values — `declared 45,000/mo · expects 400,000/mo · 8.9×`.
 * That is what proves "never a silent score". A row that restates its own label
 * is a debug dump, not evidence.
 *
 * The severity stripe runs the full height of the left edge so the row's
 * seriousness reads before any of the text does.
 */

const styles = StyleSheet.create({
  row: {
    backgroundColor: surface.inset,
    borderRadius: radius.row,
    paddingVertical: space.md,
    paddingHorizontal: space.base,
    borderLeftWidth: border.stripe,
    gap: 2,
  },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  label: { flex: 1 },
});

export function EvidenceRow({
  label,
  evidence,
  severity,
  weight,
}: {
  label: string;
  evidence: string;
  severity: Severity;
  /** 0–1 from the model's ranking. Rendered as a share of the judgment. */
  weight?: number;
}) {
  return (
    <View style={[styles.row, { borderLeftColor: severityColor[severity] }]}>
      <View style={styles.head}>
        <Text variant="bodySm" style={[styles.label, { fontFamily: 'Archivo_600SemiBold' }]}>
          {label}
        </Text>
        {weight != null && (
          <Text variant="caption" tone="fog">
            {Math.round(weight * 100)}%
          </Text>
        )}
      </View>
      <Text variant="dataSm" tone="charcoal">
        {evidence}
      </Text>
    </View>
  );
}

/** The AI's plain-language judgment. The one place with generous leading. */
export function ReasoningPanel({ children }: { children: string }) {
  return (
    <View
      style={{
        backgroundColor: surface.card,
        borderRadius: radius.card,
        borderWidth: border.field,
        borderColor: color.vastInk,
        padding: space.lg,
        gap: space.sm,
      }}
    >
      <Text variant="micro">AI reasoning</Text>
      <Text variant="reasoning">{children}</Text>
    </View>
  );
}
