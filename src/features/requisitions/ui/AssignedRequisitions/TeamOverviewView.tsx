import { useState } from 'react';
import { useTeamRequisitions } from '../../api/useRequisitions';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../MyRequisitions/StatusBadge';

const TeamOverviewView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    status: 'all',
    program: 'all',
    search: ''
  });

  const { data, isLoading, error } = useTeamRequisitions(filters);

  // Get user's role for display
  const userRole = user?.roles?.[0]?.role || 'staff';
  const roleLabel = {
    coordinator: 'Direct Reports',
    manager: 'Team Members',
    program_manager: 'Team Members',
    program_director: 'Program Requisitions',
    executive_director: 'All Requisitions'
  }[userRole] || 'Team Requisitions';

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading team requisitions. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          👥 {roleLabel}
        </h2>
        <p className="text-sm text-gray-600">
          View and track requisitions from your team members
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="forwarded_for_submission">Forwarded For Submission</option>
              <option value="pending_review">Review</option>
              <option value="pending_approval">Approval</option>
              <option value="account_confirmation">Account Confirmation</option>
              <option value="ed_approval">ED Approval</option>
              <option value="board_approval">Board Approval</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Program Filter - Only show for Program Directors and ED */}
          {(userRole === 'program_director' || userRole === 'executive_director') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Program
              </label>
              <select
                value={filters.program}
                onChange={(e) => setFilters({ ...filters, program: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Programs</option>
                {user?.programs?.map((prog) => (
                  <option key={prog.program_id} value={prog.program_id}>
                    {prog.program}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Requisition #, title, or staff name..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">{data?.count || 0}</span> requisition(s) found
        </p>
      </div>

      {/* Requisitions Table */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading team requisitions...</p>
        </div>
      ) : data?.results && data.results.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requisition #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
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
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.results.map((requisition) => (
                  <tr key={requisition.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/requisitions/view/${requisition.id}`)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {requisition.requisition_number}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{requisition.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {requisition.prepared_by_name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${typeof requisition.total_with_tax === 'number'
                          ? requisition.total_with_tax.toFixed(2)
                          : parseFloat(requisition.total_with_tax || '0').toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge requisition={requisition} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {requisition.current_assignee_name || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(requisition.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/requisitions/view/${requisition.id}`)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-400 text-5xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Requisitions Found</h3>
          <p className="text-gray-600">
            {filters.status !== 'all' || filters.search
              ? 'Try adjusting your filters'
              : 'No team requisitions available'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamOverviewView;