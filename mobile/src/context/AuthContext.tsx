import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { Api } from '../api/endpoints';
import { setDemoRole } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  switchRole: (role: 'EMPLOYEE' | 'HR_MANAGER') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredSession();
  }, []);

  const loadStoredSession = async () => {
    try {
      // v2 keys intentionally invalidate the old auto-login demo session so the sign-in
      // flow is shown on the first visit to the redesigned application.
      const storedToken = await AsyncStorage.getItem('@paypulse_token_v3');
      const storedUser = await AsyncStorage.getItem('@paypulse_user_v3');
      if (storedToken && storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        await setDemoRole(parsedUser.role === 'HR_MANAGER' ? 'HR_MANAGER' : 'EMPLOYEE');
        setToken(storedToken);
        setUser(parsedUser);
      }
    } catch (e) {
      console.warn('Error loading auth session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await Api.login(email, password);
      setToken(res.token);
      setUser(res.user);
      await AsyncStorage.setItem('@paypulse_token_v3', res.token);
      await AsyncStorage.setItem('@paypulse_user_v3', JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (role: 'EMPLOYEE' | 'HR_MANAGER') => {
    setIsLoading(true);
    try {
      const res = await Api.switchRole(role);
      setToken(res.token);
      setUser(res.user);
      await AsyncStorage.setItem('@paypulse_token_v3', res.token);
      await AsyncStorage.setItem('@paypulse_user_v3', JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('@paypulse_token_v3');
    await AsyncStorage.removeItem('@paypulse_user_v3');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        switchRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

