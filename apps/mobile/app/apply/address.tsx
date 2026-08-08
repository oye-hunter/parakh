import { useState } from 'react';
import { router } from 'expo-router';

import { Choice, Field, StepScreen } from '@/ui';
import { parseAmount, useDraft } from '@/lib/draft';

const RESIDENCE = [
  { value: 'owned' as const, label: 'Owned' },
  { value: 'rented' as const, label: 'Rented' },
  { value: 'family' as const, label: 'Family home' },
];

/** A3 · Address */
export default function Address() {
  const { draft, update } = useDraft();

  const [city, setCity] = useState(draft.city ?? '');
  const [area, setArea] = useState(draft.area ?? '');
  const [residenceType, setResidenceType] = useState(draft.residenceType ?? null);
  const [years, setYears] = useState(
    draft.yearsAtAddress != null ? String(draft.yearsAtAddress) : '',
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const next: Record<string, string> = {};
    if (city.trim().length < 2) next.city = 'City is required';
    if (area.trim().length < 2) next.area = 'Area or locality is required';
    if (!residenceType) next.residenceType = 'Choose one';

    const y = parseAmount(years);
    if (y == null || y > 90) next.years = 'Enter a number of years, for example 2.5';

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    update({
      city: city.trim(),
      area: area.trim(),
      residenceType: residenceType!,
      yearsAtAddress: y!,
    });
    router.push('/apply/work');
  };

  return (
    <StepScreen
      step={2}
      stepLabel="Address"
      title="Where you live"
      onContinue={submit}
    >
      <Field
        label="City"
        value={city}
        onChangeText={setCity}
        placeholder="Rawalpindi"
        autoCapitalize="words"
        error={errors.city}
      />
      <Field
        label="Area or locality"
        value={area}
        onChangeText={setArea}
        placeholder="Liaquat Bazaar"
        autoCapitalize="words"
        error={errors.area}
      />
      <Choice
        label="Residence"
        value={residenceType}
        options={RESIDENCE}
        onChange={setResidenceType}
        error={errors.residenceType}
      />
      <Field
        label="Years at this address"
        value={years}
        onChangeText={setYears}
        placeholder="4"
        helper="Use a decimal for part of a year — 0.5 is six months"
        keyboardType="decimal-pad"
        mono
        error={errors.years}
      />
    </StepScreen>
  );
}
