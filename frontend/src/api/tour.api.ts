import { del, get, post, put } from './client';
import { HomeResponse, PageResponse, TourCreateRequest, TourDetailResponse, TourResponse, TourSearchParams, TourUpdateRequest } from '@/types';

const buildParams = (params: TourSearchParams) => {
  const out: Record<string, unknown> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      out[key] = value;
    }
  });
  return out;
};

export const tourApi = {
  home: () => get<HomeResponse>('/home'),
  search: (params: TourSearchParams) => get<PageResponse<TourResponse>>('/tours', buildParams(params)),
  detail: (id: number) => get<TourDetailResponse>(`/tours/${id}`),
  related: (id: number) => get<TourResponse[]>(`/tours/${id}/related`),
  adminSearch: (params: TourSearchParams & { status?: 'ACTIVE' | 'HIDDEN' | 'INACTIVE' }) =>
    get<PageResponse<TourResponse>>('/admin/tours', buildParams(params)),
  create: (body: TourCreateRequest) => post<TourDetailResponse, TourCreateRequest>('/admin/tours', body),
  update: (id: number, body: TourUpdateRequest) => put<TourDetailResponse, TourUpdateRequest>(`/admin/tours/${id}`, body),
  remove: (id: number) => del<void>(`/admin/tours/${id}`),
  hide: (id: number) => post<TourDetailResponse>(`/admin/tours/${id}/hide`),
  show: (id: number) => post<TourDetailResponse>(`/admin/tours/${id}/show`),
};
