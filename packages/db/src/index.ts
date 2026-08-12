// schema.ts already re-exports the Better Auth tables, so exporting
// auth-schema here too would be a duplicate-export error.
export * from './schema';
export {
  user,
  session,
  account,
  verification,
  employmentTypeEnum,
  incomeSourceEnum,
  residenceTypeEnum,
  accountPurposeEnum,
  counterpartiesEnum,
  riskLevelEnum,
  severityEnum,
  caseStatusEnum,
  decisionActionEnum,
  clusterKindEnum,
  applications,
  applicationMeta,
  signals,
  clusters,
  riskProfiles,
  cases,
  decisions,
} from './schema';

export { db, dbTx } from './client';
export { and, asc, desc, eq, gte, inArray, isNull, lte, ne, or, sql } from 'drizzle-orm';
