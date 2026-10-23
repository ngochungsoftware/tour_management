import { BookingResponse } from '@/types';
import {
  formatVND,
  formatDate,
  formatDateTime,
  bookingStatusLabel,
  bookingStatusBadge,
  paymentStatusLabel,
  paymentStatusBadge,
  paymentMethodLabel,
  genderLabel,
} from '@/utils/format';
import {
  X,
  User,
  MapPin,
  Users,
  CreditCard,
  Calendar,
  CheckCircle2,
  XCircle,
  Award,
} from 'lucide-react';
import { bookingApi } from '@/api/booking.api';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';

type ActionType = 'confirm' | 'cancel' | 'complete';

const ACTION_LABEL: Record<ActionType, { verb: string; title: string; confirmText: string; variant: 'danger' | 'primary' }> = {
  confirm: {
    verb: 'Xác nhận',
    title: 'Xác nhận đơn đặt tour này?',
    confirmText: 'Xác nhận đơn',
    variant: 'primary',
  },
  cancel: {
    verb: 'Hủy',
    title: 'Hủy đơn đặt tour này?',
    confirmText: 'Hủy đơn',
    variant: 'danger',
  },
  complete: {
    verb: 'Hoàn thành',
    title: 'Đánh dấu đơn đã hoàn thành?',
    confirmText: 'Hoàn thành',
    variant: 'primary',
  },
};

interface BookingDetailModalProps {
  booking: BookingResponse;
  onClose: () => void;
  onStatusChange?: () => void;
}

const BookingDetailModal = ({ booking, onClose, onStatusChange }: BookingDetailModalProps) => {
  const [actionLoading, setActionLoading] = useState<ActionType | null>(null);
  const [pendingAction, setPendingAction] = useState<ActionType | null>(null);

  const handleAction = async (type: ActionType) => {
    setPendingAction(null);
    setActionLoading(type);
    try {
      if (type === 'confirm') await bookingApi.confirm(booking.id);
      else if (type === 'cancel') await bookingApi.cancelByAdmin(booking.id);
      else await bookingApi.complete(booking.id);
      toast.success(`Đã ${ACTION_LABEL[type].verb.toLowerCase()} đơn`);
      onStatusChange?.();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Thao tác thất bại';
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const showConfirm = booking.status === 'PENDING';
  const showCompleteOrCancel =
    booking.status === 'PENDING' || booking.status === 'CONFIRMED';

  // Đóng modal bằng phím Escape + khoá scroll body khi modal mở
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (pendingAction) setPendingAction(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pendingAction, onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="card max-h-[90vh] w-full max-w-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Đơn #{booking.bookingCode}</h2>
            <div className="mt-1">
              <span className={bookingStatusBadge(booking.status)}>
                {bookingStatusLabel(booking.status)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 p-4 text-sm">
          {/* Thông tin tour */}
          <div className="rounded-lg border border-slate-200 p-3">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <MapPin className="h-3.5 w-3.5" /> Thông tin tour
            </div>
            <p className="font-semibold text-slate-800">{booking.tourName}</p>
            <div className="mt-1 space-y-0.5 text-xs text-slate-500">
              <p>Mã tour: <span className="font-mono">{booking.tourCode}</span></p>
              <p className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Khởi hành: {formatDate(booking.departureDate)}
              </p>
              <p>Đặt lúc: {formatDateTime(booking.createdAt)}</p>
            </div>
          </div>

          {/* Hành khách */}
          <div className="rounded-lg border border-slate-200 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Users className="h-3.5 w-3.5" /> Hành khách ({booking.totalPeople})
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {booking.guests.map((g) => (
                <li
                  key={g.id}
                  className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-2 py-1.5"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <User className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate font-medium">{g.fullName}</span>
                  </span>
                  <span className="shrink-0 text-slate-500">{genderLabel(g.gender)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Thanh toán */}
          <div className="rounded-lg border border-slate-200 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <CreditCard className="h-3.5 w-3.5" /> Thanh toán
            </div>
            <div className="space-y-1 text-xs text-slate-700">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>{formatVND(booking.subtotal)}</span>
              </div>
              {booking.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Giảm {booking.couponCode}</span>
                  <span>-{formatVND(booking.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-800">
                <span>Tổng</span>
                <span>{formatVND(booking.totalAmount)}</span>
              </div>
            </div>
            {booking.payments.length > 0 && (
              <div className="mt-2 space-y-1 border-t border-slate-100 pt-2">
                {booking.payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-xs text-slate-600"
                  >
                    <span>
                      {paymentMethodLabel(p.method)} · {p.transactionRef || '—'}
                    </span>
                    <span className={paymentStatusBadge(p.status)}>
                      {paymentStatusLabel(p.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {(showConfirm || showCompleteOrCancel) && (
          <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 p-4">
            {showCompleteOrCancel && (
              <button
                onClick={() => setPendingAction('cancel')}
                disabled={actionLoading !== null}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                <XCircle className="h-3.5 w-3.5" />
                Hủy đơn
              </button>
            )}
            {showCompleteOrCancel && (
              <button
                onClick={() => setPendingAction('complete')}
                disabled={actionLoading !== null}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-medium text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
              >
                <Award className="h-3.5 w-3.5" />
                Hoàn thành
              </button>
            )}
            {showConfirm && (
              <button
                onClick={() => setPendingAction('confirm')}
                disabled={actionLoading !== null}
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-sky-700 disabled:opacity-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Xác nhận đơn
              </button>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        open={pendingAction !== null}
        title={pendingAction ? ACTION_LABEL[pendingAction].title : ''}
        description="Hành động này sẽ thay đổi trạng thái đơn đặt tour."
        confirmText={pendingAction ? ACTION_LABEL[pendingAction].confirmText : 'Xác nhận'}
        variant={pendingAction ? ACTION_LABEL[pendingAction].variant : 'danger'}
        onConfirm={() => pendingAction && handleAction(pendingAction)}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
};

export default BookingDetailModal;
