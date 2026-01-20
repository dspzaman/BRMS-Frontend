import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';

interface ChequeStatusHistoryRecord {
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

interface ChequeStatusHistoryResponse {
  cheque_number: string;
  current_status: string;
  history: ChequeStatusHistoryRecord[];
}

export const useChequeStatusHistory = (chequeId: number | null) => {
  return useQuery({
    queryKey: ['cheque-status-history', chequeId],
    queryFn: async () => {
      if (!chequeId) return null;
      
      const response = await apiClient.get<ChequeStatusHistoryResponse>(
        `/api/requisition-management/cheques/${chequeId}/status-history/`
      );
      return response.data;
    },
    enabled: !!chequeId,
  });
};
