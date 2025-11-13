import { useFormContext } from 'react-hook-form';
import type { RequisitionFormData } from '../../model/types';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useMemo } from 'react';

interface RequisitionFormActionsProps {
  mode: 'create' | 'edit';
  onSave: () => Promise<void>;
  onSubmit: () => Promise<void>;
  onForward: () => Promise<void>;
  isSaving: boolean;
}

export function RequisitionFormActions({
  mode,
  onSave,
  onSubmit,
  onForward,
  isSaving,
}: RequisitionFormActionsProps) {
  const { handleSubmit, watch, formState } = useFormContext<RequisitionFormData>();
  const { user } = useAuth();

  // Debug: Log form errors when they exist
  const { errors } = formState;

  const handleSubmitWithLogging = handleSubmit(
    onSubmit,
    (errors) => {
      console.error('❌ Form validation failed:', errors);
      alert('Please fill in all required fields before submitting.');
    }
  );

  const handleForwardWithLogging = handleSubmit(
    onForward,
    (errors) => {
      console.error('❌ Form validation failed:', errors);
      alert('Please fill in all required fields before forwarding.');
    }
  );

  // Watch total amount to determine which button to show
  const totalWithTax = watch('totalWithTax') || 0;

  // Determine if user can submit this amount
  const canSubmit = useMemo(() => {
    if (!user) return false;
    const threshold = user.max_submission_threshold;
    
    // null or undefined means unlimited
    if (threshold === null || threshold === undefined) return true;
    
    return totalWithTax <= threshold;
  }, [user, totalWithTax]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Warning message if amount exceeds threshold */}
      {!canSubmit && totalWithTax > 0 && (
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-orange-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">
                Submission Threshold Exceeded
              </h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>
                  This requisition amount (${totalWithTax.toFixed(2)}) exceeds your submission limit 
                  (${user?.max_submission_threshold?.toFixed(2)}). It will be forwarded to your supervisor for submission.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        {/* Save as Draft - No validation required */}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : mode === 'edit' ? 'Update Draft' : 'Save as Draft'}
        </button>

        {/* Conditional Submit or Forward Button */}
        {canSubmit ? (
          <button
            type="button"
            onClick={handleSubmitWithLogging}
            disabled={isSaving}
            className="px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-ems-green-600 hover:bg-ems-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ems-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Submitting...' : 'Submit Requisition'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleForwardWithLogging}
            disabled={isSaving}
            className="px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Forwarding...' : 'Forward for Submission'}
          </button>
        )}
      </div>
    </div>
  );
}