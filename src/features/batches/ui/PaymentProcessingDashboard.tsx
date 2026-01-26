import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaymentProcessingRequisitions } from '@/features/requisitions/api/usePaymentProcessing';

type PaymentType = 'cheque' | 'eft' | 'wire';

export function PaymentProcessingDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PaymentType>('cheque');
  const [selectedRequisitions, setSelectedRequisitions] = useState<number[]>([]);

  const { data: chequeData, isLoading: chequeLoading } = usePaymentProcessingRequisitions('cheque');
  const { data: eftData, isLoading: eftLoading } = usePaymentProcessingRequisitions('eft');
  const { data: wireData, isLoading: wireLoading } = usePaymentProcessingRequisitions('wire');

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'cheque':
        return chequeData;
      case 'eft':
        return eftData;
      case 'wire':
        return wireData;
      default:
        return null;
    }
  };

  const isLoading = chequeLoading || eftLoading || wireLoading;
  const currentData = getCurrentData();
  const requisitions = currentData?.requisitions || [];

  const handleSelectAll = () => {
    const allIds = requisitions.map(req => req.id);
    setSelectedRequisitions(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedRequisitions([]);
  };

  const handleToggleRequisition = (reqId: number) => {
    setSelectedRequisitions(prev =>
      prev.includes(reqId)
        ? prev.filter(id => id !== reqId)
        : [...prev, reqId]
    );
  };

  const handleProceedToGeneration = () => {
    if (selectedRequisitions.length === 0) {
      alert('Please select at least one requisition');
      return;
    }

    if (activeTab === 'cheque') {
      navigate('/payment-processing/cheques', {
        state: { preselectedIds: selectedRequisitions }
      });
    } else if (activeTab === 'eft') {
      navigate('/create-eft-batch', {
        state: { preselectedIds: selectedRequisitions }
      });
    } else if (activeTab === 'wire') {
      alert('Wire transfer processing coming soon');
    }
  };

  const selectedTotal = requisitions
    .filter(req => selectedRequisitions.includes(req.id))
    .reduce((sum, req) => sum + parseFloat(req.total_with_tax), 0);

  const getTabLabel = (type: PaymentType) => {
    const data = type === 'cheque' ? chequeData : type === 'eft' ? eftData : wireData;
    const count = data?.requisitions?.length || 0;
    const label = type === 'cheque' ? 'Cheques' : type === 'eft' ? 'EFT' : 'Wire Transfer';
    return `${label} (${count})`;
  };

  const getPaymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      cheque: 'Cheque',
      eft: 'EFT',
      wire: 'Wire Transfer',
      office_credit_card: 'Credit Card',
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-600">Loading payment processing data...</div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ready For Payment</h1>
          <p className="text-gray-600 mt-1">
            Requisitions ready to generate payment instruments
          </p>
        </div>
        <button
          onClick={() => navigate('/processed-payments')}
          className="px-4 py-2 bg-ems-green-600 text-white rounded-lg hover:bg-ems-green-700 transition-colors font-medium"
        >
          View Processed Payments →
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Cheques</div>
              <div className="text-2xl font-bold text-gray-900">
                {chequeData?.requisitions?.length || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {formatCurrency(
                  chequeData?.requisitions?.reduce((sum, req) => sum + parseFloat(req.total_with_tax), 0) || 0
                )}
              </div>
            </div>
            <div className="text-4xl">💵</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">EFT</div>
              <div className="text-2xl font-bold text-gray-900">
                {eftData?.requisitions?.length || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {formatCurrency(
                  eftData?.requisitions?.reduce((sum, req) => sum + parseFloat(req.total_with_tax), 0) || 0
                )}
              </div>
            </div>
            <div className="text-4xl">📄</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Wire Transfer</div>
              <div className="text-2xl font-bold text-gray-900">
                {wireData?.requisitions?.length || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {formatCurrency(
                  wireData?.requisitions?.reduce((sum, req) => sum + parseFloat(req.total_with_tax), 0) || 0
                )}
              </div>
            </div>
            <div className="text-4xl">🏦</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => {
              setActiveTab('cheque');
              setSelectedRequisitions([]);
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cheque'
                ? 'border-ems-green-500 text-ems-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {getTabLabel('cheque')}
          </button>
          <button
            onClick={() => {
              setActiveTab('eft');
              setSelectedRequisitions([]);
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'eft'
                ? 'border-ems-green-500 text-ems-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {getTabLabel('eft')}
          </button>
          <button
            onClick={() => {
              setActiveTab('wire');
              setSelectedRequisitions([]);
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'wire'
                ? 'border-ems-green-500 text-ems-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {getTabLabel('wire')}
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Action Bar */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleSelectAll}
              className="text-sm text-ems-green-600 hover:text-ems-green-700 font-medium"
            >
              Select All
            </button>
            {selectedRequisitions.length > 0 && (
              <>
                <span className="text-gray-300">|</span>
                <button
                  onClick={handleDeselectAll}
                  className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                >
                  Deselect All
                </button>
              </>
            )}
          </div>
          <button
            onClick={handleProceedToGeneration}
            disabled={selectedRequisitions.length === 0}
            className="px-4 py-2 bg-ems-green-600 text-white rounded-lg hover:bg-ems-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            {activeTab === 'cheque' && 'Generate Cheques →'}
            {activeTab === 'eft' && 'Generate EFT →'}
            {activeTab === 'wire' && 'Process Wire Transfer →'}
          </button>
        </div>

        {/* Requisition List */}
        <div className="overflow-x-auto">
          {requisitions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">📭</div>
              <div>No requisitions available for {getPaymentTypeLabel(activeTab)}</div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 w-12">
                    <input
                      type="checkbox"
                      checked={requisitions.length > 0 && selectedRequisitions.length === requisitions.length}
                      onChange={(e) => e.target.checked ? handleSelectAll() : handleDeselectAll()}
                      className="h-4 w-4 text-ems-green-600 focus:ring-ems-green-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requisition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prepared By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requisitions.map((req) => (
                  <tr
                    key={req.id}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedRequisitions.includes(req.id) ? 'bg-ems-green-50' : ''
                    }`}
                    onClick={() => handleToggleRequisition(req.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedRequisitions.includes(req.id)}
                        onChange={() => handleToggleRequisition(req.id)}
                        className="h-4 w-4 text-ems-green-600 focus:ring-ems-green-500 border-gray-300 rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{req.requisition_number}</div>
                      <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">{req.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {req.payee_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      N/A
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(req.total_with_tax)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {req.prepared_by_name || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Summary */}
        {selectedRequisitions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">
                {selectedRequisitions.length} requisition{selectedRequisitions.length !== 1 ? 's' : ''} selected
              </span>
              <span className="font-semibold text-gray-900">
                Total: {formatCurrency(selectedTotal)}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
