import type { ApplicationInput } from '@parakh/core';
import type { Application, ApplicationMeta } from '@parakh/db';

/**
 * Drizzle row → signal-engine input.
 *
 * The engine is deliberately ignorant of the database, so this is the one place
 * the two shapes meet. Note the `numeric` columns come back as strings —
 * Postgres numerics do not fit in a JS number safely, so the driver keeps them
 * as text and we widen here where the values are known to be small.
 */
export function toApplicationInput(
  row: Application,
  meta: Pick<ApplicationMeta, 'deviceFingerprint' | 'agentPointId' | 'sessionCity' | 'submittedAt'>,
): ApplicationInput {
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
    submittedAt: meta.submittedAt,
    meta: {
      deviceFingerprint: meta.deviceFingerprint,
      agentPointId: meta.agentPointId,
      sessionCity: meta.sessionCity,
    },
  };
}
