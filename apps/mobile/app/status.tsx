import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { layout, space, surface } from '@parakh/tokens';

import { Button, Text } from '@/ui';

/**
 * A8 · Status.
 *
 * Placeholder: looking up an application by reference needs a public,
 * rate-limited endpoint that returns a status and nothing else. Deliberately
 * not built yet — a careless version of it becomes an oracle for probing which
 * declarations pass, which is precisely what the applicant must not learn.
 */
export default function Status() {
  const insets = useSafeAreaInsets();

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
      <Text variant="title">Check your status</Text>
      <Text variant="body" tone="charcoal" style={{ marginTop: space.md, maxWidth: 340 }}>
        Enter the reference number from your receipt to see where your application has reached.
      </Text>
      <Text variant="caption" tone="fog" style={{ marginTop: space.lg }}>
        Not built yet — see docs/03-USE-CASES.md, UC-2.
      </Text>

      <View style={{ flex: 1 }} />
      <Button label="Back to start" variant="outlined" onPress={() => router.replace('/')} />
    </View>
  );
}
