// API hooks for requisition signatures (new direct signature workflow)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import toast from 'react-hot-toast';

// ============================================================================
// Types
// ============================================================================

export interface RequisitionSignature {
  id: number;
  requisition: number;
  requisition_number: string;
  requisition_title: string;
  signaturee: number;
  signaturee_name: string;
  signature_order: number;
  status: 'pending' | 'signed' | 'rejected';
  assigned_at: string;
  signed_at: string | null;
  rejection_reason: string | null;
  notes: string | null;
  configuration: number | null;
  
  // Requisition details for display
  payee_name?: string;
  total_amount?: string;
  payment_type?: string;
  program_name?: string;
}

export interface PendingSignaturesResponse {
  count: number;
  signatures: RequisitionSignature[];
}

export interface SignatureHistoryResponse {
  count: number;
  signatures: RequisitionSignature[];
}

export interface SignatureApprovalRequest {
  action: 'signed' | 'rejected';
  comments?: string;
}

// ============================================================================
// API Functions
// ============================================================================

async function fetchMyPendingSignatures(): Promise<PendingSignaturesResponse> {
  const response = await apiClient.get('/api/requisition-management/signatures/my-pending/');
  return response.data;
}

async function fetchMySignatureHistory(): Promise<SignatureHistoryResponse> {
  const response = await apiClient.get('/api/requisition-management/signatures/my-history/');
  return response.data;
}

async function approveSignature(requisitionId: number, data: SignatureApprovalRequest): Promise<any> {
  const response = await apiClient.post(
    `/api/requisition-management/requisitions/${requisitionId}/approve-signature/`,
    data
  );
  return response.data;
}

// ============================================================================
// React Query Hooks
// ============================================================================

export function useMyPendingSignatures() {
  return useQuery({
    queryKey: ['signatures', 'pending'],
    queryFn: fetchMyPendingSignatures,
    staleTime: 30000, // 30 seconds
  });
}

export function useMySignatureHistory() {
  return useQuery({
    queryKey: ['signatures', 'history'],
    queryFn: fetchMySignatureHistory,
    staleTime: 60000, // 1 minute
  });
}

export function useApproveSignature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requisitionId, data }: { requisitionId: number; data: SignatureApprovalRequest }) =>
      approveSignature(requisitionId, data),
    onSuccess: (data) => {
      // Invalidate signature queries
      queryClient.invalidateQueries({ queryKey: ['signatures'] });
      
      // Invalidate requisition queries
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      
      toast.success(data.message || 'Signature processed successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to process signature';
      toast.error(errorMessage);
    },
  });
}

export function useBulkApproveSignatures() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { requisition_ids: number[]; comments?: string }) => {
      const response = await apiClient.post('/api/requisition-management/signatures/bulk-approve/', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate signature queries
      queryClient.invalidateQueries({ queryKey: ['signatures'] });
      
      // Invalidate requisition queries
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      
      const successCount = data.results?.success?.length || 0;
      const failedCount = data.results?.failed?.length || 0;
      
      if (failedCount === 0) {
        toast.success(`Successfully approved ${successCount} requisition(s)`);
      } else {
        toast.error(`Approved ${successCount} requisition(s), ${failedCount} failed. Check details.`);
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || 'Failed to process bulk approval';
      toast.error(errorMessage);
    },
  });
}
