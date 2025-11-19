// src/features/requisitions/ui/sections/SignatureeConfirmationSection.tsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useConfirmSignaturee } from '../../api/useRequisitions';
import type { RequisitionResponse } from '../../api/types';

interface SignatureeConfirmationSectionProps {
  requisition: RequisitionResponse;
  onSuccess?: () => void;
}

export function SignatureeConfirmationSection({ requisition, onSuccess }: SignatureeConfirmationSectionProps) {
  const [comments, setComments] = useState('');
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  const confirmMutation = useConfirmSignaturee();

  // Determine which signaturee this is (1 or 2)
  const getSignatureeNumber = () => {
    const signatureeStatuses = requisition.status_history?.filter(
      (s) => s.status === 'signaturee_confirmation'
    ) || [];
    
    const completedSignaturees = signatureeStatuses.filter(
      (s) => s.action_status === 'confirmed'
    ).length;
    
    return completedSignaturees + 1;
  };

  const signatureeNumber = getSignatureeNumber();

  const handleConfirm = async () => {
    try {
      await confirmMutation.mutateAsync({
        requisitionId: requisition.id,
        data: {
          action: 'confirmed',
          comments: comments || undefined,
        },
      });
      toast.success('Requisition confirmed successfully!');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to confirm requisition:', error);
    }
  };

  const handleReject = async () => {
    if (!comments.trim()) {
      toast.error('Please add comments before rejecting');
      return;
    }

    try {
      await confirmMutation.mutateAsync({
        requisitionId: requisition.id,
        data: {
          action: 'rejected',
          comments: comments.trim(),
        },
      });
      toast.success('Requisition rejected');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('Failed to reject requisition');
      console.error('Failed to reject requisition:', error);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Section Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Signaturee Confirmation ({signatureeNumber} of 2)
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Review the requisition details and confirm or reject this request.
        </p>
      </div>

      {/* Payment Information Display */}
      {requisition.payment_type && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Payment Type:</span>
              <p className="font-medium text-gray-900 capitalize">
                {requisition.payment_type.replace('_', ' ')}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Reference Number:</span>
              <p className="font-medium text-gray-900">
                {requisition.payment_reference_number}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Comments Field */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comments {showRejectConfirm && <span className="text-red-500">*</span>}
        </label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={4}
          placeholder="Add any comments about this requisition..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
        />
        {showRejectConfirm && (
          <p className="text-xs text-red-600 mt-1">
            Comments are required when rejecting a requisition
          </p>
        )}
      </div>

      {/* Action Buttons */}
      {!showRejectConfirm ? (
        <div className="flex justify-end gap-3">
          {/* <button
            onClick={() => setShowRejectConfirm(true)}
            disabled={confirmMutation.isPending}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reject
          </button> */}

          <button
            onClick={handleConfirm}
            disabled={confirmMutation.isPending}
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
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start gap-3 mb-4">
            <svg className="h-6 w-6 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-900">Confirm Rejection</h3>
              <p className="text-sm text-red-700 mt-1">
                Are you sure you want to reject this requisition? This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowRejectConfirm(false)}
              disabled={confirmMutation.isPending}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={!comments.trim() || confirmMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {confirmMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Rejecting...
                </>
              ) : (
                'Confirm Rejection'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}