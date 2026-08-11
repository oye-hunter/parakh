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

/**
 * `all` means every application, not every EDD-queue item.
 *
 * An earlier version always fetched `{ status: 'edd_queue' }` and then filtered
 * that result client-side, so "All" silently meant "all high-risk cases" and an
 * officer could never see the low and medium applications that were approved
 * automatically — which is most of them.
 */
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'queue', label: 'In queue' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
  { key: 'clustered', label: 'Clustered' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

/** What each chip asks the server for. Filtering happens in the query, not after it. */
function queryFor(filter: FilterKey): { status?: string; risk?: string } {
  switch (filter) {
    case 'queue':
      return { status: 'edd_queue' };
    case 'high':
    case 'medium':
    case 'low':
      return { risk: filter };
    default:
      return {};
  }
}

/** O3 · Applications — the officer's working list. */
export default function Queue() {
  const params = useLocalSearchParams<{ cluster?: string }>();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [items, setItems] = useState<CaseListItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getCases(params.cluster ? { cluster: params.cluster } : queryFor(filter));
      setItems(res.items);
    } catch (err) {
      if ((err as { status?: number }).status === 401) router.replace('/officer/sign-in');
    }
  }, [params.cluster, filter]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  // Cluster membership is a property of the signals, not something the list
  // endpoint filters on, so that one stays client-side.
  const visible = filter === 'clustered' ? items.filter((i) => Boolean(i.clusterRef)) : items;

  return (
    <View style={{ flex: 1, backgroundColor: surface.console }}>
      <HeaderBand
        title={params.cluster ? `Cluster ${params.cluster}` : 'Applications'}
        onBack={() => router.back()}
        right={
          <Text variant="caption" style={{ color: color.lumenCream }}>
            {visible.length}
          </Text>
        }
      />

      {!params.cluster && (
        <View style={{ height: 50, maxHeight: 50, flexGrow: 0, marginTop: space.sm }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              flexDirection: 'row',
              gap: space.sm,
              paddingHorizontal: layout.gutter,
              alignItems: 'center',
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
                    paddingVertical: 6,
                    paddingHorizontal: 14,
                    height: 34,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    variant="caption"
                    style={{
                      color: active ? color.lumenCream : color.vastInk,
                      lineHeight: 18,
                    }}
                  >
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
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
              {filter === 'all'
                ? 'No applications yet.'
                : `No applications match “${FILTERS.find((f) => f.key === filter)?.label}”.`}
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
