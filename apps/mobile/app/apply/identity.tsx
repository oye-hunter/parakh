import { useState } from 'react';
import { router } from 'expo-router';

import { Field, StepScreen } from '@/ui';
import { CNIC_PATTERN, formatCnic, normaliseDate, useDraft } from '@/lib/draft';

/** A2 · Identity */
export default function Identity() {
  const { draft, update } = useDraft();

  const [cnic, setCnic] = useState(draft.cnic ?? '');
  const [fullName, setFullName] = useState(draft.fullName ?? '');
  const [dob, setDob] = useState(draft.dob ?? '');
  const [cnicExpiry, setCnicExpiry] = useState(draft.cnicExpiry ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const next: Record<string, string> = {};

    if (!CNIC_PATTERN.test(cnic)) next.cnic = 'CNIC must be 13 digits';
    if (fullName.trim().length < 2) next.fullName = 'Enter your full name as it appears on your CNIC';

    const dobIso = normaliseDate(dob);
    if (!dobIso) next.dob = 'Use the format YYYY-MM-DD';

    const expiryIso = normaliseDate(cnicExpiry);
    if (!expiryIso) next.cnicExpiry = 'Use the format YYYY-MM-DD';

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    update({ cnic, fullName: fullName.trim(), dob: dobIso!, cnicExpiry: expiryIso! });
    router.push('/apply/address');
  };

  return (
    <StepScreen
      step={1}
      stepLabel="Identity"
      title="Who you are"
      subtitle="Exactly as printed on your CNIC."
      onContinue={submit}
    >
      <Field
        label="CNIC number"
        value={cnic}
        onChangeText={(v) => setCnic(formatCnic(v))}
        placeholder="00000-0000000-0"
        keyboardType="number-pad"
        maxLength={15}
        mono
        error={errors.cnic}
      />
      <Field
        label="Full name"
        value={fullName}
        onChangeText={setFullName}
        placeholder="Kamran Iqbal"
        autoCapitalize="words"
        error={errors.fullName}
      />
      <Field
        label="Date of birth"
        value={dob}
        onChangeText={setDob}
        placeholder="1994-06-02"
        helper="Year, month, day"
        keyboardType="numbers-and-punctuation"
        maxLength={10}
        mono
        error={errors.dob}
      />
      <Field
        label="CNIC expiry"
        value={cnicExpiry}
        onChangeText={setCnicExpiry}
        placeholder="2031-06-02"
        keyboardType="numbers-and-punctuation"
        maxLength={10}
        mono
        error={errors.cnicExpiry}
      />
    </StepScreen>
  );
}
