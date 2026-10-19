import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import {
  adminClient,
  adminTokenStorage,
  adminGet,
  adminPost,
  adminPut,
  adminPatch,
  adminDelete,
  AdminApiError,
} from '@/admin/adminClient';
import { ApiResponse } from '@/types';

const TOKEN_KEY = 'travelgo_token';
const USER_KEY = 'travelgo_user';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const userStorage = {
  get: <T>(): T | null => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  set: <T>(user: T) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  clear: () => localStorage.removeItem(USER_KEY),
};

export const clearAuth = () => {
  tokenStorage.clear();
  userStorage.clear();
};

const apiClient: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.get();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Đã xảy ra lỗi';
    if (status === 401) {
      clearAuth();
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    if (status && status >= 400 && status !== 401) {
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

/**
 * Helper: Kiểm tra URL có phải admin endpoint không
 * Nếu là admin endpoint (/admin/**) → dùng adminClient với token admin riêng
 * Nếu không → dùng client thường
 *
 * Lưu ý: adminClient có baseURL = '/api/v1/admin', nên cần strip '/admin/' prefix
 * trước khi gọi adminGet/adminPost/... để tránh URL bị duplicate (/api/v1/admin/admin/...)
 */
const isAdminUrl = (url: string): boolean => url.startsWith('/admin/') || url.startsWith('admin/');

const stripAdminPrefix = (url: string): string => {
  if (url.startsWith('/admin/')) return url.substring(6); // bỏ '/admin'
  if (url.startsWith('admin/')) return url.substring(5); // bỏ 'admin'
  return url;
};

export const get = async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
  if (isAdminUrl(url)) {
    return adminGet<T>(stripAdminPrefix(url), params);
  }
  const res = await apiClient.get<ApiResponse<T>>(url, { params });
  if (!res.data.success) {
    throw new ApiError(res.data.message || 'Đã xảy ra lỗi', res.status);
  }
  return res.data.data as T;
};

export const post = async <T, B = unknown>(url: string, body?: B, config?: { params?: Record<string, unknown> }): Promise<T> => {
  if (isAdminUrl(url)) {
    return adminPost<T, B>(stripAdminPrefix(url), body);
  }
  const res = await apiClient.post<ApiResponse<T>>(url, body, config);
  if (!res.data.success) {
    throw new ApiError(res.data.message || 'Đã xảy ra lỗi', res.status);
  }
  return res.data.data as T;
};

export const put = async <T, B = unknown>(url: string, body?: B): Promise<T> => {
  if (isAdminUrl(url)) {
    return adminPut<T, B>(stripAdminPrefix(url), body);
  }
  const res = await apiClient.put<ApiResponse<T>>(url, body);
  if (!res.data.success) {
    throw new ApiError(res.data.message || 'Đã xảy ra lỗi', res.status);
  }
  return res.data.data as T;
};

export const patch = async <T, B = unknown>(url: string, body?: B, config?: { params?: Record<string, unknown> }): Promise<T> => {
  if (isAdminUrl(url)) {
    return adminPatch<T, B>(stripAdminPrefix(url), body);
  }
  const res = await apiClient.patch<ApiResponse<T>>(url, body, config);
  if (!res.data.success) {
    throw new ApiError(res.data.message || 'Đã xảy ra lỗi', res.status);
  }
  return res.data.data as T;
};

export const del = async <T>(url: string): Promise<T> => {
  if (isAdminUrl(url)) {
    return adminDelete<T>(stripAdminPrefix(url));
  }
  const res = await apiClient.delete<ApiResponse<T>>(url);
  if (!res.data.success) {
    throw new ApiError(res.data.message || 'Đã xảy ra lỗi', res.status);
  }
  return res.data.data as T;
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export { AdminApiError };
export { adminClient };
export { adminTokenStorage };
export default apiClient;
