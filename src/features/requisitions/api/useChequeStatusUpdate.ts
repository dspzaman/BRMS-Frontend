import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';

interface UpdateStatusPayload {
  status: string;
  notes?: string;
  dispatched_by?: string;
  comments?: string;
  metadata?: Record<string, any>;
}

interface BulkUpdateStatusPayload {
  cheque_ids: number[];
  status: string;
  notes?: string;
}

interface UpdateStatusResponse {
  message: string;
  cheque?: any;
  requisitions_updated: number;
  status_history: {
    status: string;
    updated_by: string;
    notes: string;
  };
}

interface BulkUpdateStatusResponse {
  message: string;
  cheques_updated: number;
  requisitions_updated: number;
  status: string;
}

export const useUpdateChequeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      chequeId, 
      payload 
    }: { 
      chequeId: number; 
      payload: UpdateStatusPayload 
    }) => {
      const response = await apiClient.post<UpdateStatusResponse>(
        `/api/requisition-management/cheques/${chequeId}/update-status/`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate processed payments query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['processed-payments'] });
    },
  });
};

export const useBulkUpdateChequeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BulkUpdateStatusPayload) => {
      const response = await apiClient.post<BulkUpdateStatusResponse>(
        '/api/requisition-management/cheques/bulk-update-status/',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate processed payments query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['processed-payments'] });
    },
  });
};

export const useGetChequeStatusHistory = (chequeId: number | null) => {
  return useMutation({
    mutationFn: async () => {
      if (!chequeId) return null;
      const response = await apiClient.get(
        `/api/requisition-management/cheques/${chequeId}/status-history/`
      );
      return response.data;
    },
  });
};
