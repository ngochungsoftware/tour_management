import { del, get, post, put } from './client';
import { TransportModeRequest, TransportModeResponse } from '@/types';

export const transportModeApi = {
  list: () => get<TransportModeResponse[]>('/transport-modes'),
  adminSearch: (keyword?: string, page = 0, size = 20) =>
    get<{ content: TransportModeResponse[]; totalElements: number }>('/admin/transport-modes', { keyword, page, size }),
  get: (id: number) => get<TransportModeResponse>(`/admin/transport-modes/${id}`),
  create: (body: TransportModeRequest) => post<TransportModeResponse, TransportModeRequest>('/admin/transport-modes', body),
  update: (id: number, body: TransportModeRequest) => put<TransportModeResponse, TransportModeRequest>(`/admin/transport-modes/${id}`, body),
  remove: (id: number) => del<void>(`/admin/transport-modes/${id}`),
};
