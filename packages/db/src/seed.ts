/**
 * Seed 25 applicant profiles.
 *
 *   pnpm db:seed              deterministic scoring, instant, free
 *   pnpm db:seed --with-ai    real Groq reasoning on every profile (~1 min)
 *
 * Data is hand-written rather than generated so the demo is reproducible: the
 * same 25 applicants, the same signals, the same cluster, every run.
 *
 * The four cluster members are the point. Individually each one is clean —
 * ordinary income, coherent employment, nothing tripped. Only the shared device
 * fingerprint and the burst from one agent point make them high risk, and that
 * is a judgment no per-form rule can reach.
 */
import { detectSignals, fallbackRiskLevel, profileRisk } from '@parakh/core';
import type { ApplicationInput } from '@parakh/core';

import { db } from './client.js';
import {
  applicationMeta,
  applications,
  cases,
  clusters,
  decisions,
  user,
  riskProfiles,
  signals as signalsTable,
  type NewApplication,
} from './schema.js';

const WITH_AI = process.argv.includes('--with-ai');
const NOW = new Date();

/** minutes ago → Date */
const ago = (m: number) => new Date(NOW.getTime() - m * 60_000);

type Profile = Omit<NewApplication, 'id' | 'reference' | 'createdAt' | 'declaredIncomePkr' | 'expectedVolumePkr'> & {
  declaredIncomePkr: number;
  expectedVolumePkr: number;
  device: string;
  agent: string;
  sessionCity: string;
  minutesAgo: number;
};

/* ─────────────────────────── the 25 profiles ─────────────────────── */

const CLEAN: Profile[] = [
  {
    cnic: '37405-1234567-1', fullName: 'Kamran Iqbal', dob: '1994-06-02', cnicExpiry: '2031-06-02',
    city: 'Rawalpindi', area: 'Liaquat Bazaar', residenceType: 'owned', yearsAtAddress: 4,
    employmentType: 'business_owner', employerName: 'Iqbal General Store', incomeSource: 'business',
    declaredIncomePkr: 85_000, accountPurpose: 'receive_business_payments',
    expectedVolumePkr: 150_000, expectedTxnCount: 60, counterparties: 'domestic',
    isPep: false, existingBankRelationship: true,
    device: 'fp-a11f', agent: 'RWP-114', sessionCity: 'Rawalpindi', minutesAgo: 35,
  },
  {
    cnic: '42101-9988776-5', fullName: 'Ayesha Siddiqui', dob: '1990-11-18', cnicExpiry: '2029-11-18',
    city: 'Karachi', area: 'Gulshan-e-Iqbal', residenceType: 'owned', yearsAtAddress: 7,
    employmentType: 'salaried', employerName: 'Habib Metro Bank', incomeSource: 'salary',
    declaredIncomePkr: 165_000, accountPurpose: 'savings',
    expectedVolumePkr: 90_000, expectedTxnCount: 18, counterparties: 'domestic',
    isPep: false, existingBankRelationship: true,
    device: 'fp-b22c', agent: 'KHI-207', sessionCity: 'Karachi', minutesAgo: 90,
  },
  {
    cnic: '35202-4455667-3', fullName: 'Usman Tariq', dob: '1988-02-27', cnicExpiry: '2030-02-27',
    city: 'Lahore', area: 'Model Town', residenceType: 'owned', yearsAtAddress: 11,
    employmentType: 'salaried', employerName: 'Netsol Technologies', incomeSource: 'salary',
    declaredIncomePkr: 240_000, accountPurpose: 'personal_use',
    expectedVolumePkr: 120_000, expectedTxnCount: 25, counterparties: 'domestic',
    isPep: false, existingBankRelationship: true,
    device: 'fp-c33d', agent: 'LHR-041', sessionCity: 'Lahore', minutesAgo: 150,
  },
  {
    cnic: '61101-2233445-7', fullName: 'Hina Zafar', dob: '1996-09-05', cnicExpiry: '2032-09-05',
    city: 'Islamabad', area: 'G-11', residenceType: 'rented', yearsAtAddress: 2.5,
    employmentType: 'freelancer', employerName: null, incomeSource: 'freelance',
    declaredIncomePkr: 195_000, accountPurpose: 'receive_remittance',
    expectedVolumePkr: 210_000, expectedTxnCount: 12, counterparties: 'international',
    isPep: false, existingBankRelationship: true,
    device: 'fp-d44e', agent: 'ISB-002', sessionCity: 'Islamabad', minutesAgo: 200,
  },
  {
    cnic: '33100-6677889-9', fullName: 'Bilal Hussain', dob: '1985-04-14', cnicExpiry: '2028-04-14',
    city: 'Faisalabad', area: 'Peoples Colony', residenceType: 'owned', yearsAtAddress: 9,
    employmentType: 'self_employed', employerName: 'Hussain Cloth House', incomeSource: 'business',
    declaredIncomePkr: 130_000, accountPurpose: 'receive_business_payments',
    expectedVolumePkr: 320_000, expectedTxnCount: 95, counterparties: 'domestic',
    isPep: false, existingBankRelationship: true,
    device: 'fp-e55f', agent: 'FSD-018', sessionCity: 'Faisalabad', minutesAgo: 260,
  },
  {
    cnic: '17301-1122334-1', fullName: 'Sana Gul', dob: '1999-01-22', cnicExpiry: '2033-01-22',
    city: 'Peshawar', area: 'University Town', residenceType: 'family', yearsAtAddress: 6,
    employmentType: 'salaried', employerName: 'Rehman Medical Institute', incomeSource: 'salary',
    declaredIncomePkr: 78_500, accountPurpose: 'personal_use',
    expectedVolumePkr: 45_000, expectedTxnCount: 20, counterparties: 'domestic',
    isPep: false, existingBankRelationship: true,
    device: 'fp-f66a', agent: 'PEW-055', sessionCity: 'Peshawar', minutesAgo: 320,
  },
  {
    cnic: '54400-9090901-3', fullName: 'Adnan Baloch', dob: '1992-07-30', cnicExpiry: '2029-07-30',
    city: 'Quetta', area: 'Jinnah Town', residenceType: 'rented', yearsAtAddress: 3,
    employmentType: 'salaried', employerName: 'PTCL', incomeSource: 'salary',
    declaredIncomePkr: 112_000, accountPurpose: 'savings',
    expectedVolumePkr: 60_000, expectedTxnCount: 14, counterparties: 'domestic',
    isPep: false, existingBankRelationship: true,
    device: 'fp-g77b', agent: 'QTA-009', sessionCity: 'Quetta', minutesAgo: 400,
  },
  {
    cnic: '38403-5566778-5', fullName: 'Fatima Noor', dob: '1997-12-11', cnicExpiry: '2031-12-11',
    city: 'Multan', area: 'Cantt', residenceType: 'family', yearsAtAddress: 8,
    employmentType: 'freelancer', employerName: null, incomeSource: 'freelance',
    declaredIncomePkr: 96_000, accountPurpose: 'receive_remittance',
    expectedVolumePkr: 105_000, expectedTxnCount: 8, counterparties: 'domestic',
    isPep: false, existingBankRelationship: true,
    device: 'fp-h88c', agent: 'MUX-023', sessionCity: 'Multan', minutesAgo: 480,
  },
  {
    cnic: '31202-3344556-7', fullName: 'Zeeshan Ali', dob: '1983-05-19', cnicExpiry: '2030-05-19',
    city: 'Bahawalpur', area: 'Model Town A', residenceType: 'owned', yearsAtAddress: 14,
    employmentType: 'business_owner', employerName: 'Ali Auto Parts', incomeSource: 'business',
    declaredIncomePkr: 210_000, accountPurpose: 'receive_business_payments',
    expectedVolumePkr: 480_000, expectedTxnCount: 140, counterparties: 'domestic',
    isPep: false, existingBankRelationship: true,
    device: 'fp-i99d', agent: 'BWP-012', sessionCity: 'Bahawalpur', minutesAgo: 560,
  },
  {
    cnic: '36302-7788990-1', fullName: 'Maria Yousaf', dob: '1993-08-08', cnicExpiry: '2032-08-08',
    city: 'Sialkot', area: 'Cantt', residenceType: 'rented', yearsAtAddress: 4.5,
    employmentType: 'salaried', employerName: 'Forward Sports', incomeSource: 'salary',
    declaredIncomePkr: 88_000, accountPurpose: 'personal_use',
    expectedVolumePkr: 52_000, expectedTxnCount: 22, counterparties: 'domestic',
    isPep: false, existingBankRelationship: true,
    device: 'fp-j10e', agent: 'SKT-031', sessionCity: 'Sialkot', minutesAgo: 640,
  },
  {
    cnic: '45504-1212121-3', fullName: 'Imran Shah', dob: '1979-03-03', cnicExpiry: '2027-03-03',
    city: 'Hyderabad', area: 'Latifabad', residenceType: 'owned', yearsAtAddress: 20,
    employmentType: 'retired', employerName: null, incomeSource: 'pension',
    declaredIncomePkr: 64_000, accountPurpose: 'savings',
    expectedVolumePkr: 30_000, expectedTxnCount: 6, counterparties: 'domestic',
    isPep: false, existingBankRelationship: true,
    device: 'fp-k11f', agent: 'HYD-007', sessionCity: 'Hyderabad', minutesAgo: 720,
  },
  {
    cnic: '13101-4545454-5', fullName: 'Naveed Khan', dob: '1991-10-25', cnicExpiry: '2029-10-25',
    city: 'Abbottabad', area: 'Supply Bazaar', residenceType: 'family', yearsAtAddress: 12,
    employmentType: 'self_employed', employerName: 'Khan Electronics', incomeSource: 'business',
    declaredIncomePkr: 74_000, accountPurpose: 'receive_business_payments',
    expectedVolumePkr: 190_000, expectedTxnCount: 70, counterparties: 'domestic',
    isPep: false, existingBankRelationship: true,
    device: 'fp-l12a', agent: 'ATD-004', sessionCity: 'Abbottabad', minutesAgo: 810,
  },
];

const BORDERLINE: Profile[] = [
  {
    // address instability only
    cnic: '42201-8080808-1', fullName: 'Rabia Aslam', dob: '1998-04-04', cnicExpiry: '2030-04-04',
    city: 'Karachi', area: 'North Nazimabad', residenceType: 'rented', yearsAtAddress: 0.25,
    employmentType: 'salaried', employerName: 'Systems Ltd', incomeSource: 'salary',
    declaredIncomePkr: 105_000, accountPurpose: 'personal_use',
    expectedVolumePkr: 70_000, expectedTxnCount: 20, counterparties: 'domestic',
    isPep: false, existingBankRelationship: false,
    device: 'fp-m13b', agent: 'KHI-207', sessionCity: 'Karachi', minutesAgo: 120,
  },
  {
    // income-volume 4.2x — medium
    cnic: '35201-6363636-7', fullName: 'Hamza Sheikh', dob: '1995-06-16', cnicExpiry: '2031-06-16',
    city: 'Lahore', area: 'Johar Town', residenceType: 'rented', yearsAtAddress: 2,
    employmentType: 'self_employed', employerName: 'Sheikh Traders', incomeSource: 'business',
    declaredIncomePkr: 90_000, accountPurpose: 'receive_business_payments',
    expectedVolumePkr: 380_000, expectedTxnCount: 110, counterparties: 'domestic',
    isPep: false, existingBankRelationship: true,
    device: 'fp-n14c', agent: 'LHR-041', sessionCity: 'Lahore', minutesAgo: 175,
  },
  {
    // geographic mismatch
    cnic: '61102-7474747-9', fullName: 'Saad Mehmood', dob: '1989-09-09', cnicExpiry: '2028-09-09',
    city: 'Islamabad', area: 'F-10', residenceType: 'owned', yearsAtAddress: 5,
    employmentType: 'salaried', employerName: 'Ufone', incomeSource: 'salary',
    declaredIncomePkr: 145_000, accountPurpose: 'personal_use',
    expectedVolumePkr: 80_000, expectedTxnCount: 16, counterparties: 'domestic',
    isPep: false, existingBankRelationship: true,
    device: 'fp-o15d', agent: 'LHR-041', sessionCity: 'Lahore', minutesAgo: 240,
  },
  {
    // PEP + round number
    cnic: '37401-1919191-1', fullName: 'Tahira Bukhari', dob: '1975-02-02', cnicExpiry: '2029-02-02',
    city: 'Rawalpindi', area: 'Bahria Town', residenceType: 'owned', yearsAtAddress: 6,
    employmentType: 'business_owner', employerName: 'Bukhari Estates', incomeSource: 'business',
    declaredIncomePkr: 400_000, accountPurpose: 'savings',
    expectedVolumePkr: 900_000, expectedTxnCount: 30, counterparties: 'domestic',
    isPep: true, existingBankRelationship: true,
    device: 'fp-p16e', agent: 'RWP-114', sessionCity: 'Rawalpindi', minutesAgo: 300,
  },
  {
    // CNIC expiring soon
    cnic: '33102-2626262-3', fullName: 'Waqar Younis', dob: '1987-07-07', cnicExpiry: expiryInDays(19),
    city: 'Faisalabad', area: 'Madina Town', residenceType: 'rented', yearsAtAddress: 3,
    employmentType: 'salaried', employerName: 'Chenab Group', incomeSource: 'salary',
    declaredIncomePkr: 82_000, accountPurpose: 'personal_use',
    expectedVolumePkr: 48_000, expectedTxnCount: 18, counterparties: 'domestic',
    isPep: false, existingBankRelationship: true,
    device: 'fp-q17f', agent: 'FSD-018', sessionCity: 'Faisalabad', minutesAgo: 380,
  },
];

const RISKY: Profile[] = [
  {
    // Bilal — the demo's high-risk applicant
    cnic: '61101-7654321-3', fullName: 'Bilal Ahmed', dob: '2004-02-11', cnicExpiry: '2031-02-11',
    city: 'Islamabad', area: 'Saddar', residenceType: 'rented', yearsAtAddress: 0.25,
    employmentType: 'salaried', employerName: 'Northline Traders', incomeSource: 'business',
    declaredIncomePkr: 45_000, accountPurpose: 'receive_business_payments',
    expectedVolumePkr: 400_000, expectedTxnCount: 80, counterparties: 'international',
    isPep: false, existingBankRelationship: false,
    device: 'fp-r18a', agent: 'ISB-002', sessionCity: 'Islamabad', minutesAgo: 14,
  },
  {
    // student running merchant collection
    cnic: '35203-3131313-5', fullName: 'Danish Raza', dob: '2005-11-30', cnicExpiry: '2032-11-30',
    city: 'Lahore', area: 'Garden Town', residenceType: 'family', yearsAtAddress: 0.3,
    employmentType: 'student', employerName: null, incomeSource: 'business',
    declaredIncomePkr: 30_000, accountPurpose: 'merchant_collection',
    expectedVolumePkr: 250_000, expectedTxnCount: 130, counterparties: 'domestic',
    isPep: false, existingBankRelationship: false,
    device: 'fp-s19b', agent: 'LHR-041', sessionCity: 'Lahore', minutesAgo: 55,
  },
  {
    // expired CNIC + cross-border on low income
    cnic: '42301-5757575-7', fullName: 'Junaid Farooq', dob: '1990-01-15', cnicExpiry: expiryInDays(-45),
    city: 'Karachi', area: 'Korangi', residenceType: 'rented', yearsAtAddress: 1,
    employmentType: 'freelancer', employerName: null, incomeSource: 'freelance',
    declaredIncomePkr: 55_000, accountPurpose: 'receive_remittance',
    expectedVolumePkr: 320_000, expectedTxnCount: 25, counterparties: 'international',
    isPep: false, existingBankRelationship: false,
    device: 'fp-t20c', agent: 'KHI-207', sessionCity: 'Karachi', minutesAgo: 100,
  },
  {
    // unemployed, business income, huge expected volume
    cnic: '17302-8484848-9', fullName: 'Sohail Aziz', dob: '2006-03-21', cnicExpiry: '2033-03-21',
    city: 'Peshawar', area: 'Hayatabad', residenceType: 'family', yearsAtAddress: 0.2,
    employmentType: 'unemployed', employerName: null, incomeSource: 'business',
    declaredIncomePkr: 25_000, accountPurpose: 'receive_business_payments',
    expectedVolumePkr: 300_000, expectedTxnCount: 90, counterparties: 'international',
    isPep: false, existingBankRelationship: false,
    device: 'fp-u21d', agent: 'PEW-055', sessionCity: 'Peshawar', minutesAgo: 165,
  },
];

/**
 * The cluster. Four applications, one agent point, one device, four CNICs,
 * inside a two-hour window.
 *
 * Every one of these is individually unremarkable — that is the entire point.
 * Run detectSignals on any of them with an empty `recent` array and nothing
 * trips.
 */
const CLUSTER_DEVICE = 'fp-ring-7c2';
const CLUSTER_AGENT = 'RWP-114';

const CLUSTER: Profile[] = [
  {
    cnic: '37402-1111111-1', fullName: 'Rizwan Latif', dob: '1993-03-12', cnicExpiry: '2030-03-12',
    city: 'Rawalpindi', area: 'Raja Bazaar', residenceType: 'rented', yearsAtAddress: 2,
    employmentType: 'self_employed', employerName: 'Latif Mobile Point', incomeSource: 'business',
    declaredIncomePkr: 62_000, accountPurpose: 'receive_business_payments',
    expectedVolumePkr: 130_000, expectedTxnCount: 45, counterparties: 'domestic',
    isPep: false, existingBankRelationship: true,
    device: CLUSTER_DEVICE, agent: CLUSTER_AGENT, sessionCity: 'Rawalpindi', minutesAgo: 108,
  },
  {
    cnic: '37402-2222222-3', fullName: 'Shahid Mahmood', dob: '1991-08-19', cnicExpiry: '2029-08-19',
    city: 'Rawalpindi', area: 'Raja Bazaar', residenceType: 'rented', yearsAtAddress: 3,
    employmentType: 'self_employed', employerName: 'Mahmood Traders', incomeSource: 'business',
    declaredIncomePkr: 58_000, accountPurpose: 'receive_business_payments',
    expectedVolumePkr: 125_000, expectedTxnCount: 40, counterparties: 'domestic',
    isPep: false, existingBankRelationship: true,
    device: CLUSTER_DEVICE, agent: CLUSTER_AGENT, sessionCity: 'Rawalpindi', minutesAgo: 74,
  },
  {
    cnic: '37402-3333333-5', fullName: 'Asif Nadeem', dob: '1995-05-07', cnicExpiry: '2031-05-07',
    city: 'Rawalpindi', area: 'Raja Bazaar', residenceType: 'rented', yearsAtAddress: 2.5,
    employmentType: 'self_employed', employerName: 'Nadeem Enterprises', incomeSource: 'business',
    declaredIncomePkr: 65_000, accountPurpose: 'receive_business_payments',
    expectedVolumePkr: 140_000, expectedTxnCount: 48, counterparties: 'domestic',
    isPep: false, existingBankRelationship: true,
    device: CLUSTER_DEVICE, agent: CLUSTER_AGENT, sessionCity: 'Rawalpindi', minutesAgo: 41,
  },
  {
    cnic: '37402-4444444-7', fullName: 'Tanveer Abbas', dob: '1990-12-01', cnicExpiry: '2028-12-01',
    city: 'Rawalpindi', area: 'Raja Bazaar', residenceType: 'rented', yearsAtAddress: 4,
    employmentType: 'self_employed', employerName: 'Abbas Mobile Centre', incomeSource: 'business',
    declaredIncomePkr: 60_000, accountPurpose: 'receive_business_payments',
    expectedVolumePkr: 128_000, expectedTxnCount: 42, counterparties: 'domestic',
    isPep: false, existingBankRelationship: true,
    device: CLUSTER_DEVICE, agent: CLUSTER_AGENT, sessionCity: 'Rawalpindi', minutesAgo: 9,
  },
];

function expiryInDays(days: number): string {
  return new Date(NOW.getTime() + days * 86_400_000).toISOString().slice(0, 10);
}

/* ────────────────────────────── run ──────────────────────────────── */

const ALL = [...CLEAN, ...BORDERLINE, ...RISKY, ...CLUSTER].sort(
  (a, b) => b.minutesAgo - a.minutesAgo, // oldest first, so clusters build up
);

function toInput(row: typeof applications.$inferSelect, p: Profile): ApplicationInput {
  return {
    id: row.id,
    reference: row.reference,
    cnic: row.cnic,
    fullName: row.fullName,
    dob: row.dob,
    cnicExpiry: row.cnicExpiry,
    city: row.city,
    area: row.area,
    residenceType: row.residenceType,
    yearsAtAddress: row.yearsAtAddress,
    employmentType: row.employmentType,
    employerName: row.employerName,
    incomeSource: row.incomeSource,
    declaredIncomePkr: Number(row.declaredIncomePkr),
    accountPurpose: row.accountPurpose,
    expectedVolumePkr: Number(row.expectedVolumePkr),
    expectedTxnCount: row.expectedTxnCount,
    counterparties: row.counterparties,
    isPep: row.isPep,
    existingBankRelationship: row.existingBankRelationship,
    submittedAt: ago(p.minutesAgo),
    meta: {
      deviceFingerprint: p.device,
      agentPointId: p.agent,
      sessionCity: p.sessionCity,
    },
  };
}

async function main() {
  console.log(`Seeding ${ALL.length} applications${WITH_AI ? ' with live Groq reasoning' : ''}…\n`);

  // Wipe in FK-safe order.
  await db.delete(decisions);
  await db.delete(cases);
  await db.delete(riskProfiles);
  await db.delete(signalsTable);
  await db.delete(clusters);
  await db.delete(applicationMeta);
  await db.delete(applications);

  // Officer accounts are NOT seeded here — they are Better Auth users with
  // hashed passwords, provisioned by `pnpm provision:officers`. Wiping them on
  // every reseed would sign everyone out mid-demo.

  const scored: ApplicationInput[] = [];
  const seenClusterRefs = new Set<string>();
  const tally = { low: 0, medium: 0, high: 0 };

  for (const [i, p] of ALL.entries()) {
    const [row] = await db
      .insert(applications)
      .values({
        reference: `PK-${4400 + i}`,
        cnic: p.cnic,
        fullName: p.fullName,
        dob: p.dob,
        cnicExpiry: p.cnicExpiry,
        city: p.city,
        area: p.area,
        residenceType: p.residenceType,
        yearsAtAddress: p.yearsAtAddress,
        employmentType: p.employmentType,
        employerName: p.employerName,
        incomeSource: p.incomeSource,
        declaredIncomePkr: String(p.declaredIncomePkr),
        accountPurpose: p.accountPurpose,
        expectedVolumePkr: String(p.expectedVolumePkr),
        expectedTxnCount: p.expectedTxnCount,
        counterparties: p.counterparties,
        isPep: p.isPep,
        existingBankRelationship: p.existingBankRelationship,
        createdAt: ago(p.minutesAgo),
      })
      .returning();

    if (!row) throw new Error('insert returned no row');

    await db.insert(applicationMeta).values({
      applicationId: row.id,
      deviceFingerprint: p.device,
      agentPointId: p.agent,
      sessionCity: p.sessionCity,
      submittedAt: ago(p.minutesAgo),
    });

    const input = toInput(row, p);
    const submittedAt = input.submittedAt;

    // Only applications that already existed at submission time are visible —
    // the same window the live route handler will use.
    const recent = scored.filter(
      (r) =>
        r.submittedAt <= submittedAt &&
        submittedAt.getTime() - r.submittedAt.getTime() <= 24 * 3_600_000,
    );

    const { signals, clusters: found } = detectSignals(input, recent, submittedAt);

    if (signals.length > 0) {
      await db.insert(signalsTable).values(
        signals.map((s) => ({
          applicationId: row.id,
          name: s.name,
          label: s.label,
          severity: s.severity,
          evidence: s.evidence,
          fields: s.fields,
          clusterRef: s.clusterRef ?? null,
          createdAt: submittedAt,
        })),
      );
    }

    for (const c of found) {
      if (seenClusterRefs.has(c.ref)) continue;
      seenClusterRefs.add(c.ref);
      await db.insert(clusters).values({
        ref: c.ref,
        kind: c.kind,
        agentPointId: c.agentPointId ?? null,
        deviceFingerprint: c.deviceFingerprint ?? null,
        applicationIds: c.applicationIds,
        summary: c.summary,
        detectedAt: submittedAt,
      });
    }

    const profile = WITH_AI
      ? await profileRisk(input, signals)
      : (() => {
          const { riskLevel, confidence } = fallbackRiskLevel(signals);
          return {
            riskLevel,
            confidence,
            reasoning: seedReasoning(signals.length, riskLevel),
            contributingSignals: signals.map((s) => ({
              name: s.name,
              label: s.label,
              weight: s.severity === 'high' ? 0.3 : s.severity === 'medium' ? 0.15 : 0.05,
              evidence: s.evidence,
            })),
            recommendedAction:
              riskLevel === 'high' ? 'edd_queue' : riskLevel === 'medium' ? 'manual_review' : 'auto_approve',
            model: 'seed-deterministic',
            latencyMs: 0,
          };
        })();

    await db.insert(riskProfiles).values({
      applicationId: row.id,
      riskLevel: profile.riskLevel,
      confidence: profile.confidence,
      reasoning: profile.reasoning,
      contributingSignals: profile.contributingSignals,
      recommendedAction: profile.recommendedAction,
      model: profile.model,
      latencyMs: profile.latencyMs,
      createdAt: submittedAt,
    });

    // Nothing is auto-approved: every application waits for an officer. Risk
    // decides urgency (edd_queue vs pending), never outcome.
    await db.insert(cases).values({
      applicationId: row.id,
      status: profile.riskLevel === 'high' ? 'edd_queue' : 'pending',
      queuedAt: submittedAt,
      resolvedAt: null,
      createdAt: submittedAt,
      updatedAt: submittedAt,
    });

    tally[profile.riskLevel]++;

    const badge = profile.riskLevel.toUpperCase().padEnd(6);
    const sig = signals.length ? `${signals.length} signal${signals.length === 1 ? '' : 's'}` : 'clean';
    console.log(`  ${row.reference}  ${badge} ${p.fullName.padEnd(20)} ${sig}`);

    scored.push(input);
  }

  console.log(`\nRisk distribution: ${tally.low} low · ${tally.medium} medium · ${tally.high} high`);
  console.log(`Clusters detected: ${seenClusterRefs.size}`);
  console.log('\nDone.');
}

function seedReasoning(signalCount: number, level: 'low' | 'medium' | 'high'): string {
  if (signalCount === 0) {
    return 'No cross-field checks tripped. Declared income, employment type, account purpose and expected activity are consistent with one another, and nothing was found across recent applications from the same device or agent point.';
  }
  if (level === 'high') {
    return 'Multiple checks tripped and they compound rather than repeat. Seeded with the deterministic scorer — re-run with --with-ai for the model-written explanation.';
  }
  return 'One or more checks tripped, each with a plausible innocent reading on its own. Seeded with the deterministic scorer — re-run with --with-ai for the model-written explanation.';
}

main().catch((err) => {
  console.error('\nSeed failed:', err);
  process.exit(1);
});
