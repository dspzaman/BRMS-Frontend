// src/features/requisitions/ui/sections/AccountConfirmationSection.tsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useConfirmAccount, useReturnForRevision } from '../../api/useRequisitions';
import type { RequisitionResponse } from '../../api/types';

interface AccountConfirmationSectionProps {
  requisition: RequisitionResponse;
  onSuccess?: () => void;
}

export function AccountConfirmationSection({ requisition, onSuccess }: AccountConfirmationSectionProps) {
  const [paymentType, setPaymentType] = useState<'cheque' | 'eft' | 'wire_transfer' | ''>('');
  const [comments, setComments] = useState('');

  const confirmMutation = useConfirmAccount();
  const returnMutation = useReturnForRevision();

  // Check if payee has complete banking information for EFT/Wire
  const hasCompleteBankingInfo = requisition.payee_banking_info?.has_complete_info || false;

  // Payment types for new direct signature workflow
  // Only show EFT/Wire if payee has complete banking information
  const paymentTypes = [
    { value: '', label: 'Select Payment Type' },
    { value: 'cheque', label: 'Cheque' },
    ...(hasCompleteBankingInfo 
      ? [
          { value: 'eft', label: 'EFT (Electronic Funds Transfer)' },
          { value: 'wire_transfer', label: 'Wire Transfer' }
        ] 
      : []
    ),
  ];

  const handleConfirm = async () => {
    // Validation
    if (!paymentType) {
      toast.error('Please select a payment type');
      return;
    }

    try {
      // Simple payload - only payment type and comments
      const payload = {
        payment_type: paymentType,
        comments: comments || undefined,
      };

      await confirmMutation.mutateAsync({
        requisitionId: requisition.id,
        data: payload,
      });
      toast.success('Account confirmed! Requisition sent for signatures.');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error is handled by the mutation
      console.error('Failed to confirm account:', error);
    }
  };

  const handleReturn = async () => {
    if (!comments.trim()) {
      toast.error('Please add comments before returning for revision');
      return;
    }

    try {
      await returnMutation.mutateAsync({
        id: requisition.id,
        comments: comments.trim(),
      });
      toast.success('Requisition returned for revision');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('Failed to return requisition');
      console.error('Failed to return requisition:', error);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Section Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Account Confirmation
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Assign payment method. Requisition will be sent for authorized signatures.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4 mb-6">
        {/* Payment Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Type <span className="text-red-500">*</span>
          </label>
          <select
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value as 'cheque' | 'eft' | 'wire_transfer' | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
            required
          >
            {paymentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {!hasCompleteBankingInfo && (
            <p className="text-xs text-amber-600 mt-1 flex items-start gap-1">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>EFT/Wire Transfer not available: Payee banking information is incomplete. Please use Cheque payment.</span>
            </p>
          )}
        </div>

        {/* Info message for selected payment type */}
        {paymentType && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              {paymentType === 'cheque' && (
                <>✓ Cheque will be generated after signatures are completed and approved.</>  
              )}
              {paymentType === 'eft' && (
                <>✓ EFT payment will be processed after signatures are completed and approved.</>  
              )}
              {paymentType === 'wire_transfer' && (
                <>✓ Wire transfer will be processed after signatures are completed and approved.</>
              )}
            </p>
          </div>
        )}

        {/* Comments (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comments (Optional)
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
            placeholder="Add any additional comments..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleReturn}
          disabled={returnMutation.isPending || confirmMutation.isPending}
          className="px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {returnMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <span className="text-lg">↩</span>
              Return for Revision
            </>
          )}
        </button>

        <button
          onClick={handleConfirm}
          disabled={
            !paymentType ||
            confirmMutation.isPending ||
            returnMutation.isPending
          }
          className="px-6 py-2 bg-ems-green-600 text-white rounded-md hover:bg-ems-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
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
              Confirm 
            </>
          )}
        </button>
      </div>
    </div>
  );
}