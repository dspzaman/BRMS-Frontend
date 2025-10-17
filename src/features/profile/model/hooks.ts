// features/profile/model/hooks.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile, changePassword, uploadProfilePicture } from '../api';
import { useAuth } from '@/shared/contexts/AuthContext';
import type { UpdateProfilePayload, ChangePasswordPayload } from '../api/types';

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  
  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => updateProfile(data),
    onSuccess: (data) => {
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}

/**
 * Hook to change password
 * NO LOGOUT - User stays logged in
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordPayload) => changePassword(data),
    // Removed logout - user stays logged in
  });
}

/**
 * Hook to upload profile picture
 */
export function useUploadProfilePicture() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  
  return useMutation({
    mutationFn: (file: File) => uploadProfilePicture(file),
    onSuccess: (data) => {
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}