import { del, get, post, put } from './client';
import { CouponRequest, CouponResponse } from '@/types';

export const couponApi = {
  validate: (code: string) => get<CouponResponse>(`/coupons/${code}`),
  adminList: () => get<CouponResponse[]>('/admin/coupons'),
  create: (body: CouponRequest) => post<CouponResponse, CouponRequest>('/admin/coupons', body),
  update: (id: number, body: CouponRequest) => put<CouponResponse, CouponRequest>(`/admin/coupons/${id}`, body),
  remove: (id: number) => del<void>(`/admin/coupons/${id}`),
};
