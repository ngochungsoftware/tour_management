import { del, get, post } from './client';
import { ReviewRequest, ReviewResponse } from '@/types';

export const reviewApi = {
  byTour: (tourId: number) => get<ReviewResponse[]>(`/reviews/tour/${tourId}`),
  create: (body: ReviewRequest) => post<ReviewResponse, ReviewRequest>('/reviews', body),
  adminAll: () => get<ReviewResponse[]>('/admin/reviews'),
  hide: (id: number) => post<ReviewResponse>(`/admin/reviews/${id}/hide`),
  show: (id: number) => post<ReviewResponse>(`/admin/reviews/${id}/show`),
  remove: (id: number) => del<void>(`/admin/reviews/${id}`),
};
