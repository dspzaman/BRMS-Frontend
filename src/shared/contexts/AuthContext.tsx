// shared/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { login as apiLogin, logout as apiLogout, me as apiMe } from '@/features/auth/api';
import type { LoginPayload, LoginUser } from '@/features/auth/model/types';

// Auth state shape
interface AuthState {
  user: LoginUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
}

// Auth context methods
interface AuthContextType extends AuthState {
  login: (payload: LoginPayload, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  
  // Helper methods
  canSubmitAmount: (amount: number) => boolean;
  canApproveAmount: (amount: number) => boolean;
  hasRole: (roleName: string) => boolean;
  hasPermission: (permission: string) => boolean;
  getFullName: () => string;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<LoginUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Computed: isAuthenticated
  const isAuthenticated = !!token && !!user;

  // Initialize: Load token and user from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');

      // FIXED: Always restore if token exists (removed rememberMe requirement)
      if (storedToken && storedUser) {
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          // Clear invalid data
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('rememberMe');
        }
      }
      setIsInitializing(false);
    };

    initAuth();
  }, []);

  // Login method
  const login = async (payload: LoginPayload, rememberMe: boolean = false) => {
    try {
      const response = await apiLogin(payload);
      
      // Store token and user
      setToken(response.token);
      localStorage.setItem('authToken', response.token);

      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Store remember me preference
      localStorage.setItem('rememberMe', rememberMe.toString());
    } catch (error) {
      // Clear any partial state
      setToken(null);
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('rememberMe');
      throw error;
    }
  };

  // Logout method
  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear state and storage
      setToken(null);
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('rememberMe');
    }
  };

  // Refresh user profile - FIXED: Update localStorage too
  const refreshUser = async () => {
    if (!token) return;

    try {
      const userProfile = await apiMe();
      setUser(userProfile);
      localStorage.setItem('user', JSON.stringify(userProfile)); // FIXED: Update localStorage
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
      // If token is invalid, logout
      await logout();
      throw error;
    }
  };

  // Helper: Check if user can submit an amount
  const canSubmitAmount = (amount: number): boolean => {
    if (!user) return false;
    const threshold = user.max_submission_threshold;
    return threshold === null || amount <= threshold;
  };

  // Helper: Check if user can approve an amount
  const canApproveAmount = (amount: number): boolean => {
    if (!user) return false;
    const threshold = user.max_approval_threshold;
    return threshold === null || amount <= threshold;
  };

  // Helper: Check if user has a specific role
  const hasRole = (roleName: string): boolean => {
    if (!user) return false;
    return user.roles.some(r => r.role === roleName);
  };

  // Helper: Check if user has a specific permission
  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions[permission] === true;
  };

  // Helper: Get user's full name
  const getFullName = (): string => {
    if (!user) return 'User';
    return `${user.first_name} ${user.last_name}`.trim() || 'User';
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isInitializing,
    login,
    logout,
    refreshUser,
    canSubmitAmount,
    canApproveAmount,
    hasRole,
    hasPermission,
    getFullName,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}