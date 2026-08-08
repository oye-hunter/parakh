import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { color, layout, space, surface } from '@parakh/tokens';

import { Button, Text } from '@/ui';

/** A1 · Welcome — the applicant's entry point. */
export default function Welcome() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: surface.applicant }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + space.xl,
          paddingHorizontal: layout.gutter,
          paddingBottom: space.xl,
          flexGrow: 1,
        }}
      >
        <Text variant="micro">Parakh</Text>

        <View style={{ marginTop: space.xxl }}>
          <Text variant="title">Open your account</Text>
          <Text variant="title">in five steps</Text>
          {/* The one flourish in the whole applicant flow. */}
          <View
            style={{
              height: 4,
              width: 92,
              backgroundColor: color.lavender,
              borderRadius: 2,
              marginTop: -4,
              marginLeft: 2,
            }}
          />
        </View>

        <Text variant="body" tone="charcoal" style={{ marginTop: space.base, maxWidth: 320 }}>
          A few details about you and how you plan to use the account. It takes about three minutes.
        </Text>

        <View style={{ marginTop: space.xxl, gap: space.base }}>
          {[
            ['Your identity', 'CNIC and date of birth'],
            ['Where you live', 'City, area, how long you have been there'],
            ['Work and income', 'What you do and what you earn'],
            ['How you will use it', 'Purpose and expected activity'],
          ].map(([title, detail]) => (
            <View key={title} style={{ flexDirection: 'row', gap: space.md, alignItems: 'flex-start' }}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: color.vastInk,
                  marginTop: 7,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text variant="bodySm" style={{ fontFamily: 'Archivo_600SemiBold' }}>
                  {title}
                </Text>
                <Text variant="caption" tone="fog">
                  {detail}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ flex: 1 }} />

        <View style={{ marginTop: space.xxxl, gap: space.base }}>
          <Button label="Get started" onPress={() => router.push('/apply/identity')} />
          <Pressable onPress={() => router.push('/officer/sign-in')} hitSlop={10}>
            <Text variant="caption" tone="fog" center>
              Compliance officer sign in
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
