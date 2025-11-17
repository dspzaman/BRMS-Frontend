import { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { useAuth } from "@/shared/contexts/AuthContext";
import { useUpdateProfile, useUploadProfilePicture } from "../model/hooks";
import { getMediaUrl } from "@/shared/api/client";

interface EditProfileProps {
  onSuccess: () => void;
}

export default function EditProfile({ onSuccess }: EditProfileProps) {
  const { user } = useAuth();
  const updateProfileMutation = useUpdateProfile();
  const uploadPictureMutation = useUploadProfilePicture();

  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [phone, setPhone] = useState(user?.phone || user?.phone_number || "");
  const [address, setAddress] = useState(user?.address || "");
  const [previewImage, setPreviewImage] = useState<string | null>(
    getMediaUrl(user?.profile_picture) || null
  );

  // Sync preview with user data when it changes
  useEffect(() => {
    if (user?.profile_picture) {
      setPreviewImage(getMediaUrl(user.profile_picture));
    }
  }, [user?.profile_picture]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }

      // Preview image locally first
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload image
      uploadPictureMutation.mutate(file, {
        onSuccess: (response) => {
          // Update preview with server URL after upload
          if (response.profile_picture) {
            setPreviewImage(getMediaUrl(response.profile_picture));
          }
          toast.success('Profile picture updated successfully!');
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.error || "Failed to upload image");
          // Revert preview on error
          setPreviewImage(getMediaUrl(user?.profile_picture) || null);
        }
      });
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    updateProfileMutation.mutate(
      {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        address: address,
      },
      {
        onSuccess: () => {
          toast.success('Profile updated successfully!');
          setTimeout(() => {
            onSuccess();
          }, 1000);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.error || "Failed to update profile");
        }
      }
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Picture Upload */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Profile"
                className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {uploadPictureMutation.isPending ? "Uploading..." : "Change Picture"}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploadPictureMutation.isPending}
              />
            </label>
            <p className="mt-2 text-xs text-gray-500">
              JPG, PNG or GIF. Max size 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* First Name */}
          <div>
            <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              id="first-name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={updateProfileMutation.isPending}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-ems-green-500 focus:border-ems-green-500 disabled:bg-gray-100"
            />
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              id="last-name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={updateProfileMutation.isPending}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-ems-green-500 focus:border-ems-green-500 disabled:bg-gray-100"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={updateProfileMutation.isPending}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-ems-green-500 focus:border-ems-green-500 disabled:bg-gray-100"
            />
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              id="address"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={updateProfileMutation.isPending}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-ems-green-500 focus:border-ems-green-500 disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            onClick={onSuccess}
            disabled={updateProfileMutation.isPending}
            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-ems-green-600 hover:bg-ems-green-700 disabled:opacity-50"
          >
            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}