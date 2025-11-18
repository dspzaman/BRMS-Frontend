// src/features/requisitions/ui/sections/AccountConfirmationSection.tsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useSignaturees, useConfirmAccount, useReturnForRevision } from '../../api/useRequisitions';
import type { RequisitionResponse } from '../../api/types';

interface AccountConfirmationSectionProps {
  requisition: RequisitionResponse;
  onSuccess?: () => void;
}

export function AccountConfirmationSection({ requisition, onSuccess }: AccountConfirmationSectionProps) {
  const [paymentType, setPaymentType] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [signaturee1, setSignaturee1] = useState('');
  const [signaturee2, setSignaturee2] = useState('');
  const [comments, setComments] = useState('');

  // Fetch signaturees from API
  const { data: signatureesData, isLoading: isLoadingSignaturees } = useSignaturees();
  const confirmMutation = useConfirmAccount();
  const returnMutation = useReturnForRevision();

  // Payment types (matching backend PAYMENT_TYPE_CHOICES)
  const paymentTypes = [
    { value: '', label: 'Select Payment Type' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cash', label: 'Cash' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'other', label: 'Other' },
  ];

  const handleConfirm = async () => {
    if (!paymentType || !paymentReference || !signaturee1 || !signaturee2) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (signaturee1 === signaturee2) {
      toast.error('Please select two different signaturees');
      return;
    }

    try {
      await confirmMutation.mutateAsync({
        requisitionId: requisition.id,
        data: {
          payment_type: paymentType,
          payment_reference_number: paymentReference,
          signaturee_1: Number(signaturee1),
          signaturee_2: Number(signaturee2),
          comments: comments || undefined,
        },
      });
      toast.success('Account confirmed successfully!');
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
          Add payment details and select two signaturees to confirm this requisition.
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
            onChange={(e) => setPaymentType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
            required
          >
            {paymentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Reference Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Reference Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={paymentReference}
            onChange={(e) => setPaymentReference(e.target.value)}
            placeholder="Enter cheque number or transaction ID"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
            required
          />
        </div>

        {/* Signaturee 1 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Signaturee <span className="text-red-500">*</span>
          </label>
          <select
            value={signaturee1}
            onChange={(e) => setSignaturee1(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
            disabled={isLoadingSignaturees}
            required
          >
            <option value="">Select Signaturee</option>
            {signatureesData?.map((sig) => (
              <option 
                key={sig.id} 
                value={sig.id} 
                disabled={sig.id.toString() === signaturee2}
              >
                {sig.first_name} {sig.last_name} ({sig.email})
              </option>
            ))}
          </select>
          {isLoadingSignaturees && (
            <p className="text-xs text-gray-500 mt-1">Loading signaturees...</p>
          )}
        </div>

        {/* Signaturee 2 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Second Signaturee <span className="text-red-500">*</span>
          </label>
          <select
            value={signaturee2}
            onChange={(e) => setSignaturee2(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
            disabled={isLoadingSignaturees}
            required
          >
            <option value="">Select Signaturee</option>
            {signatureesData?.map((sig) => (
              <option 
                key={sig.id} 
                value={sig.id} 
                disabled={sig.id.toString() === signaturee1}
              >
                {sig.first_name} {sig.last_name} ({sig.email})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Must be different from the first signaturee
          </p>
        </div>

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
            !paymentReference || 
            !signaturee1 || 
            !signaturee2 || 
            signaturee1 === signaturee2 || 
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
              Confirm & Assign Signaturees
            </>
          )}
        </button>
      </div>
    </div>
  );
}