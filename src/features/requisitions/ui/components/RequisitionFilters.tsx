interface FilterState {
  status: string;
  search: string;
  sortBy: 'date' | 'amount' | 'status';
  sortOrder: 'asc' | 'desc';
}

interface RequisitionFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export function RequisitionFilters({ filters, onChange }: RequisitionFiltersProps) {
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'forwarded_for_submission', label: 'For Submission' },
    { value: 'pending_review', label: 'Pending Review' },
    { value: 'pending_approval', label: 'Pending Approval' },
    { value: 'returned_for_revision', label: 'Returned for Revision' },
    { value: 'completed', label: 'Approved' },
    { value: 'account_confirmation', label: 'Account Confirmation' },
    { value: 'signaturee_confirmation', label: 'Signaturee Confirmation' },
    { value: 'payment_confirmation', label: 'Payment Confirmation' },
  ];


  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search by REQ#, name..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <div className="flex gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) =>
                onChange({ ...filters, sortBy: e.target.value as 'date' | 'amount' | 'status' })
              }
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="status">Status</option>
            </select>
            <button
              onClick={() =>
                onChange({
                  ...filters,
                  sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
                })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
