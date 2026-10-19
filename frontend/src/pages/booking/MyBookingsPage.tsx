import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { bookingApi } from '@/api/booking.api';
import { useAsync } from '@/hooks/useAsync';
import { formatVND, formatDate, bookingStatusBadge, bookingStatusLabel } from '@/utils/format';
import { PageResponse, BookingResponse } from '@/types';
import { EmptyState } from '@/components/ui/Feedback';
import { Spinner } from '@/components/ui/Feedback';
import { Calendar, Clock, MapPin, Eye, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MyBookingsPage = () => {
  const [page, setPage] = useState(0);
  const bookings = useAsync<PageResponse<BookingResponse>>(() => bookingApi.myBookings(page), [page]);
  const navigate = useNavigate();

  const cancel = async (id: number) => {
    if (!confirm('Hủy đơn đặt tour này?')) return;
    try {
      await bookingApi.cancel(id);
      bookings.refetch();
      toast.success('Đã hủy thành công');
    } catch { /* toast handled */ }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Đơn đặt tour của tôi</h1>
      {bookings.loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : bookings.data && bookings.data.content.length > 0 ? (
        <>
          <div className="space-y-4">
            {bookings.data.content.map((b) => (
              <div key={b.id} className="card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800">{b.tourName}</span>
                      <span className={`${bookingStatusBadge(b.status)}`}>{bookingStatusLabel(b.status)}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Mã: {b.bookingCode}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(b.departureDate)}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{b.totalPeople} khách</span>
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{b.adultCount} NL / {b.childCount} TE / {b.infantCount} EB</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-brand-700">{formatVND(b.totalAmount)}</div>
                    {b.discountAmount > 0 && (
                      <div className="text-xs text-emerald-600">- {formatVND(b.discountAmount)} giảm</div>
                    )}
                    <p className="mt-1 text-xs text-slate-400">Đặt lúc {formatDate(b.createdAt)}</p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    onClick={() => navigate(`/bookings/my/${b.id}`)}
                    className="btn-secondary text-xs"
                  >
                    <Eye className="h-3 w-3" /> Chi tiết
                  </button>
                  {b.status === 'PENDING' && (
                    <button
                      onClick={() => cancel(b.id)}
                      className="btn-danger text-xs"
                    >
                      <XCircle className="h-3 w-3" /> Hủy
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {bookings.data.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button disabled={bookings.data.page === 0} onClick={() => setPage((p) => p - 1)} className="btn-secondary">
                ← Trang trước
              </button>
              <span className="text-sm text-slate-500">
                {bookings.data.page + 1} / {bookings.data.totalPages}
              </span>
              <button disabled={bookings.data.last} onClick={() => setPage((p) => p + 1)} className="btn-secondary">
                Trang sau →
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState title="Bạn chưa có đơn đặt tour nào" description="Hãy khám phá và đặt tour ngay." />
      )}
    </div>
  );
};

export default MyBookingsPage;
