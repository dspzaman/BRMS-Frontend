import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';

/**
 * Hook to get count of pending assigned requisitions (excluding signature statuses)
 * Used for sidebar badge on "Assigned Requisitions" link
 */
export function useAssignedRequisitionsCount(enabled: boolean = true) {
  return useQuery({
    queryKey: ['requisitions', 'assigned', 'count'],
    queryFn: async () => {
      const response = await apiClient.get('/api/requisition-management/requisitions/', {
        params: { 
          current_assignee: 'me'
        }
      });
      // Backend already excludes signature_1 and signature_2 statuses
      return response.data.count;
    },
    enabled,
    staleTime: 60000, // 1 minute cache
    refetchInterval: 120000, // Auto-refresh every 2 minutes
  });
}

/**
 * Hook to get total count of requisitions ready for payment processing
 * Includes all payment types (cheque, eft, wire)
 * Used for sidebar badge on "Ready For Payment" link
 */
export function usePaymentProcessingCount(enabled: boolean = true) {
  return useQuery({
    queryKey: ['payment-processing', 'count'],
    queryFn: async () => {
      const response = await apiClient.get('/api/requisition-management/payment-processing/requisitions/');
      return response.data.total_count; // All 3 payment types combined
    },
    enabled,
    staleTime: 60000, // 1 minute cache
    refetchInterval: 120000, // Auto-refresh every 2 minutes
  });
}

/**
 * Hook to get count of pending signatures for current user
 * Used for sidebar badge on "My Signatures" link
 */
export function usePendingSignaturesCount(enabled: boolean = true) {
  return useQuery({
    queryKey: ['signatures', 'pending', 'count'],
    queryFn: async () => {
      const response = await apiClient.get('/api/requisition-management/signatures/my-pending/');
      return response.data.count; // Only pending signatures
    },
    enabled,
    staleTime: 60000, // 1 minute cache
    refetchInterval: 120000, // Auto-refresh every 2 minutes
  });
}
