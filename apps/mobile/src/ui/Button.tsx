import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { border, color, layout, radius, space } from '@parakh/tokens';

import { Text } from './Text';

/**
 * Buttons.
 *
 * `primary` is Lavender and there is at most one per screen — it is the single
 * clickable thing, and it never signals risk or status.
 *
 * `approve` / `reject` break that rule on purpose. They are the only buttons
 * carrying semantic colour, because on the decision bar the decision *is* the
 * risk judgment. Lavender would be wrong there: it is a verdict, not a call to
 * action.
 */

export type ButtonVariant = 'primary' | 'outlined' | 'approve' | 'reject' | 'escalate';

const VARIANTS: Record<ButtonVariant, { fill: string; ink: string; stroke: string }> = {
  primary: { fill: color.lavender, ink: color.vastInk, stroke: color.vastInk },
  outlined: { fill: color.lumenCream, ink: color.vastInk, stroke: color.vastInk },
  approve: { fill: color.forestInk, ink: color.lumenCream, stroke: color.forestInk },
  escalate: { fill: color.lumenCream, ink: color.vastInk, stroke: color.vastInk },
  reject: { fill: color.lumenCream, ink: color.riskHigh, stroke: color.riskHigh },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.button,
    borderWidth: border.heavy,
    minHeight: layout.tapTargetMin + 4,
    paddingVertical: 12,
    paddingHorizontal: space.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: space.sm,
  },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.4 },
});

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
}: ButtonProps) {
  const v = VARIANTS[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: v.fill, borderColor: v.stroke },
        pressed && !inactive && styles.pressed,
        inactive && styles.disabled,
        style,
      ]}
    >
      {loading && <ActivityIndicator size="small" color={v.ink} />}
      <Text variant="bodySm" style={{ color: v.ink, fontFamily: 'Archivo_600SemiBold' }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** The fixed bar at the bottom of a case. Three equal verdicts. */
export function DecisionBar({
  onApprove,
  onEscalate,
  onReject,
  busy,
}: {
  onApprove: () => void;
  onEscalate: () => void;
  onReject: () => void;
  busy?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: space.sm,
        padding: space.base,
        backgroundColor: color.lumenCream,
        borderTopWidth: border.heavy,
        borderTopColor: color.vastInk,
      }}
    >
      <Button label="Approve" variant="approve" onPress={onApprove} disabled={busy} style={{ flex: 1 }} />
      <Button label="Escalate" variant="escalate" onPress={onEscalate} disabled={busy} style={{ flex: 1 }} />
      <Button label="Reject" variant="reject" onPress={onReject} disabled={busy} style={{ flex: 1 }} />
    </View>
  );
}
