/**
 * API quản lý tài khoản trong admin portal.
 * Mọi URL bắt đầu bằng /admin/ → client.ts tự chuyển sang adminClient
 * (token admin riêng, không đụng session của khách hàng).
 */
import { get, patch, post, put, del } from './client';
import {
  DashboardResponse,
  PageResponse,
  RoleName,
  UserCreateRequest,
  UserResponse,
  UserUpdateRequest,
} from '@/types';

export const adminApi = {
  // Dashboard
  dashboard: () => get<DashboardResponse>('/admin/dashboard'),

  // ===== Tài khoản nhân viên (ADMIN / STAFF) =====
  staff: (keyword?: string, status?: string, page = 0, size = 10) =>
    get<PageResponse<UserResponse>>('/admin/staff', { keyword, status, page, size }),
  createStaff: (body: UserCreateRequest) =>
    post<UserResponse, UserCreateRequest>('/admin/staff', body),
  updateStaff: (id: number, body: UserUpdateRequest) =>
    put<UserResponse, UserUpdateRequest>(`/admin/staff/${id}`, body),
  deleteStaff: (id: number) => del<void>(`/admin/staff/${id}`),

  // ===== Tài khoản khách hàng (CUSTOMER) =====
  customers: (keyword?: string, status?: string, page = 0, size = 10) =>
    get<PageResponse<UserResponse>>('/admin/customers', { keyword, status, page, size }),
  createCustomer: (body: UserCreateRequest) =>
    post<UserResponse, UserCreateRequest>('/admin/customers', body),
  updateCustomer: (id: number, body: UserUpdateRequest) =>
    put<UserResponse, UserUpdateRequest>(`/admin/customers/${id}`, body),
  deleteCustomer: (id: number) => del<void>(`/admin/customers/${id}`),

  // ===== Tài khoản chung =====
  users: (keyword?: string, role?: RoleName, status?: string, page = 0, size = 10) =>
    get<PageResponse<UserResponse>>('/admin/users', { keyword, role, status, page, size }),
  userDetail: (id: number) => get<UserResponse>(`/admin/users/${id}`),
  lockUser: (id: number) => patch<UserResponse>(`/admin/users/${id}/lock`),
  unlockUser: (id: number) => patch<UserResponse>(`/admin/users/${id}/unlock`),
};
