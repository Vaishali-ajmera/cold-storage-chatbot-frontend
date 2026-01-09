import apiClient from './config';
import { AUTH_ENDPOINTS } from './constants';

// Request/Response Types
export interface SignupRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password2: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  date_joined?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface SignupResponse {
  message: string;
  status: boolean;
  data: {
    user: User;
    access: string;
    refresh: string;
  };
}

export interface LoginResponse {
  message: string;
  status: boolean;
  data: {
    user: User;
    access: string;
    refresh: string;
  };
}

export interface ForgotPasswordResponse {
  message: string;
  data: {
    email: string;
    otp_expires_in_minutes: number;
  };
}

export interface VerifyOTPResponse {
  message: string;
  data: {
    email: string;
    otp_verified: boolean;
  };
}

export interface ResetPasswordResponse {
  message: string;
  data: {
    email: string;
    password_reset: boolean;
  };
}

export interface UserProfileResponse {
  message: string;
  data: User;
}

export const authAPI = {
  /**
   * Register a new user
   */
  signup: async (userData: SignupRequest): Promise<SignupResponse> => {
    const response = await apiClient.post(AUTH_ENDPOINTS.SIGNUP, userData);
    return response.data;
  },

  /**
   * Login with email and password
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, { email, password });
    return response.data;
  },

  /**
   * Request password reset OTP
   */
  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    const response = await apiClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
    return response.data;
  },

  /**
   * Verify OTP for password reset
   */
  verifyOTP: async (email: string, otp: string): Promise<VerifyOTPResponse> => {
    const response = await apiClient.post(AUTH_ENDPOINTS.VERIFY_OTP, { email, otp });
    return response.data;
  },

  /**
   * Reset password with OTP
   */
  resetPassword: async (
    email: string,
    otp: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<ResetPasswordResponse> => {
    const response = await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, {
      email,
      otp,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    const response = await apiClient.post(AUTH_ENDPOINTS.REFRESH_TOKEN, {
      refresh: refreshToken,
    });
    return response.data;
  },

  /**
   * Get user profile
   */
  getUserProfile: async (): Promise<UserProfileResponse> => {
    const response = await apiClient.get(AUTH_ENDPOINTS.USER_PROFILE);
    return response.data;
  },

  /**
   * Update user profile
   */
  updateUserProfile: async (userData: {
    first_name?: string;
    last_name?: string;
  }): Promise<UserProfileResponse> => {
    const response = await apiClient.post(AUTH_ENDPOINTS.USER_PROFILE, userData);
    return response.data;
  },
};
