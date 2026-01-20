import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePreviewChequeGroups, useGenerateCheque } from '../api';
import { usePaymentProcessingRequisitions } from '@/features/requisitions/api/usePaymentProcessing';
import type { ChequeGroup } from '../api/types';
import toast from 'react-hot-toast';

export function ChequeGenerationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRequisitions, setSelectedRequisitions] = useState<number[]>([]);
  const [chequeNumbers, setChequeNumbers] = useState<Record<string, string>>({});
  const [generatingGroups, setGeneratingGroups] = useState<Set<string>>(new Set());

  // Fetch payment processing requisitions (only cheque payment type)
  const { data: paymentData, isLoading: isLoadingPool } = usePaymentProcessingRequisitions('cheque');

  // Auto-select requisitions passed from dashboard
  useEffect(() => {
    const preselectedIds = location.state?.preselectedIds as number[] | undefined;
    if (preselectedIds && preselectedIds.length > 0) {
      setSelectedRequisitions(preselectedIds);
    }
  }, [location.state]);

  // Preview cheque groups
  const { data: preview, isLoading: isLoadingPreview } = usePreviewChequeGroups(selectedRequisitions);

  // Generate cheque mutation
  const generateChequeMutation = useGenerateCheque();

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(parseFloat(amount));
  };

  const handleSelectAll = () => {
    if (paymentData?.requisitions) {
      const allIds = paymentData.requisitions.map(req => req.id);
      setSelectedRequisitions(allIds);
    }
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

  const handleRemoveFromGroup = (_groupKey: string, reqId: number) => {
    setSelectedRequisitions(prev => prev.filter(id => id !== reqId));
  };

  const getGroupKey = (group: ChequeGroup) => {
    return `${group.payee_type}_${group.payee_id}`;
  };

  const handleGenerateCheque = async (group: ChequeGroup) => {
    const groupKey = getGroupKey(group);
    const chequeNumber = chequeNumbers[groupKey];

    if (!chequeNumber || !chequeNumber.trim()) {
      toast.error('Please enter a cheque number');
      return;
    }

    const requisitionIds = group.requisitions.map(r => r.id);

    setGeneratingGroups(prev => new Set(prev).add(groupKey));

    try {
      await generateChequeMutation.mutateAsync({
        cheque_number: chequeNumber.trim(),
        requisition_ids: requisitionIds,
      });

      // Remove generated requisitions from selection
      setSelectedRequisitions(prev => prev.filter(id => !requisitionIds.includes(id)));
      
      // Clear cheque number input
      setChequeNumbers(prev => {
        const updated = { ...prev };
        delete updated[groupKey];
        return updated;
      });

      toast.success(`Cheque ${chequeNumber} generated successfully!`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate cheque');
    } finally {
      setGeneratingGroups(prev => {
        const updated = new Set(prev);
        updated.delete(groupKey);
        return updated;
      });
    }
  };

  const handleGenerateAll = async () => {
    if (!preview?.groups || preview.groups.length === 0) {
      toast.error('No groups to generate');
      return;
    }

    // Check all groups have cheque numbers
    const missingNumbers = preview.groups.filter(group => {
      const groupKey = getGroupKey(group);
      return !chequeNumbers[groupKey]?.trim();
    });

    if (missingNumbers.length > 0) {
      toast.error('Please enter cheque numbers for all groups');
      return;
    }

    // Generate all cheques sequentially
    for (const group of preview.groups) {
      await handleGenerateCheque(group);
    }
  };

  if (isLoadingPool) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-600">Loading requisitions...</div>
      </div>
    );
  }

  const availableRequisitions = paymentData?.requisitions || [];

  return (
    <>
      {/* Header */}
      <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Generate Cheques</h1>
              <p className="text-gray-600 mt-1">
                Select requisitions and generate cheques grouped by payee
              </p>
            </div>
            <button
              onClick={() => navigate('/payment-processing')}
              className="px-4 py-2 bg-ems-green-600 text-white rounded-lg hover:bg-ems-green-700 transition-colors"
            >
              Back to Payment Processing
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Available Requisitions</div>
            <div className="text-2xl font-bold text-gray-900">{availableRequisitions.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Selected</div>
            <div className="text-2xl font-bold text-ems-green-600">{selectedRequisitions.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Cheques to Generate</div>
            <div className="text-2xl font-bold text-blue-600">{preview?.total_groups || 0}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Available Requisitions */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  📋 Available Requisitions
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-ems-green-600 hover:text-ems-green-700"
                  >
                    Select All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={handleDeselectAll}
                    className="text-sm text-gray-600 hover:text-gray-700"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 max-h-[600px] overflow-y-auto">
              {availableRequisitions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No requisitions available for cheque generation
                </div>
              ) : (
                <div className="space-y-2">
                  {availableRequisitions.map((req) => (
                    <label
                      key={req.id}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedRequisitions.includes(req.id)
                          ? 'border-ems-green-500 bg-ems-green-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedRequisitions.includes(req.id)}
                        onChange={() => handleToggleRequisition(req.id)}
                        className="h-4 w-4 text-ems-green-600 rounded border-gray-300 focus:ring-ems-green-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            {req.requisition_number}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(req.total_with_tax)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {req.payee_name} • {req.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Grouped Preview */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  💵 Cheque Groups Preview
                </h2>
                {preview && preview.groups.length > 0 && (
                  <button
                    onClick={handleGenerateAll}
                    disabled={generateChequeMutation.isPending}
                    className="px-4 py-2 bg-ems-green-600 text-white rounded-lg hover:bg-ems-green-700 disabled:opacity-50 text-sm font-medium"
                  >
                    Generate All Cheques
                  </button>
                )}
              </div>
            </div>
            <div className="p-4 max-h-[600px] overflow-y-auto">
              {isLoadingPreview ? (
                <div className="text-center py-8 text-gray-500">
                  Loading preview...
                </div>
              ) : !preview || preview.groups.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Select requisitions to see grouped preview
                </div>
              ) : (
                <div className="space-y-4">
                  {preview.groups.map((group) => {
                    const groupKey = getGroupKey(group);
                    const isGenerating = generatingGroups.has(groupKey);

                    return (
                      <div
                        key={groupKey}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        {/* Group Header */}
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {group.payee_name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {group.requisition_count} requisition{group.requisition_count !== 1 ? 's' : ''} • {formatCurrency(group.total_amount)}
                              </p>
                            </div>
                          </div>

                          {/* Cheque Number Input */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Enter cheque number (e.g., CHQ-12345)"
                              value={chequeNumbers[groupKey] || ''}
                              onChange={(e) =>
                                setChequeNumbers(prev => ({
                                  ...prev,
                                  [groupKey]: e.target.value,
                                }))
                              }
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-ems-green-500 focus:border-transparent"
                            />
                            <button
                              onClick={() => handleGenerateCheque(group)}
                              disabled={isGenerating || !chequeNumbers[groupKey]?.trim()}
                              className="px-4 py-2 bg-ems-green-600 text-white rounded-lg hover:bg-ems-green-700 disabled:opacity-50 text-sm font-medium whitespace-nowrap"
                            >
                              {isGenerating ? 'Generating...' : 'Generate'}
                            </button>
                          </div>
                        </div>

                        {/* Requisitions in Group */}
                        <div className="divide-y divide-gray-200">
                          {group.requisitions.map((req) => (
                            <div
                              key={req.id}
                              className="px-4 py-3 hover:bg-gray-50 flex items-center justify-between"
                            >
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-gray-900 text-sm">
                                    {req.requisition_number}
                                  </span>
                                  <span className="font-semibold text-gray-900 text-sm">
                                    {formatCurrency(req.amount)}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {req.title} • {req.prepared_by}
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveFromGroup(groupKey, req.id)}
                                className="ml-3 text-red-600 hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Summary */}
        <div className="mt-6 bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 text-center">
            {selectedRequisitions.length > 0 ? (
              <>
                {selectedRequisitions.length} requisition{selectedRequisitions.length !== 1 ? 's' : ''} selected
                {preview && preview.total_groups > 0 && (
                  <> → {preview.total_groups} cheque{preview.total_groups !== 1 ? 's' : ''} to generate</>
                )}
              </>
            ) : (
              'Select requisitions to start generating cheques'
            )}
          </div>
        </div>
    </>
  );
}
