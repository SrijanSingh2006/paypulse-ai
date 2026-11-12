import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { Api } from '../api/endpoints';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  biometricsEnabled: boolean;
  setBiometricsEnabled: (enabled: boolean) => Promise<void>;
  login: (email: string, password?: string) => Promise<void>;
  switchRole: (role: 'EMPLOYEE' | 'HR_MANAGER') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [biometricsEnabled, setBiometricsEnabledState] = useState(true);

  useEffect(() => {
    loadStoredSession();
  }, []);

  const loadStoredSession = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('@paypulse_token');
      const storedUser = await AsyncStorage.getItem('@paypulse_user');
      const storedBio = await AsyncStorage.getItem('@paypulse_biometrics');

      if (storedBio !== null) {
        setBiometricsEnabledState(storedBio === 'true');
      }

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        // Automatically pre-load employee session for frictionless first-run experience
        const res = await Api.login('employee@heftin.ai', 'password123');
        setToken(res.token);
        setUser(res.user);
        await AsyncStorage.setItem('@paypulse_token', res.token);
        await AsyncStorage.setItem('@paypulse_user', JSON.stringify(res.user));
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
      await AsyncStorage.setItem('@paypulse_token', res.token);
      await AsyncStorage.setItem('@paypulse_user', JSON.stringify(res.user));
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
      await AsyncStorage.setItem('@paypulse_token', res.token);
      await AsyncStorage.setItem('@paypulse_user', JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const setBiometricsEnabled = async (enabled: boolean) => {
    setBiometricsEnabledState(enabled);
    await AsyncStorage.setItem('@paypulse_biometrics', String(enabled));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('@paypulse_token');
    await AsyncStorage.removeItem('@paypulse_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        biometricsEnabled,
        setBiometricsEnabled,
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
