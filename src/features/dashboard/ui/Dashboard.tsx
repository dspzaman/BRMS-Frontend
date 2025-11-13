import { Footer } from "@/layouts/footer";
import { useAuth } from "@/shared/contexts/AuthContext";
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, token, getFullName } = useAuth();
  const isDevelopment = import.meta.env.DEV;

  // Get localStorage data (only in development)
  const localStorageData = isDevelopment ? {
    authToken: localStorage.getItem('authToken'),
    user: localStorage.getItem('user'),
  } : null;

  return (
    <main className="flex-1 bg-white">
      <div className="p-8">
        {/* Page Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">DASHBOARD</h1>
            <p className="text-gray-600 mt-2">
              Welcome to your budget & requisition management dashboard, {getFullName()}
            </p>
          </div>
          <Link
            to="/requisitions/create"
            className="px-4 py-2 bg-ems-green-600 text-white rounded-md hover:bg-ems-green-700 font-medium flex items-center"
          >
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Requisition
          </Link>
        </div>

        {/* Debug Section - Only in Development */}
        {isDevelopment && (
          <div className="mb-8 space-y-6">
            {/* AuthContext User Data */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">
                AuthContext User Data
              </h2>
              <div className="bg-white rounded p-4 overflow-auto max-h-96">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap break-words">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>

            {/* AuthContext Token */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-900 mb-4">
                AuthContext Token
              </h2>
              <div className="bg-white rounded p-4 overflow-auto">
                <p className="text-xs text-gray-800 break-all font-mono">
                  {token || 'No token'}
                </p>
              </div>
            </div>

            {/* localStorage Data */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-purple-900 mb-4">
                localStorage Data
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-purple-800 mb-2">authToken:</h3>
                  <div className="bg-white rounded p-4 overflow-auto">
                    <p className="text-xs text-gray-800 break-all font-mono">
                      {localStorageData?.authToken || 'Not found'}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-purple-800 mb-2">user:</h3>
                  <div className="bg-white rounded p-4 overflow-auto max-h-96">
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap break-words">
                      {localStorageData?.user ? JSON.stringify(JSON.parse(localStorageData.user), null, 2) : 'Not found'}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* User Summary Cards */}
            {user && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  User Summary
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded border">
                    <p className="text-xs text-gray-500 mb-1">Full Name</p>
                    <p className="text-sm font-semibold">{getFullName()}</p>
                  </div>
                  <div className="bg-white p-4 rounded border">
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm font-semibold">{user.email}</p>
                  </div>
                  <div className="bg-white p-4 rounded border">
                    <p className="text-xs text-gray-500 mb-1">Employee ID</p>
                    <p className="text-sm font-semibold">{user.employee_id || 'N/A'}</p>
                  </div>
                  <div className="bg-white p-4 rounded border">
                    <p className="text-xs text-gray-500 mb-1">Department</p>
                    <p className="text-sm font-semibold">{user.department_name || 'N/A'}</p>
                  </div>
                  <div className="bg-white p-4 rounded border">
                    <p className="text-xs text-gray-500 mb-1">Primary Program</p>
                    <p className="text-sm font-semibold">{user.primary_program_name || 'N/A'}</p>
                  </div>
                  <div className="bg-white p-4 rounded border">
                    <p className="text-xs text-gray-500 mb-1">Can Approve</p>
                    <p className="text-sm font-semibold">{user.can_approve ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="bg-white p-4 rounded border">
                    <p className="text-xs text-gray-500 mb-1">Submission Limit</p>
                    <p className="text-sm font-semibold">
                      {user.max_submission_threshold === null ? 'Unlimited' : `$${user.max_submission_threshold.toLocaleString()}`}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded border">
                    <p className="text-xs text-gray-500 mb-1">Approval Limit</p>
                    <p className="text-sm font-semibold">
                      {user.max_approval_threshold === null ? 'Unlimited' : `$${user.max_approval_threshold.toLocaleString()}`}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded border">
                    <p className="text-xs text-gray-500 mb-1">Roles</p>
                    <p className="text-sm font-semibold">{user.roles?.length || 0} role(s)</p>
                  </div>
                  <div className="bg-white p-4 rounded border">
                    <p className="text-xs text-gray-500 mb-1">Programs</p>
                    <p className="text-sm font-semibold">{user.programs?.length || 0} program(s)</p>
                  </div>
                  <div className="bg-white p-4 rounded border">
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <p className="text-sm font-semibold">{user.is_active ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Requisitions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-ems-green-50">
                <svg className="h-6 w-6 text-ems-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requisitions</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-yellow-100">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </div>

          {/* Approved */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">14</p>
              </div>
            </div>
          </div>

          {/* Total Amount */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">$45,230</p>
              </div>
            </div>
          </div>
        </div>

        {/* Two-column content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">Office Supplies Request</p>
                  <p className="text-xs text-gray-500">Submitted 2 hours ago</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  Pending
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">Travel Expense</p>
                  <p className="text-xs text-gray-500">Approved yesterday</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Approved
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">Equipment Purchase</p>
                  <p className="text-xs text-gray-500">Submitted 3 days ago</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  In Review
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Create New Requisition</span>
                </div>
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">View My Requisitions</span>
                </div>
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg mr-3">
                    <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Generate Reports</span>
                </div>
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}