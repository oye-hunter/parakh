import { useState } from 'react';
import { router } from 'expo-router';

import { Choice, Field, StepScreen } from '@/ui';
import { parseAmount, useDraft } from '@/lib/draft';

const EMPLOYMENT = [
  { value: 'salaried' as const, label: 'Salaried' },
  { value: 'self_employed' as const, label: 'Self-employed' },
  { value: 'business_owner' as const, label: 'Business owner' },
  { value: 'freelancer' as const, label: 'Freelancer' },
  { value: 'student' as const, label: 'Student' },
  { value: 'unemployed' as const, label: 'Unemployed' },
  { value: 'retired' as const, label: 'Retired' },
];

const SOURCE = [
  { value: 'salary' as const, label: 'Salary' },
  { value: 'business' as const, label: 'Business' },
  { value: 'freelance' as const, label: 'Freelance' },
  { value: 'remittance' as const, label: 'Remittance' },
  { value: 'agriculture' as const, label: 'Agriculture' },
  { value: 'pension' as const, label: 'Pension' },
  { value: 'other' as const, label: 'Other' },
];

/**
 * A4 · Work & income — the pattern screen.
 *
 * Note what is *not* here: no warning that a salaried applicant declaring
 * business income will be flagged. The applicant must not be taught how the
 * scoring works, or they learn to file a version that passes.
 */
export default function Work() {
  const { draft, update } = useDraft();

  const [employmentType, setEmploymentType] = useState(draft.employmentType ?? null);
  const [employerName, setEmployerName] = useState(draft.employerName ?? '');
  const [incomeSource, setIncomeSource] = useState(draft.incomeSource ?? null);
  const [income, setIncome] = useState(
    draft.declaredIncomePkr != null ? String(draft.declaredIncomePkr) : '',
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const needsEmployer =
    employmentType === 'salaried' ||
    employmentType === 'self_employed' ||
    employmentType === 'business_owner';

  const submit = () => {
    const next: Record<string, string> = {};
    if (!employmentType) next.employmentType = 'Choose one';
    if (!incomeSource) next.incomeSource = 'Choose one';
    if (needsEmployer && employerName.trim().length < 2) {
      next.employerName = 'Name of your employer or business';
    }

    const amount = parseAmount(income);
    if (amount == null || amount === 0) next.income = 'Enter your monthly income in rupees';

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    update({
      employmentType: employmentType!,
      employerName: needsEmployer ? employerName.trim() : null,
      incomeSource: incomeSource!,
      declaredIncomePkr: amount!,
    });
    router.push('/apply/purpose');
  };

  return (
    <StepScreen step={3} stepLabel="Work & income" title="What you do" onContinue={submit}>
      <Choice
        label="Employment"
        value={employmentType}
        options={EMPLOYMENT}
        onChange={setEmploymentType}
        error={errors.employmentType}
      />
      {needsEmployer && (
        <Field
          label="Employer or business name"
          value={employerName}
          onChangeText={setEmployerName}
          placeholder="Iqbal General Store"
          autoCapitalize="words"
          error={errors.employerName}
        />
      )}
      <Choice
        label="Main source of income"
        value={incomeSource}
        options={SOURCE}
        onChange={setIncomeSource}
        error={errors.incomeSource}
      />
      <Field
        label="Monthly income (PKR)"
        value={income}
        onChangeText={setIncome}
        placeholder="85000"
        keyboardType="number-pad"
        mono
        error={errors.income}
      />
    </StepScreen>
  );
}
