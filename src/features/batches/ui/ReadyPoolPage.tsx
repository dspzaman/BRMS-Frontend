import { useState } from 'react';
import { useReadyPool } from '../api';
import { BATCH_TYPE_LABELS } from '../model';
import { CreateBatchModal } from './CreateBatchModal';

export function ReadyPoolPage() {
  const [selectedPaymentType, setSelectedPaymentType] = useState<'cheque' | 'eft' | 'wire' | undefined>();
  const [selectedRequisitions, setSelectedRequisitions] = useState<number[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, isLoading, error } = useReadyPool(selectedPaymentType);

  const handleSelectAll = (checked: boolean) => {
    if (checked && data?.requisitions) {
      setSelectedRequisitions(data.requisitions.map(r => r.id));
    } else {
      setSelectedRequisitions([]);
    }
  };

  const handleSelectRequisition = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRequisitions(prev => [...prev, id]);
    } else {
      setSelectedRequisitions(prev => prev.filter(reqId => reqId !== id));
    }
  };

  const handleCreateBatch = () => {
    setIsCreateModalOpen(true);
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading ready pool...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load ready pool requisitions</p>
      </div>
    );
  }

  const allSelected = (data?.requisitions?.length ?? 0) > 0 && 
    selectedRequisitions.length === (data?.requisitions?.length ?? 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ready Pool</h1>
          <p className="text-gray-600 mt-1">
            Requisitions ready to be grouped into batches for signature approval
          </p>
        </div>
        <button
          onClick={handleCreateBatch}
          disabled={selectedRequisitions.length === 0}
          className="px-4 py-2 bg-ems-green-600 text-white rounded-lg hover:bg-ems-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Create Batch ({selectedRequisitions.length})
        </button>
      </div>

      {/* Summary Cards */}
      {data?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setSelectedPaymentType(selectedPaymentType === 'cheque' ? undefined : 'cheque')}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedPaymentType === 'cheque'
                ? 'border-ems-green-500 bg-ems-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">📝 Cheque</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {data.summary.cheque.count}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatCurrency(data.summary.cheque.total_amount)}
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedPaymentType(selectedPaymentType === 'eft' ? undefined : 'eft')}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedPaymentType === 'eft'
                ? 'border-ems-green-500 bg-ems-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">💳 EFT</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {data.summary.eft.count}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatCurrency(data.summary.eft.total_amount)}
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedPaymentType(selectedPaymentType === 'wire' ? undefined : 'wire')}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedPaymentType === 'wire'
                ? 'border-ems-green-500 bg-ems-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">🌐 Wire Transfer</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {data.summary.wire.count}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatCurrency(data.summary.wire.total_amount)}
                </p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Filter Info */}
      {selectedPaymentType && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Filtered by:</span>
          <span className="px-2 py-1 bg-ems-green-100 text-ems-green-800 rounded">
            {BATCH_TYPE_LABELS[selectedPaymentType]}
          </span>
          <button
            onClick={() => setSelectedPaymentType(undefined)}
            className="text-ems-green-600 hover:text-ems-green-700"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Requisitions Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {data?.requisitions && data.requisitions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-ems-green-600 focus:ring-ems-green-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requisition #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prepared By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.requisitions.map((req) => (
                  <tr
                    key={req.id}
                    className={`hover:bg-gray-50 ${
                      selectedRequisitions.includes(req.id) ? 'bg-ems-green-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRequisitions.includes(req.id)}
                        onChange={(e) => handleSelectRequisition(req.id, e.target.checked)}
                        className="rounded border-gray-300 text-ems-green-600 focus:ring-ems-green-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {req.requisition_number}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {req.payee_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {req.description}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {BATCH_TYPE_LABELS[req.payment_type as keyof typeof BATCH_TYPE_LABELS] || req.payment_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatCurrency(req.total_with_tax)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(req.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {req.prepared_by_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No requisitions in ready pool
            </h3>
            <p className="text-gray-600">
              {selectedPaymentType
                ? `No ${BATCH_TYPE_LABELS[selectedPaymentType]} requisitions available for batching`
                : 'All requisitions have been processed or are in batches'}
            </p>
          </div>
        )}
      </div>

      {/* Create Batch Modal */}
      {isCreateModalOpen && (
        <CreateBatchModal
          selectedRequisitionIds={selectedRequisitions}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setSelectedRequisitions([]);
            setIsCreateModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
