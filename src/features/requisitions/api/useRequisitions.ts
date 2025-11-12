import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getRequisitions, 
  getRequisition, 
  deleteRequisition,
  saveAsDraft,
  updateDraft,
  getMyDrafts,
  submitRequisition,
  forwardRequisition,
  approveRequisition,
  rejectRequisition,
  returnRequisition
} from './requisitionApi';
import type { 
  RequisitionListParams, 
  RequisitionListResponse, 
  RequisitionResponse,
  CreateRequisitionRequest 
} from './types';

/**
 * Hook to fetch requisitions with filters
 * @param params - Query parameters for filtering requisitions
 */
export function useRequisitions(params?: RequisitionListParams) {
  return useQuery<RequisitionListResponse>({
    queryKey: ['requisitions', params],
    queryFn: () => getRequisitions(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch requisitions prepared by current user
 * @param params - Additional query parameters
 */
export function useMyRequisitions(params?: Omit<RequisitionListParams, 'prepared_by'>) {
  return useRequisitions({
    ...params,
    prepared_by: 'me' as any,
  });
}

/**
 * Hook to fetch requisitions assigned to current user (for approvers)
 * @param params - Additional query parameters
 */
export function useAssignedToMe(params?: Omit<RequisitionListParams, 'current_assignee'>) {
  return useRequisitions({
    ...params,
    current_assignee: 'me' as any,
  });
}

/**
 * Hook to fetch a single requisition by ID
 * @param id - Requisition ID
 */
export function useRequisition(id: number) {
  return useQuery<RequisitionResponse>({
    queryKey: ['requisitions', id],
    queryFn: () => getRequisition(id),
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!id, // Only fetch if ID is provided
  });
}

/**
 * Hook to fetch current user's draft requisitions
 */
export function useMyDrafts() {
  return useQuery<RequisitionResponse[]>({
    queryKey: ['requisitions', 'drafts'],
    queryFn: getMyDrafts,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to save a requisition as draft
 */
export function useSaveAsDraft() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      data, 
      files 
    }: { 
      data: CreateRequisitionRequest; 
      files?: { index: number; file: File; documentType: string; description: string }[] 
    }) => saveAsDraft(data, files),
    onSuccess: (newRequisition) => {
      // Invalidate all requisition queries to refetch
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      
      // Optionally set the new requisition in cache
      queryClient.setQueryData(['requisitions', newRequisition.id], newRequisition);
    },
  });
}

/**
 * Hook to update an existing draft requisition
 */
export function useUpdateDraft() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      id, 
      data, 
      files,
      existingDocumentIds
    }: { 
      id: number; 
      data: CreateRequisitionRequest; 
      files?: { index: number; file: File; documentType: string; description: string }[];
      existingDocumentIds?: number[];
    }) => updateDraft(id, data, files, existingDocumentIds),
    onSuccess: (updatedRequisition) => {
      // Invalidate all requisition queries to refetch
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      
      // Update the specific requisition in cache
      queryClient.setQueryData(['requisitions', updatedRequisition.id], updatedRequisition);
    },
  });
}

/**
 * Hook to submit a requisition for approval
 */
export function useSubmitRequisition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, comments }: { id: number; comments?: string }) => 
      submitRequisition(id, comments ? { comments } : undefined),
    onSuccess: (submittedRequisition) => {
      // Invalidate all requisition queries to refetch
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      
      // Update the specific requisition in cache
      queryClient.setQueryData(['requisitions', submittedRequisition.id], submittedRequisition);
    },
  });
}

/**
 * Hook to forward a requisition for submission
 * Used when user exceeds their submission threshold
 */
export function useForwardRequisition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, comments }: { id: number; comments?: string }) => 
      forwardRequisition(id, comments),
    onSuccess: (forwardedRequisition) => {
      // Invalidate all requisition queries to refetch
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      
      // Update the specific requisition in cache
      queryClient.setQueryData(['requisitions', forwardedRequisition.id], forwardedRequisition);
    },
  });
}

/**
 * Hook to delete a requisition
 */
export function useDeleteRequisition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteRequisition,
    onSuccess: () => {
      // Invalidate all requisition queries to refetch
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
    },
  });
}

/**
 * Hook to approve a requisition
 */
export function useApproveRequisition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, comments }: { id: number; comments?: string }) => 
      approveRequisition(id, { comments }),
    onSuccess: (approvedRequisition) => {
      // Invalidate all requisition queries to refetch
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      
      // Update the specific requisition in cache
      queryClient.setQueryData(['requisitions', approvedRequisition.id], approvedRequisition);
    },
  });
}

/**
 * Hook to reject a requisition
 */
export function useRejectRequisition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, comments }: { id: number; comments: string }) => 
      rejectRequisition(id, { comments }),
    onSuccess: (rejectedRequisition) => {
      // Invalidate all requisition queries to refetch
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      
      // Update the specific requisition in cache
      queryClient.setQueryData(['requisitions', rejectedRequisition.id], rejectedRequisition);
    },
  });
}

/**
 * Hook to return a requisition for revision
 */
export function useReturnRequisition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, comments }: { id: number; comments: string }) => 
      returnRequisition(id, { comments }),
    onSuccess: (returnedRequisition) => {
      // Invalidate all requisition queries to refetch
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      
      // Update the specific requisition in cache
      queryClient.setQueryData(['requisitions', returnedRequisition.id], returnedRequisition);
    },
  });
}