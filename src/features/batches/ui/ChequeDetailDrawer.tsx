import { useChequeDetail } from '@/features/requisitions/api/useProcessedPayments';
import { useChequeStatusHistory } from '@/features/requisitions/api/useChequeStatusHistory';

interface ChequeDetailDrawerProps {
  chequeId: number | null;
  onClose: () => void;
}

export function ChequeDetailDrawer({ chequeId, onClose }: ChequeDetailDrawerProps) {
  const { data: cheque, isLoading } = useChequeDetail(chequeId);
  const { data: statusHistory, isLoading: historyLoading } = useChequeStatusHistory(chequeId);

  if (!chequeId) return null;

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

  return (
    <>
      {/* Drawer - No backdrop, user can interact with parent */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-l-2 border-gray-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Cheque Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {cheque?.cheque_number || 'Loading...'} • {cheque ? cheque.payee_name : ''}
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
              <div className="text-gray-600">Loading cheque details...</div>
            </div>
          ) : cheque ? (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Cheque Summary
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Cheque Number</p>
                    <p className="text-xl font-bold text-gray-900">{cheque.cheque_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="text-xl font-bold text-ems-green-700">
                      {formatCurrency(cheque.total_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Payee</p>
                    <p className="text-base font-medium text-gray-900">{cheque.payee_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      cheque.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      cheque.status === 'printed' ? 'bg-blue-100 text-blue-800' :
                      cheque.status === 'signed' ? 'bg-purple-100 text-purple-800' :
                      cheque.status === 'distributed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {cheque.status.charAt(0).toUpperCase() + cheque.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Cheque Date</p>
                    <p className="text-base font-medium text-gray-900">
                      {cheque.cheque_date ? formatDate(cheque.cheque_date) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Created By</p>
                    <p className="text-base font-medium text-gray-900">{cheque.created_by_name}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Created At</p>
                  <p className="text-base font-medium text-gray-900">{formatDate(cheque.created_at)}</p>
                </div>
                {cheque.notes && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-1">Notes</p>
                    <p className="text-sm text-gray-900">{cheque.notes}</p>
                  </div>
                )}
              </div>

              {/* Requisitions Table */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Requisitions ({cheque.requisition_count})
                </h3>

                {cheque.requisitions.length === 0 ? (
                  <p className="text-sm text-gray-500">No requisitions found for this cheque.</p>
                ) : (
                  <div className="space-y-3">
                    {cheque.requisitions.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            <a
                              href={`/requisitions/view/${req.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-ems-green-600 hover:text-ems-green-700 hover:underline"
                            >
                              {req.requisition_number}
                            </a>
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Submitted by: {req.submitted_by}
                          </p>
                          <p className="text-xs text-gray-600">
                            Payee: {req.payee_name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {req.description}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(req.amount)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(req.created_at)}
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
                              record.status === 'voided' || record.status === 'cancelled' 
                                ? 'bg-red-100 text-red-600'
                                : record.status === 'cashed' || record.status === 'payment_completed'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-blue-100 text-blue-600'
                            }`}>
                              {record.status === 'voided' || record.status === 'cancelled' ? '⚠️' :
                               record.status === 'cashed' ? '💰' :
                               record.status === 'dispatched' ? '📦' :
                               record.status === 'signed' ? '✍️' : '📄'}
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
                                record.status === 'voided' || record.status === 'cancelled'
                                  ? 'bg-red-100 text-red-700'
                                  : record.status === 'cashed'
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
              Cheque not found
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
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
