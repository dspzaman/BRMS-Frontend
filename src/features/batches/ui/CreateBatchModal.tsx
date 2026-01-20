import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateBatch } from '../api';
import { BATCH_TYPE_OPTIONS } from '../model';
import type { CreateBatchRequest } from '../api/types';

interface CreateBatchModalProps {
  selectedRequisitionIds: number[];
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateBatchModal({ selectedRequisitionIds, onClose, onSuccess }: CreateBatchModalProps) {
  const navigate = useNavigate();
  const [batchType, setBatchType] = useState<'cheque' | 'eft' | 'wire'>('cheque');
  const [notes, setNotes] = useState('');

  const createBatchMutation = useCreateBatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const request: CreateBatchRequest = {
      batch_type: batchType,
      notes: notes.trim() || undefined,
      requisition_ids: selectedRequisitionIds,
    };

    try {
      const batch = await createBatchMutation.mutateAsync(request);
      onSuccess();
      navigate(`/batches/${batch.id}`);
    } catch (error) {
      console.error('Failed to create batch:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Batch</h2>
          <p className="text-sm text-gray-600 mt-1">
            {selectedRequisitionIds.length} requisition{selectedRequisitionIds.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Batch Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batch Type <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {BATCH_TYPE_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="batch_type"
                    value={option.value}
                    checked={batchType === option.value}
                    onChange={(e) => setBatchType(e.target.value as 'cheque' | 'eft' | 'wire')}
                    className="mr-2 text-ems-green-600 focus:ring-ems-green-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
              placeholder="Add any notes about this batch..."
            />
          </div>

          {/* Error Message */}
          {createBatchMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                Failed to create batch. Please try again.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={createBatchMutation.isPending}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createBatchMutation.isPending}
              className="flex-1 px-4 py-2 bg-ems-green-600 text-white rounded-lg hover:bg-ems-green-700 disabled:opacity-50"
            >
              {createBatchMutation.isPending ? 'Creating...' : 'Create Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
