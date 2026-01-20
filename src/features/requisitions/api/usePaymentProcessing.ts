import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';

export interface PaymentProcessingRequisition {
  id: number;
  requisition_number: string;
  prepared_by_name: string;
  created_at: string;
  total_with_tax: string;
  payment_type: string;
  payee_name: string;
  description: string;
  current_status: string;
}

export interface PaymentProcessingResponse {
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
  requisitions: PaymentProcessingRequisition[];
  total_count: number;
}

/**
 * Get requisitions in payment_processing status
 */
export function usePaymentProcessingRequisitions(paymentType?: 'cheque' | 'eft' | 'wire') {
  return useQuery<PaymentProcessingResponse>({
    queryKey: ['payment-processing', paymentType],
    queryFn: async () => {
      const params = paymentType ? { payment_type: paymentType } : {};
      const { data } = await apiClient.get<PaymentProcessingResponse>(
        '/api/requisition-management/payment-processing/requisitions/',
        { params }
      );
      return data;
    },
  });
}
