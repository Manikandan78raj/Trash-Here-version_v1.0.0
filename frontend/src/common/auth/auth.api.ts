import { apiClient } from '@/common/api/client';
import type { UserProfile } from './AuthContext';

export interface LoginRequestDto {
  email: string;
  password?: string;
  pin?: string;
}

export interface RegisterRequestDto {
  email: string;
  password?: string;
  pin?: string;
  fullName: string;
  role: 'USER' | 'COLLECTOR' | 'RECYCLER' | 'ADMIN';
  phone?: string;
}

export interface SendOtpRequestDto {
  phone: string;
}

export interface VerifyOtpRequestDto {
  phone: string;
  otp: string;
}

export interface SendOtpResponseData {
  success?: boolean;
  message: string;
  devOtp?: string;
}

export interface AuthResponseData {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  user: UserProfile;
}

export const authApi = {
  async login(dto: LoginRequestDto): Promise<AuthResponseData> {
    const response = await apiClient.post<{ message: string; data: AuthResponseData }>(
      '/auth/login',
      dto,
    );
    return response.data?.data || (response.data as unknown as AuthResponseData);
  },

  async register(dto: RegisterRequestDto): Promise<AuthResponseData> {
    const response = await apiClient.post<{ message: string; data: AuthResponseData }>(
      '/auth/register',
      dto,
    );
    return response.data?.data || (response.data as unknown as AuthResponseData);
  },

  async sendOtp(dto: SendOtpRequestDto): Promise<SendOtpResponseData> {
    const response = await apiClient.post<{ message: string; data: SendOtpResponseData; devOtp?: string }>(
      '/auth/send-otp',
      dto,
    );
    return response.data?.data || (response.data as unknown as SendOtpResponseData);
  },

  async verifyOtp(dto: VerifyOtpRequestDto): Promise<AuthResponseData> {
    const response = await apiClient.post<{ message: string; data: AuthResponseData }>(
      '/auth/verify-otp',
      dto,
    );
    return response.data?.data || (response.data as unknown as AuthResponseData);
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout', {});
  },

  async refresh(): Promise<{ accessToken: string; refreshToken?: string; expiresIn: number }> {
    const response = await apiClient.post<{
      message: string;
      data: { accessToken: string; refreshToken?: string; expiresIn: number };
    }>('/auth/refresh', {});
    return (
      response.data?.data ||
      (response.data as unknown as { accessToken: string; refreshToken?: string; expiresIn: number })
    );
  },

  async me(): Promise<UserProfile> {
    const response = await apiClient.get<{ message: string; data: UserProfile }>('/auth/me');
    return response.data?.data || (response.data as unknown as UserProfile);
  },
};

