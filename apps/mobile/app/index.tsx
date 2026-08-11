import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { color, layout, radius, space, surface } from '@parakh/tokens';

import { Button, Text } from '@/ui';

/**
 * Root Entry Screen — Role Selection (Customer vs Compliance Officer).
 *
 * Provides a clean, elegant choice before entering the main flow.
 */
export default function RoleSelectionScreen() {
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
        <Text variant="micro">PARAKH · پرکھ</Text>

        <View style={{ marginTop: space.xxl }}>
          <Text variant="title">Welcome to Parakh</Text>
          <Text variant="body" tone="charcoal" style={{ marginTop: space.xs }}>
            Please select your role to get started.
          </Text>
        </View>

        <View style={{ marginTop: space.xxl, gap: space.lg }}>
          {/* Customer / Applicant Card */}
          <View
            style={{
              backgroundColor: surface.card,
              borderRadius: radius.card,
              borderWidth: 2,
              borderColor: color.vastInk,
              padding: space.lg,
              gap: space.md,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  backgroundColor: color.lavender,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1.5,
                  borderColor: color.vastInk,
                }}
              >
                <Text style={{ fontSize: 20 }}>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="subheading" style={{ fontFamily: 'Archivo_600SemiBold' }}>
                  Customer / Applicant
                </Text>
                <Text variant="caption" tone="fog">
                  Account Onboarding & Status
                </Text>
              </View>
            </View>

            <Text variant="bodySm" tone="charcoal">
              Open a new digital account in five steps or check your existing application status.
            </Text>

            <Button
              label="Continue as Customer →"
              onPress={() => router.push('/apply/welcome')}
            />
          </View>

          {/* Compliance Officer Card */}
          <View
            style={{
              backgroundColor: surface.console,
              borderRadius: radius.card,
              borderWidth: 2,
              borderColor: color.vastInk,
              padding: space.lg,
              gap: space.md,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  backgroundColor: color.vastInk,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 20 }}>🛡️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="subheading" style={{ fontFamily: 'Archivo_600SemiBold' }}>
                  Compliance Officer
                </Text>
                <Text variant="caption" tone="fog">
                  Risk Triage & Audit Portal
                </Text>
              </View>
            </View>

            <Text variant="bodySm" tone="charcoal">
              Review flagged applications, AI risk reasoning, and audit decision history.
            </Text>

            <Button
              label="Officer Sign in ›"
              variant="outlined"
              onPress={() => router.push('/officer/sign-in')}
            />
          </View>
        </View>

        <View style={{ flex: 1 }} />

        {/* Footer simple text link */}
        <View style={{ marginTop: space.xxl, alignItems: 'center' }}>
          <Text variant="micro" tone="fog">
            Parakh · Customer Risk Profiling & Compliance System
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
