import toast from 'react-hot-toast';

interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  onConfirm: () => Promise<void>;
  loadingMessage?: string;
  successMessage?: string | null;
  errorMessage?: string | ((error: any) => string | null);
}

/**
 * Show a toast confirmation dialog with Cancel and Confirm buttons
 * Returns a promise that resolves when confirmed or rejects when cancelled
 * 
 * @example
 * showConfirmation({
 *   title: 'Delete Item?',
 *   message: 'Are you sure you want to delete this item?',
 *   confirmText: 'Delete',
 *   confirmButtonClass: 'bg-red-600 hover:bg-red-700',
 *   onConfirm: async () => { await deleteItem(); },
 *   loadingMessage: 'Deleting...',
 *   successMessage: 'Item deleted!',
 * });
 */
export const showConfirmation = ({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = 'px-3 py-1.5 text-sm font-medium text-white bg-ems-green-600 rounded-md hover:bg-ems-green-700',
  onConfirm,
  loadingMessage = 'Processing...',
  successMessage = null,
  errorMessage,
}: ConfirmationOptions) => {
  return toast.promise(
    new Promise((resolve, reject) => {
      toast(
        (t) => (
          <div className="flex flex-col gap-3">
            <div>
              <p className="font-medium text-gray-900">{title}</p>
              <p className="text-sm text-gray-600 mt-1">{message}</p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  reject(new Error('Cancelled'));
                }}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {cancelText}
              </button>
              <button
                onClick={async () => {
                  toast.dismiss(t.id);
                  try {
                    await onConfirm();
                    resolve(true);
                  } catch (error) {
                    reject(error);
                  }
                }}
                className={confirmButtonClass}
              >
                {confirmText}
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity,
          position: 'top-center',
        }
      );
    }),
    {
      loading: loadingMessage,
      success: successMessage,
      error: (err) => {
        if (err.message === 'Cancelled') return null;
        if (typeof errorMessage === 'function') {
          const result = errorMessage(err);
          return result || null;
        }
        return errorMessage || null;
      },
    }
  );
};

/**
 * Preset confirmation for delete actions (red button)
 * 
 * @example
 * showDeleteConfirmation({
 *   itemName: 'Requisition',
 *   onConfirm: async () => { await deleteRequisition(id); },
 * });
 */
export const showDeleteConfirmation = ({
  itemName,
  onConfirm,
}: {
  itemName: string;
  onConfirm: () => Promise<void>;
}) => {
  return showConfirmation({
    title: `Delete ${itemName}?`,
    message: `Are you sure you want to delete this ${itemName.toLowerCase()}? This action cannot be undone.`,
    confirmText: 'Delete',
    confirmButtonClass: 'px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700',
    onConfirm,
    loadingMessage: 'Deleting...',
    successMessage: `${itemName} deleted successfully!`,
    errorMessage: `Failed to delete ${itemName.toLowerCase()}`,
  });
};

/**
 * Preset confirmation for approval actions (green button)
 * 
 * @example
 * showApprovalConfirmation({
 *   onConfirm: async () => { await approveMutation.mutateAsync({ id, data }); },
 * });
 */
export const showApprovalConfirmation = ({
  onConfirm,
  message = 'Are you sure you want to approve this requisition? This will assign all budgets and move it to Account Confirmation.',
}: {
  onConfirm: () => Promise<void>;
  message?: string;
}) => {
  return showConfirmation({
    title: 'Approve Requisition?',
    message,
    confirmText: 'Approve',
    confirmButtonClass: 'px-3 py-1.5 text-sm font-medium text-white bg-ems-green-600 rounded-md hover:bg-ems-green-700',
    onConfirm,
    loadingMessage: 'Approving...',
    successMessage: null, // Handled by mutation hook
    errorMessage: () => null, // Handled by mutation hook
  });
};

/**
 * Preset confirmation for return/revision actions (yellow button)
 * 
 * @example
 * showReturnConfirmation({
 *   onConfirm: async () => { await returnMutation.mutateAsync({ id, data }); },
 * });
 */
export const showReturnConfirmation = ({
  onConfirm,
  message = 'Are you sure you want to return this requisition for revision?',
}: {
  onConfirm: () => Promise<void>;
  message?: string;
}) => {
  return showConfirmation({
    title: 'Return for Revision?',
    message,
    confirmText: 'Return for Revision',
    confirmButtonClass: 'px-3 py-1.5 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700',
    onConfirm,
    loadingMessage: 'Processing...',
    successMessage: null, // Handled by mutation hook
    errorMessage: () => null, // Handled by mutation hook
  });
};

/**
 * Preset confirmation for review and forward actions (green button)
 * 
 * @example
 * showReviewConfirmation({
 *   onConfirm: async () => { await reviewMutation.mutateAsync({ id, comments }); },
 * });
 */
export const showReviewConfirmation = ({
  onConfirm,
  message = 'Are you sure you want to review and forward this requisition to the next approver?',
}: {
  onConfirm: () => Promise<void>;
  message?: string;
}) => {
  return showConfirmation({
    title: 'Review & Forward Requisition?',
    message,
    confirmText: 'Review & Forward',
    confirmButtonClass: 'px-3 py-1.5 text-sm font-medium text-white bg-ems-green-600 rounded-md hover:bg-ems-green-700',
    onConfirm,
    loadingMessage: 'Processing...',
    successMessage: null, // Handled by mutation hook
    errorMessage: () => null, // Handled by mutation hook
  });
};