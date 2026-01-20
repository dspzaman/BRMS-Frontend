import { useState } from 'react';
import toast from 'react-hot-toast';

interface DispatchChequeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dispatchedBy: string, notes: string) => void;
  chequeNumber: string;
}

export function DispatchChequeModal({
  isOpen,
  onClose,
  onConfirm,
  chequeNumber,
}: DispatchChequeModalProps) {
  const [dispatchedBy, setDispatchedBy] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dispatchedBy) {
      toast.error('Please select a dispatch method');
      return;
    }

    onConfirm(dispatchedBy, notes);
    
    // Reset form
    setDispatchedBy('');
    setNotes('');
  };

  const handleCancel = () => {
    setDispatchedBy('');
    setNotes('');
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
            <h3 className="text-lg font-semibold text-gray-900">
              Mark Cheque as Dispatched
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Cheque: <span className="font-medium">{chequeNumber}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Dispatched By Field */}
            <div className="mb-4">
              <label
                htmlFor="dispatchedBy"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Dispatch Method <span className="text-red-500">*</span>
              </label>
              <select
                id="dispatchedBy"
                value={dispatchedBy}
                onChange={(e) => setDispatchedBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-transparent"
                required
              >
                <option value="">Select dispatch method...</option>
                <option value="inPerson">In Person</option>
                <option value="Mail">Mail</option>
                <option value="Bank">Bank</option>
              </select>
            </div>

            {/* Notes Field */}
            <div className="mb-6">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-transparent resize-none"
                placeholder="Add any additional notes..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ems-green-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-ems-green-600 rounded-md hover:bg-ems-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ems-green-500"
              >
                📦 Mark as Dispatched
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
