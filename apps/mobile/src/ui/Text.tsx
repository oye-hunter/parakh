import { Text as RNText, StyleSheet, type TextProps as RNTextProps } from 'react-native';
import { color, type as typeScale, type TypeVariant } from '@parakh/tokens';

/**
 * Every piece of text in the app goes through here.
 *
 * Two things this centralises that are easy to get wrong once per screen:
 * `fontFamily` (React Native ignores `fontWeight` when the family already names
 * a weight), and `fontVariant: ['tabular-nums']` on the data variants — without
 * it, digits in the queue and the evidence rows do not line up in columns.
 */

const styles = StyleSheet.create({
  micro: { ...typeScale.micro, color: color.fog, textTransform: 'uppercase' },
  caption: { ...typeScale.caption, color: color.charcoal },
  bodySm: { ...typeScale.bodySm, color: color.vastInk },
  body: { ...typeScale.body, color: color.vastInk },
  reasoning: { ...typeScale.reasoning, color: color.vastInk },
  subheading: { ...typeScale.subheading, color: color.vastInk },
  titleSm: { ...typeScale.titleSm, color: color.vastInk },
  title: { ...typeScale.title, color: color.vastInk },
  titleLg: { ...typeScale.titleLg, color: color.vastInk },
  figure: { ...typeScale.figure, color: color.vastInk },
  dataSm: { ...typeScale.dataSm, color: color.charcoal, fontVariant: ['tabular-nums'] },
  data: { ...typeScale.data, color: color.vastInk, fontVariant: ['tabular-nums'] },
});

export interface TextProps extends RNTextProps {
  variant?: TypeVariant;
  /** Convenience override — avoids a style array for the common case. */
  tone?: keyof typeof color;
  center?: boolean;
}

export function Text({ variant = 'body', tone, center, style, ...rest }: TextProps) {
  return (
    <RNText
      style={[
        styles[variant],
        tone ? { color: color[tone] } : null,
        center ? { textAlign: 'center' } : null,
        style,
      ]}
      {...rest}
    />
  );
}
