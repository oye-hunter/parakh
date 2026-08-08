import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { color, layout, radius, space, surface } from '@parakh/tokens';

import { Button, Field, Text } from '@/ui';
import { signIn } from '@/lib/auth-client';

/** O1 · Officer sign in */
export default function SignIn() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      const { error: authError } = await signIn.email({ email: email.trim(), password });
      if (authError) {
        // Never distinguish "no such account" from "wrong password" — that
        // difference tells an attacker which addresses are real.
        setError('That email and password do not match an officer account.');
        setBusy(false);
        return;
      }
      router.replace('/officer/dashboard');
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: surface.console }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + space.huge,
          paddingHorizontal: layout.gutter,
          paddingBottom: insets.bottom + space.xl,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="micro">Parakh · Compliance</Text>
        <Text variant="title" style={{ marginTop: space.sm }}>
          Officer sign in
        </Text>
        <Text variant="caption" tone="fog" style={{ marginTop: 4 }}>
          Accounts are issued by your administrator.
        </Text>

        <View style={{ marginTop: space.xl, gap: space.lg }}>
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="name@parakh.pk"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••••"
            autoCapitalize="none"
            secureTextEntry
          />
        </View>

        {error ? (
          <View
            style={{
              marginTop: space.base,
              borderRadius: radius.row,
              borderWidth: 2,
              borderColor: color.riskHigh,
              padding: space.md,
            }}
          >
            <Text variant="caption" tone="riskHigh">
              {error}
            </Text>
          </View>
        ) : null}

        <View style={{ flex: 1 }} />

        <View style={{ gap: space.md, marginTop: space.xl }}>
          <Button
            label="Sign in"
            onPress={submit}
            loading={busy}
            disabled={!email || !password}
          />
          <Button label="Back" variant="outlined" onPress={() => router.replace('/')} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
