/**
 * Admin API client - hoàn toàn tách biệt với client
 * - baseURL: /api/v1/admin (chỉ dùng cho admin)
 * - Token lưu riêng key: travelgo_admin_token
 * - User storage riêng: travelgo_admin_user
 * - KHÔNG xóa session client khi logout admin
 */
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import { ApiResponse } from '@/types';

const ADMIN_TOKEN_KEY = 'travelgo_admin_token';
const ADMIN_USER_KEY = 'travelgo_admin_user';

export const adminTokenStorage = {
  get: () => localStorage.getItem(ADMIN_TOKEN_KEY),
  set: (token: string) => localStorage.setItem(ADMIN_TOKEN_KEY, token),
  clear: () => localStorage.removeItem(ADMIN_TOKEN_KEY),
};

export const adminUserStorage = {
  get: <T>(): T | null => {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  set: <T>(user: T) => localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user)),
  clear: () => localStorage.removeItem(ADMIN_USER_KEY),
};

export const clearAdminAuth = () => {
  adminTokenStorage.clear();
  adminUserStorage.clear();
};

const adminClient: AxiosInstance = axios.create({
  baseURL: '/api/v1/admin',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

adminClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = adminTokenStorage.get();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Đã xảy ra lỗi';

    // 401/403: chỉ clear admin session, KHÔNG ảnh hưởng client
    if (status === 401 || status === 403) {
      clearAdminAuth();
      if (!window.location.pathname.includes('/admin-portal/403')) {
        window.location.href = '/admin-portal/403';
      }
    } else if (status && status >= 400) {
      toast.error(message);
    }
    return Promise.reject(error);
  },
);

export const adminGet = async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
  const res = await adminClient.get<ApiResponse<T>>(url, { params });
  if (!res.data.success) {
    throw new AdminApiError(res.data.message || 'Đã xảy ra lỗi', res.status);
  }
  return res.data.data as T;
};

export const adminPost = async <T, B = unknown>(url: string, body?: B): Promise<T> => {
  const res = await adminClient.post<ApiResponse<T>>(url, body);
  if (!res.data.success) {
    throw new AdminApiError(res.data.message || 'Đã xảy ra lỗi', res.status);
  }
  return res.data.data as T;
};

export const adminPut = async <T, B = unknown>(url: string, body?: B): Promise<T> => {
  const res = await adminClient.put<ApiResponse<T>>(url, body);
  if (!res.data.success) {
    throw new AdminApiError(res.data.message || 'Đã xảy ra lỗi', res.status);
  }
  return res.data.data as T;
};

export const adminPatch = async <T, B = unknown>(url: string, body?: B): Promise<T> => {
  const res = await adminClient.patch<ApiResponse<T>>(url, body);
  if (!res.data.success) {
    throw new AdminApiError(res.data.message || 'Đã xảy ra lỗi', res.status);
  }
  return res.data.data as T;
};

export const adminDelete = async <T>(url: string): Promise<T> => {
  const res = await adminClient.delete<ApiResponse<T>>(url);
  if (!res.data.success) {
    throw new AdminApiError(res.data.message || 'Đã xảy ra lỗi', res.status);
  }
  return res.data.data as T;
};

export class AdminApiError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.status = status;
    this.name = 'AdminApiError';
  }
}

export { adminClient as default };

// Named export để có thể re-export từ client.ts
export { adminClient };
