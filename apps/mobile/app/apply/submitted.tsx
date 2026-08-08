import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
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
  const { reference, status } = useLocalSearchParams<{ reference: string; status: string }>();
  const approved = status === 'approved';

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

      <Text variant="title">
        {approved ? 'Your account is open' : 'Application received'}
      </Text>

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
        <StatusPill status={approved ? 'approved' : 'pending'} />
      </View>

      <Text variant="body" tone="charcoal" style={{ marginTop: space.lg, maxWidth: 340 }}>
        {approved
          ? 'You can start receiving payments straight away. Keep your reference number in case you need to contact support.'
          : 'A member of our compliance team is reviewing your application. Most reviews finish within one working day, and we will notify you as soon as it is done.'}
      </Text>

      <View style={{ flex: 1 }} />

      <View style={{ gap: space.md }}>
        <Button
          label={approved ? 'Continue' : 'Check status'}
          onPress={() => router.replace('/status')}
          variant={approved ? 'primary' : 'outlined'}
        />
        <Button label="Back to start" variant="outlined" onPress={() => router.replace('/')} />
      </View>
    </View>
  );
}
