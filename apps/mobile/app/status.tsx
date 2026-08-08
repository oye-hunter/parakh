import { useState } from 'react';
import { View, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { color, font, layout, radius, space, surface } from '@parakh/tokens';
import { Button, StatusPill, Text } from '@/ui';
import { lookupStatus, ApiError, type ApplicationStatusResult } from '@/lib/api';

/**
 * A8 · Application Status Lookup.
 *
 * Allows applicants to query status by reference number (e.g. PK-4471) or CNIC.
 * Strict privacy boundary: Only reference, status, and submittedAt are displayed.
 */
export default function StatusScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApplicationStatusResult | null>(null);

  async function handleLookup() {
    const trimmed = query.trim();
    if (!trimmed) {
      Alert.alert('Missing Input', 'Please enter a reference number or CNIC.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      /**
       * Both formats contain hyphens, so "has a hyphen" cannot tell them apart —
       * an earlier version used that test and sent every reference number
       * (PK-4413) to the CNIC lookup, which always 404'd.
       *
       * Match on shape instead: a CNIC is 13 digits, optionally grouped 5-7-1.
       * Anything else is treated as a reference.
       */
      const digits = trimmed.replace(/\D/g, '');
      const isCnic = /^\d{5}-\d{7}-\d$/.test(trimmed) || /^\d{13}$/.test(digits);

      const res = await lookupStatus(
        isCnic
          ? { cnic: `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}` }
          : { reference: trimmed.toUpperCase() },
      );
      setResult(res.application);
    } catch (err: any) {
      if (err instanceof ApiError) {
        Alert.alert('Not Found', err.message || 'No application found.');
      } else {
        Alert.alert('Error', err.message || 'Unable to connect to server.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: surface.applicant,
        paddingTop: insets.top + space.xl,
        paddingHorizontal: layout.gutter,
        paddingBottom: insets.bottom + space.lg,
      }}
    >
      <Text variant="title">Check status</Text>
      <Text variant="body" tone="charcoal" style={{ marginTop: space.sm, marginBottom: space.lg }}>
        Enter your reference number (e.g. PK-4471) or 13-digit CNIC to look up your application status.
      </Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="PK-XXXX or 00000-0000000-0"
        placeholderTextColor={color.fog}
        autoCapitalize="characters"
        autoCorrect={false}
        style={{
          height: 52,
          backgroundColor: color.lumenCream,
          borderRadius: radius.input,
          borderWidth: 1,
          borderColor: color.lumenStone,
          paddingHorizontal: space.base,
          fontFamily: font.data,
          fontSize: 16,
          color: color.vastInk,
          marginBottom: space.md,
        }}
      />

      <Button label={loading ? 'Searching...' : 'Lookup Application'} onPress={handleLookup} disabled={loading} />

      {loading && <ActivityIndicator size="large" color={color.forestInk} style={{ marginTop: space.xl }} />}

      {result && (
        <View
          style={{
            marginTop: space.xl,
            padding: space.lg,
            backgroundColor: color.lumenCream,
            borderRadius: radius.card,
            borderWidth: 1,
            borderColor: color.lumenStone,
          }}
        >
          <Text variant="micro" tone="fog">Reference Number</Text>
          <Text variant="data" style={{ fontSize: 20, marginVertical: space.xs, color: color.forestInk }}>
            {result.reference}
          </Text>

          <View style={{ height: 1, backgroundColor: color.lumenStone, marginVertical: space.md }} />

          <Text variant="micro" tone="fog" style={{ marginBottom: space.xs }}>Application Status</Text>
          <View style={{ alignItems: 'flex-start' }}>
            <StatusPill status={result.status as any} />
          </View>

          <Text variant="caption" tone="fog" style={{ marginTop: space.md }}>
            Submitted on {new Date(result.submittedAt).toLocaleDateString()}
          </Text>
        </View>
      )}

      <View style={{ flex: 1 }} />
      <Button label="Back to start" variant="outlined" onPress={() => router.replace('/')} />
    </View>
  );
}
