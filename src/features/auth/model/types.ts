export type LoginPayload = { username: string; password: string };

// Direct Manager type
export interface DirectManager {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

// Role type
export interface UserRoleInfo {
  role: string;
  name: string;
  organization: string | null;
}

// Program assignment type
export interface UserProgramInfo {
  program_id: number;
  program: string;
  role_in_program: string;
  is_primary: boolean;
}

export type LoginUser = {
  id: number;
  email: string;
  username?: string; // Optional, not in serializer but might be needed
  employee_id: string | null;
  first_name: string;
  last_name: string;
  phone: string | null;
  phone_number?: string; // Alias for phone
  address: string | null;
  profile_picture: string | null;
  
  // Organization structure
  department: number | null;
  department_name: string | null;
  organization_name?: string; // Add this
  primary_program: number | null;
  primary_program_name: string | null;
  
  // Manager info
  direct_manager: number | DirectManager | null; // Can be ID or object
  direct_manager_name?: string;
  
  // Roles and permissions
  can_approve: boolean;
  signaturee_authority: boolean;
  roles: UserRoleInfo[];
  programs: UserProgramInfo[];
  
  // Thresholds and Permissions
  max_submission_threshold: number | null;  // null = unlimited
  max_approval_threshold: number | null;    // null = unlimited
  permissions: Record<string, boolean>;     // Flexible permissions object
  
  // Status flags
  is_active: boolean;
  is_staff: boolean;
  is_verified: boolean;
  last_login: string | null;
};

export type LoginResponse = {
  token: string;
  user: LoginUser;
  message: string;
};