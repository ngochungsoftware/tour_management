import { del, get, post, put } from './client';
import { DeparturePointRequest, DeparturePointResponse } from '@/types';

export const departurePointApi = {
  list: (city?: string) =>
    get<DeparturePointResponse[]>('/departure-points', city ? { city } : undefined),
  get: (id: number) => get<DeparturePointResponse>(`/departure-points/${id}`),
  adminSearch: (keyword?: string, page = 0, size = 20) =>
    get<{ content: DeparturePointResponse[]; totalElements: number }>('/admin/departure-points', { keyword, page, size }),
  create: (body: DeparturePointRequest) => post<DeparturePointResponse, DeparturePointRequest>('/admin/departure-points', body),
  update: (id: number, body: DeparturePointRequest) => put<DeparturePointResponse, DeparturePointRequest>(`/admin/departure-points/${id}`, body),
  remove: (id: number) => del<void>(`/admin/departure-points/${id}`),
};
