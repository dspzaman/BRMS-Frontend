// Signature Approval Section for new direct signature workflow
import { useState } from 'react';
import { useApproveSignature } from '@/features/requisitions/api/useSignatures';
import type { RequisitionResponse } from '@/features/requisitions/api/types';

interface SignatureApprovalSectionProps {
  requisition: RequisitionResponse;
  onSuccess?: () => void;
}

export function SignatureApprovalSection({ requisition, onSuccess }: SignatureApprovalSectionProps) {
  const [comments, setComments] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const approveSignature = useApproveSignature();

  const handleApprove = () => {
    if (!requisition.id) return;

    approveSignature.mutate(
      {
        requisitionId: requisition.id,
        data: {
          action: 'signed',
          comments: comments || undefined,
        },
      },
      {
        onSuccess: () => {
          setComments('');
          onSuccess?.();
        },
      }
    );
  };

  const handleReject = () => {
    if (!requisition.id) return;
    
    if (!comments.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    approveSignature.mutate(
      {
        requisitionId: requisition.id,
        data: {
          action: 'rejected',
          comments: comments,
        },
      },
      {
        onSuccess: () => {
          setComments('');
          setShowRejectForm(false);
          onSuccess?.();
        },
      }
    );
  };

  // Extract signature order from status (signature_1 -> 1, signature_2 -> 2)
  const signatureOrder = requisition.current_status?.match(/signature_(\d+)/)?.[1] || '1';

  return (
    <div className="bg-white border-2 border-yellow-400 rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Signature Required - Signature #{signatureOrder}
          </h2>
          <p className="text-gray-600">
            This requisition requires your signature approval. Please review the details below and approve or reject.
          </p>
        </div>
      </div>

      {/* Requisition Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Requisition Number</p>
            <p className="font-medium text-gray-900">{requisition.requisition_number}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="font-medium text-gray-900">${requisition.total_with_tax}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Payment Type</p>
            <p className="font-medium text-gray-900 capitalize">
              {requisition.payment_type?.replace('_', ' ') || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Submitted By</p>
            <p className="font-medium text-gray-900">{requisition.submitted_by_name || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="mb-6">
        <label htmlFor="signature-comments" className="block text-sm font-medium text-gray-700 mb-2">
          Comments {showRejectForm && <span className="text-red-600">*</span>}
        </label>
        <textarea
          id="signature-comments"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-transparent"
          placeholder={showRejectForm ? "Please provide a reason for rejection..." : "Optional comments about this signature..."}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {!showRejectForm ? (
          <>
            <button
              onClick={handleApprove}
              disabled={approveSignature.isPending}
              className="px-6 py-2 bg-ems-green-600 text-white rounded-md hover:bg-ems-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {approveSignature.isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Approving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Approve & Sign
                </>
              )}
            </button>
            <button
              onClick={() => setShowRejectForm(true)}
              disabled={approveSignature.isPending}
              className="px-6 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleReject}
              disabled={approveSignature.isPending || !comments.trim()}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {approveSignature.isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Rejecting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Confirm Rejection
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowRejectForm(false);
                setComments('');
              }}
              disabled={approveSignature.isPending}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> By approving this signature, you confirm that you have reviewed the requisition details and authorize the payment. 
          {signatureOrder !== '1' && ' This is signature #' + signatureOrder + ' in the approval chain.'}
        </p>
      </div>
    </div>
  );
}
