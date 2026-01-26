import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { showConfirmation } from '@/shared/utils/toastHelpers';
import { useProcessedPayments } from '@/features/requisitions/api/useProcessedPayments';
import { useUpdateChequeStatus } from '@/features/requisitions/api/useChequeStatusUpdate';
import { ChequeDetailDrawer } from './ChequeDetailDrawer';
import { DispatchChequeModal } from './DispatchChequeModal';
import { VoidChequeModal } from './VoidChequeModal';
import { DraftDetailDrawer } from './DraftDetailDrawer';

type PaymentType = 'cheque' | 'eft' | 'wire';

type BulkMode = 'sign' | 'cash' | null;

export function ProcessedPaymentsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PaymentType>('cheque');
  const [selectedChequeId, setSelectedChequeId] = useState<number | null>(null);
  const [bulkMode, setBulkMode] = useState<BulkMode>(null);
  const [selectedCheques, setSelectedCheques] = useState<Set<number>>(new Set());
  const [selectedDispatchedCheques, setSelectedDispatchedCheques] = useState<Set<number>>(new Set());
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [dispatchingCheque, setDispatchingCheque] = useState<{ id: number; number: string } | null>(null);
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [voidingCheque, setVoidingCheque] = useState<{ id: number; number: string } | null>(null);
  const [selectedDraftId, setSelectedDraftId] = useState<number | null>(null);
  
  // Search and filter states
  const [chequeSearchTerm, setChequeSearchTerm] = useState('');
  const [chequeStatusFilter, setChequeStatusFilter] = useState<string>('all');
  const [eftSearchTerm, setEftSearchTerm] = useState('');
  const [eftStatusFilter, setEftStatusFilter] = useState<string>('all');

  const { data: chequeData, isLoading: chequeLoading, refetch: refetchCheques } = useProcessedPayments('cheque');
  const { data: eftData, isLoading: eftLoading } = useProcessedPayments('eft');
  const { data: wireData, isLoading: wireLoading } = useProcessedPayments('wire');
  
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateChequeStatus();

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

  const getPaymentTypeLabel = (type: PaymentType) => {
    switch (type) {
      case 'cheque':
        return 'Cheques';
      case 'eft':
        return 'DD/Draft (EFT)';
      case 'wire':
        return 'Wire Transfers';
    }
  };

  const getTabLabel = (type: PaymentType) => {
    const data = type === 'cheque' ? chequeData : type === 'eft' ? eftData : wireData;
    const count = data?.summary[type]?.count || 0;
    return `${getPaymentTypeLabel(type)} (${count})`;
  };

  const isLoading = chequeLoading || eftLoading || wireLoading;
  const currentData = getCurrentData();
  const allCheques = currentData?.cheques || [];
  const allEftBatches = currentData?.eft_batches || [];
  
  // Filter cheques based on search term and status
  const filteredCheques = allCheques.filter((cheque: any) => {
    const matchesSearch = chequeSearchTerm === '' || 
      cheque.cheque_number.toLowerCase().includes(chequeSearchTerm.toLowerCase()) ||
      cheque.payee_name.toLowerCase().includes(chequeSearchTerm.toLowerCase());
    
    const matchesStatus = chequeStatusFilter === 'all' || cheque.status === chequeStatusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Filter EFT batches based on search term and status
  const filteredEftBatches = allEftBatches.filter((batch: any) => {
    const matchesSearch = eftSearchTerm === '' || 
      batch.batch_number.toLowerCase().includes(eftSearchTerm.toLowerCase());
    
    const matchesStatus = eftStatusFilter === 'all' || batch.status === eftStatusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const cheques = filteredCheques;
  const eftBatches = filteredEftBatches;

  const getNextStatus = (currentStatus: string): string | null => {
    const statusFlow: Record<string, string> = {
      'generated': 'signed',
      'draft': 'signed',
      'printed': 'signed',
      'signed': 'dispatched',
      'dispatched': 'cashed',
      'mailed': 'cashed',
    };
    return statusFlow[currentStatus] || null;
  };

  const getNextActionLabel = (currentStatus: string): string | null => {
    const nextStatus = getNextStatus(currentStatus);
    if (!nextStatus) return null;
    
    const labels: Record<string, string> = {
      'signed': '✍️ Mark as Signed',
      'dispatched': '📦 Mark as Dispatched',
      'cashed': '💰 Mark as Cashed',
    };
    return labels[nextStatus] || null;
  };

  const handleStatusUpdate = (chequeId: number, currentStatus: string, chequeNumber: string) => {
    const nextStatus = getNextStatus(currentStatus);
    if (!nextStatus) return;

    // If next status is 'dispatched', show dispatch modal
    if (nextStatus === 'dispatched') {
      setDispatchingCheque({ id: chequeId, number: chequeNumber });
      setDispatchModalOpen(true);
      return;
    }

    // For other statuses, use confirmation dialog
    const statusLabels: Record<string, string> = {
      'signed': 'Signed',
      'cashed': 'Cashed',
    };

    showConfirmation({
      title: `Mark Cheque as ${statusLabels[nextStatus]}?`,
      message: `Cheque ${chequeNumber} will be marked as ${statusLabels[nextStatus]}. This will also update all linked requisitions.`,
      confirmText: `Mark as ${statusLabels[nextStatus]}`,
      onConfirm: async () => {
        return new Promise((resolve, reject) => {
          updateStatus(
            {
              chequeId,
              payload: {
                status: nextStatus,
                notes: `Updated to ${statusLabels[nextStatus]} status`,
              },
            },
            {
              onSuccess: (data) => {
                toast.success(
                  `Cheque updated successfully! ${data.requisitions_updated} requisition(s) also updated.`,
                  { duration: 4000 }
                );
                refetchCheques();
                resolve();
              },
              onError: (error: any) => {
                toast.error(
                  error.response?.data?.error || error.message || 'Failed to update cheque status',
                  { duration: 5000 }
                );
                reject(error);
              },
            }
          );
        });
      },
      loadingMessage: `Updating cheque to ${statusLabels[nextStatus]}...`,
      successMessage: null,
      errorMessage: () => null,
    });
  };

  const handleDispatchConfirm = (dispatchedBy: string, notes: string) => {
    if (!dispatchingCheque) return;

    // Format dispatch method label for display
    const dispatchMethodLabels: Record<string, string> = {
      'inPerson': 'In Person',
      'Mail': 'Mail',
      'Bank': 'Bank',
    };

    const dispatchMethodLabel = dispatchMethodLabels[dispatchedBy] || dispatchedBy;

    // Combine dispatch method and notes for status history
    const combinedNotes = notes 
      ? `${dispatchMethodLabel} - ${notes}`
      : dispatchMethodLabel;

    updateStatus(
      {
        chequeId: dispatchingCheque.id,
        payload: {
          status: 'dispatched',
          dispatched_by: dispatchedBy,
          notes: combinedNotes,
        },
      },
      {
        onSuccess: (data) => {
          toast.success(
            `Cheque dispatched successfully! ${data.requisitions_updated} requisition(s) also updated.`,
            { duration: 4000 }
          );
          refetchCheques();
          setDispatchModalOpen(false);
          setDispatchingCheque(null);
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.error || error.message || 'Failed to dispatch cheque',
            { duration: 5000 }
          );
        },
      }
    );
  };

  const handleVoidCheque = (chequeId: number, chequeNumber: string) => {
    setVoidingCheque({ id: chequeId, number: chequeNumber });
    setVoidModalOpen(true);
  };

  const handleVoidConfirm = (voidReason: string) => {
    if (!voidingCheque) return;

    updateStatus(
      {
        chequeId: voidingCheque.id,
        payload: {
          status: 'voided',
          notes: `VOIDED - ${voidReason}`,
          comments: voidReason,
        },
      },
      {
        onSuccess: (data) => {
          toast.success(
            `Cheque voided successfully! ${data.requisitions_updated} requisition(s) also updated.`,
            { duration: 4000 }
          );
          refetchCheques();
          setVoidModalOpen(false);
          setVoidingCheque(null);
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.error || error.message || 'Failed to void cheque',
            { duration: 5000 }
          );
        },
      }
    );
  };

  const handleBulkStatusUpdate = () => {
    if (selectedCheques.size === 0) return;

    showConfirmation({
      title: 'Mark Cheques as Signed?',
      message: `${selectedCheques.size} cheque(s) will be marked as Signed. This will also update all linked requisitions.`,
      confirmText: 'Mark as Signed',
      onConfirm: async () => {
        const chequeIds = Array.from(selectedCheques);
        let completed = 0;
        let failed = 0;
        let totalRequisitionsUpdated = 0;

        // Process cheques sequentially to avoid race conditions
        for (const chequeId of chequeIds) {
          try {
            await new Promise<void>((resolve, reject) => {
              updateStatus(
                {
                  chequeId,
                  payload: {
                    status: 'signed',
                    notes: 'Bulk updated to Signed status',
                  },
                },
                {
                  onSuccess: (data) => {
                    completed++;
                    totalRequisitionsUpdated += data.requisitions_updated || 0;
                    resolve();
                  },
                  onError: (error) => {
                    failed++;
                    console.error(`Failed to update cheque ${chequeId}:`, error);
                    reject(error);
                  },
                }
              );
            });
          } catch (error) {
            // Continue with next cheque even if one fails
            continue;
          }
        }

        setSelectedCheques(new Set());
        refetchCheques();

        if (failed === 0) {
          toast.success(
            `Bulk update complete! ${completed} cheque(s) updated successfully. ${totalRequisitionsUpdated} requisition(s) also updated.`,
            { duration: 5000 }
          );
        } else {
          toast.error(
            `Bulk update completed with errors. ${completed} succeeded, ${failed} failed.`,
            { duration: 5000 }
          );
        }
      },
      loadingMessage: `Updating ${selectedCheques.size} cheque(s)...`,
      successMessage: null,
      errorMessage: () => null,
    });
  };

  const handleSelectCheque = (chequeId: number) => {
    setSelectedCheques((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chequeId)) {
        newSet.delete(chequeId);
      } else {
        newSet.add(chequeId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const generatedCheques = cheques.filter((c: any) => c.status === 'generated');
    if (selectedCheques.size === generatedCheques.length) {
      setSelectedCheques(new Set());
    } else {
      setSelectedCheques(new Set(generatedCheques.map((c: any) => c.id)));
    }
  };

  const generatedChequesCount = cheques.filter((c: any) => c.status === 'generated').length;
  const hasGeneratedCheques = generatedChequesCount > 0;

  const dispatchedChequesCount = cheques.filter((c: any) => c.status === 'dispatched').length;
  const hasDispatchedCheques = dispatchedChequesCount > 0;

  const handleSelectDispatchedCheque = (chequeId: number) => {
    setSelectedDispatchedCheques((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chequeId)) {
        newSet.delete(chequeId);
      } else {
        newSet.add(chequeId);
      }
      return newSet;
    });
  };

  const handleSelectAllDispatched = () => {
    const dispatchedCheques = cheques.filter((c: any) => c.status === 'dispatched');
    if (selectedDispatchedCheques.size === dispatchedCheques.length) {
      setSelectedDispatchedCheques(new Set());
    } else {
      setSelectedDispatchedCheques(new Set(dispatchedCheques.map((c: any) => c.id)));
    }
  };

  const handleBulkCashedUpdate = () => {
    if (selectedDispatchedCheques.size === 0) return;

    showConfirmation({
      title: 'Mark Cheques as Cashed?',
      message: `${selectedDispatchedCheques.size} cheque(s) will be marked as Cashed. This will also update all linked requisitions.`,
      confirmText: 'Mark as Cashed',
      onConfirm: async () => {
        const chequeIds = Array.from(selectedDispatchedCheques);
        let completed = 0;
        let failed = 0;
        let totalRequisitionsUpdated = 0;

        // Process cheques sequentially to avoid race conditions
        for (const chequeId of chequeIds) {
          try {
            await new Promise<void>((resolve, reject) => {
              updateStatus(
                {
                  chequeId,
                  payload: {
                    status: 'cashed',
                    notes: 'Bulk updated to Cashed status',
                  },
                },
                {
                  onSuccess: (data) => {
                    completed++;
                    totalRequisitionsUpdated += data.requisitions_updated || 0;
                    resolve();
                  },
                  onError: (error) => {
                    failed++;
                    console.error(`Failed to update cheque ${chequeId}:`, error);
                    reject(error);
                  },
                }
              );
            });
          } catch (error) {
            // Continue with next cheque even if one fails
            continue;
          }
        }

        setSelectedDispatchedCheques(new Set());
        refetchCheques();

        if (failed === 0) {
          toast.success(
            `Bulk update complete! ${completed} cheque(s) marked as cashed. ${totalRequisitionsUpdated} requisition(s) also updated.`,
            { duration: 5000 }
          );
        } else {
          toast.error(
            `Bulk update completed with errors. ${completed} succeeded, ${failed} failed.`,
            { duration: 5000 }
          );
        }
      },
      loadingMessage: `Marking ${selectedDispatchedCheques.size} cheque(s) as cashed...`,
      successMessage: null,
      errorMessage: () => null,
    });
  };

  const handleEnterBulkMode = (mode: 'sign' | 'cash') => {
    setBulkMode(mode);
    // Clear any existing selections when entering a mode
    setSelectedCheques(new Set());
    setSelectedDispatchedCheques(new Set());
  };

  const handleExitBulkMode = () => {
    setBulkMode(null);
    setSelectedCheques(new Set());
    setSelectedDispatchedCheques(new Set());
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-600">Loading processed payments...</div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Processed Payments</h1>
          <p className="text-gray-600 mt-1">
            View generated cheques and payment instruments
          </p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'eft' && (
            <button
              onClick={() => navigate('/create-eft-batch')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Create EFT Batch
            </button>
          )}
          <button
            onClick={() => navigate('/payment-processing')}
            className="px-4 py-2 bg-ems-green-600 text-white rounded-lg hover:bg-ems-green-700 transition-colors font-medium"
          >
            ← Back to Payment Processing
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Cheques</div>
              <div className="text-2xl font-bold text-gray-900">
                {chequeData?.summary.cheque.count || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {formatCurrency(chequeData?.summary.cheque.total_amount || 0)}
              </div>
            </div>
            <div className="text-4xl">💵</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">DD/Draft</div>
              <div className="text-2xl font-bold text-gray-900">
                {eftData?.summary.eft.count || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {formatCurrency(eftData?.summary.eft.total_amount || 0)}
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
                {wireData?.summary.wire.count || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {formatCurrency(wireData?.summary.wire.total_amount || 0)}
              </div>
            </div>
            <div className="text-4xl">🌐</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('cheque')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cheque'
                ? 'border-ems-green-500 text-ems-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {getTabLabel('cheque')}
          </button>
          <button
            onClick={() => setActiveTab('eft')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'eft'
                ? 'border-ems-green-500 text-ems-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {getTabLabel('eft')}
          </button>
          <button
            onClick={() => setActiveTab('wire')}
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

      {/* Search and Filter Section */}
      {(activeTab === 'cheque' || activeTab === 'eft') && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder={activeTab === 'cheque' ? 'Search by cheque number or payee name...' : 'Search by batch number...'}
                  value={activeTab === 'cheque' ? chequeSearchTerm : eftSearchTerm}
                  onChange={(e) => activeTab === 'cheque' ? setChequeSearchTerm(e.target.value) : setEftSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="w-full sm:w-64">
              <select
                value={activeTab === 'cheque' ? chequeStatusFilter : eftStatusFilter}
                onChange={(e) => activeTab === 'cheque' ? setChequeStatusFilter(e.target.value) : setEftStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
              >
                <option value="all">All Statuses</option>
                {activeTab === 'cheque' ? (
                  <>
                    <option value="generated">Generated</option>
                    <option value="printed">Printed</option>
                    <option value="signed">Signed</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="mailed">Mailed</option>
                    <option value="cashed">Cashed</option>
                    <option value="voided">Voided</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="stop_payment">Stop Payment</option>
                  </>
                ) : (
                  <>
                    <option value="generated">Generated</option>
                    <option value="processed">Processed</option>
                  </>
                )}
              </select>
            </div>
            
            {/* Clear Filters Button */}
            {((activeTab === 'cheque' && (chequeSearchTerm || chequeStatusFilter !== 'all')) ||
              (activeTab === 'eft' && (eftSearchTerm || eftStatusFilter !== 'all'))) && (
              <button
                onClick={() => {
                  if (activeTab === 'cheque') {
                    setChequeSearchTerm('');
                    setChequeStatusFilter('all');
                  } else {
                    setEftSearchTerm('');
                    setEftStatusFilter('all');
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>
          
          {/* Results Count */}
          <div className="mt-3 text-sm text-gray-600">
            {activeTab === 'cheque' ? (
              <span>
                Showing <span className="font-semibold">{cheques.length}</span> of <span className="font-semibold">{allCheques.length}</span> cheques
              </span>
            ) : (
              <span>
                Showing <span className="font-semibold">{eftBatches.length}</span> of <span className="font-semibold">{allEftBatches.length}</span> batches
              </span>
            )}
          </div>
        </div>
      )}

      {/* Bulk Mode Toggle Buttons */}
      {!bulkMode && (hasGeneratedCheques || hasDispatchedCheques) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Bulk Actions:</span>
            {hasGeneratedCheques && (
              <button
                onClick={() => handleEnterBulkMode('sign')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm font-medium"
              >
                <span>✍️</span>
                <span>Bulk Sign Mode</span>
              </button>
            )}
            {hasDispatchedCheques && (
              <button
                onClick={() => handleEnterBulkMode('cash')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 text-sm font-medium"
              >
                <span>💰</span>
                <span>Bulk Cash Mode</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active Bulk Mode Bar - Sign Mode */}
      {bulkMode === 'sign' && (
        <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-semibold">
                ✍️ BULK SIGN MODE
              </div>
              {selectedCheques.size > 0 && (
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">{selectedCheques.size}</span> generated cheque(s) selected
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedCheques.size > 0 && (
                <button
                  onClick={handleBulkStatusUpdate}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-ems-green-600 text-white rounded-md hover:bg-ems-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span>✍️</span>
                  <span>Mark as Signed</span>
                </button>
              )}
              <button
                onClick={handleExitBulkMode}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
              >
                <span>❌</span>
                <span>Exit Mode</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Bulk Mode Bar - Cash Mode */}
      {bulkMode === 'cash' && (
        <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 text-white px-3 py-1 rounded-md text-sm font-semibold">
                💰 BULK CASH MODE
              </div>
              {selectedDispatchedCheques.size > 0 && (
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">{selectedDispatchedCheques.size}</span> dispatched cheque(s) selected
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedDispatchedCheques.size > 0 && (
                <button
                  onClick={handleBulkCashedUpdate}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-ems-green-600 text-white rounded-md hover:bg-ems-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span>💰</span>
                  <span>Mark as Cashed</span>
                </button>
              )}
              <button
                onClick={handleExitBulkMode}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
              >
                <span>❌</span>
                <span>Exit Mode</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          {activeTab === 'cheque' ? (
            /* Cheque Table */
            cheques.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-2">📭</div>
                <div>No {getPaymentTypeLabel(activeTab).toLowerCase()} generated yet</div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {bulkMode && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {bulkMode === 'sign' && (
                          <input
                            type="checkbox"
                            checked={selectedCheques.size === generatedChequesCount && generatedChequesCount > 0}
                            onChange={handleSelectAll}
                            className="h-4 w-4 text-ems-green-600 focus:ring-ems-green-500 border-gray-300 rounded"
                            title="Select all generated cheques"
                          />
                        )}
                        {bulkMode === 'cash' && (
                          <input
                            type="checkbox"
                            checked={selectedDispatchedCheques.size === dispatchedChequesCount && dispatchedChequesCount > 0}
                            onChange={handleSelectAllDispatched}
                            className="h-4 w-4 text-ems-green-600 focus:ring-ems-green-500 border-gray-300 rounded"
                            title="Select all dispatched cheques"
                          />
                        )}
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cheque Number
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
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cheques.map((cheque) => (
                    <tr key={cheque.id} className="hover:bg-gray-50">
                      {bulkMode && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {bulkMode === 'sign' && cheque.status === 'generated' ? (
                            <input
                              type="checkbox"
                              checked={selectedCheques.has(cheque.id)}
                              onChange={() => handleSelectCheque(cheque.id)}
                              className="h-4 w-4 text-ems-green-600 focus:ring-ems-green-500 border-gray-300 rounded"
                            />
                          ) : bulkMode === 'cash' && cheque.status === 'dispatched' ? (
                            <input
                              type="checkbox"
                              checked={selectedDispatchedCheques.has(cheque.id)}
                              onChange={() => handleSelectDispatchedCheque(cheque.id)}
                              className="h-4 w-4 text-ems-green-600 focus:ring-ems-green-500 border-gray-300 rounded"
                            />
                          ) : (
                            <div className="w-4"></div>
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedChequeId(cheque.id)}
                          className="text-sm font-medium text-ems-green-600 hover:text-ems-green-700 hover:underline cursor-pointer"
                        >
                          {cheque.cheque_number}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{cheque.payee_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(cheque.total_amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {cheque.requisition_count} requisition{cheque.requisition_count !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-gray-500">
                          {cheque.requisition_numbers.join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {cheque.cheque_date ? formatDate(cheque.cheque_date) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          cheque.status === 'generated' ? 'bg-yellow-100 text-yellow-800' :
                          cheque.status === 'printed' ? 'bg-blue-100 text-blue-800' :
                          cheque.status === 'signed' ? 'bg-purple-100 text-purple-800' :
                          cheque.status === 'dispatched' ? 'bg-green-100 text-green-800' :
                          cheque.status === 'mailed' ? 'bg-teal-100 text-teal-800' :
                          cheque.status === 'cashed' ? 'bg-gray-100 text-gray-800' :
                          cheque.status === 'voided' ? 'bg-red-100 text-red-800' :
                          cheque.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          cheque.status === 'stop_payment' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {cheque.status.charAt(0).toUpperCase() + cheque.status.slice(1).replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{cheque.created_by_name}</div>
                        <div className="text-xs text-gray-500">{formatDate(cheque.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {getNextActionLabel(cheque.status) && (
                            <button
                              onClick={() => handleStatusUpdate(cheque.id, cheque.status, cheque.cheque_number)}
                              disabled={isUpdating}
                              className="text-sm font-medium text-ems-green-600 hover:text-ems-green-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed text-left"
                            >
                              {getNextActionLabel(cheque.status)}
                            </button>
                          )}
                          {['generated', 'signed', 'dispatched'].includes(cheque.status) && (
                            <button
                              onClick={() => handleVoidCheque(cheque.id, cheque.cheque_number)}
                              disabled={isUpdating}
                              className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed text-left"
                            >
                              ⚠️ Mark as Void
                            </button>
                          )}
                          {!getNextActionLabel(cheque.status) && !['generated', 'signed', 'dispatched'].includes(cheque.status) && (
                            <span className="text-sm text-gray-400">No action available</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : activeTab === 'eft' ? (
            /* EFT Batch Table */
            eftBatches.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-2">📭</div>
                <div>No EFT batches generated yet</div>
                <p className="text-sm mt-2">Click "Create EFT Batch" to get started</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Processing Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requisitions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {eftBatches.map((batch: any) => (
                    <tr key={batch.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/batches/eft/${batch.id}`)}
                          className="text-sm font-medium text-ems-green-600 hover:text-ems-green-700 hover:underline cursor-pointer"
                        >
                          {batch.batch_number}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(batch.batch_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {batch.processing_date ? formatDate(batch.processing_date) : 'Not set'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {batch.draft_count} payee{batch.draft_count !== 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {batch.requisition_count} requisition{batch.requisition_count !== 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(batch.total_amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          batch.status === 'generated' ? 'bg-yellow-100 text-yellow-800' :
                          batch.status === 'processed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {batch.status_display || batch.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{batch.created_by_name}</div>
                        <div className="text-xs text-gray-500">{formatDate(batch.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/batches/eft/${batch.id}`)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            /* Wire Transfer Table - Placeholder */
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">🚧</div>
              <div>Wire transfer functionality coming soon</div>
            </div>
          )}
        </div>
      </div>

      <ChequeDetailDrawer
        chequeId={selectedChequeId}
        onClose={() => setSelectedChequeId(null)}
      />

      <DispatchChequeModal
        isOpen={dispatchModalOpen}
        onClose={() => {
          setDispatchModalOpen(false);
          setDispatchingCheque(null);
        }}
        onConfirm={handleDispatchConfirm}
        chequeNumber={dispatchingCheque?.number || ''}
      />

      <VoidChequeModal
        isOpen={voidModalOpen}
        onClose={() => {
          setVoidModalOpen(false);
          setVoidingCheque(null);
        }}
        onConfirm={handleVoidConfirm}
        chequeNumber={voidingCheque?.number || ''}
      />

      <DraftDetailDrawer
        draftId={selectedDraftId}
        onClose={() => setSelectedDraftId(null)}
      />
    </>
  );
}
