import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, UserLoginPayload, UserRegisterPayload } from '../types/auth';
import { authApi } from '../services/authApi';
import { storage } from '../utils/storage';
import { parseApiError } from '../utils/errorHandler';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: UserLoginPayload) => Promise<void>;
  register: (payload: UserRegisterPayload) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => storage.getUser<User>());
  const [token, setToken] = useState<string | null>(() => storage.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    storage.clearAuth();
    setUser(null);
    setToken(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentToken = storage.getToken();
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authApi.getMe();
      setUser(userData);
      storage.setUser(userData);
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: UserLoginPayload): Promise<void> => {
    try {
      const response = await authApi.login(credentials);
      storage.setToken(response.access_token);
      storage.setUser(response.user);
      setToken(response.access_token);
      setUser(response.user);
    } catch (err) {
      throw new Error(parseApiError(err, 'Failed to login'));
    }
  };

  const register = async (payload: UserRegisterPayload): Promise<User> => {
    try {
      const newUser = await authApi.register(payload);
      return newUser;
    } catch (err) {
      throw new Error(parseApiError(err, 'Failed to register account'));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
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
