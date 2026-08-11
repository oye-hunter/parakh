import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { color, layout, relativeTime, space, surface } from '@parakh/tokens';

import { Card, HeaderBand, StatusPill, Text } from '@/ui';
import { useDecisionsQuery } from '@/lib/queries';

/** O6 · Standalone Decision History / Audit Trail Screen. */
export default function HistoryScreen() {
  const { data, isPending, isRefetching, refetch, error: fetchError } = useDecisionsQuery();

  const decisions = data ?? [];
  const refreshing = isRefetching;
  const error = fetchError ? 'Could not load decision history.' : null;

  const onRefresh = () => void refetch();

  return (
    <View style={{ flex: 1, backgroundColor: surface.console }}>
      <HeaderBand
        title="Decision History"
        right={
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text variant="caption" style={{ color: '#ffffeb' }}>
              Back
            </Text>
          </Pressable>
        }
      />

      {error ? (
        <View style={{ padding: layout.gutter }}>
          <Text variant="caption" tone="riskHigh">
            {error}
          </Text>
        </View>
      ) : null}

      <FlatList
        data={decisions}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{
          padding: layout.gutter,
          gap: space.md,
          paddingBottom: space.xxl,
        }}
        ListEmptyComponent={
          !isPending ? (
            <Card>
              <Text variant="caption" tone="fog">
                No past decisions recorded yet.
              </Text>
            </Card>
          ) : null
        }
        renderItem={({ item }) => {
          const app = item.case?.application;
          const status =
            item.action === 'approve'
              ? 'approved'
              : item.action === 'reject'
              ? 'declined'
              : 'escalated';

          return (
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text variant="data" style={{ fontWeight: 'bold', fontSize: 16 }}>
                  {app?.reference ?? 'N/A'}
                </Text>
                <StatusPill status={status as any} />
              </View>

              {app ? (
                <Text variant="body" style={{ marginTop: space.xs, fontSize: 14 }}>
                  {app.fullName} ({app.cnic})
                </Text>
              ) : null}

              <Text variant="caption" tone="fog" style={{ marginTop: space.xs }}>
                Decided by: {item.officer?.name ?? item.officer?.email ?? 'Officer'} · {relativeTime(item.decidedAt)}
              </Text>

              <View style={{ height: 1, backgroundColor: color.lumenStone, marginVertical: space.sm }} />

              <Text variant="micro" tone="fog">
                OFFICER JUSTIFICATION
              </Text>
              <Text variant="body" tone="charcoal" style={{ fontSize: 13, marginTop: 2 }}>
                {item.justification}
              </Text>

              <Text variant="micro" tone="fog" style={{ marginTop: space.sm }}>
                AI REASONING SNAPSHOT ({item.riskSnapshot.toUpperCase()})
              </Text>
              <Text variant="caption" tone="fog" numberOfLines={2} style={{ fontSize: 12, marginTop: 2 }}>
                {item.reasoningSnapshot}
              </Text>
            </Card>
          );
        }}
      />
    </View>
  );
}
