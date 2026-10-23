import {
  Plane,
  PlaneTakeoff,
  Train,
  Bus,
  Ship,
  Car,
  Truck,
  Bike,
  Footprints,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const formatVND = (value?: number | null) => {
  if (value === null || value === undefined) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
};

export const formatDate = (iso?: string | null) => {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));
  } catch {
    return iso;
  }
};

export const formatDateTime = (iso?: string | null) => {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

export const bookingStatusBadge = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'badge-yellow';
    case 'CONFIRMED':
      return 'badge-blue';
    case 'COMPLETED':
      return 'badge-green';
    case 'CANCELLED':
      return 'badge-red';
    default:
      return 'badge-slate';
  }
};

export const paymentStatusBadge = (status: string) => {
  switch (status) {
    case 'PAID':
      return 'badge-green';
    case 'PENDING':
      return 'badge-yellow';
    case 'FAILED':
      return 'badge-red';
    case 'REFUNDED':
      return 'badge-slate';
    default:
      return 'badge-slate';
  }
};

export const bookingStatusLabel = (status: string) => {
  return (
    {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
    } as Record<string, string>
  )[status] || status;
};

export const paymentStatusLabel = (status: string) => {
  return (
    {
      PENDING: 'Chờ thanh toán',
      PAID: 'Đã thanh toán',
      FAILED: 'Thất bại',
      REFUNDED: 'Đã hoàn tiền',
    } as Record<string, string>
  )[status] || status;
};

export const paymentMethodLabel = (m: string) => {
  return (
    {
      CASH: 'Tiền mặt',
      BANK_TRANSFER: 'Chuyển khoản',
      ONLINE: 'Thanh toán online',
    } as Record<string, string>
  )[m] || m;
};

/**
 * Dịch giới tính từ mã enum sang tiếng Việt.
 * Backend trả về 'MALE' | 'FEMALE' | 'OTHER' (có thể null/undefined/rỗng).
 */
export const genderLabel = (g?: string | null): string => {
  if (!g) return 'Không cung cấp';
  return (
    {
      MALE: 'Nam',
      FEMALE: 'Nữ',
      OTHER: 'Khác',
    } as Record<string, string>
  )[g.toUpperCase()] || g;
};

/**
 * Icon phương tiện di chuyển. DB lưu tên icon dạng chuỗi (Lucide name),
 * nên cần map sang component thực tế, fallback về Bus.
 */
export const transportIcon = (name?: string | null) => {
  const map: Record<string, LucideIcon> = {
    Plane: Plane,
    PlaneTakeoff: PlaneTakeoff,
    Train: Train,
    Bus: Bus,
    Ship: Ship,
    Car: Car,
    Truck: Truck,
    Bike: Bike,
    Footprints: Footprints,
  };
  return map[name ?? ''] ?? Bus;
};

/**
 * Hiển thị thời gian tương đối kiểu Facebook: "5 phút trước", "2 giờ trước", "3 ngày trước".
 */
export const timeAgo = (iso?: string | null): string => {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'vừa xong';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} ngày trước`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth} tháng trước`;
  const diffYear = Math.floor(diffMonth / 12);
  return `${diffYear} năm trước`;
};
