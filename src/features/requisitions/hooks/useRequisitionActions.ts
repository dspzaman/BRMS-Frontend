import { useState } from 'react';
import {
  useSubmitRequisition,
  useApproveRequisition,
  useRejectRequisition,
  useReturnRequisition,
} from '../api/useRequisitions';

/**
 * Hook to handle all requisition actions (submit, approve, reject, return)
 * Provides unified interface with loading states and error handling
 */
export function useRequisitionActions() {
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const submitMutation = useSubmitRequisition();
  const approveMutation = useApproveRequisition();
  const rejectMutation = useRejectRequisition();
  const returnMutation = useReturnRequisition();

  /**
   * Submit a requisition for approval
   */
  const handleSubmit = async (id: number, comments?: string) => {
    try {
      setActionInProgress('submit');
      await submitMutation.mutateAsync({ id, comments });
      return { success: true, message: 'Requisition submitted successfully!' };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to submit requisition';
      return { success: false, message: errorMessage };
    } finally {
      setActionInProgress(null);
    }
  };

  /**
   * Approve a requisition
   */
  const handleApprove = async (id: number, comments?: string) => {
    try {
      setActionInProgress('approve');
      await approveMutation.mutateAsync({ id, comments });
      return { success: true, message: 'Requisition approved successfully!' };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to approve requisition';
      return { success: false, message: errorMessage };
    } finally {
      setActionInProgress(null);
    }
  };

  /**
   * Reject a requisition
   */
  const handleReject = async (id: number, comments: string) => {
    try {
      setActionInProgress('reject');
      await rejectMutation.mutateAsync({ id, comments });
      return { success: true, message: 'Requisition rejected successfully!' };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to reject requisition';
      return { success: false, message: errorMessage };
    } finally {
      setActionInProgress(null);
    }
  };

  /**
   * Return a requisition for revision
   */
  const handleReturn = async (id: number, comments: string) => {
    try {
      setActionInProgress('return');
      await returnMutation.mutateAsync({ id, comments });
      return { success: true, message: 'Requisition returned for revision!' };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to return requisition';
      return { success: false, message: errorMessage };
    } finally {
      setActionInProgress(null);
    }
  };

  return {
    handleSubmit,
    handleApprove,
    handleReject,
    handleReturn,
    isProcessing: actionInProgress !== null,
    actionInProgress,
  };
}
