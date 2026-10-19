import { del, get, patch, post } from './client';
import {
  ActiveStatus,
  PageResponse,
  QaReplyRequest,
  QaReplyResponse,
  TourQaRequest,
  TourQaResponse,
  TourQaSearchParams,
} from '@/types';

export const tourQaApi = {
  // ===== Public =====
  byTour: (tourId: number, page = 0, size = 10) =>
    get<PageResponse<TourQaResponse>>(`/tour-qa/tour/${tourId}`, { page, size }),

  all: (page = 0, size = 10) =>
    get<PageResponse<TourQaResponse>>('/tour-qa', { page, size }),

  detail: (id: number) => get<TourQaResponse>(`/tour-qa/${id}`),

  replies: (qaId: number) => get<QaReplyResponse[]>(`/tour-qa/${qaId}/replies`),

  search: (params: TourQaSearchParams) =>
    get<PageResponse<TourQaResponse>>('/tour-qa/search', params as Record<string, unknown>),

  faq: (limit = 10) => get<TourQaResponse[]>('/tour-qa/faq', { limit }),

  // ===== Authenticated =====
  myQuestions: () => get<TourQaResponse[]>('/tour-qa/my'),

  create: (body: TourQaRequest) => post<TourQaResponse, TourQaRequest>('/tour-qa', body),

  deleteMyQuestion: (id: number) => del<void>(`/tour-qa/${id}`),

  reply: (body: QaReplyRequest) => post<QaReplyResponse, QaReplyRequest>('/tour-qa/replies', body),

  deleteMyReply: (replyId: number) => del<void>(`/tour-qa/replies/${replyId}`),

  markAnswer: (replyId: number) =>
    patch<QaReplyResponse>(`/tour-qa/replies/${replyId}/mark-answer`),

  unmarkAnswer: (replyId: number) =>
    patch<QaReplyResponse>(`/tour-qa/replies/${replyId}/unmark-answer`),

  changeStatus: (id: number, status: ActiveStatus) =>
    patch<TourQaResponse>(`/tour-qa/${id}/status`, undefined, { params: { status } }),

  changeReplyStatus: (replyId: number, status: ActiveStatus) =>
    patch<QaReplyResponse>(`/tour-qa/replies/${replyId}/status`, undefined, { params: { status } }),

  // ===== Admin =====
  adminSearch: (params: TourQaSearchParams) =>
    get<PageResponse<TourQaResponse>>('/admin/tour-qa/search', params as Record<string, unknown>),

  adminAll: (page = 0, size = 10) =>
    get<PageResponse<TourQaResponse>>('/admin/tour-qa', { page, size }),

  adminDelete: (id: number) => del<void>(`/admin/tour-qa/${id}`),

  adminDeleteReply: (replyId: number) => del<void>(`/admin/tour-qa/replies/${replyId}`),
};
