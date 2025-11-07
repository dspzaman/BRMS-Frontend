import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { apiClient } from '@/shared/api/client';

interface DevUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  employee_id: string | null;
}

export function DevUserSwitcher() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<DevUser[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Only show in development
  if (import.meta.env.PROD) return null;

  // Fetch all users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiClient.get('/api/accounts/dev/users/');
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch dev users:', error);
      }
    };
    fetchUsers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery(''); // Clear search when closing
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const switchUser = async (userId: number) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/api/accounts/dev/switch-user/', {
        user_id: userId
      });
      
      // Store token and user data
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Force page reload to refresh all contexts and get fresh user data
      window.location.reload();
    } catch (error) {
      console.error('Failed to switch user:', error);
      alert('Failed to switch user. Check console for details.');
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const getDisplayName = (user: DevUser) => {
    const name = `${user.first_name} ${user.last_name}`.trim();
    return name || user.email;
  };

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const name = getDisplayName(user).toLowerCase();
    const email = user.email.toLowerCase();
    const employeeId = user.employee_id?.toLowerCase() || '';
    
    return (
      name.includes(query) ||
      email.includes(query) ||
      employeeId.includes(query)
    );
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1.5 rounded-md text-sm font-medium flex items-center space-x-1 transition-colors disabled:opacity-50"
        title="Development Only: Switch User"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        <span>🔧 Dev: Switch User</span>
        <svg
          className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border border-gray-200 py-2 max-h-96 overflow-hidden z-50">
          <div className="px-3 py-2 bg-yellow-50 border-b border-yellow-200">
            <p className="text-xs font-semibold text-yellow-800">⚠️ DEVELOPMENT MODE ONLY</p>
            <p className="text-xs text-yellow-700 mt-0.5">Click any user to switch instantly</p>
          </div>
          
          {/* Search Input */}
          <div className="px-3 py-2 border-b border-gray-200">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* User List */}
          <div className="overflow-y-auto max-h-80">
          {filteredUsers.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No users found
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isCurrentUser = currentUser?.id === user.id;
              return (
                <button
                  key={user.id}
                  onClick={() => !isCurrentUser && switchUser(user.id)}
                  disabled={isCurrentUser || isLoading}
                  className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isCurrentUser ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getDisplayName(user)}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-green-600 font-semibold">
                            (Current)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      {user.employee_id && (
                        <p className="text-xs text-gray-400">ID: {user.employee_id}</p>
                      )}
                    </div>
                    {!isCurrentUser && (
                      <svg className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })
          )}
          </div>
        </div>
      )}
    </div>
  );
}