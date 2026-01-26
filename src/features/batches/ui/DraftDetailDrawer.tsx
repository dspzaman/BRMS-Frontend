import { useDraftDetail, useDraftStatusHistory, useUpdateDraftStatus } from '@/features/requisitions/api/useEFTBatch';
import toast from 'react-hot-toast';
import { showConfirmation } from '@/shared/utils/toastHelpers';

interface DraftDetailDrawerProps {
  draftId: number | null;
  onClose: () => void;
}

export function DraftDetailDrawer({ draftId, onClose }: DraftDetailDrawerProps) {
  const { data: draft, isLoading } = useDraftDetail(draftId);
  const { data: statusHistory, isLoading: historyLoading } = useDraftStatusHistory(draftId);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateDraftStatus();

  if (!draftId) return null;

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleMarkAsProcessed = () => {
    if (!draft) return;

    showConfirmation({
      title: 'Mark as Processed?',
      message: `This will mark EFT payment ${draft.draft_number} as processed and update all ${draft.requisition_count} linked requisition(s) to payment_completed status.`,
      confirmText: 'Mark as Processed',
      onConfirm: async () => {
        updateStatus(
          {
            draftId: draft.id,
            payload: {
              status: 'processed',
              notes: 'EFT payment processed',
            },
          },
          {
            onSuccess: (data) => {
              toast.success(data.message, { duration: 4000 });
            },
            onError: (error: any) => {
              toast.error(
                error.response?.data?.error || error.message || 'Failed to update status',
                { duration: 5000 }
              );
            },
          }
        );
      },
    });
  };

  return (
    <>
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-l-2 border-gray-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              EFT Payment Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {draft?.draft_number || 'Loading...'} • {draft ? draft.payee_name : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            aria-label="Close drawer"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-600">Loading draft details...</div>
            </div>
          ) : draft ? (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment Summary
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Draft Number</p>
                    <p className="text-xl font-bold text-gray-900">{draft.draft_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="text-xl font-bold text-ems-green-700">
                      {formatCurrency(draft.total_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Payee</p>
                    <p className="text-base font-medium text-gray-900">{draft.payee_name}</p>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded mt-1 inline-block">
                      {draft.payee_type}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      draft.current_status === 'generated' ? 'bg-yellow-100 text-yellow-800' :
                      draft.current_status === 'processed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {draft.status_display}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Payment Date</p>
                    <p className="text-base font-medium text-gray-900">
                      {formatDate(draft.draft_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Created By</p>
                    <p className="text-base font-medium text-gray-900">{draft.created_by_name}</p>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="border-t border-blue-200 pt-4 mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Banking Information</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Bank:</span>
                      <span className="ml-2 font-medium text-gray-900">{draft.bank_name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Institution:</span>
                      <span className="ml-2 font-medium text-gray-900">{draft.institution_number || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Transit:</span>
                      <span className="ml-2 font-medium text-gray-900">{draft.transit_number || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Account:</span>
                      <span className="ml-2 font-medium text-gray-900">{draft.account_number || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {draft.notes && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-1">Notes</p>
                    <p className="text-sm text-gray-900">{draft.notes}</p>
                  </div>
                )}
              </div>

              {/* Requisitions Table */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Requisitions ({draft.requisition_count})
                </h3>

                {draft.requisitions.length === 0 ? (
                  <p className="text-sm text-gray-500">No requisitions found for this draft.</p>
                ) : (
                  <div className="space-y-3">
                    {draft.requisitions.map((draftReq) => (
                      <div
                        key={draftReq.id}
                        className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            <a
                              href={`/requisitions/view/${draftReq.requisition.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-ems-green-600 hover:text-ems-green-700 hover:underline"
                            >
                              {draftReq.requisition.requisition_number}
                            </a>
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Submitted by: {draftReq.requisition.submitted_by}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {draftReq.requisition.description}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(draftReq.amount)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(draftReq.requisition.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status History */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Status History
                </h3>

                {historyLoading ? (
                  <div className="text-center py-4 text-gray-500">Loading history...</div>
                ) : statusHistory && statusHistory.history.length > 0 ? (
                  <div className="space-y-4">
                    {statusHistory.history.map((record, index) => (
                      <div key={record.id} className="relative">
                        {/* Timeline line */}
                        {index < statusHistory.history.length - 1 && (
                          <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />
                        )}
                        
                        <div className="flex gap-4">
                          {/* Timeline dot */}
                          <div className="relative flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              record.status === 'processed'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-blue-100 text-blue-600'
                            }`}>
                              {record.status === 'processed' ? '✓' : '📄'}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 pb-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {record.status_display}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {formatDateTime(record.timestamp)}
                                </p>
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                record.status === 'processed'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {record.status_display}
                              </span>
                            </div>
                            
                            <p className="text-xs text-gray-600 mt-2">
                              Updated by: <span className="font-medium">{record.updated_by.name}</span>
                            </p>
                            
                            {record.notes && (
                              <div className="mt-2 bg-gray-50 rounded p-2 border border-gray-200">
                                <p className="text-xs text-gray-700">{record.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No status history available.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Draft not found
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          {draft && draft.current_status === 'generated' && (
            <button
              onClick={handleMarkAsProcessed}
              disabled={isUpdating}
              className="px-6 py-2 bg-ems-green-600 text-white rounded-md hover:bg-ems-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUpdating ? 'Processing...' : '✓ Mark as Processed'}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
