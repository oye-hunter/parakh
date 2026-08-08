import { useState } from 'react';
import { router } from 'expo-router';

import { Choice, Field, StepScreen } from '@/ui';
import { parseAmount, useDraft } from '@/lib/draft';

const PURPOSE = [
  { value: 'personal_use' as const, label: 'Personal use' },
  { value: 'savings' as const, label: 'Savings' },
  { value: 'receive_business_payments' as const, label: 'Business payments' },
  { value: 'receive_remittance' as const, label: 'Remittance' },
  { value: 'merchant_collection' as const, label: 'Merchant collection' },
];

const COUNTERPARTIES = [
  { value: 'domestic' as const, label: 'Within Pakistan' },
  { value: 'international' as const, label: 'International too' },
];

const PEP = [
  { value: 'no' as const, label: 'No' },
  { value: 'yes' as const, label: 'Yes' },
];

/** A5 · Account purpose and expected activity */
export default function Purpose() {
  const { draft, update } = useDraft();

  const [accountPurpose, setAccountPurpose] = useState(draft.accountPurpose ?? null);
  const [volume, setVolume] = useState(
    draft.expectedVolumePkr != null ? String(draft.expectedVolumePkr) : '',
  );
  const [txnCount, setTxnCount] = useState(
    draft.expectedTxnCount != null ? String(draft.expectedTxnCount) : '',
  );
  const [counterparties, setCounterparties] = useState(draft.counterparties ?? null);
  const [isPep, setIsPep] = useState<'yes' | 'no'>(draft.isPep ? 'yes' : 'no');
  const [hasBank, setHasBank] = useState<'yes' | 'no'>(
    draft.existingBankRelationship ? 'yes' : 'no',
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const next: Record<string, string> = {};
    if (!accountPurpose) next.accountPurpose = 'Choose one';
    if (!counterparties) next.counterparties = 'Choose one';

    const v = parseAmount(volume);
    if (v == null || v === 0) next.volume = 'Roughly how much will move through the account';

    const c = parseAmount(txnCount);
    if (c == null) next.txnCount = 'Roughly how many transactions a month';

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    update({
      accountPurpose: accountPurpose!,
      expectedVolumePkr: v!,
      expectedTxnCount: Math.round(c!),
      counterparties: counterparties!,
      isPep: isPep === 'yes',
      existingBankRelationship: hasBank === 'yes',
    });
    router.push('/apply/review');
  };

  return (
    <StepScreen
      step={4}
      stepLabel="Account purpose"
      title="How you will use it"
      subtitle="Estimates are fine."
      onContinue={submit}
    >
      <Choice
        label="What is the account for"
        value={accountPurpose}
        options={PURPOSE}
        onChange={setAccountPurpose}
        error={errors.accountPurpose}
      />
      <Field
        label="Expected monthly volume (PKR)"
        value={volume}
        onChangeText={setVolume}
        placeholder="150000"
        keyboardType="number-pad"
        mono
        error={errors.volume}
      />
      <Field
        label="Transactions per month"
        value={txnCount}
        onChangeText={setTxnCount}
        placeholder="60"
        keyboardType="number-pad"
        mono
        error={errors.txnCount}
      />
      <Choice
        label="Who will you send and receive from"
        value={counterparties}
        options={COUNTERPARTIES}
        onChange={setCounterparties}
        error={errors.counterparties}
      />
      <Choice
        label="Do you already have a bank account"
        value={hasBank}
        options={[
          { value: 'yes' as const, label: 'Yes' },
          { value: 'no' as const, label: 'No' },
        ]}
        onChange={setHasBank}
      />
      <Choice
        label="Are you a politically exposed person"
        value={isPep}
        options={PEP}
        onChange={setIsPep}
      />
    </StepScreen>
  );
}
