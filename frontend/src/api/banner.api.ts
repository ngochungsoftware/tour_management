import { del, get, post, put } from './client';
import { BannerPosition, BannerRequest, BannerResponse } from '@/types';

export const bannerApi = {
  list: (position?: BannerPosition) =>
    get<BannerResponse[]>('/banners', position ? { position } : undefined),
  adminSearch: (position?: BannerPosition, keyword?: string, page = 0, size = 20) =>
    get<{ content: BannerResponse[]; totalElements: number }>('/admin/banners', { position, keyword, page, size }),
  get: (id: number) => get<BannerResponse>(`/admin/banners/${id}`),
  create: (body: BannerRequest) => post<BannerResponse, BannerRequest>('/admin/banners', body),
  update: (id: number, body: BannerRequest) => put<BannerResponse, BannerRequest>(`/admin/banners/${id}`, body),
  remove: (id: number) => del<void>(`/admin/banners/${id}`),
};
