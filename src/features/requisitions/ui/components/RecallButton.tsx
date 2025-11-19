import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRecallRequisition } from '../../api/useRequisitions';
import type { RequisitionResponse } from '../../api/types';

interface RecallButtonProps {
  requisition: RequisitionResponse;
  onSuccess?: () => void;
}

export function RecallButton({ requisition, onSuccess }: RecallButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const recallMutation = useRecallRequisition();

  const handleRecall = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for recalling this requisition');
      return;
    }

    try {
      await recallMutation.mutateAsync({
        requisitionId: requisition.id,
        reason: reason.trim(),
      });
      
      toast.success('Requisition recalled successfully!');
      setIsModalOpen(false);
      setReason('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || 'Failed to recall requisition';
      toast.error(errorMessage);
    }
  };

  return (
    <>
      {/* Recall Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 border border-yellow-500 text-yellow-600 rounded-md hover:bg-yellow-50 flex items-center gap-2 font-medium"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
        Recall
      </button>

      {/* Recall Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Recall Requisition
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setReason('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                You are about to recall requisition <strong>{requisition.requisition_number}</strong>.
                This will cancel the current assignment and return the requisition to you for revision.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                <div className="flex gap-2">
                  <svg className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Important:</p>
                    <p>You can only recall if the current assignee hasn't acted yet.</p>
                  </div>
                </div>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Recall <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="e.g., Need to change budget line assignment, Update payment details, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setReason('');
                }}
                disabled={recallMutation.isPending}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRecall}
                disabled={recallMutation.isPending || !reason.trim()}
                className="px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {recallMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Recalling...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    Recall Requisition
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}