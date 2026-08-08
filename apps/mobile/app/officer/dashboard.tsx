import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { layout, relativeTime, space, surface } from '@parakh/tokens';

import {
  Card,
  ClusterBanner,
  HeaderBand,
  RiskBadge,
  RiskDistribution,
  StatTile,
  Text,
} from '@/ui';
import { getCases, getDashboard, type CaseListItem, type DashboardData } from '@/lib/api';
import { signOut } from '@/lib/auth-client';

/** O2 · Dashboard — triage the day. */
export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [needsReview, setNeedsReview] = useState<CaseListItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [dash, queue] = await Promise.all([
        getDashboard(),
        getCases({ status: 'edd_queue' }),
      ]);
      setData(dash);
      setNeedsReview(queue.items.slice(0, 3));
    } catch (err) {
      // A 401 means the session expired while the app was backgrounded.
      if ((err as { status?: number }).status === 401) {
        router.replace('/officer/sign-in');
        return;
      }
      setError('Could not load the dashboard.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const stats = data?.stats;

  return (
    <View style={{ flex: 1, backgroundColor: surface.console }}>
      <HeaderBand
        title="Dashboard"
        right={
          <Pressable
            onPress={async () => {
              await signOut();
              router.replace('/');
            }}
            hitSlop={10}
          >
            <Text variant="caption" style={{ color: '#ffffeb' }}>
              Sign out
            </Text>
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={{
          padding: layout.gutter,
          gap: space.base,
          paddingBottom: space.xxl,
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {error ? (
          <Text variant="caption" tone="riskHigh">
            {error}
          </Text>
        ) : null}

        {data?.clusters.map((c) => (
          <ClusterBanner
            key={c.ref}
            summary={c.summary}
            onPress={() => router.push({ pathname: '/officer/queue', params: { cluster: c.ref } })}
          />
        ))}

        <View style={{ flexDirection: 'row', gap: space.md }}>
          <StatTile label="Today" value={String(stats?.applicationsToday ?? '—')} hint="applications" />
          <StatTile label="In EDD queue" value={String(stats?.inEddQueue ?? '—')} hint="awaiting review" />
        </View>
        <View style={{ flexDirection: 'row', gap: space.md }}>
          <StatTile label="Resolved" value={String(stats?.resolvedToday ?? '—')} hint="last 24h" />
          <StatTile
            label="Median decision"
            value={stats?.medianDecisionMinutes != null ? `${stats.medianDecisionMinutes}m` : '—'}
            hint="queue to verdict"
          />
        </View>

        {data ? (
          <Card>
            <Text variant="micro" style={{ marginBottom: space.md }}>
              Risk distribution
            </Text>
            <RiskDistribution distribution={data.distribution} />
          </Card>
        ) : null}

        <View style={{ marginTop: space.sm, gap: space.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text variant="subheading" style={{ flex: 1 }}>
              Needs review
            </Text>
            <Pressable onPress={() => router.push('/officer/queue')} hitSlop={8}>
              <Text variant="caption" style={{ textDecorationLine: 'underline' }}>
                See all
              </Text>
            </Pressable>
          </View>

          {needsReview.length === 0 ? (
            <Card>
              <Text variant="caption" tone="fog">
                Nothing waiting. Everything today cleared automatically.
              </Text>
            </Card>
          ) : (
            needsReview.map((c) => (
              <Card key={c.caseId} onPress={() => router.push(`/officer/case/${c.caseId}`)}>
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
                <Text variant="dataSm" tone="fog" style={{ marginTop: 6, fontSize: 12 }}>
                  {relativeTime(c.submittedAt)}
                </Text>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
