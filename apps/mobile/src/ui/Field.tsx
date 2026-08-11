import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type ViewStyle,
} from 'react-native';
import { border, color, font, radius, space, surface, type as typeScale } from '@parakh/tokens';

import { Text } from './Text';

/**
 * Form field.
 *
 * `fontSize` is never below 16 — anything smaller makes iOS zoom the viewport on
 * focus and the whole flow lurches sideways.
 *
 * Numeric and identity fields render in the mono face, so what the applicant
 * types looks like what the officer later reads on the case file.
 */

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  input: {
    backgroundColor: surface.inset,
    borderRadius: radius.input,
    borderWidth: border.field,
    borderColor: color.vastInk,
    paddingVertical: 14,
    paddingHorizontal: space.base,
    ...typeScale.body,
    color: color.vastInk,
  },
  focused: { borderWidth: border.heavy, borderColor: color.forestInk },
  errored: { borderWidth: border.heavy, borderColor: color.riskHigh },
  mono: { fontFamily: font.data },
});

export interface FieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  helper?: string;
  error?: string | null;
  keyboardType?: KeyboardTypeOptions;
  /** CNIC, amounts, dates — anything read character by character. */
  mono?: boolean;
  maxLength?: number;
  autoCapitalize?: 'none' | 'words' | 'sentences';
  secureTextEntry?: boolean;
  style?: ViewStyle;
}

import { formatCnic } from '@/lib/draft';

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  helper,
  error,
  keyboardType,
  mono,
  maxLength,
  autoCapitalize = 'sentences',
  secureTextEntry,
  style,
}: FieldProps) {
  const [focused, setFocused] = useState(false);

  const handleTextChange = (text: string) => {
    const isCnicField =
      label.toLowerCase().includes('cnic') ||
      placeholder?.includes('00000-0000000-0');
    if (isCnicField) {
      onChangeText(formatCnic(text));
    } else {
      onChangeText(text);
    }
  };

  return (
    <View style={[styles.wrap, style]}>
      <Text variant="micro">{label}</Text>
      <TextInput
        value={value}
        onChangeText={handleTextChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={color.fog}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        secureTextEntry={secureTextEntry}
        style={[
          styles.input,
          mono && styles.mono,
          focused && styles.focused,
          error && styles.errored,
        ]}
      />
      {error ? (
        <Text variant="caption" tone="riskHigh">
          {error}
        </Text>
      ) : helper ? (
        <Text variant="caption" tone="fog">
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

/* ───────────────────────────── choice ────────────────────────────── */

export interface ChoiceOption<T extends string> {
  value: T;
  label: string;
}

/**
 * A select, as chips. Native pickers on Android look nothing like this design
 * system and cannot be styled into it, so the options are laid out directly —
 * which also means the applicant sees every choice without a modal.
 */
export function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
  error,
}: {
  label: string;
  value: T | null;
  options: ChoiceOption<T>[];
  onChange: (v: T) => void;
  error?: string | null;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text variant="micro">{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <Pressable
              key={o.value}
              onPress={() => onChange(o.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={{
                borderRadius: radius.pill,
                borderWidth: selected ? border.heavy : border.hair,
                borderColor: color.vastInk,
                backgroundColor: selected ? color.vastInk : surface.card,
                paddingVertical: 9,
                paddingHorizontal: 14,
              }}
            >
              <Text
                variant="caption"
                style={{ color: selected ? color.lumenCream : color.vastInk }}
              >
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <Text variant="caption" tone="riskHigh">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

/** Yes/no, as two chips. Same visual language as Choice. */
export function Toggle({
  label,
  value,
  onChange,
  helper,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  helper?: string;
}) {
  return (
    <Choice
      label={label}
      value={value ? 'yes' : 'no'}
      options={[
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ]}
      onChange={(v) => onChange(v === 'yes')}
      error={helper ? null : null}
    />
  );
}
