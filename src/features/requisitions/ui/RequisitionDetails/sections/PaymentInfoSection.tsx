// src/features/requisitions/ui/RequisitionDetails/sections/PaymentInfoSection.tsx
import type { RequisitionResponse } from '../../../api/types';

interface PaymentInfoSectionProps {
  requisition: RequisitionResponse;
}

export function PaymentInfoSection({ requisition }: PaymentInfoSectionProps) {
  // Only show if payment information exists
  if (!requisition.payment_type) {
    return null;
  }

  const paymentType = requisition.payment_type;
  const paymentReference = requisition.payment_reference_number;

  // Get payment type display label
  const getPaymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'cheque': 'Cheque',
      'eft': 'EFT (Electronic Funds Transfer)',
      'cash': 'Cash',
      'credit_card': 'Credit Card',
      'other': 'Other',
    };
    return labels[type] || type;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        💳 Payment Information
      </h3>
      
      <div className="space-y-3">
        {/* Payment Type */}
        <div className="flex items-start">
          <span className="text-sm font-medium text-gray-500 w-40">Payment Type:</span>
          <span className="text-sm text-gray-900 font-medium">
            {getPaymentTypeLabel(paymentType)}
          </span>
        </div>

        {/* Payment Reference / Cheque Number */}
        {paymentReference && (
          <div className="flex items-start">
            <span className="text-sm font-medium text-gray-500 w-40">
              {paymentType === 'cheque' ? 'Cheque Number:' : 'Reference Number:'}
            </span>
            <span className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
              {paymentReference}
            </span>
          </div>
        )}

        {/* Additional Info for EFT */}
        {paymentType === 'eft' && !paymentReference && (
          <div className="flex items-start">
            <span className="text-sm font-medium text-gray-500 w-40">Reference Number:</span>
            <span className="text-sm text-gray-500 italic">
              Will be assigned after batch processing
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
