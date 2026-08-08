import { describe, expect, it } from 'vitest';

import { detectSignals, fallbackRiskLevel } from './signals.js';
import type { ApplicationInput } from './types.js';

const NOW = new Date('2026-08-08T10:00:00Z');

/** A clean, coherent applicant. Nothing should trip. This is Kamran. */
function base(overrides: Partial<ApplicationInput> = {}): ApplicationInput {
  return {
    id: 'app-1',
    reference: 'PK-4471',
    cnic: '37405-1234567-1',
    fullName: 'Kamran Iqbal',
    dob: '1994-06-02',
    cnicExpiry: '2031-06-02',
    city: 'Rawalpindi',
    area: 'Liaquat Bazaar',
    residenceType: 'owned',
    yearsAtAddress: 4,
    employmentType: 'business_owner',
    employerName: 'Iqbal General Store',
    incomeSource: 'business',
    declaredIncomePkr: 85_000,
    accountPurpose: 'receive_business_payments',
    expectedVolumePkr: 150_000,
    expectedTxnCount: 60,
    counterparties: 'domestic',
    isPep: false,
    existingBankRelationship: true,
    submittedAt: NOW,
    meta: {
      deviceFingerprint: 'fp-kamran',
      agentPointId: 'RWP-114',
      sessionCity: 'Rawalpindi',
    },
    ...overrides,
  };
}

function names(app: ApplicationInput, recent: ApplicationInput[] = []): string[] {
  return detectSignals(app, recent, NOW).signals.map((s) => s.name);
}

describe('clean applicant', () => {
  it('trips nothing', () => {
    expect(names(base())).toEqual([]);
  });

  it('is scored low risk by the fallback', () => {
    expect(fallbackRiskLevel([]).riskLevel).toBe('low');
  });
});

describe('1 · income–volume mismatch', () => {
  it('trips above 3x and reports the real ratio', () => {
    const { signals } = detectSignals(
      base({ declaredIncomePkr: 45_000, expectedVolumePkr: 400_000 }),
      [],
      NOW,
    );
    const s = signals.find((x) => x.name === 'income_volume_mismatch');
    expect(s?.severity).toBe('high');
    expect(s?.evidence).toContain('45,000');
    expect(s?.evidence).toContain('400,000');
    expect(s?.evidence).toContain('8.9×');
  });

  it('does not trip at or below 3x', () => {
    expect(names(base({ declaredIncomePkr: 100_000, expectedVolumePkr: 300_000 }))).not.toContain(
      'income_volume_mismatch',
    );
  });

  it('reads two fields', () => {
    const { signals } = detectSignals(
      base({ declaredIncomePkr: 20_000, expectedVolumePkr: 500_000 }),
      [],
      NOW,
    );
    expect(signals[0]?.fields.length).toBeGreaterThanOrEqual(2);
  });
});

describe('2 · purpose–employment conflict', () => {
  it('trips for a student collecting merchant payments', () => {
    expect(
      names(
        base({
          employmentType: 'student',
          incomeSource: 'remittance',
          accountPurpose: 'merchant_collection',
        }),
      ),
    ).toContain('purpose_employment_conflict');
  });

  it('does not trip for a business owner receiving business payments', () => {
    expect(names(base())).not.toContain('purpose_employment_conflict');
  });
});

describe('3 · source–employment conflict', () => {
  it('trips for salaried with business income', () => {
    const { signals } = detectSignals(
      base({ employmentType: 'salaried', incomeSource: 'business' }),
      [],
      NOW,
    );
    const s = signals.find((x) => x.name === 'source_employment_conflict');
    expect(s?.evidence).toContain('salaried');
    expect(s?.evidence).toContain('business');
  });

  it('does not trip for salaried with salary income', () => {
    expect(
      names(base({ employmentType: 'salaried', incomeSource: 'salary' })),
    ).not.toContain('source_employment_conflict');
  });
});

describe('4 · age–profile implausibility', () => {
  it('trips for a 19-year-old business owner', () => {
    expect(names(base({ dob: '2007-01-01', declaredIncomePkr: 500_000 }))).toContain(
      'age_profile_implausibility',
    );
  });

  it('does not trip for an adult business owner', () => {
    expect(names(base())).not.toContain('age_profile_implausibility');
  });
});

describe('5 · address instability', () => {
  it('trips for a new address with no banking history', () => {
    const { signals } = detectSignals(
      base({ yearsAtAddress: 0.25, existingBankRelationship: false }),
      [],
      NOW,
    );
    const s = signals.find((x) => x.name === 'address_instability');
    expect(s?.evidence).toContain('3 months');
  });

  it('does not trip when the applicant already banks somewhere', () => {
    expect(
      names(base({ yearsAtAddress: 0.25, existingBankRelationship: true })),
    ).not.toContain('address_instability');
  });
});

describe('6 · geographic mismatch', () => {
  it('trips when the session city differs from the declared city', () => {
    expect(
      names(base({ meta: { ...base().meta, sessionCity: 'Quetta' } })),
    ).toContain('geographic_mismatch');
  });

  it('ignores case and whitespace', () => {
    expect(
      names(base({ meta: { ...base().meta, sessionCity: '  rawalpindi ' } })),
    ).not.toContain('geographic_mismatch');
  });
});

describe('9 · cross-border with low income', () => {
  it('trips for international intent under the income floor', () => {
    expect(
      names(base({ counterparties: 'international', declaredIncomePkr: 45_000 })),
    ).toContain('cross_border_low_income');
  });

  it('does not trip for a higher earner', () => {
    expect(
      names(base({ counterparties: 'international', declaredIncomePkr: 250_000 })),
    ).not.toContain('cross_border_low_income');
  });
});

describe('10 · CNIC expiry', () => {
  it('flags an expired CNIC as high severity', () => {
    const { signals } = detectSignals(base({ cnicExpiry: '2026-07-01' }), [], NOW);
    const s = signals.find((x) => x.name === 'cnic_expiry');
    expect(s?.severity).toBe('high');
    expect(s?.evidence).toContain('expired');
  });

  it('flags an imminent expiry as low severity', () => {
    const { signals } = detectSignals(base({ cnicExpiry: '2026-08-20' }), [], NOW);
    expect(signals.find((x) => x.name === 'cnic_expiry')?.severity).toBe('low');
  });
});

describe('11 · PEP declaration', () => {
  it('trips when self-declared', () => {
    expect(names(base({ isPep: true }))).toContain('pep_declaration');
  });
});

describe('12 · round-number income', () => {
  it('trips on an exact round figure, at low severity', () => {
    const { signals } = detectSignals(base({ declaredIncomePkr: 300_000 }), [], NOW);
    expect(signals.find((x) => x.name === 'round_number_income')?.severity).toBe('low');
  });

  it('does not trip on an ordinary figure', () => {
    expect(names(base({ declaredIncomePkr: 85_500 }))).not.toContain('round_number_income');
  });
});

/* ───────────── the two that only exist across applications ───────── */

describe('8 · device reuse', () => {
  const shared = 'fp-shared-device';

  it('trips when one device submits under different CNICs', () => {
    const a = base({ id: 'a', cnic: '11111-1111111-1', meta: { ...base().meta, deviceFingerprint: shared } });
    const b = base({ id: 'b', cnic: '22222-2222222-2', meta: { ...base().meta, deviceFingerprint: shared } });

    const { signals, clusters } = detectSignals(a, [b], NOW);
    const s = signals.find((x) => x.name === 'device_reuse');

    expect(s?.severity).toBe('high');
    expect(s?.evidence).toContain('2 different CNICs');
    expect(clusters[0]?.kind).toBe('device_reuse');
    expect(clusters[0]?.applicationIds).toContain('b');
  });

  it('does not trip for the same person resubmitting', () => {
    const a = base({ id: 'a', cnic: '11111-1111111-1', meta: { ...base().meta, deviceFingerprint: shared } });
    const b = base({ id: 'b', cnic: '11111-1111111-1', meta: { ...base().meta, deviceFingerprint: shared } });
    expect(names(a, [b])).not.toContain('device_reuse');
  });

  it('is invisible when scored in isolation — the whole point', () => {
    const a = base({ id: 'a', meta: { ...base().meta, deviceFingerprint: shared } });
    expect(names(a, [])).not.toContain('device_reuse');
  });
});

describe('7 · agent-point clustering', () => {
  function atAgent(id: string, minutesAgo: number): ApplicationInput {
    return base({
      id,
      cnic: `3740${id}-1234567-1`,
      declaredIncomePkr: 60_000,
      employmentType: 'self_employed',
      incomeSource: 'business',
      accountPurpose: 'receive_business_payments',
      submittedAt: new Date(NOW.getTime() - minutesAgo * 60_000),
      meta: { ...base().meta, agentPointId: 'RWP-114', deviceFingerprint: `fp-${id}` },
    });
  }

  it('trips on three near-identical applications inside the window', () => {
    const a = atAgent('1', 0);
    const recent = [atAgent('2', 40), atAgent('3', 90)];

    const { signals, clusters } = detectSignals(a, recent, NOW);
    const s = signals.find((x) => x.name === 'agent_point_clustering');

    expect(s?.severity).toBe('high');
    expect(s?.evidence).toContain('3 near-identical');
    expect(s?.evidence).toContain('RWP-114');
    expect(clusters[0]?.applicationIds).toHaveLength(3);
  });

  it('does not trip on a busy agent with dissimilar applicants', () => {
    const a = atAgent('1', 0);
    const dissimilar = [
      base({ id: '2', employmentType: 'salaried', incomeSource: 'salary', declaredIncomePkr: 200_000, submittedAt: new Date(NOW.getTime() - 40 * 60_000) }),
      base({ id: '3', employmentType: 'student', incomeSource: 'remittance', declaredIncomePkr: 15_000, submittedAt: new Date(NOW.getTime() - 60 * 60_000) }),
    ];
    expect(names(a, dissimilar)).not.toContain('agent_point_clustering');
  });

  it('does not trip outside the time window', () => {
    const a = atAgent('1', 0);
    const old = [atAgent('2', 400), atAgent('3', 500)];
    expect(names(a, old)).not.toContain('agent_point_clustering');
  });

  it('assigns the same cluster ref to the same agent point', () => {
    const first = detectSignals(atAgent('1', 0), [atAgent('2', 30), atAgent('3', 60)], NOW);
    const second = detectSignals(atAgent('4', 0), [atAgent('5', 30), atAgent('6', 60)], NOW);
    expect(first.clusters[0]?.ref).toBe(second.clusters[0]?.ref);
  });
});

/* ─────────────────────────── the personas ────────────────────────── */

describe('personas from docs/03-USE-CASES.md', () => {
  it('Kamran is clean', () => {
    expect(names(base())).toEqual([]);
  });

  it('Bilal trips four signals and scores high', () => {
    const bilal = base({
      id: 'bilal',
      dob: '2004-02-11',
      employmentType: 'salaried',
      incomeSource: 'business',
      declaredIncomePkr: 45_000,
      expectedVolumePkr: 400_000,
      counterparties: 'international',
      yearsAtAddress: 0.25,
      existingBankRelationship: false,
      accountPurpose: 'receive_business_payments',
    });

    const found = names(bilal);
    expect(found).toContain('income_volume_mismatch');
    expect(found).toContain('source_employment_conflict');
    expect(found).toContain('cross_border_low_income');
    expect(found).toContain('address_instability');

    const { signals } = detectSignals(bilal, [], NOW);
    expect(fallbackRiskLevel(signals).riskLevel).toBe('high');
  });

  it('cluster members look clean alone but score high together', () => {
    const device = 'fp-ring';
    const make = (id: string, cnic: string, minutesAgo: number) =>
      base({
        id,
        cnic,
        declaredIncomePkr: 60_000,
        expectedVolumePkr: 120_000,
        employmentType: 'self_employed',
        incomeSource: 'business',
        accountPurpose: 'receive_business_payments',
        submittedAt: new Date(NOW.getTime() - minutesAgo * 60_000),
        meta: { deviceFingerprint: device, agentPointId: 'RWP-114', sessionCity: 'Rawalpindi' },
      });

    const a = make('r1', '11111-1111111-1', 0);
    const ring = [make('r2', '22222-2222222-2', 25), make('r3', '33333-3333333-3', 55)];

    // Alone: nothing.
    expect(names(a, [])).toEqual([]);
    expect(fallbackRiskLevel(detectSignals(a, [], NOW).signals).riskLevel).toBe('low');

    // Together: two high-severity cross-application signals.
    const found = names(a, ring);
    expect(found).toContain('device_reuse');
    expect(found).toContain('agent_point_clustering');
    expect(fallbackRiskLevel(detectSignals(a, ring, NOW).signals).riskLevel).toBe('high');
  });
});

describe('ordering', () => {
  it('puts high-severity signals first', () => {
    const { signals } = detectSignals(
      base({
        employmentType: 'salaried',
        incomeSource: 'business',
        isPep: true,
        declaredIncomePkr: 45_000,
        expectedVolumePkr: 400_000,
      }),
      [],
      NOW,
    );
    expect(signals[0]?.severity).toBe('high');
    expect(signals.at(-1)?.severity).not.toBe('high');
  });
});
