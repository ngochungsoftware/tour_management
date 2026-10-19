import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { bookingApi } from '@/api/booking.api';
import { reviewApi } from '@/api/review.api';
import { useAsync } from '@/hooks/useAsync';
import { formatVND, formatDate, formatDateTime, bookingStatusBadge, bookingStatusLabel, paymentStatusBadge, paymentStatusLabel, paymentMethodLabel } from '@/utils/format';
import { EmptyState } from '@/components/ui/Feedback';
import { Spinner } from '@/components/ui/Feedback';
import { Calendar, Clock, DollarSign, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const BookingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const booking = useAsync(() => bookingApi.detail(Number(id)), [id]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const pay = async (success: boolean) => {
    try {
      await bookingApi.pay(Number(id), success);
      toast.success(success ? 'Thanh toán thành công!' : 'Thanh toán thất bại');
      booking.refetch();
    } catch { /* handled */ }
  };

  const submitReview = async () => {
    try {
      setReviewing(true);
      await reviewApi.create({ bookingId: Number(id), rating: reviewRating, comment: reviewComment });
      toast.success('Đã gửi đánh giá');
      booking.refetch();
    } catch { /* handled */ }
    finally { setReviewing(false); }
  };

  if (booking.loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!booking.data) return <EmptyState title="Không tìm thấy đơn đặt tour" />;

  const b = booking.data;
  const pendingPayment = b.payments.find((p) => p.status === 'PENDING');
  const hasReview = b.payments.some((p) => p.status === 'PAID');

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/bookings/my')} className="text-slate-500 hover:text-slate-700">← Quay lại</button>
        <h1 className="text-2xl font-bold text-slate-800">Chi tiết đơn #{b.bookingCode}</h1>
        <span className={bookingStatusBadge(b.status)}>{bookingStatusLabel(b.status)}</span>
      </div>

      <div className="space-y-4">
        <div className="card p-5">
          <h2 className="mb-3 font-semibold text-slate-700">Thông tin tour</h2>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div><span className="text-slate-500">Tour:</span> <Link to={`/tours/${b.tourId}`} className="font-medium text-brand-600 hover:underline">{b.tourName}</Link></div>
            <div><span className="text-slate-500">Mã tour:</span> {b.tourCode}</div>
            <div className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /><span className="text-slate-500">Khởi hành:</span> {formatDate(b.departureDate)}</div>
            <div className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /><span className="text-slate-500">Tổng khách:</span> {b.totalPeople}</div>
            <div><span className="text-slate-500">Người lớn:</span> {b.adultCount}</div>
            <div><span className="text-slate-500">Trẻ em:</span> {b.childCount}</div>
            <div><span className="text-slate-500">Em bé:</span> {b.infantCount}</div>
            <div><span className="text-slate-500">Ngày đặt:</span> {formatDateTime(b.createdAt)}</div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-3 font-semibold text-slate-700">Hành khách</h2>
          <div className="space-y-2">
            {b.guests.map((g, i) => (
              <div key={g.id} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                <span className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                <div>
                  <div className="font-medium">{g.fullName}</div>
                  <div className="text-xs text-slate-500">{g.gender} · {g.identityNumber || 'N/A'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-3 font-semibold text-slate-700">Thanh toán</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Tạm tính</span><span>{formatVND(b.subtotal)}</span></div>
            {b.discountAmount > 0 && <div className="flex justify-between text-emerald-600"><span>Giảm giá {b.couponCode}</span><span>-{formatVND(b.discountAmount)}</span></div>}
            <div className="flex justify-between border-t pt-2 font-bold text-lg text-brand-700"><span>Tổng cộng</span><span>{formatVND(b.totalAmount)}</span></div>
          </div>
          {b.payments.map((p) => (
            <div key={p.id} className="mt-3 flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-slate-500" />
                <div>
                  <div className="text-sm font-medium">{paymentMethodLabel(p.method)}</div>
                  <div className="text-xs text-slate-500">{p.transactionRef || 'Chưa có mã GD'}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">{formatVND(p.amount)}</div>
                <span className={paymentStatusBadge(p.status)}>{paymentStatusLabel(p.status)}</span>
                {p.paidAt && <p className="text-xs text-slate-400">{formatDateTime(p.paidAt)}</p>}
              </div>
            </div>
          ))}
          {pendingPayment && (
            <div className="mt-4 flex gap-2">
              <button onClick={() => pay(true)} className="btn-primary flex-1"><CheckCircle2 className="h-4 w-4" />Thanh toán thành công</button>
              <button onClick={() => pay(false)} className="btn-danger flex-1"><XCircle className="h-4 w-4" />Thanh toán thất bại</button>
            </div>
          )}
        </div>

        {b.status === 'COMPLETED' && !hasReview && (
          <div className="card p-5">
            <h2 className="mb-3 font-semibold text-slate-700">Đánh giá tour</h2>
            <div className="space-y-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button key={r} onClick={() => setReviewRating(r)} className="text-2xl">
                    <span className={r <= reviewRating ? 'text-amber-400' : 'text-slate-300'}>★</span>
                  </button>
                ))}
              </div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="input min-h-20"
                placeholder="Chia sẻ trải nghiệm của bạn..."
              />
              <button onClick={submitReview} disabled={reviewing} className="btn-primary">
                {reviewing ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDetailPage;
