import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';

export interface ChequeRequisition {
  id: number;
  requisition_number: string;
  submitted_by: string;
  payee_type: string;
  payee_name: string;
  amount: string;
  description: string;
  created_at: string;
  current_status: string;
}

export interface ProcessedCheque {
  id: number;
  cheque_number: string;
  cheque_date: string | null;
  payee_name: string;
  total_amount: string;
  status: string;
  requisition_count: number;
  requisition_numbers: string[];
  created_by_name: string;
  created_at: string;
  notes: string;
}

export interface ChequeDetail {
  id: number;
  cheque_number: string;
  cheque_date: string | null;
  payee_name: string;
  payee_type: string;
  total_amount: string;
  status: string;
  created_by_name: string;
  created_at: string;
  notes: string;
  requisitions: ChequeRequisition[];
  requisition_count: number;
}

export interface ProcessedDraft {
  id: number;
  draft_number: string;
  draft_date: string;
  payee_name: string;
  payee_type: string;
  total_amount: string;
  current_status: string;
  status_display: string;
  requisition_count: number;
  requisition_numbers: string[];
  created_by_name: string;
  created_at: string;
}

export interface ProcessedPaymentsResponse {
  summary: {
    cheque: {
      count: number;
      total_amount: string;
    };
    eft: {
      count: number;
      total_amount: string;
    };
    wire: {
      count: number;
      total_amount: string;
    };
  };
  cheques: ProcessedCheque[];
  drafts?: ProcessedDraft[];
  total_count: number;
}

/**
 * Get processed payments (generated cheques, DD, wire transfers)
 */
export function useProcessedPayments(paymentType?: 'cheque' | 'eft' | 'wire') {
  return useQuery<ProcessedPaymentsResponse>({
    queryKey: ['processed-payments', paymentType],
    queryFn: async () => {
      const params = paymentType ? { payment_type: paymentType } : {};
      const { data } = await apiClient.get<ProcessedPaymentsResponse>(
        '/api/requisition-management/processed-payments/',
        { params }
      );
      return data;
    },
  });
}

/**
 * Get detailed information about a specific cheque including all requisitions
 */
export function useChequeDetail(chequeId: number | null) {
  return useQuery<ChequeDetail>({
    queryKey: ['cheque-detail', chequeId],
    queryFn: async () => {
      if (!chequeId) throw new Error('Cheque ID is required');
      const { data } = await apiClient.get<ChequeDetail>(
        `/api/requisition-management/processed-payments/cheques/${chequeId}/`
      );
      return data;
    },
    enabled: !!chequeId,
  });
}
