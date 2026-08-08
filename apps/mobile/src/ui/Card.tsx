import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { border, color, layout, radius, surface } from '@parakh/tokens';

/**
 * A sheet of cream laid on the ground.
 *
 * Separation is the 2px ink border plus the cream ladder — never a shadow. The
 * system is deliberately flat; adding elevation to make a flagged case "pop"
 * breaks the whole visual language. Raise its severity stripe instead.
 */

const styles = StyleSheet.create({
  card: {
    backgroundColor: surface.card,
    borderRadius: radius.card,
    borderWidth: border.heavy,
    borderColor: color.vastInk,
    padding: layout.cardPadding,
  },
  pressed: { opacity: 0.7 },
});

export interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  /** Severity stripe down the left edge — used by clustered case cards. */
  accent?: string;
  style?: ViewStyle;
}

export function Card({ children, onPress, accent, style }: CardProps) {
  const accentStyle: ViewStyle | null = accent
    ? { borderLeftWidth: border.stripe + 1, borderLeftColor: accent }
    : null;

  if (!onPress) {
    return <View style={[styles.card, accentStyle, style]}>{children}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, accentStyle, pressed && styles.pressed, style]}
    >
      {children}
    </Pressable>
  );
}
