// features/auth/api/index.ts
import { apiClient } from '@/shared/api/client';
import type { LoginPayload, LoginResponse, LoginUser } from '../model/types';

/** POST /api/accounts/auth/login/  → { token, user, message } */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiClient.post('/api/accounts/auth/login/', payload);
  return response.data;
}

/** GET /api/accounts/auth/profile/  (Token auth) */
export async function me(): Promise<LoginUser> {
  const response = await apiClient.get('/api/accounts/auth/profile/');
  return response.data;
}

/** POST /api/accounts/auth/logout/ */
export async function logout(): Promise<void> {
  await apiClient.post('/api/accounts/auth/logout/');
}

// NEW: Password Reset Functions

/** POST /api/accounts/auth/password-reset/ - Request password reset */
export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  const response = await apiClient.post('/api/accounts/auth/password-reset/', { email });
  return response.data;
}

/** POST /api/accounts/auth/password-reset-confirm/ - Confirm password reset */
export async function confirmPasswordReset(
  uid: string,
  token: string,
  new_password: string
): Promise<{ message: string }> {
  const response = await apiClient.post('/api/accounts/auth/password-reset-confirm/', {
    uid,
    token,
    new_password,
  });
  return response.data;
}