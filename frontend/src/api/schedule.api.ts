import { del, get, post, put } from './client';
import { ScheduleRequest, ScheduleResponse } from '@/types';

export const scheduleApi = {
  byTour: (tourId: number) => get<ScheduleResponse[]>('/schedules', { tourId }),
  get: (id: number) => get<ScheduleResponse>(`/admin/schedules/${id}`),
  create: (body: ScheduleRequest) => post<ScheduleResponse, ScheduleRequest>('/admin/schedules', body),
  update: (id: number, body: ScheduleRequest) => put<ScheduleResponse, ScheduleRequest>(`/admin/schedules/${id}`, body),
  remove: (id: number) => del<void>(`/admin/schedules/${id}`),
};
