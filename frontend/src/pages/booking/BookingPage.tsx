import { FormEvent, useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { bookingApi } from '@/api/booking.api';
import { tourApi } from '@/api/tour.api';
import { scheduleApi } from '@/api/schedule.api';
import { couponApi } from '@/api/coupon.api';
import { BookingRequest, GuestRequest, ScheduleResponse, TourDetailResponse, CouponResponse } from '@/types';
import { formatVND, formatDate } from '@/utils/format';
import { useAuth } from '@/context/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { toast } from 'react-hot-toast';
import { CheckCircle2, Loader2, Minus, Plus, X } from 'lucide-react';
import { Spinner } from '@/components/ui/Feedback';

const GuestForm = ({
  index,
  guest,
  onChange,
  onRemove,
  canRemove,
}: {
  index: number;
  guest: GuestRequest;
  onChange: (g: GuestRequest) => void;
  onRemove: () => void;
  canRemove: boolean;
}) => (
  <div className="rounded-lg border border-slate-200 p-4">
    <div className="mb-2 flex items-center justify-between">
      <span className="text-sm font-semibold text-slate-700">Hành khách {index + 1}</span>
      {canRemove && (
        <button type="button" onClick={onRemove} className="text-red-500 hover:text-red-700">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="text-xs font-medium text-slate-600">Họ tên *</label>
        <input
          required
          value={guest.fullName}
          onChange={(e) => onChange({ ...guest, fullName: e.target.value })}
          className="input mt-1"
          placeholder="Nhập họ tên đầy đủ"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600">Ngày sinh</label>
        <input
          type="date"
          value={guest.dateOfBirth || ''}
          onChange={(e) => onChange({ ...guest, dateOfBirth: e.target.value })}
          className="input mt-1"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600">Giới tính</label>
        <select
          value={guest.gender || 'MALE'}
          onChange={(e) => onChange({ ...guest, gender: e.target.value as GuestRequest['gender'] })}
          className="input mt-1"
        >
          <option value="MALE">Nam</option>
          <option value="FEMALE">Nữ</option>
          <option value="OTHER">Khác</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600">Điện thoại</label>
        <input
          value={guest.phone || ''}
          onChange={(e) => onChange({ ...guest, phone: e.target.value })}
          className="input mt-1"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600">Email</label>
        <input
          value={guest.email || ''}
          onChange={(e) => onChange({ ...guest, email: e.target.value })}
          className="input mt-1"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="text-xs font-medium text-slate-600">Số CCCD / Hộ chiếu</label>
        <input
          value={guest.identityNumber || ''}
          onChange={(e) => onChange({ ...guest, identityNumber: e.target.value })}
          className="input mt-1"
        />
      </div>
    </div>
  </div>
);

const BookingPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const tourId = Number(params.get('tourId'));
  const scheduleId = Number(params.get('scheduleId'));

  const tour = useAsync<TourDetailResponse>(() => tourApi.detail(tourId), [tourId]);
  const schedules = useAsync<ScheduleResponse[]>(() => scheduleApi.byTour(tourId), [tourId]);

  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleResponse | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<CouponResponse | null>(null);
  const [guests, setGuests] = useState<GuestRequest[]>([
    { fullName: '', gender: 'MALE' },
  ]);
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'CASH' | 'BANK_TRANSFER'>('ONLINE');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth/login');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (schedules.data && schedules.data.length > 0 && !selectedSchedule) {
      const found = scheduleId
        ? schedules.data.find((s) => s.id === scheduleId)
        : schedules.data.find((s) => s.availableSeats > 0);
      if (found) setSelectedSchedule(found);
    }
  }, [schedules.data, selectedSchedule, scheduleId]);

  useEffect(() => {
    const total = adults + children + infants;
    setGuests((prev) => {
      if (total === prev.length) return prev;
      if (total > prev.length) {
        return [...prev, ...Array.from({ length: total - prev.length }, () => ({ fullName: '', gender: 'MALE' as const }))];
      }
      return prev.slice(0, total);
    });
  }, [adults, children, infants]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      await couponApi.validate(couponCode.trim());
      setCoupon({ code: couponCode.toUpperCase(), discountPercent: 10 } as CouponResponse);
      toast.success('Áp dụng mã giảm giá thành công');
    } catch {
      setCoupon(null);
    }
  };

  if (tour.loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const t = tour.data!;
  const subtotal =
    (t.adultPrice * adults) + (t.childPrice * children) + (t.infantPrice * infants);
  const discount = coupon ? Math.round(subtotal * coupon.discountPercent / 100) : 0;
  const total = subtotal - discount;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;
    if (guests.some((g) => !g.fullName.trim())) {
      toast.error('Vui lòng điền đầy đủ họ tên cho tất cả hành khách');
      return;
    }
    try {
      setSubmitting(true);
      const req: BookingRequest = {
        tourId,
        scheduleId: selectedSchedule.id,
        adultCount: adults,
        childCount: children,
        infantCount: infants,
        couponCode: coupon?.code,
        paymentMethod,
        guests,
      };
      const res = await bookingApi.create(req);
      toast.success('Đặt tour thành công!');
      navigate(`/bookings/my`);
      console.log('Booking:', res);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Đặt tour: {t.name}</h1>
      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="card p-5">
            <h2 className="mb-3 font-semibold text-slate-700">Chọn lịch khởi hành</h2>
            {schedules.data ? (
              <div className="flex flex-wrap gap-2">
                {schedules.data
                  .filter((s) => s.availableSeats > 0)
                  .map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSchedule(s)}
                      className={`rounded-lg border px-3 py-2 text-sm ${
                        selectedSchedule?.id === s.id
                          ? 'border-brand-600 bg-brand-50 text-brand-700'
                          : 'border-slate-200 hover:border-brand-400'
                      }`}
                    >
                      {formatDate(s.departureDate)} → {formatDate(s.returnDate)}
                      <span className="ml-1 text-xs text-slate-500">({s.availableSeats} chỗ)</span>
                    </button>
                  ))}
              </div>
            ) : (
              <Spinner />
            )}
          </div>

          <div className="card p-5">
            <h2 className="mb-3 font-semibold text-slate-700">Số lượng khách</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Người lớn (≥12t)', value: adults, set: setAdults, price: t.adultPrice },
                { label: 'Trẻ em (2-11t)', value: children, set: setChildren, price: t.childPrice },
                { label: 'Em bé (<2t)', value: infants, set: setInfants, price: t.infantPrice },
              ].map(({ label, value, set, price }) => (
                <div key={label} className="rounded-lg border p-3">
                  <div className="text-xs text-slate-500">{label}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <button type="button" onClick={() => set(Math.max(0, value - 1))} className="btn-secondary h-8 w-8 p-0">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center font-semibold">{value}</span>
                    <button type="button" onClick={() => set(value + 1)} className="btn-secondary h-8 w-8 p-0">
                      <Plus className="h-3 w-3" />
                    </button>
                    <span className="ml-auto text-xs text-slate-500">{formatVND(price)}</span>
                  </div>
                </div>
              ))}
            </div>
            {selectedSchedule && adults + children + infants > selectedSchedule.availableSeats && (
              <p className="mt-2 text-xs text-red-500">
                Số chỗ vượt quá ({selectedSchedule.availableSeats} chỗ còn)
              </p>
            )}
          </div>

          <div className="card p-5">
            <h2 className="mb-3 font-semibold text-slate-700">Thông tin hành khách</h2>
            <div className="space-y-3">
              {guests.map((g, i) => (
                <GuestForm
                  key={i}
                  index={i}
                  guest={g}
                  onChange={(ng) => setGuests((prev) => prev.map((_, j) => (j === i ? ng : _)))}
                  onRemove={() => setGuests((prev) => prev.filter((_, j) => j !== i))}
                  canRemove={guests.length > 1}
                />
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-3 font-semibold text-slate-700">Phương thức thanh toán</h2>
            <div className="space-y-2">
              {[
                { value: 'ONLINE', label: '💳 Thanh toán online (VNPay)', desc: 'Chuyển khoản qua cổng thanh toán' },
                { value: 'BANK_TRANSFER', label: '🏦 Chuyển khoản ngân hàng', desc: 'Chuyển khoản trực tiếp vào tài khoản TravelGo' },
                { value: 'CASH', label: '💵 Thanh toán tiền mặt', desc: 'Thanh toán trực tiếp tại văn phòng' },
              ].map(({ value, label, desc }) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                    paymentMethod === value
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-slate-200 hover:border-brand-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={value}
                    checked={paymentMethod === value}
                    onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-sm font-medium">{label}</div>
                    <div className="text-xs text-slate-500">{desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-20 p-5">
            <h2 className="mb-3 font-semibold text-slate-700">Tổng kết đơn hàng</h2>
            {t.images[0] && (
              <div className="aspect-video overflow-hidden rounded-lg">
                <img src={t.images[0]} alt={t.name} className="h-full w-full object-cover" />
              </div>
            )}
            <h3 className="mt-3 font-semibold">{t.name}</h3>
            {selectedSchedule && (
              <p className="mt-1 text-xs text-slate-500">
                {formatDate(selectedSchedule.departureDate)} → {formatDate(selectedSchedule.returnDate)}
              </p>
            )}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Người lớn × {adults}</span>
                <span>{formatVND(t.adultPrice * adults)}</span>
              </div>
              {children > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Trẻ em × {children}</span>
                  <span>{formatVND(t.childPrice * children)}</span>
                </div>
              )}
              {infants > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Em bé × {infants}</span>
                  <span>{formatVND(t.infantPrice * infants)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Tạm tính</span>
                <span>{formatVND(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Giảm giá (-{coupon?.discountPercent}%)</span>
                  <span>-{formatVND(discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-lg font-bold text-brand-700">
                <span>Tổng cộng</span>
                <span>{formatVND(total)}</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Mã giảm giá"
                  className="input flex-1"
                />
                <button type="button" onClick={applyCoupon} className="btn-secondary text-xs">
                  Áp dụng
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting || !selectedSchedule || (selectedSchedule && adults + children + infants > selectedSchedule.availableSeats)}
              className="btn-primary mt-4 w-full"
            >
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang xử lý...</> : <><CheckCircle2 className="h-4 w-4" /> Xác nhận đặt tour</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookingPage;
