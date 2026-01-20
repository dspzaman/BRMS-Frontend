import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBatches } from '../api';
import { BATCH_TYPE_LABELS, BATCH_STATUS_LABELS, BATCH_STATUS_COLORS, BATCH_TYPE_ICONS, BATCH_STATUS_ICONS } from '../model';

export function BatchListPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: batches, isLoading, error } = useBatches({
    status: statusFilter || undefined,
    batch_type: typeFilter || undefined,
    search: searchQuery || undefined,
  });

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading batches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load batches</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Batches</h1>
          <p className="text-gray-600 mt-1">
            View and manage all requisition batches
          </p>
        </div>
        <Link
          to="/batches/ready-pool"
          className="px-4 py-2 bg-ems-green-600 text-white rounded-lg hover:bg-ems-green-700 transition-colors"
        >
          Create New Batch
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Batch number..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending_signatures">Pending Signatures</option>
              <option value="partially_approved">Partially Approved</option>
              <option value="fully_approved">Fully Approved</option>
              <option value="payment_processing">Payment Processing</option>
              <option value="payment_confirmed">Payment Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              id="type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
            >
              <option value="">All Types</option>
              <option value="cheque">Cheque</option>
              <option value="eft">EFT</option>
              <option value="wire">Wire Transfer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Batches List */}
      <div className="space-y-4">
        {batches && batches.length > 0 ? (
          batches.map((batch) => (
            <Link
              key={batch.id}
              to={`/batches/${batch.id}`}
              className="block bg-white border border-gray-200 rounded-lg p-6 hover:border-ems-green-500 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Batch Number and Type */}
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {BATCH_TYPE_ICONS[batch.batch_type]} {batch.batch_number}
                    </h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {BATCH_TYPE_LABELS[batch.batch_type]}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${BATCH_STATUS_COLORS[batch.status]}`}>
                      {BATCH_STATUS_ICONS[batch.status]} {BATCH_STATUS_LABELS[batch.status]}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-gray-500">Requisitions</p>
                      <p className="text-sm font-medium text-gray-900">
                        {batch.requisition_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Amount</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(batch.total_amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Signatures</p>
                      <p className="text-sm font-medium text-gray-900">
                        {batch.signaturee_progress.approved} / {batch.required_signatures}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(batch.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Creator */}
                  <p className="text-xs text-gray-500 mt-3">
                    Created by {batch.created_by_name}
                  </p>
                </div>

                {/* Arrow */}
                <div className="ml-4">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No batches found
            </h3>
            <p className="text-gray-600 mb-4">
              {statusFilter || typeFilter || searchQuery
                ? 'Try adjusting your filters'
                : 'Create your first batch to get started'}
            </p>
            {!statusFilter && !typeFilter && !searchQuery && (
              <Link
                to="/batches/ready-pool"
                className="inline-block px-4 py-2 bg-ems-green-600 text-white rounded-lg hover:bg-ems-green-700 transition-colors"
              >
                Go to Ready Pool
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
