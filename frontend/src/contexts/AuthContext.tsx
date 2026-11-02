import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { full_name: string; email: string; username: string; password: string }) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cybershield_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('cybershield_token');
      if (storedToken) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch {
          localStorage.removeItem('cybershield_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, []);

  const login = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.login(data);
      localStorage.setItem('cybershield_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { full_name: string; email: string; username: string; password: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.register(data);
      localStorage.setItem('cybershield_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.demoLogin();
      localStorage.setItem('cybershield_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Judge Demo login failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.logout().catch(() => {});
    localStorage.removeItem('cybershield_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
        error,
        clearError: () => setError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

