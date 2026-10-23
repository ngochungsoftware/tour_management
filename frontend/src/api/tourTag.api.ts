import { del, get, post, put } from './client';
import { TourTagRequest, TourTagResponse } from '@/types';

export const tourTagApi = {
  list: () => get<TourTagResponse[]>('/tour-tags'),
  adminSearch: (keyword?: string, page = 0, size = 20) =>
    get<{ content: TourTagResponse[]; totalElements: number }>('/admin/tour-tags', { keyword, page, size }),
  get: (id: number) => get<TourTagResponse>(`/admin/tour-tags/${id}`),
  create: (body: TourTagRequest) => post<TourTagResponse, TourTagRequest>('/admin/tour-tags', body),
  update: (id: number, body: TourTagRequest) => put<TourTagResponse, TourTagRequest>(`/admin/tour-tags/${id}`, body),
  remove: (id: number) => del<void>(`/admin/tour-tags/${id}`),
  setTagsForTour: (tourId: number, tagIds: number[]) =>
    put<void, number[]>(`/admin/tours/${tourId}/tags`, tagIds),
};
