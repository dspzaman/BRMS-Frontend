import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';

// ============================================================================
// TYPES
// ============================================================================

interface Requisition {
  id: number;
  requisition_number: string;
  description: string;
  amount: string;
  created_at: string;
  submitted_by: string;
}

interface PayeeGroup {
  payee_type: string;
  payee_id: number;
  payee_name: string;
  bank_name: string;
  account_number: string;
  transit_number: string;
  institution_number: string;
  total_amount: string;
  requisition_count: number;
  requisitions: Requisition[];
}

interface EligibleRequisitionsResponse {
  total_requisitions: number;
  total_amount: string;
  payee_count: number;
  payee_groups: PayeeGroup[];
}

interface CreateEFTBatchPayload {
  requisition_ids: number[];
  payment_date: string;
  notes?: string;
}

interface DraftRequisition {
  id: number;
  requisition: {
    id: number;
    requisition_number: string;
    description: string;
    total_with_tax: string;
    submitted_by: string;
    created_at: string;
  };
  amount: string;
  created_at: string;
}

interface Draft {
  id: number;
  draft_number: string;
  draft_date: string;
  payee_type: string;
  payee_id: number;
  payee_name: string;
  bank_name: string;
  account_number: string;
  transit_number: string;
  institution_number: string;
  total_amount: string;
  current_status: string;
  status_display: string;
  created_at: string;
  created_by: number;
  created_by_name: string;
  notes: string;
  requisitions: DraftRequisition[];
  requisition_count: number;
}

interface DraftStatusHistory {
  id: number;
  status: string;
  status_display: string;
  updated_by: {
    id: number;
    name: string;
    email: string;
  };
  timestamp: string;
  notes: string;
  metadata: Record<string, any>;
}

interface UpdateStatusPayload {
  status: 'generated' | 'processed';
  notes?: string;
}

// ============================================================================
// HOOKS
// ============================================================================

export const useEligibleRequisitions = () => {
  return useQuery({
    queryKey: ['eft-eligible-requisitions'],
    queryFn: async () => {
      const response = await apiClient.get<EligibleRequisitionsResponse>(
        '/api/requisition-management/eft/eligible-requisitions/'
      );
      return response.data;
    },
  });
};

export const useCreateEFTBatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: CreateEFTBatchPayload) => {
      const response = await apiClient.post(
        '/api/requisition-management/eft/create-batch/',
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eft-eligible-requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['processed-payments'] });
    },
  });
};

export const useDraftDetail = (draftId: number | null) => {
  return useQuery({
    queryKey: ['draft-detail', draftId],
    queryFn: async () => {
      if (!draftId) return null;
      
      const response = await apiClient.get<Draft>(
        `/api/requisition-management/drafts/${draftId}/`
      );
      return response.data;
    },
    enabled: !!draftId,
  });
};

export const useUpdateDraftStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ draftId, payload }: { draftId: number; payload: UpdateStatusPayload }) => {
      const response = await apiClient.post(
        `/api/requisition-management/drafts/${draftId}/update-status/`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft-detail'] });
      queryClient.invalidateQueries({ queryKey: ['processed-payments'] });
      queryClient.invalidateQueries({ queryKey: ['draft-status-history'] });
    },
  });
};

export const useDraftStatusHistory = (draftId: number | null) => {
  return useQuery({
    queryKey: ['draft-status-history', draftId],
    queryFn: async () => {
      if (!draftId) return null;
      
      const response = await apiClient.get<{
        draft_number: string;
        current_status: string;
        history: DraftStatusHistory[];
      }>(
        `/api/requisition-management/drafts/${draftId}/status-history/`
      );
      return response.data;
    },
    enabled: !!draftId,
  });
};

export const useExportDraftCSV = () => {
  return useMutation({
    mutationFn: async (draftId: number) => {
      const response = await apiClient.get(
        `/api/requisition-management/drafts/${draftId}/export-csv/`,
        { responseType: 'blob' }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `EFT_${draftId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return response.data;
    },
  });
};

export const useExportBatchCSV = () => {
  return useMutation({
    mutationFn: async (draftIds: number[]) => {
      const response = await apiClient.post(
        '/api/requisition-management/eft/export-batch-csv/',
        { draft_ids: draftIds },
        { responseType: 'blob' }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `EFT_Batch_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return response.data;
    },
  });
};
