import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { useChangePassword } from "../model/hooks";

export default function ChangePassword() {
  const navigate = useNavigate();
  const changePasswordMutation = useChangePassword();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validation
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    // Use TanStack Query mutation
    changePasswordMutation.mutate(
      {
        current_password: currentPassword,
        new_password: newPassword,
      },
      {
        onSuccess: () => {
          toast.success('Password changed successfully! You can now use your new password for future logins.');
          // Clear form
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: (error: any) => {
          // Extract error message from various possible locations
          let errorMessage = "Failed to change password";
          
          if (error?.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          toast.error(errorMessage);
        }
      }
    );
  }

  return (
    <main className="flex-1 bg-white">
      <div className="p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">CHANGE PASSWORD</h1>
          <p className="text-gray-600 mt-2">
            Update your password to keep your account secure
          </p>
        </div>

        {/* Change Password Form */}
        <div className="max-w-2xl">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  id="current-password"
                  name="current-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={changePasswordMutation.isPending}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-ems-green-500 focus:border-ems-green-500 sm:text-sm disabled:bg-gray-100"
                  placeholder="Enter your current password"
                />
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  id="new-password"
                  name="new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={changePasswordMutation.isPending}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-ems-green-500 focus:border-ems-green-500 sm:text-sm disabled:bg-gray-100"
                  placeholder="At least 8 characters"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Must be at least 8 characters long
                </p>
              </div>

              {/* Confirm New Password */}
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={changePasswordMutation.isPending}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-ems-green-500 focus:border-ems-green-500 sm:text-sm disabled:bg-gray-100"
                  placeholder="Re-enter new password"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  disabled={changePasswordMutation.isPending}
                  className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ems-green-500 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ems-green-600 hover:bg-ems-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ems-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {changePasswordMutation.isPending ? "Changing Password..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>

          {/* Security Tips */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Password Security Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use a strong password with at least 8 characters</li>
              <li>• Include a mix of letters, numbers, and symbols</li>
              <li>• Don't reuse passwords from other accounts</li>
              <li>• Change your password regularly</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}