import { get, post } from './client';
import { BookingRequest, BookingResponse, PageResponse, PaymentResponse } from '@/types';

export const bookingApi = {
  // ===== Client =====
  create: (body: BookingRequest) => post<BookingResponse, BookingRequest>('/bookings', body),
  myBookings: (page = 0, size = 10) => get<PageResponse<BookingResponse>>('/bookings/my', { page, size }),
  detail: (id: number) => get<BookingResponse>(`/bookings/${id}`),
  cancel: (id: number) => post<BookingResponse>(`/bookings/${id}/cancel`),
  pay: (bookingId: number, success = true) =>
    post<PaymentResponse>(`/payments/${bookingId}/simulate`, undefined, { params: { success } }),

  // ===== Admin =====
  adminSearch: (
    page = 0,
    size = 10,
    keyword?: string,
    status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
  ) =>
    get<PageResponse<BookingResponse>>('/admin/bookings', {
      page,
      size,
      keyword: keyword || undefined,
      status: status || undefined,
    }),
  adminGet: (id: number) => get<BookingResponse>(`/admin/bookings/${id}`),
  confirm: (id: number) => post<BookingResponse>(`/admin/bookings/${id}/confirm`),
  complete: (id: number) => post<BookingResponse>(`/admin/bookings/${id}/complete`),
  cancelByAdmin: (id: number) => post<BookingResponse>(`/admin/bookings/${id}/cancel`),
  byUser: (userId: number, page = 0, size = 10) =>
    get<PageResponse<BookingResponse>>(`/admin/users/${userId}/bookings`, { page, size }),
};
