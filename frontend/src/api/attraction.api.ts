import { del, get, post, put } from './client';
import { AttractionRequest, AttractionResponse } from '@/types';

export const attractionApi = {
  list: (destinationId?: number) =>
    get<AttractionResponse[]>('/attractions', destinationId ? { destinationId } : undefined),
  get: (id: number) => get<AttractionResponse>(`/attractions/${id}`),
  adminSearch: (keyword?: string, destinationId?: number, page = 0, size = 20) =>
    get<{ content: AttractionResponse[]; totalElements: number }>('/admin/attractions', { keyword, destinationId, page, size }),
  create: (body: AttractionRequest) => post<AttractionResponse, AttractionRequest>('/admin/attractions', body),
  update: (id: number, body: AttractionRequest) => put<AttractionResponse, AttractionRequest>(`/admin/attractions/${id}`, body),
  remove: (id: number) => del<void>(`/admin/attractions/${id}`),
};
