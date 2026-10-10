'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/lib/types';
import {
  getUserProfile,
  refreshAccessToken,
  logout as logoutApi,
} from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (phone: string, otpCode: string, deviceInfo?: string) => Promise<void>;
  requestOtp: (phone: string, deviceInfo?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  requestOtp: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken) {
        try {
          const profile = await getUserProfile();
          setUser(profile);
          setToken(storedToken);
        } catch (error) {
          console.error('Failed to validate token:', error);
          // Token is invalid, try to refresh
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const refreshed = await refreshAccessToken(refreshToken);
              localStorage.setItem('access_token', refreshed.access_token);
              setToken(refreshed.access_token);
              const newProfile = await getUserProfile();
              setUser(newProfile);
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
            }
          } else {
            localStorage.removeItem('access_token');
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (phone: string, otpCode: string, deviceInfo = '') => {
    const { verifyOtp } = await import('@/lib/api-client');
    const response = await verifyOtp(phone, otpCode, deviceInfo);

    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    setToken(response.access_token);
    setUser(response.user);
  };

  const requestOtp = async (phone: string, deviceInfo = '') => {
    const { requestOtp: requestOtpApi } = await import('@/lib/api-client');
    await requestOtpApi(phone, deviceInfo);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await logoutApi(refreshToken);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, requestOtp, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
