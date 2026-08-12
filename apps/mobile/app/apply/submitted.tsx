import { useCallback } from 'react';
import { BackHandler, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { color, layout, radius, space, surface } from '@parakh/tokens';

import { Button, StatusPill, Text } from '@/ui';

/**
 * A7 · Submitted.
 *
 * The applicant sees a reference and a state. No risk level, no signals, no
 * reasoning — that is internal. Showing someone their own score teaches them
 * exactly which field to change and re-file.
 */
export default function Submitted() {
  const insets = useSafeAreaInsets();
  const { reference } = useLocalSearchParams<{ reference: string }>();

  const goHome = useCallback(() => {
    if (router.canDismiss()) {
      router.dismissAll();
    }
    router.replace('/');
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        goHome();
        return true; // Intercept hardware back button
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [goHome]),
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: surface.applicant,
        paddingTop: insets.top + space.huge,
        paddingHorizontal: layout.gutter,
        paddingBottom: insets.bottom + space.lg,
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          borderWidth: 2,
          borderColor: color.vastInk,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: space.lg,
        }}
      >
        <Text variant="titleSm">✓</Text>
      </View>

      <Text variant="title">Application received</Text>

      <View style={{ marginTop: space.lg, gap: space.md, alignItems: 'flex-start' }}>
        <View
          style={{
            backgroundColor: surface.inset,
            borderRadius: radius.tag,
            paddingVertical: 8,
            paddingHorizontal: 12,
          }}
        >
          <Text variant="data">{reference}</Text>
        </View>
        <StatusPill status="pending" />
      </View>

      <Text variant="body" tone="charcoal" style={{ marginTop: space.lg, maxWidth: 340 }}>
        A member of our compliance team is reviewing your application. Most reviews
        finish within one working day, and we will notify you as soon as it is done.
        Keep your reference number — you can use it to check progress.
      </Text>

      <View style={{ flex: 1 }} />

      <View style={{ gap: space.md }}>
        <Button
          label="Check status"
          onPress={() => {
            if (router.canDismiss()) {
              router.dismissAll();
            }
            router.replace('/status');
          }}
        />
        <Button label="Back to start" variant="outlined" onPress={goHome} />
      </View>
    </View>
  );
}
