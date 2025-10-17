// features/profile/api/types.ts
export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}