import { useState } from 'react';
import toast from 'react-hot-toast';

interface VoidChequeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (voidReason: string) => void;
  chequeNumber: string;
}

export function VoidChequeModal({
  isOpen,
  onClose,
  onConfirm,
  chequeNumber,
}: VoidChequeModalProps) {
  const [voidReason, setVoidReason] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!voidReason.trim()) {
      toast.error('Please provide a reason for voiding this cheque');
      return;
    }

    onConfirm(voidReason.trim());
    
    // Reset form
    setVoidReason('');
  };

  const handleCancel = () => {
    setVoidReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleCancel}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-red-600">⚠️</span>
              Void Cheque
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Cheque: <span className="font-medium">{chequeNumber}</span>
            </p>
            <p className="text-sm text-red-600 mt-2">
              This action cannot be undone. Please provide a reason for voiding this cheque.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Void Reason Field */}
            <div className="mb-6">
              <label
                htmlFor="voidReason"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Void Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                id="voidReason"
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="Enter the reason for voiding this cheque..."
                required
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                This reason will be recorded in the cheque and requisition history.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                ⚠️ Void Cheque
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
