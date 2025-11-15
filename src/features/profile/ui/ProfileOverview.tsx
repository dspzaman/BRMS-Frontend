import { useAuth } from "@/shared/contexts/AuthContext";
import { getMediaUrl } from "@/shared/api/client";

interface ProfileOverviewProps {
  onEdit: () => void;
}

export default function ProfileOverview({ onEdit }: ProfileOverviewProps) {
  const { user } = useAuth();

  if (!user) return null;

  // Helper to get manager name
  const getManagerName = () => {
    if (!user.direct_manager) return '-';
    
    // If direct_manager is an object with first_name and last_name
    if (typeof user.direct_manager === 'object' && 'first_name' in user.direct_manager) {
      return `${user.direct_manager.first_name} ${user.direct_manager.last_name}`;
    }
    
    // If direct_manager_name is available
    if (user.direct_manager_name) {
      return user.direct_manager_name;
    }
    
    return '-';
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0">
            {user.profile_picture ? (
              <img
                src={getMediaUrl(user.profile_picture) || ''}
                alt={user.first_name}
                className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-ems-green-100 flex items-center justify-center border-2 border-gray-200">
                <span className="text-3xl font-semibold text-ems-green-700">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-gray-600">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {user.roles.map((roleInfo, index) => (
                <span
                  key={`${roleInfo.role}-${index}`}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-ems-green-100 text-ems-green-800"
                >
                  {roleInfo.role}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-ems-green-600 text-white rounded-md hover:bg-ems-green-700 focus:outline-none focus:ring-2 focus:ring-ems-green-500"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">First Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{user.first_name || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Last Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{user.last_name || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Employee ID</dt>
            <dd className="mt-1 text-sm text-gray-900">{user.employee_id || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Phone</dt>
            <dd className="mt-1 text-sm text-gray-900">{user.phone || user.phone_number || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Address</dt>
            <dd className="mt-1 text-sm text-gray-900">{user.address || '-'}</dd>
          </div>
        </dl>
      </div>

      {/* Organization Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Information</h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          
          <div>
            <dt className="text-sm font-medium text-gray-500">Primary Program</dt>
            <dd className="mt-1 text-sm text-gray-900">{user.primary_program_name || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Direct Manager</dt>
            <dd className="mt-1 text-sm text-gray-900">{getManagerName()}</dd>
          </div>
        </dl>
      </div>

      {/* Permissions & Limits */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions & Limits</h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Submission Limit</dt>
            <dd className="mt-1 text-sm text-gray-900">
  {user.max_submission_threshold != null
    ? `$${user.max_submission_threshold.toLocaleString()}`
    : '-'
  }
</dd>
          </div>
          
          {user.can_approve && (
  <div>
    <dt className="text-sm font-medium text-gray-500">Approval Limit</dt>
    <dd className="mt-1 text-sm text-gray-900">
      {user.max_approval_threshold != null
        ? `$${user.max_approval_threshold.toLocaleString()}`
        : '-'
      }
    </dd>
  </div>
)}
          <div>
            <dt className="text-sm font-medium text-gray-500">Can Approve</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {user.can_approve ? 'Yes' : 'No'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}