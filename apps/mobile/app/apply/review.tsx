import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { color, formatPkr, humanize, radius, space } from '@parakh/tokens';

import { Card, DetailRow, StepScreen, Text } from '@/ui';
import { ApiError, submitApplication, type ApplicationPayload } from '@/lib/api';
import { AGENT_POINT_ID } from '@/lib/config';
import { useDraft } from '@/lib/draft';

/**
 * Device fingerprint.
 *
 * A real deployment would use hardware attestation. Here it is stable per app
 * install, which is exactly what the cluster signals need: a fraud ring filing
 * four applications from one handset produces one fingerprint across four
 * CNICs, and that is the pattern no single form can reveal.
 */
let deviceFingerprint: string | null = null;
function getDeviceFingerprint(): string {
  if (!deviceFingerprint) {
    deviceFingerprint = `fp-${Math.random().toString(36).slice(2, 10)}`;
  }
  return deviceFingerprint;
}

function Section({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: space.sm }}>
        <Text variant="micro" style={{ flex: 1 }}>
          {title}
        </Text>
        <Pressable onPress={() => router.push(href as never)} hitSlop={8}>
          <Text variant="caption" style={{ textDecorationLine: 'underline' }}>
            Edit
          </Text>
        </Pressable>
      </View>
      {children}
    </Card>
  );
}

/** A6 · Review & submit */
export default function Review() {
  const { draft, reset } = useDraft();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      const payload: ApplicationPayload = {
        cnic: draft.cnic!,
        fullName: draft.fullName!,
        dob: draft.dob!,
        cnicExpiry: draft.cnicExpiry!,
        city: draft.city!,
        area: draft.area!,
        residenceType: draft.residenceType!,
        yearsAtAddress: draft.yearsAtAddress!,
        employmentType: draft.employmentType!,
        employerName: draft.employerName ?? null,
        incomeSource: draft.incomeSource!,
        declaredIncomePkr: draft.declaredIncomePkr!,
        accountPurpose: draft.accountPurpose!,
        expectedVolumePkr: draft.expectedVolumePkr!,
        expectedTxnCount: draft.expectedTxnCount!,
        counterparties: draft.counterparties!,
        isPep: draft.isPep ?? false,
        existingBankRelationship: draft.existingBankRelationship ?? false,
        meta: {
          deviceFingerprint: getDeviceFingerprint(),
          agentPointId: AGENT_POINT_ID,
          sessionCity: draft.city ?? null,
          secondsPerStep: draft.stepTimings,
        },
      };

      const receipt = await submitApplication(payload);
      reset();
      router.replace({
        pathname: '/apply/submitted',
        params: { reference: receipt.reference, status: receipt.status },
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.issues?.length
            ? `${err.issues[0]!.field}: ${err.issues[0]!.message}`
            : err.message,
        );
      } else {
        setError('Could not reach the server. Check your connection and try again.');
      }
      setBusy(false);
    }
  };

  return (
    <StepScreen
      step={5}
      stepLabel="Review"
      title="Check your details"
      subtitle="You can change anything before submitting."
      onContinue={submit}
      continueLabel="Submit application"
      canContinue={consent && !busy}
      busy={busy}
    >
      <Section title="Identity" href="/apply/identity">
        <DetailRow label="Name" value={draft.fullName ?? '—'} />
        <DetailRow label="CNIC" value={draft.cnic ?? '—'} mono />
        <DetailRow label="Date of birth" value={draft.dob ?? '—'} mono />
        <DetailRow label="CNIC expiry" value={draft.cnicExpiry ?? '—'} mono />
      </Section>

      <Section title="Address" href="/apply/address">
        <DetailRow label="City" value={draft.city ?? '—'} />
        <DetailRow label="Area" value={draft.area ?? '—'} />
        <DetailRow label="Residence" value={humanize(draft.residenceType ?? '—')} />
        <DetailRow label="Years there" value={String(draft.yearsAtAddress ?? '—')} mono />
      </Section>

      <Section title="Work & income" href="/apply/work">
        <DetailRow label="Employment" value={humanize(draft.employmentType ?? '—')} />
        {draft.employerName ? <DetailRow label="Employer" value={draft.employerName} /> : null}
        <DetailRow label="Income source" value={humanize(draft.incomeSource ?? '—')} />
        <DetailRow
          label="Monthly income"
          value={draft.declaredIncomePkr ? `PKR ${formatPkr(draft.declaredIncomePkr)}` : '—'}
          mono
        />
      </Section>

      <Section title="Account purpose" href="/apply/purpose">
        <DetailRow label="Purpose" value={humanize(draft.accountPurpose ?? '—')} />
        <DetailRow
          label="Expected volume"
          value={draft.expectedVolumePkr ? `PKR ${formatPkr(draft.expectedVolumePkr)}/mo` : '—'}
          mono
        />
        <DetailRow label="Transactions" value={`${draft.expectedTxnCount ?? '—'}/mo`} mono />
        <DetailRow label="Counterparties" value={humanize(draft.counterparties ?? '—')} />
        <DetailRow label="Existing bank" value={draft.existingBankRelationship ? 'Yes' : 'No'} />
        <DetailRow label="Politically exposed" value={draft.isPep ? 'Yes' : 'No'} />
      </Section>

      <Pressable
        onPress={() => setConsent((c) => !c)}
        style={{ flexDirection: 'row', gap: space.md, alignItems: 'flex-start' }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: color.vastInk,
            backgroundColor: consent ? color.vastInk : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 2,
          }}
        >
          {consent && (
            <Text variant="caption" style={{ color: color.lumenCream, lineHeight: 14 }}>
              ✓
            </Text>
          )}
        </View>
        <Text variant="caption" tone="charcoal" style={{ flex: 1 }}>
          I confirm these details are accurate and consent to them being verified.
        </Text>
      </Pressable>

      {error ? (
        <View
          style={{
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
    </StepScreen>
  );
}
