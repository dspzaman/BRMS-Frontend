// src/features/requisitions/ui/sections/PaymentConfirmationSection.tsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useConfirmPayment } from '../../api/useRequisitions';
import type { RequisitionResponse } from '../../api/types';

interface PaymentConfirmationSectionProps {
  requisition: RequisitionResponse;
  onSuccess?: () => void;
}

export function PaymentConfirmationSection({ requisition, onSuccess }: PaymentConfirmationSectionProps) {
  const [comments, setComments] = useState('');

  const confirmMutation = useConfirmPayment();

  const handleConfirm = async () => {
    try {
      await confirmMutation.mutateAsync({
        requisitionId: requisition.id,
        data: {
          comments: comments || undefined,
        },
      });
      toast.success('Payment confirmed successfully! Requisition completed.');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to confirm payment:', error);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Section Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          💰 Payment Confirmation
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          All signaturees have approved. Please confirm payment to complete this requisition.
        </p>
      </div>

      {/* Payment Information Display */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Payment Type:</span>
            <p className="font-medium text-gray-900 capitalize">
              {requisition.payment_type?.replace('_', ' ') || 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Reference Number:</span>
            <p className="font-medium text-gray-900">
              {requisition.payment_reference_number || 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Total Amount:</span>
            <p className="font-semibold text-gray-900 text-lg">
              ${parseFloat(requisition.total_with_tax).toFixed(2)}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Payee:</span>
            <p className="font-medium text-gray-900">
              {requisition.payee_staff_name ||
                requisition.payee_vendor_name ||
                requisition.payee_card_holder_name ||
                requisition.payee_other_name ||
                'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Comments Field */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comments (Optional)
        </label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={3}
          placeholder="Add any final comments about payment confirmation..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
        />
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <button
          onClick={handleConfirm}
          disabled={confirmMutation.isPending}
          className="px-8 py-2.5 bg-ems-green-600 text-white rounded-md hover:bg-ems-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
        >
          {confirmMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Confirm Payment
            </>
          )}
        </button>
      </div>
    </div>
  );
}
