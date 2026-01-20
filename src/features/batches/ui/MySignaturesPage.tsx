import { Link } from 'react-router-dom';
import { useMyPendingSignatures, useMySignatureHistory, useBulkApproveSignatures } from '@/features/requisitions/api/useSignatures';
import { useState } from 'react';
import { showConfirmation } from '@/shared/utils/toastHelpers';

export function MySignaturesPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { data: pendingData, isLoading: pendingLoading, error: pendingError } = useMyPendingSignatures();
  const { data: historyData, isLoading: historyLoading, error: historyError } = useMySignatureHistory();
  const bulkApproveMutation = useBulkApproveSignatures();

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isLoading = activeTab === 'pending' ? pendingLoading : historyLoading;
  const error = activeTab === 'pending' ? pendingError : historyError;
  const signatures = activeTab === 'pending' ? pendingData?.signatures : historyData?.signatures;

  const handleSelectAll = () => {
    if (activeTab === 'pending' && signatures) {
      const allIds = signatures.map(s => s.requisition);
      setSelectedIds(allIds);
    }
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleToggleSelect = (requisitionId: number) => {
    setSelectedIds(prev => 
      prev.includes(requisitionId) 
        ? prev.filter(id => id !== requisitionId)
        : [...prev, requisitionId]
    );
  };

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;
    
    showConfirmation({
      title: 'Approve Multiple Signatures?',
      message: `Are you sure you want to approve ${selectedIds.length} requisition(s)? This action will process all selected signatures.`,
      confirmText: 'Approve All',
      confirmButtonClass: 'px-3 py-1.5 text-sm font-medium text-white bg-ems-green-600 rounded-md hover:bg-ems-green-700',
      onConfirm: async () => {
        await bulkApproveMutation.mutateAsync({ requisition_ids: selectedIds });
        setSelectedIds([]);
      },
      loadingMessage: 'Approving signatures...',
      successMessage: null, // Handled by mutation hook
      errorMessage: () => null, // Handled by mutation hook
    });
  };

  // Reset selection when switching tabs
  const handleTabChange = (tab: 'pending' | 'history') => {
    setActiveTab(tab);
    setSelectedIds([]);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      signed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pending',
      signed: 'Signed',
      rejected: 'Rejected',
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Signatures</h1>
        <p className="text-gray-600 mt-1">
          Requisitions requiring your signature approval
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('pending')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-ems-green-500 text-ems-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending Signatures
            {pendingData && pendingData.count > 0 && (
              <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                {pendingData.count}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabChange('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-ems-green-500 text-ems-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Signature History
          </button>
        </nav>
      </div>

      {/* Bulk Actions Bar - Only show on pending tab */}
      {activeTab === 'pending' && signatures && signatures.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              {selectedIds.length > 0 ? `${selectedIds.length} selected` : 'No items selected'}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Select All
              </button>
              {selectedIds.length > 0 && (
                <button
                  onClick={handleDeselectAll}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  Deselect All
                </button>
              )}
            </div>
          </div>
          <button
            onClick={handleBulkApprove}
            disabled={selectedIds.length === 0 || bulkApproveMutation.isPending}
            className="px-4 py-2 bg-ems-green-500 text-white rounded-md hover:bg-ems-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            {bulkApproveMutation.isPending ? 'Approving...' : `Approve Selected (${selectedIds.length})`}
          </button>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading signatures...</div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load signatures</p>
        </div>
      ) : signatures && signatures.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {activeTab === 'pending' && (
                  <th className="px-6 py-3 w-12">
                    <input
                      type="checkbox"
                      checked={signatures.length > 0 && selectedIds.length === signatures.length}
                      onChange={(e) => e.target.checked ? handleSelectAll() : handleDeselectAll()}
                      className="h-4 w-4 text-ems-green-600 focus:ring-ems-green-500 border-gray-300 rounded"
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requisition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {signatures.map((signature) => (
                <tr key={signature.id} className="hover:bg-gray-50">
                  {activeTab === 'pending' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(signature.requisition)}
                        onChange={() => handleToggleSelect(signature.requisition)}
                        className="h-4 w-4 text-ems-green-600 focus:ring-ems-green-500 border-gray-300 rounded"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/requisitions/view/${signature.requisition}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {signature.requisition_number}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                      {signature.requisition_title}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {signature.payee_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {signature.total_amount ? formatCurrency(signature.total_amount) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {signature.payment_type?.replace('_', ' ') || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(signature.status)}`}>
                      {getStatusLabel(signature.status)}
                    </span>
                    {signature.status === 'rejected' && signature.rejection_reason && (
                      <p className="text-xs text-red-600 mt-1 max-w-xs truncate" title={signature.rejection_reason}>
                        {signature.rejection_reason}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {signature.status === 'pending' 
                      ? formatDate(signature.assigned_at)
                      : signature.signed_at 
                        ? formatDate(signature.signed_at)
                        : formatDate(signature.assigned_at)
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {activeTab === 'pending' && signature.status === 'pending' && (
                      <Link
                        to={`/requisitions/view/${signature.requisition}`}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-ems-green-500 hover:bg-ems-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ems-green-500"
                      >
                        Review & Sign
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4">
            {activeTab === 'pending' ? '✍️' : '✅'}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'pending' ? 'No pending signatures' : 'No signature history'}
          </h3>
          <p className="text-gray-600">
            {activeTab === 'pending'
              ? 'You have no requisitions awaiting your signature at this time'
              : 'You have not signed any requisitions yet'}
          </p>
        </div>
      )}
    </div>
  );
}
