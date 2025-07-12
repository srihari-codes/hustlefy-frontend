import React, { createContext, useContext, useState, ReactNode } from 'react';
import ApiService from '../services/api';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (user: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  registerUser: (userData: any) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const token = localStorage.getItem('token');
    return {
      isAuthenticated: !!token,
      user: null,
    };
  });

  const login = (user: User) => {
    setAuthState({
      isAuthenticated: true,
      user,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      isAuthenticated: false,
      user: null,
    });
  };

  const updateUser = (userData: Partial<User>) => {
    if (authState.user) {
      setAuthState(prev => ({
        ...prev,
        user: { ...prev.user!, ...userData },
      }));
    }
  };

  const loginWithCredentials = async (email: string, password: string) => {
    try {
      const response = await ApiService.login({ email, password });
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      setAuthState({
        isAuthenticated: true,
        user,
      });
    } catch (error) {
      throw error;
    }
  };

  const registerUser = async (userData: any) => {
    try {
      const response = await ApiService.register(userData);
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      setAuthState({
        isAuthenticated: true,
        user,
      });
    } catch (error) {
      throw error;
    }
  };

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    if (token && !authState.user) {
      try {
        const response = await ApiService.getMe();
        setAuthState({
          isAuthenticated: true,
          user: response.data,
        });
      } catch (error) {
        localStorage.removeItem('token');
        setAuthState({
          isAuthenticated: false,
          user: null,
        });
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      ...authState, 
      login, 
      logout, 
      updateUser, 
      loginWithCredentials, 
      registerUser, 
      checkAuthStatus 
    }}>
      {children}
    </AuthContext.Provider>
  );
};