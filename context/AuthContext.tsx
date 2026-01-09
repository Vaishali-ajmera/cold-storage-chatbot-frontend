import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, User, SignupRequest } from '../api/auth.api';
import { setTokens, clearTokens, getAccessToken, setUser as saveUser, getUser } from '../utils/localStorage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signup: (userData: SignupRequest) => Promise<{ success: boolean; error?: any }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: any }>;
  logout: () => void;
  updateProfile: (userData: { first_name?: string; last_name?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = getAccessToken();
    const savedUser = getUser();
    
    if (token && savedUser) {
      setUser(savedUser);
    }
    
    setIsLoading(false);
  }, []);

  const signup = async (userData: SignupRequest) => {
    try {
      const response = await authAPI.signup(userData);
      // Backend returns: { data: { user, access, refresh } }
      const { user: newUser, access, refresh } = response.data;
      
      // Save tokens and user data
      setTokens(access, refresh);
      saveUser(newUser);
      setUser(newUser);
      
      return { success: true };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.response?.data?.errors || { general: error.response?.data?.error || 'Signup failed' }
      };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      // Backend returns: { data: { user, access, refresh } }
      const { user: loggedInUser, access, refresh } = response.data;
      
      // Save tokens and user data
      setTokens(access, refresh);
      saveUser(loggedInUser);
      setUser(loggedInUser);
      
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.response?.data?.error || 'Invalid credentials'
      };
    }
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  const updateProfile = async (userData: { first_name?: string; last_name?: string }) => {
    try {
      const response = await authAPI.updateUserProfile(userData);
      const updatedUser = response.data;
      
      saveUser(updatedUser);
      setUser(updatedUser);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signup,
        login,
        logout,
        updateProfile,
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
  return context;
};
