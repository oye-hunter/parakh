import { useEffect, useRef, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { border, color, layout, space, surface } from '@parakh/tokens';

import { useDraft } from '@/lib/draft';

import { Button } from './Button';
import { StepProgress } from './Layout';
import { Text } from './Text';

/**
 * The shared frame for the four onboarding form steps.
 *
 * Designing one form screen properly and reusing it is the whole point — A2,
 * A3, A4 and A5 differ only in their fields.
 *
 * It also times each step. That is an observed signal, not a declared one: a
 * form completed impossibly fast is the sort of thing a fraud ring produces and
 * an honest applicant does not.
 */
export function StepScreen({
  step,
  stepLabel,
  title,
  subtitle,
  children,
  onContinue,
  continueLabel = 'Continue',
  canContinue = true,
  busy,
}: {
  step: number;
  stepLabel: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onContinue: () => void;
  continueLabel?: string;
  canContinue?: boolean;
  busy?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const { recordStep } = useDraft();
  const startedAt = useRef(Date.now());

  useEffect(() => {
    startedAt.current = Date.now();
  }, [step]);

  const handleContinue = () => {
    recordStep((Date.now() - startedAt.current) / 1000);
    onContinue();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: surface.applicant }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ paddingTop: insets.top + space.md, paddingHorizontal: layout.gutter }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.base }}>
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Go back">
            <Text variant="titleSm">‹</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <StepProgress step={step} total={5} label={stepLabel} />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          paddingTop: space.base,
          paddingBottom: space.xxl,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="title">{title}</Text>
        {subtitle ? (
          <Text variant="caption" tone="fog" style={{ marginTop: 4 }}>
            {subtitle}
          </Text>
        ) : null}

        <View style={{ marginTop: space.lg, gap: space.lg }}>{children}</View>
      </ScrollView>

      <View
        style={{
          paddingHorizontal: layout.gutter,
          paddingTop: space.md,
          paddingBottom: insets.bottom + space.md,
          borderTopWidth: border.hair,
          borderTopColor: color.lumenStone,
        }}
      >
        <Button
          label={continueLabel}
          onPress={handleContinue}
          disabled={!canContinue}
          loading={busy}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
