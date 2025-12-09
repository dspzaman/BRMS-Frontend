import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  getApprovalWorkspace,
  approveWithBudget,
  rejectRequisition,
  returnRequisition,
} from './requisitionApi';
import type {
  ApproveWithBudgetRequest,
  RejectRequisitionRequest,
  ReturnRequisitionRequest,
} from './types';

// ============================================================================
// Query Hook
// ============================================================================

/**
 * Hook to fetch approval workspace data for a requisition
 */
export const useApprovalWorkspace = (id: number) => {
  return useQuery({
    queryKey: ['approval-workspace', id],
    queryFn: () => getApprovalWorkspace(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Hook to approve requisition with budget assignments
 */
export const useApproveWithBudget = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ApproveWithBudgetRequest }) =>
      approveWithBudget(id, data),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['approval-workspace', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['requisition', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['assigned-requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });

      // Show success message
      toast.success(`Requisition ${data.requisition_number} approved successfully!`);

      // Navigate to assigned requisitions
      navigate('/requisitions/assigned');
    },
    onError: (error: any) => {
      // Show error message
      const errorMessage = error?.response?.data?.error || 'Failed to approve requisition';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to reject a requisition
 */
export const useRejectRequisition = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RejectRequisitionRequest }) =>
      rejectRequisition(id, data),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['approval-workspace', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['requisition', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['assigned-requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });

      // Show success message
      toast.success(`Requisition ${data.requisition_number} rejected!`);

      // Navigate to assigned requisitions
      navigate('/requisitions/assigned');
    },
    onError: (error: any) => {
      // Show error message
      const errorMessage = error?.response?.data?.error || 'Failed to reject requisition';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to return a requisition for revision
 */
export const useReturnForRevision = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReturnRequisitionRequest }) =>
      returnRequisition(id, data),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['approval-workspace', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['requisition', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['assigned-requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });

      // Show success message
      toast.success(`Requisition ${data.requisition_number} returned for revision!`);

      // Navigate to assigned requisitions
      navigate('/requisitions/assigned');
    },
    onError: (error: any) => {
      // Show error message
      const errorMessage = error?.response?.data?.error || 'Failed to return requisition';
      toast.error(errorMessage);
    },
  });
};
