import { del, get, patch, post } from './client';
import { ReviewRequest, ReviewResponse } from '@/types';

export const reviewApi = {
  byTour: (tourId: number) => get<ReviewResponse[]>(`/reviews/tour/${tourId}`),
  create: (body: ReviewRequest) => post<ReviewResponse, ReviewRequest>('/reviews', body),
  hasReviewed: (bookingId: number) => get<boolean>(`/reviews/booking/${bookingId}/reviewed`),
  adminAll: () => get<ReviewResponse[]>('/admin/reviews'),
  hide: (id: number) => patch<ReviewResponse>(`/admin/reviews/${id}/hide`),
  show: (id: number) => patch<ReviewResponse>(`/admin/reviews/${id}/show`),
  remove: (id: number) => del<void>(`/admin/reviews/${id}`),
};
