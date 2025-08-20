import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role_id: number;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  is_agreement: number; // Added for EULA
}

interface LoginResponse {
  message: string;
  user: User & {
    roles: Array<{
      id: number;
      name: string;
      permissions: Array<{
        id: number;
        name: string;
      }>;
    }>;
  };
  roles: string[];
  permissions: string[];
  token: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  roles: string[];
  permissions: string[];
  isLoading: boolean;
  login: (email: string, password: string, is_tracer_user?: string, is_agreement?: string, is_slug?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  verifySession: (userId: number, roleId: number) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_EXPIRY_DAYS = 29; // 1 day less than the actual 30-day expiry
const TOKEN_CREATED_KEY = 'auth_token_created';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const checkTokenExpiry = () => {
    const tokenCreated = localStorage.getItem(TOKEN_CREATED_KEY);
    if (!tokenCreated) return false;

    const createdDate = new Date(tokenCreated);
    const currentDate = new Date();
    const daysDifference = (currentDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);

    return daysDifference >= TOKEN_EXPIRY_DAYS;
  };

  const verifySession = async (userId: number, roleId: number): Promise<boolean> => {
    try {
      const storedToken = localStorage.getItem('auth_token');
      console.log('Verifying session with token:', storedToken);
      if (!storedToken) {
        console.log('No token found');
        return false;
      }

      console.log('Making API call to verify session');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/verify-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId, role_id: roleId })
      });

      console.log('API response status:', response.status);
      if (!response.ok) {
        console.log('API response not ok');
        throw new Error('Session verification failed');
      }

      const data = await response.json();
      console.log('API response data:', data);
      
      if (data.valid) {
        setToken(storedToken);
        setUser(data.user);
        setRoles(data.roles || []);
        setPermissions(data.permissions || []);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Session verification error:', error);
      return false;
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_roles');
    localStorage.removeItem('auth_permissions');
    localStorage.removeItem(TOKEN_CREATED_KEY);
    setToken(null);
    setUser(null);
    setRoles([]);
    setPermissions([]);
  };

  useEffect(() => {
    // Check for stored auth data on mount
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    const storedRoles = localStorage.getItem('auth_roles');
    const storedPermissions = localStorage.getItem('auth_permissions');
    
    if (storedToken && storedUser) {
      // Check if token is expired
      if (checkTokenExpiry()) {
        clearAuthData();
      } else {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setRoles(storedRoles ? JSON.parse(storedRoles) : []);
        setPermissions(storedPermissions ? JSON.parse(storedPermissions) : []);
      }
    }
    
    setIsLoading(false);
  }, []);

  // Set up interval to check token expiry
  useEffect(() => {
    if (token) {
      const interval = setInterval(() => {
        if (checkTokenExpiry()) {
          logout();
        }
      }, 1000 * 60 * 60); // Check every hour

      return () => clearInterval(interval);
    }
    console.log('hello this is first token');
  }, [token]);

  const login = async (email: string, password: string, is_tracer_user?: string, is_agreement?: string, is_slug?: string) => {
    try {
      const body: any = { 
        email, 
        password
      };
      
      // Only add is_iso_user if is_tracer_user is provided
      if (is_tracer_user) {
        body.is_iso_user = is_tracer_user;
      }

      // Only add is_agreement if it's provided
      if (is_agreement) {
        body.is_agreement = is_agreement;
        console.log('Login with agreement requested (is_agreement:', is_agreement, ').');
      }

      // Add is_slug if provided
      if (is_slug) {
        body.is_slug = is_slug;
      }

      console.log('Login request body:', body); // Debug log

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Login API error:', errorData);
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      console.log('Login successful, user data:', data); // Debug log
      
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      localStorage.setItem('auth_roles', JSON.stringify(data.roles));
      localStorage.setItem('auth_permissions', JSON.stringify(data.permissions));
      localStorage.setItem(TOKEN_CREATED_KEY, new Date().toISOString());
      
      setToken(data.token);
      setUser(data.user);
      setRoles(data.roles);
      setPermissions(data.permissions);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
    }
  };

  const isAdmin = user?.role_id === 1 || user?.role_id === 2;
  const isSuperAdmin = user?.role_id === 1;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        roles,
        permissions,
        isLoading,
        login,
        logout,
        isAuthenticated: !!token,
        isAdmin,
        isSuperAdmin,
        verifySession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // Add event listener for storage changes
  useEffect(() => {
    const handleStorageChange = async (e: StorageEvent) => {
      if (e.key === 'auth_user') {
        console.log('LocalStorage auth_user changed:', e.newValue);
        try {
          if (e.newValue) {
            const parsedUser = JSON.parse(e.newValue);
            console.log('Verifying session for user:', parsedUser);
            const isValid = await context.verifySession(parsedUser.id, parsedUser.role_id);
            console.log('Session verification result:', isValid);
            if (!isValid) {
              console.log('Session invalid, logging out');
              context.logout();
            }
          }
        } catch (error) {
          console.error('Error handling storage change:', error);
          context.logout();
        }
      }
    };

    // Add storage event listener
    window.addEventListener('storage', handleStorageChange);

    // Initial verification
    const verifyCurrentSession = async () => {
      const storedUser = localStorage.getItem('auth_user');
      // console.log('Current stored user:', storedUser);
      if (storedUser && context.user) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('Verifying current session for user:', parsedUser);
          const isValid = await context.verifySession(parsedUser.id, parsedUser.role_id);
          console.log('Current session verification result:', isValid);
          if (!isValid) {
            console.log('Current session invalid, logging out');
            context.logout();
          }
        } catch (error) {
          console.error('Error verifying current session:', error);
          context.logout();
        }
      }
    };

    verifyCurrentSession();

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [context]);

  return context;
};