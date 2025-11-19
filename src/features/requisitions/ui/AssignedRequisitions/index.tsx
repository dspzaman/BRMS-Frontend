// src/features/requisitions/ui/AssignedRequisitions/index.tsx
import { useState } from 'react';
import { useRequisitionActions } from '../../hooks/useRequisitionActions';
import { RequisitionFilters } from '../components/RequisitionFilters';
import { RequisitionActionButtons } from '../components/RequisitionActionButtons';
import { StatusBadge } from '../MyRequisitions/StatusBadge';
import { Link } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import type { RequisitionResponse } from '../../api/types';

interface AssignedRequisitionsProps {
  data?: { count: number; results: RequisitionResponse[] };
  isLoading: boolean;
  error: any;
  isProcessedView?: boolean;
}

export function AssignedRequisitions({ 
  data, 
  isLoading, 
  error,
  isProcessedView = false 
}: AssignedRequisitionsProps) {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    sortBy: 'date' as 'date' | 'amount' | 'status',
    sortOrder: 'desc' as 'asc' | 'desc',
  });
  
  const { handleSubmit, handleApprove, handleReject, handleReturn, isProcessing } =
    useRequisitionActions();

  // Use data from props
  const requisitions = data?.results || [];
  const totalCount = data?.count || 0;

  // Calculate summary for pending view only
  const summary = isProcessedView ? null : {
    total: requisitions.length,
    forSubmission: requisitions.filter((r) => r.current_status === 'forwarded_for_submission').length,
    forApproval: requisitions.filter((r) =>
      ['pending_approval', 'initial_review', 'manager_review'].includes(r.current_status)
    ).length,
    forReview: requisitions.filter((r) =>
      ['pending_review', 'account_confirmation', 'top_management_review', 'board_review'].includes(r.current_status)
    ).length,
  };

  // Apply filters (status + search)
  const filteredRequisitions = requisitions.filter((req) => {
    // Filter by status
    if (filters.status !== 'all' && req.current_status !== filters.status) {
      return false;
    }
    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        req.requisition_number?.toLowerCase().includes(searchLower) ||
        req.prepared_by_name?.toLowerCase().includes(searchLower) ||
        req.submitted_by_name?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Apply sorting
  const sortedRequisitions = [...filteredRequisitions].sort((a, b) => {
    let comparison = 0;

    switch (filters.sortBy) {
      case 'date': {
        const aTime = new Date(a.created_at).getTime();
        const bTime = new Date(b.created_at).getTime();
        comparison = aTime - bTime;
        break;
      }
      case 'amount': {
        const aAmount = Number(a.total_with_tax ?? 0);
        const bAmount = Number(b.total_with_tax ?? 0);
        comparison = aAmount - bAmount;
        break;
      }
      case 'status': {
        comparison = a.current_status.localeCompare(b.current_status);
        break;
      }
    }

    return filters.sortOrder === 'asc' ? comparison : -comparison;
  });

  const filteredCount = sortedRequisitions.length;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle actions with alerts
  const handleAction = async (
    action: 'submit' | 'approve' | 'reject' | 'return',
    id: number,
    comments?: string
  ) => {
    let result;
    switch (action) {
      case 'submit':
        result = await handleSubmit(id);
        break;
      case 'approve':
        result = await handleApprove(id, comments);
        break;
      case 'reject':
        result = await handleReject(id, comments!);
        break;
      case 'return':
        result = await handleReturn(id, comments!);
        break;
    }
    alert(result.message);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading assigned requisitions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading requisitions: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary Cards - Only show for pending view */}
      {!isProcessedView && summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Assigned</div>
            <div className="text-3xl font-bold text-gray-900">{summary.total}</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="text-sm font-medium text-orange-700 mb-1">For Submission</div>
            <div className="text-3xl font-bold text-orange-900">{summary.forSubmission}</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="text-sm font-medium text-yellow-700 mb-1">For Approval</div>
            <div className="text-3xl font-bold text-yellow-900">{summary.forApproval}</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="text-sm font-medium text-blue-700 mb-1">For Review</div>
            <div className="text-3xl font-bold text-blue-900">{summary.forReview}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <RequisitionFilters filters={filters} onChange={setFilters} />

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredCount} of {totalCount} requisitions
      </div>

      {/* Requisitions Table */}
      {sortedRequisitions.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="text-gray-400 text-lg mb-2">No requisitions found</div>
          <div className="text-gray-500 text-sm">
            {filters.status !== 'all' || filters.search
              ? 'Try adjusting your filters'
              : 'You have no assigned requisitions at the moment'}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requisition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {isProcessedView ? 'Current Status' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedRequisitions.map((requisition) => (
                <tr key={requisition.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/requisitions/view/${requisition.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {requisition.requisition_number}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {requisition.submitted_by_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(Number(requisition.total_with_tax || 0))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge requisition={requisition} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(requisition.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {isProcessedView ? (
                      <div className="flex justify-end">
                        <StatusBadge requisition={requisition} />
                      </div>
                    ) : (requisition.current_status === 'account_confirmation' || 
                        requisition.current_status === 'signaturee_confirmation' ||
                        requisition.current_status === 'payment_confirmation') &&
                       user && requisition.current_assignee === user.id ? (
                      <Link
                        to={`/requisitions/view/${requisition.id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-ems-green-600 hover:bg-ems-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ems-green-500"
                      >
                        Confirm
                      </Link>
                    ) : (
                      <RequisitionActionButtons requisition={requisition} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}