import { useFormContext } from 'react-hook-form';
import toast from 'react-hot-toast';
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
  const { handleSubmit, watch } = useFormContext<RequisitionFormData>();
  const { user } = useAuth();

  // Debug: Log form errors when they exist

  const handleSubmitWithLogging = handleSubmit(
    onSubmit,
    (errors) => {
      console.error('❌ Form validation failed:', errors);
      toast.error('Please fill in all required fields before submitting.');
    }
  );

  const handleForwardWithLogging = handleSubmit(
    onForward,
    (errors) => {
      console.error('❌ Form validation failed:', errors);
      toast.error('Please fill in all required fields before forwarding.');
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
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
  <div className="flex">
    <div className="flex-shrink-0">
      <svg
        className="h-5 w-5 text-yellow-400"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        ...
      </svg>
    </div>
    <div className="ml-3">
      <h3 className="text-sm font-medium text-yellow-800">
        Submission Threshold Exceeded
      </h3>
      <div className="mt-2 text-sm text-yellow-700">
        <p>
          This requisition amount (${totalWithTax.toFixed(2)}) exceeds your submission limit
          (${user?.max_submission_threshold?.toFixed(2)}). It will be forwarded to your
          supervisor for submission.
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
  className="px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isSaving ? 'Forwarding...' : 'Forward for Submission'}
</button>
        )}
      </div>
    </div>
  );
}