// src/features/requisitions/ui/ReviewSection.tsx
import { useState } from 'react';
import { useReviewAndForward, useReturnForRevision } from '../../api/useRequisitions';
import type { RequisitionResponse } from '../../api/types';


interface ReviewSectionProps {
  requisition: RequisitionResponse;
  onSuccess?: () => void;
}

export function ReviewSection({ requisition, onSuccess }: ReviewSectionProps) {
  const [comments, setComments] = useState('');
  const reviewMutation = useReviewAndForward();
  const returnMutation = useReturnForRevision();

  const handleReviewAndForward = async () => {
    if (!comments.trim()) {
      alert('Please add comments before reviewing and forwarding');
      return;
    }

    if (!confirm('Are you sure you want to review and forward this requisition to the next approver?')) {
      return;
    }

    try {
      await reviewMutation.mutateAsync({
        id: requisition.id,
        comments: comments.trim(),
      });

      alert('Requisition reviewed and forwarded successfully!');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to review requisition';
      alert(`Error: ${errorMessage}`);
    }
  };

    const handleReturnForRevision = async () => {
    if (!comments.trim()) {
      alert('Please add comments before returning for revision');
      return;
    }

    if (!confirm('Are you sure you want to return this requisition for revision?')) {
      return;
    }

    try {
      await returnMutation.mutateAsync({
        id: requisition.id,
        comments: comments.trim(),
      });

      alert('Requisition returned for revision successfully!');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Failed to return requisition';
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Section Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Review Requisition
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          This requisition amount (${requisition.total_with_tax}) exceeds your approval threshold. 
          Please review and forward to the next approver.
        </p>
      </div>

      {/* Comments Field */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Review Comments <span className="text-red-500">*</span>
        </label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={4}
          placeholder="Add your review comments here..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Your comments will be visible in the requisition history.
        </p>
      </div>

      {/* Action Button */}
            {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleReturnForRevision}
          disabled={returnMutation.isPending || reviewMutation.isPending || !comments.trim()}
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
          onClick={handleReviewAndForward}
          disabled={reviewMutation.isPending || returnMutation.isPending || !comments.trim()}
          className="px-6 py-2 bg-ems-green-600 text-white rounded-md hover:bg-ems-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {reviewMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Review & Forward
            </>
          )}
        </button>
      </div>
    </div>
  );
}