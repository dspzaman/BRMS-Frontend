import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useEligibleRequisitions, useCreateEFTBatch } from '@/features/requisitions/api/useEFTBatch';

export function CreateEFTBatchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRequisitions, setSelectedRequisitions] = useState<Set<number>>(new Set());
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [expandedPayees, setExpandedPayees] = useState<Set<number>>(new Set());

  const { data: eligibleData, isLoading } = useEligibleRequisitions();
  const { mutate: createBatch, isPending: isCreating } = useCreateEFTBatch();

  // Auto-select requisitions if passed from Ready For Payment page
  useEffect(() => {
    const preselectedIds = location.state?.preselectedIds as number[] | undefined;
    if (preselectedIds && preselectedIds.length > 0) {
      setSelectedRequisitions(new Set(preselectedIds));
    }
  }, [location.state]);

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

  const handleTogglePayee = (payeeId: number) => {
    const newExpanded = new Set(expandedPayees);
    if (newExpanded.has(payeeId)) {
      newExpanded.delete(payeeId);
    } else {
      newExpanded.add(payeeId);
    }
    setExpandedPayees(newExpanded);
  };

  const handleSelectRequisition = (reqId: number) => {
    const newSelected = new Set(selectedRequisitions);
    if (newSelected.has(reqId)) {
      newSelected.delete(reqId);
    } else {
      newSelected.add(reqId);
    }
    setSelectedRequisitions(newSelected);
  };

  const handleSelectAllForPayee = (payeeRequisitions: any[]) => {
    const payeeReqIds = payeeRequisitions.map(r => r.id);
    const allSelected = payeeReqIds.every(id => selectedRequisitions.has(id));
    
    const newSelected = new Set(selectedRequisitions);
    if (allSelected) {
      payeeReqIds.forEach(id => newSelected.delete(id));
    } else {
      payeeReqIds.forEach(id => newSelected.add(id));
    }
    setSelectedRequisitions(newSelected);
  };

  const handleSelectAll = () => {
    if (!eligibleData) return;
    
    const allReqIds = eligibleData.payee_groups.flatMap(group => 
      group.requisitions.map(r => r.id)
    );
    
    const allSelected = allReqIds.every(id => selectedRequisitions.has(id));
    
    if (allSelected) {
      setSelectedRequisitions(new Set());
    } else {
      setSelectedRequisitions(new Set(allReqIds));
    }
  };

  const handleCreateBatch = () => {
    if (selectedRequisitions.size === 0) {
      toast.error('Please select at least one requisition');
      return;
    }

    if (!paymentDate) {
      toast.error('Please select a payment date');
      return;
    }

    createBatch(
      {
        requisition_ids: Array.from(selectedRequisitions),
        payment_date: paymentDate,
        notes: notes,
      },
      {
        onSuccess: (data) => {
          toast.success(data.message, { duration: 4000 });
          navigate('/processed-payments?tab=eft');
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.error || error.message || 'Failed to create EFT batch',
            { duration: 5000 }
          );
        },
      }
    );
  };

  // Memoize selected total to recalculate when selectedRequisitions changes
  const selectedTotal = useMemo(() => {
    if (!eligibleData) return '0.00';
    
    let total = 0;
    eligibleData.payee_groups.forEach(group => {
      group.requisitions.forEach(req => {
        if (selectedRequisitions.has(req.id)) {
          total += parseFloat(req.amount);
        }
      });
    });
    
    return total.toFixed(2);
  }, [eligibleData, selectedRequisitions]);

  // Memoize selected payee count to recalculate when selectedRequisitions changes
  const selectedPayeeCount = useMemo(() => {
    if (!eligibleData) return 0;
    
    const payeesWithSelection = new Set<string>();
    eligibleData.payee_groups.forEach(group => {
      const hasSelection = group.requisitions.some(req => selectedRequisitions.has(req.id));
      if (hasSelection) {
        payeesWithSelection.add(`${group.payee_type}-${group.payee_id}`);
      }
    });
    
    return payeesWithSelection.size;
  }, [eligibleData, selectedRequisitions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading eligible requisitions...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create EFT Batch</h1>
          <p className="text-gray-600 mt-1">
            Select requisitions and create EFT/CAFT payment batch
          </p>
        </div>
        <button
          onClick={() => navigate('/processed-payments?tab=eft')}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          ← Cancel
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Requisitions</div>
          <div className="text-2xl font-bold text-gray-900">
            {eligibleData?.total_requisitions || 0}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Payees</div>
          <div className="text-2xl font-bold text-gray-900">
            {eligibleData?.payee_count || 0}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Selected</div>
          <div className="text-2xl font-bold text-ems-green-700">
            {selectedRequisitions.size}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {selectedPayeeCount} payee(s)
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Selected Amount</div>
          <div className="text-2xl font-bold text-ems-green-700">
            {formatCurrency(selectedTotal)}
          </div>
        </div>
      </div>

      {/* Payment Date & Notes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Batch Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ems-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes for this batch..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ems-green-500"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              {selectedRequisitions.size === eligibleData?.total_requisitions
                ? '☑️ Deselect All'
                : '☐ Select All'}
            </button>
            <span className="text-sm text-gray-600">
              {selectedRequisitions.size} of {eligibleData?.total_requisitions || 0} selected
            </span>
          </div>
          <button
            onClick={handleCreateBatch}
            disabled={selectedRequisitions.size === 0 || !paymentDate || isCreating}
            className="px-6 py-2 bg-ems-green-600 text-white rounded-md hover:bg-ems-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isCreating ? 'Creating...' : '✓ Create EFT Batch'}
          </button>
        </div>
      </div>

      {/* Payee Groups */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Requisitions Grouped by Payee
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Requisitions are automatically grouped by payee for EFT processing
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {eligibleData?.payee_groups.map((group) => {
            const isExpanded = expandedPayees.has(group.payee_id);
            const allSelected = group.requisitions.every(r => selectedRequisitions.has(r.id));
            const someSelected = group.requisitions.some(r => selectedRequisitions.has(r.id));
            
            // Calculate selected count and total for this payee
            const selectedCount = group.requisitions.filter(r => selectedRequisitions.has(r.id)).length;
            const selectedPayeeTotal = group.requisitions
              .filter(r => selectedRequisitions.has(r.id))
              .reduce((sum, r) => sum + parseFloat(r.amount), 0);

            return (
              <div key={`${group.payee_type}-${group.payee_id}`} className="p-6">
                {/* Payee Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected && !allSelected;
                      }}
                      onChange={() => handleSelectAllForPayee(group.requisitions)}
                      className="h-5 w-5 text-ems-green-600 focus:ring-ems-green-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {group.payee_name}
                        </h4>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                          {group.payee_type}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {group.bank_name} • {group.institution_number}-{group.transit_number} • {group.account_number}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(selectedPayeeTotal.toFixed(2))}
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedCount} of {group.requisition_count} selected
                      </div>
                    </div>
                    <button
                      onClick={() => handleTogglePayee(group.payee_id)}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                    >
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  </div>
                </div>

                {/* Requisitions List (Expandable) */}
                {isExpanded && (
                  <div className="ml-9 mt-4 space-y-2">
                    {group.requisitions.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedRequisitions.has(req.id)}
                          onChange={() => handleSelectRequisition(req.id)}
                          className="h-4 w-4 text-ems-green-600 focus:ring-ems-green-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {req.requisition_number}
                          </div>
                          <div className="text-sm text-gray-600">
                            {req.description}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Submitted by: {req.submitted_by} • {formatDate(req.created_at)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(req.amount)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {(!eligibleData?.payee_groups || eligibleData.payee_groups.length === 0) && (
          <div className="p-12 text-center text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <div>No eligible requisitions found</div>
            <div className="text-sm mt-1">
              Requisitions must be in payment_processing status with payment method set to Draft/EFT
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
