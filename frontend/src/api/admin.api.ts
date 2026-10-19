/**
 * Re-export admin API sử dụng từ client.ts
 * Client tự detect URL bắt đầu /admin/ → dùng adminClient
 * Đảm bảo token admin riêng được sử dụng
 */
import { get, post } from './client';
import { DashboardResponse, PageResponse, UserResponse } from '@/types';

export const adminApi = {
  // Dashboard
  dashboard: () => get<DashboardResponse>('/admin/dashboard'),

  // Users
  users: (keyword?: string, page = 0, size = 10) =>
    get<PageResponse<UserResponse>>('/admin/users', { keyword, page, size }),
  userDetail: (id: number) => get<UserResponse>(`/admin/users/${id}`),
  lockUser: (id: number) => post<UserResponse>(`/admin/users/${id}/lock`),
  unlockUser: (id: number) => post<UserResponse>(`/admin/users/${id}/unlock`),
};
