// src/features/requisitions/api/usePerDiemExpenseTypes.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import type { PerDiemExpenseType } from './types';

/**
 * Generic function to fetch expense types by code(s)
 * Uses the single backend endpoint with codes parameter
 * @param codes - Comma-separated expense codes (e.g., '5791' or '5798,5831')
 */
async function fetchExpenseTypes(codes: string): Promise<PerDiemExpenseType[]> {
  const response = await apiClient.get<PerDiemExpenseType[]>(
    `/api/expense-tracking/form-data/expense-types/?codes=${codes}`
  );
  return response.data;
}

/**
 * Generic React Query hook to fetch expense types by code(s)
 * @param codes - Comma-separated expense codes
 * @param queryKey - Unique query key for caching
 */
function useExpenseTypes(codes: string, queryKey: string) {
  return useQuery<PerDiemExpenseType[]>({
    queryKey: [queryKey, codes],
    queryFn: () => fetchExpenseTypes(codes),
    staleTime: 10 * 60 * 1000, // 10 minutes - rarely changes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch per diem expense types (code 5791)
 */
export function usePerDiemExpenseTypes(): { 
  data: PerDiemExpenseType[] | undefined; 
  isLoading: boolean; 
  error: any 
} {
  return useExpenseTypes('5831', 'expenseTypes-5831');
}

/**
 * Hook to fetch travel expense types (code 5798 by default, or custom codes)
 */
export function useTravelExpenseTypes(codes: string = '5798'): { 
  data: PerDiemExpenseType[] | undefined; 
  isLoading: boolean; 
  error: any 
} {
  return useExpenseTypes(codes, `expenseTypes-${codes}`);
}
