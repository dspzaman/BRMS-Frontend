import { useChequeDetail } from '@/features/requisitions/api/useProcessedPayments';

interface ChequeDetailDrawerProps {
  chequeId: number | null;
  onClose: () => void;
}

export function ChequeDetailModal({ chequeId, onClose }: ChequeDetailDrawerProps) {
  const { data: cheque, isLoading } = useChequeDetail(chequeId);

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

  return (
    <>
      {/* Drawer - No backdrop, user can interact with parent */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-l-2 border-gray-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Cheque Details: {cheque?.cheque_number || 'Loading...'}
            </h2>
            {cheque && (
              <p className="text-sm text-gray-600 mt-1">
                {cheque.payee_name} • {formatCurrency(cheque.total_amount)}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <>
              {/* Cheque Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Status</div>
                    <div className="mt-1">
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
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Cheque Date</div>
                    <div className="mt-1 text-sm font-medium text-gray-900">
                      {cheque.cheque_date ? formatDate(cheque.cheque_date) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Created By</div>
                    <div className="mt-1 text-sm font-medium text-gray-900">{cheque.created_by_name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Created At</div>
                    <div className="mt-1 text-sm font-medium text-gray-900">{formatDate(cheque.created_at)}</div>
                  </div>
                </div>
                {cheque.notes && (
                  <div className="mt-4">
                    <div className="text-xs text-gray-500 uppercase">Notes</div>
                    <div className="mt-1 text-sm text-gray-900">{cheque.notes}</div>
                  </div>
                )}
              </div>

              {/* Requisitions Table */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Requisitions ({cheque.requisition_count})
                </h3>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Req #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted By
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payee
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cheque.requisitions.map((req) => (
                        <tr key={req.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-ems-green-600">
                              {req.requisition_number}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{req.submitted_by}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">{req.payee_name}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {formatCurrency(req.amount)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">{req.description}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(req.created_at)}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Cheque not found
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
