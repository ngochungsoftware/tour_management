import { del, get, post, put } from './client';
import { CategoryRequest, CategoryResponse, DestinationRequest, DestinationResponse } from '@/types';

export const categoryApi = {
  list: () => get<CategoryResponse[]>('/categories'),
  get: (id: number) => get<CategoryResponse>(`/categories/${id}`),
  adminSearch: (keyword?: string, page = 0, size = 20) =>
    get<{ content: CategoryResponse[]; totalElements: number }>('/admin/categories', { keyword, page, size }),
  create: (body: CategoryRequest) => post<CategoryResponse, CategoryRequest>('/admin/categories', body),
  update: (id: number, body: CategoryRequest) => put<CategoryResponse, CategoryRequest>(`/admin/categories/${id}`, body),
  remove: (id: number) => del<void>(`/admin/categories/${id}`),
};

export const destinationApi = {
  list: () => get<DestinationResponse[]>('/destinations'),
  get: (id: number) => get<DestinationResponse>(`/destinations/${id}`),
  adminSearch: (keyword?: string, page = 0, size = 20) =>
    get<{ content: DestinationResponse[]; totalElements: number }>('/admin/destinations', { keyword, page, size }),
  create: (body: DestinationRequest) => post<DestinationResponse, DestinationRequest>('/admin/destinations', body),
  update: (id: number, body: DestinationRequest) =>
    put<DestinationResponse, DestinationRequest>(`/admin/destinations/${id}`, body),
  remove: (id: number) => del<void>(`/admin/destinations/${id}`),
};
