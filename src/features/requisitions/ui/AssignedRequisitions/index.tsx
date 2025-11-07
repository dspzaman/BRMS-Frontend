import { useRequisitionList } from '../../hooks/useRequisitionList';
import { useRequisitionActions } from '../../hooks/useRequisitionActions';
import { RequisitionFilters } from '../components/RequisitionFilters';
import { RequisitionActionButtons } from '../components/RequisitionActionButtons';
import { StatusBadge } from '../MyRequisitions/StatusBadge';
import { Link } from 'react-router-dom';

export function AssignedRequisitions() {
  const { requisitions, isLoading, filters, setFilters, summary, filteredCount, totalCount } =
    useRequisitionList();
  const { handleSubmit, handleApprove, handleReject, handleReturn, isProcessing } =
    useRequisitionActions();

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

  return (
    <div>
      {/* Summary Cards */}
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

      {/* Filters */}
      <RequisitionFilters filters={filters} onChange={setFilters} />

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredCount} of {totalCount} requisitions
      </div>

      {/* Requisitions Table */}
      {requisitions.length === 0 ? (
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
                  Prepared By
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requisitions.map((requisition) => (
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
                    {requisition.prepared_by_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(requisition.total_with_tax || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge requisition={requisition} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(requisition.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <RequisitionActionButtons
                      requisition={requisition}
                      onSubmit={(id) => handleAction('submit', id)}
                      onApprove={(id, comments) => handleAction('approve', id, comments)}
                      onReject={(id, comments) => handleAction('reject', id, comments)}
                      onReturn={(id, comments) => handleAction('return', id, comments)}
                      isProcessing={isProcessing}
                    />
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
