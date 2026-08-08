import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import {
  border,
  color,
  layout,
  radius,
  relativeTime,
  space,
  surface,
} from '@parakh/tokens';

import { Card, HeaderBand, RiskBadge, StatusPill, Text } from '@/ui';
import { getCases, type CaseListItem } from '@/lib/api';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'clustered', label: 'Clustered' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

/** O3 · EDD queue */
export default function Queue() {
  const params = useLocalSearchParams<{ cluster?: string }>();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [items, setItems] = useState<CaseListItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getCases(
        params.cluster ? { cluster: params.cluster } : { status: 'edd_queue' },
      );
      setItems(res.items);
    } catch (err) {
      if ((err as { status?: number }).status === 401) router.replace('/officer/sign-in');
    }
  }, [params.cluster]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const visible = items.filter((i) => {
    if (filter === 'all') return true;
    if (filter === 'clustered') return Boolean(i.clusterRef);
    return i.riskLevel === filter;
  });

  return (
    <View style={{ flex: 1, backgroundColor: surface.console }}>
      <HeaderBand
        title={params.cluster ? `Cluster ${params.cluster}` : 'EDD queue'}
        onBack={() => router.back()}
      />

      {!params.cluster && (
        <View
          style={{
            flexDirection: 'row',
            gap: space.sm,
            paddingHorizontal: layout.gutter,
            paddingTop: space.base,
          }}
        >
          {FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={{
                  borderRadius: radius.pill,
                  borderWidth: active ? border.heavy : border.hair,
                  borderColor: color.vastInk,
                  backgroundColor: active ? color.vastInk : 'transparent',
                  paddingVertical: 7,
                  paddingHorizontal: 14,
                }}
              >
                <Text
                  variant="caption"
                  style={{ color: active ? color.lumenCream : color.vastInk }}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ padding: layout.gutter, gap: space.md, paddingBottom: space.xxl }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
      >
        {visible.length === 0 ? (
          <Card>
            <Text variant="caption" tone="fog">
              Nothing in the queue.
            </Text>
          </Card>
        ) : (
          visible.map((c) => (
            <Card
              key={c.caseId}
              onPress={() => router.push(`/officer/case/${c.caseId}`)}
              accent={c.clusterRef ? color.riskMedium : undefined}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                <Text variant="bodySm" style={{ flex: 1, fontFamily: 'Archivo_600SemiBold' }}>
                  {c.fullName}
                </Text>
                {c.riskLevel && <RiskBadge level={c.riskLevel} confidence={c.confidence} />}
              </View>

              <Text variant="dataSm" tone="fog" style={{ marginTop: 2 }}>
                {c.cnic}
              </Text>

              {c.topSignal ? (
                <Text variant="caption" tone="charcoal" numberOfLines={1} style={{ marginTop: 6 }}>
                  {c.topSignal.label} — {c.topSignal.evidence}
                </Text>
              ) : null}

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: space.md,
                  gap: space.sm,
                }}
              >
                <Text variant="dataSm" tone="fog" style={{ flex: 1, fontSize: 12 }}>
                  {relativeTime(c.submittedAt)} · {c.signalCount} signal
                  {c.signalCount === 1 ? '' : 's'}
                </Text>
                <StatusPill status={c.status} />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}
