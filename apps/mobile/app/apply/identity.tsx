import { useState } from 'react';
import { router } from 'expo-router';

import { DatePickerField, Field, StepScreen } from '@/ui';
import { CNIC_PATTERN, formatCnic, normaliseDate, useDraft } from '@/lib/draft';

/** A2 · Identity */
export default function Identity() {
  const { draft, update } = useDraft();

  const [cnic, setCnic] = useState(draft.cnic ?? '');
  const [fullName, setFullName] = useState(draft.fullName ?? '');
  const [dob, setDob] = useState(draft.dob ?? '');
  const [cnicExpiry, setCnicExpiry] = useState(draft.cnicExpiry ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCnicChange = (v: string) => {
    // Automatically format digits as 00000-0000000-0
    const formatted = formatCnic(v);
    setCnic(formatted);
    if (errors.cnic) setErrors((prev) => ({ ...prev, cnic: '' }));
  };

  const submit = () => {
    const next: Record<string, string> = {};

    if (!CNIC_PATTERN.test(cnic)) next.cnic = 'CNIC must be 13 digits (00000-0000000-0)';
    if (fullName.trim().length < 2) next.fullName = 'Enter your full name as it appears on your CNIC';

    const dobIso = normaliseDate(dob);
    if (!dobIso) next.dob = 'Select a valid Date of Birth';

    const expiryIso = normaliseDate(cnicExpiry);
    if (!expiryIso) next.cnicExpiry = 'Select a valid CNIC expiry date';

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
        onChangeText={handleCnicChange}
        placeholder="00000-0000000-0"
        keyboardType="number-pad"
        maxLength={15}
        mono
        helper="Enter 13 digits — hyphens are added automatically"
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
      <DatePickerField
        label="Date of birth"
        value={dob}
        onChangeDate={(d) => {
          setDob(d);
          if (errors.dob) setErrors((prev) => ({ ...prev, dob: '' }));
        }}
        placeholder="YYYY-MM-DD"
        helper="Tap to select from calendar or year revolver wheel"
        minYear={1940}
        maxYear={2015}
        error={errors.dob}
      />
      <DatePickerField
        label="CNIC expiry"
        value={cnicExpiry}
        onChangeDate={(d) => {
          setCnicExpiry(d);
          if (errors.cnicExpiry) setErrors((prev) => ({ ...prev, cnicExpiry: '' }));
        }}
        placeholder="YYYY-MM-DD"
        helper="Tap to select expiry date"
        minYear={2020}
        maxYear={2040}
        error={errors.cnicExpiry}
      />
    </StepScreen>
  );
}
