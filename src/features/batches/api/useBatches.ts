// React Query hooks for Batch API operations
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import type {
  Batch,
  BatchListItem,
  ReadyPoolResponse,
  BatchStatistics,
  CreateBatchRequest,
  AddRequisitionsRequest,
  RemoveRequisitionRequest,
  ApproveBatchRequest,
  RejectBatchRequest,
  SkipSignatureeRequest,
  BatchResponse,
  AddRequisitionsResponse,
  RemoveRequisitionResponse,
  ApproveBatchResponse,
  MyPendingBatchesResponse,
} from './types';

// Query keys
export const batchKeys = {
  all: ['batches'] as const,
  lists: () => [...batchKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...batchKeys.lists(), filters] as const,
  details: () => [...batchKeys.all, 'detail'] as const,
  detail: (id: number) => [...batchKeys.details(), id] as const,
  readyPool: (filters?: Record<string, any>) => [...batchKeys.all, 'ready-pool', filters] as const,
  statistics: () => [...batchKeys.all, 'statistics'] as const,
  myPending: () => [...batchKeys.all, 'my-pending'] as const,
  myHistory: () => [...batchKeys.all, 'my-history'] as const,
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Get requisitions in ready pool (ready for batching)
 */
export function useReadyPool(paymentType?: 'cheque' | 'eft' | 'wire') {
  return useQuery({
    queryKey: batchKeys.readyPool({ payment_type: paymentType }),
    queryFn: async () => {
      const params = paymentType ? { payment_type: paymentType } : {};
      const { data } = await apiClient.get<ReadyPoolResponse>(
        '/api/requisition-management/batches/ready-pool/',
        { params }
      );
      return data;
    },
  });
}

/**
 * Get list of batches with optional filters
 */
export function useBatches(filters?: {
  status?: string;
  batch_type?: string;
  created_by?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: batchKeys.list(filters),
    queryFn: async () => {
      const { data } = await apiClient.get<{
        count: number;
        next: string | null;
        previous: string | null;
        results: BatchListItem[];
      }>(
        '/api/requisition-management/batches/',
        { params: filters }
      );
      return data.results;
    },
  });
}

/**
 * Get batch details by ID
 */
export function useBatch(id: number | undefined) {
  return useQuery({
    queryKey: batchKeys.detail(id!),
    queryFn: async () => {
      const { data } = await apiClient.get<Batch>(
        `/api/requisition-management/batches/${id}/`
      );
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Get batch statistics
 */
export function useBatchStatistics() {
  return useQuery({
    queryKey: batchKeys.statistics(),
    queryFn: async () => {
      const { data } = await apiClient.get<BatchStatistics>(
        '/api/requisition-management/batches/statistics/'
      );
      return data;
    },
  });
}

/**
 * Get batches awaiting current user's signature
 */
export function useMyPendingBatches() {
  return useQuery({
    queryKey: batchKeys.myPending(),
    queryFn: async () => {
      const { data } = await apiClient.get<MyPendingBatchesResponse>(
        '/api/requisition-management/batches/my-pending/'
      );
      return data;
    },
  });
}

/**
 * Get batches signed by current user
 */
export function useMyBatchHistory() {
  return useQuery({
    queryKey: batchKeys.myHistory(),
    queryFn: async () => {
      const { data } = await apiClient.get<MyPendingBatchesResponse>(
        '/api/requisition-management/batches/my-history/'
      );
      return data;
    },
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Create a new batch
 */
export function useCreateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateBatchRequest) => {
      const { data } = await apiClient.post<Batch>(
        '/api/requisition-management/batches/',
        request
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: batchKeys.readyPool() });
      queryClient.invalidateQueries({ queryKey: batchKeys.statistics() });
    },
  });
}

/**
 * Update batch (notes, expires_at)
 */
export function useUpdateBatch(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { notes?: string; expires_at?: string }) => {
      const { data } = await apiClient.patch<Batch>(
        `/api/requisition-management/batches/${id}/`,
        updates
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() });
    },
  });
}

/**
 * Cancel/delete a batch
 */
export function useCancelBatch(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reason?: string) => {
      const { data } = await apiClient.delete<Batch>(
        `/api/requisition-management/batches/${id}/`,
        { data: { reason } }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: batchKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: batchKeys.readyPool() });
      queryClient.invalidateQueries({ queryKey: batchKeys.statistics() });
    },
  });
}

/**
 * Add requisitions to a batch
 */
export function useAddRequisitions(batchId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: AddRequisitionsRequest) => {
      const { data } = await apiClient.post<AddRequisitionsResponse>(
        `/api/requisition-management/batches/${batchId}/add-requisitions/`,
        request
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.detail(batchId) });
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: batchKeys.readyPool() });
    },
  });
}

/**
 * Remove a requisition from a batch
 */
export function useRemoveRequisition(batchId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: RemoveRequisitionRequest) => {
      const { data } = await apiClient.post<RemoveRequisitionResponse>(
        `/api/requisition-management/batches/${batchId}/remove-requisition/`,
        request
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.detail(batchId) });
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: batchKeys.readyPool() });
    },
  });
}

/**
 * Send batch for signatures
 */
export function useSendForSignatures(batchId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<BatchResponse>(
        `/api/requisition-management/batches/${batchId}/send-for-signatures/`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.detail(batchId) });
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: batchKeys.myPending() });
    },
  });
}

/**
 * Approve batch as signaturee
 */
export function useApproveBatch(batchId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: ApproveBatchRequest) => {
      const { data } = await apiClient.post<ApproveBatchResponse>(
        `/api/requisition-management/batches/${batchId}/approve/`,
        request
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.detail(batchId) });
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: batchKeys.myPending() });
      queryClient.invalidateQueries({ queryKey: batchKeys.myHistory() });
    },
  });
}

/**
 * Reject batch (remove requisitions with issues)
 */
export function useRejectBatch(batchId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: RejectBatchRequest) => {
      const { data } = await apiClient.post<BatchResponse>(
        `/api/requisition-management/batches/${batchId}/reject/`,
        request
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.detail(batchId) });
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: batchKeys.readyPool() });
    },
  });
}

/**
 * Skip a signaturee
 */
export function useSkipSignaturee(batchId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: SkipSignatureeRequest) => {
      const { data } = await apiClient.post<BatchResponse>(
        `/api/requisition-management/batches/${batchId}/skip-signaturee/`,
        request
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.detail(batchId) });
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() });
    },
  });
}
