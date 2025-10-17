// features/profile/api/index.ts
import { apiClient } from '@/shared/api/client';
import type { UpdateProfilePayload, ChangePasswordPayload } from "./types";

/** GET /api/accounts/auth/profile/ - Get current user profile */
export async function getProfile() {
  const response = await apiClient.get('/api/accounts/auth/profile/');
  return response.data;
}

/** PUT/PATCH /api/accounts/auth/profile/update/ - Update profile */
export async function updateProfile(data: UpdateProfilePayload) {
  const response = await apiClient.patch('/api/accounts/auth/profile/update/', data);
  return response.data;
}

/** POST /api/accounts/auth/password-change/ - Change password */
export async function changePassword(data: ChangePasswordPayload) {
  const response = await apiClient.post('/api/accounts/auth/password-change/', data);
  return response.data;
}

/** POST /api/accounts/auth/profile-picture/ - Upload profile picture */
export async function uploadProfilePicture(file: File) {
  const formData = new FormData();
  formData.append('profile_picture', file);
  
  const response = await apiClient.post('/api/accounts/auth/profile-picture/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

