import React, { createContext, useContext, useState, ReactNode } from "react";
import ApiService from "../services/api";
import { User, GoogleLoginResponse } from "../types";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isAuthLoading?: boolean; // <-- Add this line
}

interface AuthContextType extends AuthState {
  login: (user: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<GoogleLoginResponse>; // <-- Update type here
  registerUser: (userData: any) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  updateUserProfile: (profileData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    return {
      isAuthenticated: !!token,
      user: userStr ? JSON.parse(userStr) : null,
      isAuthLoading: false, // <-- Add this line
    };
  });

  const login = (user: User) => {
    setAuthState({
      isAuthenticated: true,
      user,
      isAuthLoading: false, // <-- Ensure this is set
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthState({
      isAuthenticated: false,
      user: null,
      isAuthLoading: false, // <-- Ensure this is set
    });
  };

  const updateUser = (userData: Partial<User>) => {
    if (authState.user) {
      setAuthState((prev) => ({
        ...prev,
        user: { ...prev.user!, ...userData },
      }));
    }
  };

  const loginWithCredentials = async (email: string, password: string) => {
    try {
      const response = await axios.post<{
        data: { user: User; token: string };
        message?: string;
      }>(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });
      const user = response.data.data?.user;
      const token = response.data.data?.token;
      if (user && token) {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
        setAuthState({
          isAuthenticated: true,
          user,
        });
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || "Login failed"
      );
    }
  };

  // --- Google login returns GoogleLoginResponse ---
  const loginWithGoogle = async (
    credential: string
  ): Promise<GoogleLoginResponse> => {
    try {
      const response = await axios.post<GoogleLoginResponse>(
        `${API_BASE_URL}/auth/google`,
        { credential }
      );
      if (response.data.user && response.data.token) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("token", response.data.token);
        setAuthState({
          isAuthenticated: true,
          user: response.data.user,
        });
        return response.data; // Return GoogleLoginResponse
      } else {
        throw new Error(response.data.message || "Google sign-in failed");
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Google sign-in failed"
      );
    }
  };
  // ------------------------------------------

  const registerUser = async (userData: any) => {
    try {
      const response = await ApiService.register(userData);
      const { user, token } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setAuthState({
        isAuthenticated: true,
        user,
      });
    } catch (error) {
      throw error;
    }
  };

  // Update checkAuthStatus to set isAuthLoading
  const checkAuthStatus = async () => {
    setAuthState((prev) => ({ ...prev, isAuthLoading: true }));
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuthState({
          isAuthenticated: true,
          user,
          isAuthLoading: false, // <-- Set loading false
        });
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setAuthState({
          isAuthenticated: false,
          user: null,
          isAuthLoading: false, // <-- Set loading false
        });
      }
    } else {
      setAuthState({
        isAuthenticated: false,
        user: null,
        isAuthLoading: false, // <-- Set loading false
      });
    }
  };

  const updateUserProfile = async (profileData: any) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put<{ data: User; token: string }>(
        `${API_BASE_URL}/profile`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Extract both user and token from response
      const { data: updatedUser, token: newToken } = response.data;

      if (updatedUser && newToken) {
        // Update localStorage with new token and user data
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Update auth state
        setAuthState((prev) => ({
          ...prev,
          user: updatedUser,
        }));
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Profile update failed"
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        updateUser,
        loginWithCredentials,
        loginWithGoogle, // <-- Now returns GoogleLoginResponse
        registerUser,
        checkAuthStatus,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
