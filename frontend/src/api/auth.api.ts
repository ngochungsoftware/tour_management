import { del, get, post, put } from './client';
import {
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  UserResponse,
} from '@/types';

export const authApi = {
  login: (body: LoginRequest) => post<AuthResponse, LoginRequest>('/auth/login', body),
  register: (body: RegisterRequest) => post<AuthResponse, RegisterRequest>('/auth/register', body),
  logout: () => post<void>('/auth/logout'),
  me: () => get<UserResponse>('/auth/me'),
  updateProfile: (body: UpdateProfileRequest) => put<UserResponse, UpdateProfileRequest>('/auth/profile', body),
  changePassword: (body: ChangePasswordRequest) => post<void, ChangePasswordRequest>('/auth/change-password', body),
  forgotPassword: (body: ForgotPasswordRequest) =>
    post<{ resetToken: string }, ForgotPasswordRequest>('/auth/forgot-password', body),
  resetPassword: (token: string, newPassword: string) =>
    post<void, { token: string; newPassword: string }>('/auth/reset-password', { token, newPassword }),
  uploadAvatar: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/v1/auth/avatar', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('travelgo_token') ?? ''}` },
      body: form,
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Upload thất bại');
    }
    return json.data as UserResponse;
  },
};
