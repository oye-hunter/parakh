import { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import {
  border,
  color,
  formatPkr,
  humanize,
  layout,
  radius,
  relativeTime,
  space,
  surface,
} from '@parakh/tokens';

import {
  Button,
  Card,
  ClusterBanner,
  DecisionBar,
  DetailRow,
  EvidenceRow,
  Field,
  HeaderBand,
  ReasoningPanel,
  RiskBadge,
  StatusPill,
  Text,
} from '@/ui';
import { decide, getCase, type CaseDetail } from '@/lib/api';

type Action = 'approve' | 'reject' | 'escalate';

/**
 * The model's recommendation, in the officer's language.
 *
 * `auto_approve` is a legacy name from when low-risk applications opened
 * accounts on their own. Nothing is automatic now — it reads as a
 * recommendation to approve, and a human still has to make it true.
 */
const RECOMMENDATION: Record<string, string> = {
  auto_approve: 'Approve — nothing of concern found',
  manual_review: 'Review — something needs a second look',
  edd_queue: 'Enhanced due diligence — do not open without checks',
};

const ACTION_COPY: Record<Action, { title: string; cta: string; variant: 'approve' | 'reject' | 'escalate' }> = {
  approve: { title: 'Approve this application?', cta: 'Approve', variant: 'approve' },
  reject: { title: 'Reject this application?', cta: 'Reject', variant: 'reject' },
  escalate: { title: 'Escalate for senior review?', cta: 'Escalate', variant: 'escalate' },
};

/** O4 · Case detail, with the O5 decision sheet. */
export default function CaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const [data, setData] = useState<CaseDetail | null>(null);
  const [showDeclaration, setShowDeclaration] = useState(false);
  const [action, setAction] = useState<Action | null>(null);
  const [justification, setJustification] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await getCase(id));
    } catch (err) {
      if ((err as { status?: number }).status === 401) router.replace('/officer/sign-in');
      else setError('Could not load this case.');
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const commit = async () => {
    if (!action) return;
    setBusy(true);
    setError(null);
    try {
      await decide({ caseId: id, action, justification: justification.trim() });
      setAction(null);
      setJustification('');
      router.back();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  if (!data) {
    return (
      <View style={{ flex: 1, backgroundColor: surface.console }}>
        <HeaderBand title="Case" onBack={() => router.back()} />
        <View style={{ padding: layout.gutter }}>
          <Text variant="caption" tone={error ? 'riskHigh' : 'fog'}>
            {error ?? 'Loading…'}
          </Text>
        </View>
      </View>
    );
  }

  const a = data.applicant;
  const resolved = data.status === 'approved' || data.status === 'declined';

  return (
    <View style={{ flex: 1, backgroundColor: surface.console }}>
      <HeaderBand title={a.reference} onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={{ padding: layout.gutter, gap: space.base, paddingBottom: space.xxl }}
      >
        {/* Applicant summary */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.sm }}>
            <View style={{ flex: 1 }}>
              <Text variant="titleSm">{a.fullName}</Text>
              <Text variant="dataSm" tone="fog" style={{ marginTop: 2 }}>
                {a.cnic}
              </Text>
            </View>
            <StatusPill status={data.status} />
          </View>
          <Text variant="caption" tone="fog" style={{ marginTop: space.sm }}>
            {a.agentPointId} · {relativeTime(a.submittedAt)}
          </Text>
        </Card>

        {/* Risk + what the AI recommends. The officer confirms or overrides. */}
        {data.risk && (
          <View style={{ gap: space.md }}>
            <RiskBadge level={data.risk.level} confidence={data.risk.confidence} />

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.sm,
                borderRadius: radius.row,
                borderWidth: border.field,
                borderColor: color.vastInk,
                paddingVertical: space.md,
                paddingHorizontal: space.base,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text variant="micro">AI recommends</Text>
                <Text
                  variant="bodySm"
                  style={{ fontFamily: 'Archivo_600SemiBold', marginTop: 2 }}
                >
                  {RECOMMENDATION[data.risk.recommendedAction] ??
                    humanize(data.risk.recommendedAction)}
                </Text>
              </View>
              <Text variant="caption" tone="fog">
                yours to confirm
              </Text>
            </View>

            <Text variant="dataSm" tone="fog" style={{ fontSize: 12 }}>
              {data.risk.model}
              {data.risk.latencyMs != null ? ` · ${data.risk.latencyMs}ms` : ''}
            </Text>
          </View>
        )}

        {data.cluster ? <ClusterBanner summary={data.cluster.summary} /> : null}

        {/* Evidence — the screen this project is judged on */}
        {data.signals.length > 0 && (
          <View style={{ gap: space.sm }}>
            <Text variant="micro">
              Contributing signals ({data.signals.length})
            </Text>
            {data.signals.map((s) => (
              <EvidenceRow
                key={s.name + s.evidence}
                label={s.label}
                evidence={s.evidence}
                severity={s.severity}
              />
            ))}
          </View>
        )}

        {data.risk ? <ReasoningPanel>{data.risk.reasoning}</ReasoningPanel> : null}

        {/* Raw declaration, collapsed — lets the officer check any signal's source */}
        <Card onPress={() => setShowDeclaration((v) => !v)}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text variant="micro" style={{ flex: 1 }}>
              Applicant declaration
            </Text>
            <Text variant="caption" tone="fog">
              {showDeclaration ? 'Hide' : 'Show'}
            </Text>
          </View>

          {showDeclaration && (
            <View style={{ marginTop: space.md }}>
              <DetailRow label="Date of birth" value={a.dob} mono />
              <DetailRow label="CNIC expiry" value={a.cnicExpiry} mono />
              <DetailRow label="Address" value={`${a.area}, ${a.city}`} />
              <DetailRow label="Residence" value={humanize(a.residenceType)} />
              <DetailRow label="Years there" value={String(a.yearsAtAddress)} mono />
              <DetailRow label="Employment" value={humanize(a.employmentType)} />
              {a.employerName ? <DetailRow label="Employer" value={a.employerName} /> : null}
              <DetailRow label="Income source" value={humanize(a.incomeSource)} />
              <DetailRow label="Declared income" value={`PKR ${formatPkr(a.declaredIncomePkr)}/mo`} mono />
              <DetailRow label="Purpose" value={humanize(a.accountPurpose)} />
              <DetailRow label="Expected volume" value={`PKR ${formatPkr(a.expectedVolumePkr)}/mo`} mono />
              <DetailRow label="Transactions" value={`${a.expectedTxnCount}/mo`} mono />
              <DetailRow label="Counterparties" value={humanize(a.counterparties)} />
              <DetailRow label="Existing bank" value={a.existingBankRelationship ? 'Yes' : 'No'} />
              <DetailRow label="Politically exposed" value={a.isPep ? 'Yes' : 'No'} />
            </View>
          )}
        </Card>

        {/* Audit trail */}
        {data.history.length > 0 && (
          <View style={{ gap: space.sm }}>
            <Text variant="micro">Decision history</Text>
            {data.history.map((h) => (
              <Card key={h.decidedAt}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.sm }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodySm" style={{ fontFamily: 'Archivo_600SemiBold' }}>
                      {humanize(h.action)}d by {h.officer}
                    </Text>
                    <Text variant="dataSm" tone="fog" style={{ fontSize: 12, marginTop: 2 }}>
                      {relativeTime(h.decidedAt)}
                    </Text>
                  </View>
                  {/* Outlined: this is the snapshot from decision time, not live */}
                  <RiskBadge level={h.riskSnapshot} outline />
                </View>
                <Text variant="caption" tone="charcoal" style={{ marginTop: space.sm }}>
                  {h.justification}
                </Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {!resolved && (
        <DecisionBar
          onApprove={() => setAction('approve')}
          onEscalate={() => setAction('escalate')}
          onReject={() => setAction('reject')}
        />
      )}

      {/* O5 · Decision sheet */}
      <Modal visible={action !== null} transparent animationType="slide" onRequestClose={() => setAction(null)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(26,26,26,0.4)' }}
          onPress={() => !busy && setAction(null)}
        />
        <View
          style={{
            backgroundColor: surface.card,
            borderTopLeftRadius: radius.section,
            borderTopRightRadius: radius.section,
            borderWidth: border.heavy,
            borderColor: color.vastInk,
            padding: layout.gutter,
            paddingBottom: insets.bottom + space.lg,
            gap: space.base,
          }}
        >
          <Text variant="titleSm">{action ? ACTION_COPY[action].title : ''}</Text>

          <Field
            label="Justification"
            value={justification}
            onChangeText={setJustification}
            placeholder="What did you verify, and what did you conclude?"
            helper="Recorded in the audit trail. At least 10 characters."
          />

          {error ? (
            <Text variant="caption" tone="riskHigh">
              {error}
            </Text>
          ) : null}

          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <Button
              label="Cancel"
              variant="outlined"
              onPress={() => setAction(null)}
              disabled={busy}
              style={{ flex: 1 }}
            />
            <Button
              label={action ? ACTION_COPY[action].cta : ''}
              variant={action ? ACTION_COPY[action].variant : 'primary'}
              onPress={commit}
              loading={busy}
              disabled={justification.trim().length < 10}
              style={{ flex: 1.4 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
