'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  accessToken: string | null;
  error: string | null;
}

export function useAzureAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    error: null,
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();

      if (data.isAuthenticated) {
        setAuthState({
          isAuthenticated: true,
          user: data.user,
          accessToken: data.accessToken,
          error: null,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          error: null,
        });
      }
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: error.message,
      }));
    }
  };

  const login = async () => {
    try {
      // Get login URL from backend
      const response = await fetch('/api/auth/login-url');
      const { url } = await response.json();

      // Store the current URL for redirect after login
      sessionStorage.setItem('redirectUrl', window.location.pathname);

      // Redirect to Azure AD login
      window.location.href = url;
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: error.message,
      }));
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setAuthState({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        error: null,
      });
      router.push('/');
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: error.message,
      }));
    }
  };

  const getAccessToken = async () => {
    try {
      const response = await fetch('/api/auth/token');
      const { accessToken } = await response.json();
      return accessToken;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  };

  return {
    ...authState,
    login,
    logout,
    getAccessToken,
    refreshAuth: checkAuthStatus,
  };
}
