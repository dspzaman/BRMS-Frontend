import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { showConfirmation } from '@/shared/utils/toastHelpers';
import { useEFTBatchDetail, useUpdateEFTBatchStatus, useExportEFTBatchCSV } from '@/features/requisitions/api/useEFTBatch';
import { DraftDetailDrawer } from './DraftDetailDrawer';

export function EFTBatchDetailPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const [selectedDraftId, setSelectedDraftId] = useState<number | null>(null);

  const { data: batch, isLoading, refetch } = useEFTBatchDetail(batchId ? parseInt(batchId) : null);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateEFTBatchStatus();
  const { mutate: exportCSV, isPending: isExporting } = useExportEFTBatchCSV();

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleUpdateStatus = async (newStatus: 'generated' | 'processed') => {
    if (!batch) return;

    try {
      await showConfirmation({
        title: `Mark Batch as ${newStatus === 'processed' ? 'Processed' : 'Generated'}?`,
        message: `This will update the status of all ${batch.draft_count} drafts and ${batch.requisition_count} requisitions in this batch.`,
        confirmText: `Mark as ${newStatus === 'processed' ? 'Processed' : 'Generated'}`,
        onConfirm: async () => {
          return new Promise((resolve, reject) => {
            updateStatus(
              {
                batchId: batch.id,
                payload: {
                  status: newStatus,
                  notes: `Batch status updated to ${newStatus}`,
                },
              },
              {
                onSuccess: () => {
                  toast.success(`Batch ${batch.batch_number} marked as ${newStatus}`);
                  refetch();
                  resolve();
                },
                onError: (error: any) => {
                  const errorMsg = error.response?.data?.error || 'Failed to update batch status';
                  toast.error(errorMsg);
                  reject(new Error(errorMsg));
                },
              }
            );
          });
        },
        loadingMessage: 'Updating batch status...',
        successMessage: null,
        errorMessage: () => null,
      });
    } catch (error) {
      // User cancelled or error occurred
    }
  };

  const handleDownloadCSV = () => {
    if (!batch) return;

    exportCSV(batch.id, {
      onSuccess: () => {
        toast.success(`CSV downloaded for batch ${batch.batch_number}`);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to download CSV');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ems-green-600"></div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">❌</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Batch Not Found</h3>
        <p className="text-gray-500 mb-4">The requested EFT batch could not be found.</p>
        <button
          onClick={() => navigate('/batches/processed-payments')}
          className="text-ems-green-600 hover:text-ems-green-700 font-medium"
        >
          ← Back to Processed Payments
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/batches/processed-payments')}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center"
          >
            ← Back to Processed Payments
          </button>
          <h1 className="text-2xl font-bold text-gray-900">EFT Batch Details</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadCSV}
            disabled={isExporting}
            className="px-4 py-2 bg-ems-green-600 text-white rounded-md hover:bg-ems-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? 'Downloading...' : 'Download CSV'}
          </button>
          {batch.status === 'generated' && (
            <button
              onClick={() => handleUpdateStatus('processed')}
              disabled={isUpdating}
              className="px-4 py-2 bg-ems-green-600 text-white rounded-md hover:bg-ems-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Updating...' : 'Mark as Processed'}
            </button>
          )}
        </div>
      </div>

      {/* Batch Summary Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Batch Number</label>
            <p className="mt-1 text-lg font-semibold text-gray-900">{batch.batch_number}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Batch Date</label>
            <p className="mt-1 text-lg text-gray-900">{formatDate(batch.batch_date)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Processing Date</label>
            <p className="mt-1 text-lg text-gray-900">
              {batch.processing_date ? formatDate(batch.processing_date) : 'Not set'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <p className="mt-1">
              <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                batch.status === 'generated' ? 'bg-yellow-100 text-yellow-800' :
                batch.status === 'processed' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {batch.status_display}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Total Payees</label>
            <p className="mt-1 text-2xl font-bold text-gray-900">{batch.draft_count}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Total Requisitions</label>
            <p className="mt-1 text-2xl font-bold text-gray-900">{batch.requisition_count}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Total Amount</label>
            <p className="mt-1 text-2xl font-bold text-ems-green-600">
              {formatCurrency(batch.total_amount)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Created By</label>
            <p className="mt-1 text-gray-900">
              {batch.created_by?.name || 'N/A'}
              <span className="text-sm text-gray-500 ml-2">
                on {formatDate(batch.created_at)}
              </span>
            </p>
          </div>
          {batch.processed_by && (
            <div>
              <label className="text-sm font-medium text-gray-500">Processed By</label>
              <p className="mt-1 text-gray-900">
                {batch.processed_by.name}
                <span className="text-sm text-gray-500 ml-2">
                  on {batch.processed_at ? formatDate(batch.processed_at) : 'N/A'}
                </span>
              </p>
            </div>
          )}
        </div>

        {batch.notes && (
          <div className="mt-6">
            <label className="text-sm font-medium text-gray-500">Notes</label>
            <p className="mt-1 text-gray-900">{batch.notes}</p>
          </div>
        )}

        {batch.comments && (
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-500">Comments</label>
            <p className="mt-1 text-gray-900">{batch.comments}</p>
          </div>
        )}
      </div>

      {/* Drafts Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Drafts in this Batch ({batch.drafts.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Draft Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requisitions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {batch.drafts.map((draft) => (
                <tr key={draft.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedDraftId(draft.id)}
                      className="text-sm font-medium text-ems-green-600 hover:text-ems-green-700 hover:underline cursor-pointer"
                    >
                      {draft.draft_number}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{draft.payee_name}</div>
                    <div className="text-xs text-gray-500">{draft.payee_type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(draft.total_amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {draft.requisition_count} requisition{draft.requisition_count !== 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-gray-500">
                      {draft.requisition_numbers?.slice(0, 3).join(', ')}
                      {draft.requisition_count > 3 && ` +${draft.requisition_count - 3} more`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      draft.current_status === 'generated' ? 'bg-yellow-100 text-yellow-800' :
                      draft.current_status === 'processed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {draft.current_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedDraftId(draft.id)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Draft Detail Drawer */}
      {selectedDraftId && (
        <DraftDetailDrawer
          draftId={selectedDraftId}
          onClose={() => setSelectedDraftId(null)}
        />
      )}
    </div>
  );
}
