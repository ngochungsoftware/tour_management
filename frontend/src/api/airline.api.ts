import { del, get, post, put } from './client';
import { AirlineRequest, AirlineResponse } from '@/types';

export const airlineApi = {
  list: () => get<AirlineResponse[]>('/airlines'),
  get: (id: number) => get<AirlineResponse>(`/airlines/${id}`),
  adminSearch: (keyword?: string, page = 0, size = 20) =>
    get<{ content: AirlineResponse[]; totalElements: number }>('/admin/airlines', { keyword, page, size }),
  create: (body: AirlineRequest) => post<AirlineResponse, AirlineRequest>('/admin/airlines', body),
  update: (id: number, body: AirlineRequest) => put<AirlineResponse, AirlineRequest>(`/admin/airlines/${id}`, body),
  remove: (id: number) => del<void>(`/admin/airlines/${id}`),
};
