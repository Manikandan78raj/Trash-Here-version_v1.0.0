import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiClient, TOKEN_KEY, USER_KEY } from '@/common/api/client';
import { stripSensitiveTokenData } from '@/common/security/auth-security';
import {
  auditAndCleanSecureStorage,
  sanitizeUrlParameters,
} from '@/common/security/secure-storage';

export type UserRole = 'USER' | 'COLLECTOR' | 'RECYCLER' | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: {
    name: UserRole;
  };
  ecoScore?: number;
  carbonSaved?: number;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  updateUser: (user: UserProfile) => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    try {
      return savedUser ? stripSensitiveTokenData(JSON.parse(savedUser)) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    auditAndCleanSecureStorage();
    sanitizeUrlParameters();

    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = (newToken: string, newUser: UserProfile) => {
    setIsLoading(true);
    const safeUser = stripSensitiveTokenData(newUser);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
    setToken(newToken);
    setUser(safeUser);
    setIsLoading(false);
  };

  const logout = () => {
    try {
      apiClient.post('/auth/logout', {}).catch(() => {
        /* ignore error */
      });
    } catch {
      /* ignore error */
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: UserProfile) => {
    const safeUser = stripSensitiveTokenData(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
    setUser(safeUser);
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    return requiredRoles.includes(user.role.name);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        updateUser,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
