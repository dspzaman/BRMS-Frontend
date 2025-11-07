import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RequisitionResponse } from '../../api/types';

interface RequisitionActionButtonsProps {
  requisition: RequisitionResponse;
  onSubmit?: (id: number) => void;
  onApprove?: (id: number, comments?: string) => void;
  onReject?: (id: number, comments: string) => void;
  onReturn?: (id: number, comments: string) => void;
  isProcessing?: boolean;
}

export function RequisitionActionButtons({
  requisition,
  onSubmit,
  onApprove,
  onReject,
  onReturn,
  isProcessing = false,
}: RequisitionActionButtonsProps) {
  const navigate = useNavigate();
  const [showCommentModal, setShowCommentModal] = useState<'approve' | 'reject' | 'return' | null>(null);
  const [comments, setComments] = useState('');

  // Forwarded for submission - show Review & Submit button
  if (requisition.current_status === 'forwarded_for_submission') {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/requisitions/edit/${requisition.id}`)}
          className="px-4 py-2 bg-ems-green-600 text-white text-sm font-medium rounded-lg hover:bg-ems-green-700"
        >
          Review & Submit
        </button>
      </div>
    );
  }

  // Pending approval/review - show Approve, Reject, Return buttons
  const approvalStatuses = [
    'pending_approval',
    'initial_review',
    'manager_review',
    'account_confirmation',
    'top_management_review',
    'board_review',
  ];

  if (approvalStatuses.includes(requisition.current_status)) {
    return (
      <>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCommentModal('approve')}
            disabled={isProcessing}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✓ Approve
          </button>
          <button
            onClick={() => setShowCommentModal('return')}
            disabled={isProcessing}
            className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ↩ Return
          </button>
          <button
            onClick={() => setShowCommentModal('reject')}
            disabled={isProcessing}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✗ Reject
          </button>
        </div>

        {/* Comment Modal */}
        {showCommentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">
                {showCommentModal === 'approve' && 'Approve Requisition'}
                {showCommentModal === 'reject' && 'Reject Requisition'}
                {showCommentModal === 'return' && 'Return for Revision'}
              </h3>
              
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={showCommentModal === 'approve' ? 'Add comments (optional)' : 'Add comments (required)'}
                className="w-full border border-gray-300 rounded-lg p-3 mb-4 min-h-[100px]"
                required={showCommentModal !== 'approve'}
              />

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowCommentModal(null);
                    setComments('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (showCommentModal === 'approve') {
                      onApprove?.(requisition.id, comments || undefined);
                    } else if (showCommentModal === 'reject') {
                      if (comments.trim()) {
                        onReject?.(requisition.id, comments);
                      } else {
                        alert('Comments are required for rejection');
                        return;
                      }
                    } else if (showCommentModal === 'return') {
                      if (comments.trim()) {
                        onReturn?.(requisition.id, comments);
                      } else {
                        alert('Comments are required for returning');
                        return;
                      }
                    }
                    setShowCommentModal(null);
                    setComments('');
                  }}
                  disabled={isProcessing}
                  className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    showCommentModal === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : showCommentModal === 'reject'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-yellow-600 hover:bg-yellow-700'
                  }`}
                >
                  {isProcessing ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // No actions available
  return null;
}
