import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  decide,
  getCase,
  getCases,
  getDashboard,
  getDecisions,
  lookupStatus,
  type ApplicationStatusResult,
  type CaseDetail,
  type CaseListItem,
  type DecisionHistoryItem,
  type DecisionPayload,
  type DashboardData,
} from './api';

/**
 * Query Keys catalog for @parakh/mobile.
 */
export const queryKeys = {
  dashboard: ['dashboard'] as const,
  cases: (params?: Record<string, any>) => ['cases', params ?? {}] as const,
  caseDetail: (id: string) => ['case', id] as const,
  decisions: ['decisions'] as const,
  status: (params?: { reference?: string; cnic?: string }) => ['status', params] as const,
};

/**
 * Fetch Officer Dashboard data (stats, risk distribution, active clusters).
 */
export function useDashboardQuery() {
  return useQuery<DashboardData>({
    queryKey: queryKeys.dashboard,
    queryFn: getDashboard,
  });
}

/**
 * Fetch Case List items for officer queue.
 */
export function useCasesQuery(params?: {
  status?: string;
  risk?: string;
  cluster?: string;
}) {
  return useQuery<{ items: CaseListItem[] }>({
    queryKey: queryKeys.cases(params),
    queryFn: () => getCases(params),
  });
}

/**
 * Fetch Case Detail by case ID.
 */
export function useCaseDetailQuery(caseId: string, enabled = true) {
  return useQuery<CaseDetail>({
    queryKey: queryKeys.caseDetail(caseId),
    queryFn: () => getCase(caseId),
    enabled: Boolean(caseId) && enabled,
  });
}

/**
 * Fetch Decision History audit trail.
 */
export function useDecisionsQuery() {
  return useQuery<DecisionHistoryItem[]>({
    queryKey: queryKeys.decisions,
    queryFn: async () => {
      const res = await getDecisions();
      return res.decisions ?? [];
    },
  });
}

/**
 * Fetch Public Application Status lookup by reference or CNIC.
 */
export function useStatusLookupQuery(
  params: { reference?: string; cnic?: string },
  enabled = false,
) {
  return useQuery<{ success: boolean; application: ApplicationStatusResult }>({
    queryKey: queryKeys.status(params),
    queryFn: () => lookupStatus(params),
    enabled,
    retry: false,
  });
}

/**
 * Submit Officer Decision verdict (Approve / Reject / Escalate).
 *
 * Automatically invalidates and refetches dashboard, cases list, case detail,
 * and decision history caches across all screens upon success!
 */
export function useDecideMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DecisionPayload) => decide(payload),
    onSuccess: (_, variables) => {
      // Invalidate all query caches so queue, stats, and audit logs reflect updates instantly
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      void queryClient.invalidateQueries({ queryKey: ['cases'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.caseDetail(variables.caseId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.decisions });
    },
  });
}
