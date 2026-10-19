import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { tourApi } from '@/api/tour.api';
import { reviewApi } from '@/api/review.api';
import { favoriteApi } from '@/api/favorite.api';
import { useAsync } from '@/hooks/useAsync';
import { TourDetailResponse, TourResponse, ReviewResponse } from '@/types';
import { formatVND, formatDate } from '@/utils/format';
import { useAuth } from '@/context/AuthContext';
import QaSection from '@/components/tour/QaSection';
import {
  Heart,
  MapPin,
  Clock,
  Users,
  Star,
  Calendar,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Share2,
} from 'lucide-react';
import { Spinner, EmptyState } from '@/components/ui/Feedback';
import { toast } from 'react-hot-toast';

const Stars = ({ value }: { value: number }) => (
  <div className="inline-flex">
    {Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
      />
    ))}
  </div>
);

const TourDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const tourId = Number(id);

  const tour = useAsync<TourDetailResponse>(() => tourApi.detail(tourId), [id]);
  const related = useAsync<TourResponse[]>(() => tourApi.related(tourId), [id]);
  const reviews = useAsync<ReviewResponse[]>(() => reviewApi.byTour(tourId), [id]);
  const [activeImg, setActiveImg] = useState(0);
  const [favorited, setFavorited] = useState(false);

  if (tour.loading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  if (!tour.data) return <EmptyState title="Tour không tồn tại" description="Có thể tour đã bị xóa hoặc ẩn." />;

  const t = tour.data;
  const discount = t.originalPrice && t.originalPrice > t.adultPrice
    ? Math.round(((t.originalPrice - t.adultPrice) / t.originalPrice) * 100)
    : 0;

  const toggleFav = async () => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    try {
      if (favorited) {
        await favoriteApi.remove(tourId);
        setFavorited(false);
        toast.success('Đã xóa khỏi yêu thích');
      } else {
        await favoriteApi.add(tourId);
        setFavorited(true);
        toast.success('Đã thêm vào yêu thích');
      }
    } catch {
      /* toast handled */
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <nav className="mb-4 flex items-center gap-1 text-sm text-slate-500">
        <Link to="/" className="hover:text-brand-600">Trang chủ</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/tours" className="hover:text-brand-600">Tour</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-700">{t.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="aspect-[16/9] bg-slate-100">
              {t.images.length > 0 ? (
                <img src={t.images[activeImg]} alt={t.name} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-6xl">🏝️</div>
              )}
            </div>
            {t.images.length > 1 && (
              <div className="flex gap-2 p-3">
                {t.images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`h-16 w-20 overflow-hidden rounded-lg border-2 ${
                      activeImg === i ? 'border-brand-600' : 'border-transparent'
                    }`}
                  >
                    <img src={src} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card mt-4 p-5">
            <h1 className="text-2xl font-bold text-slate-800">{t.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="badge-blue">Mã: {t.code}</span>
              <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> Việt Nam</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {t.durationDays}N{t.durationNights}Đ</span>
              <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" /> Tối đa {t.maxPeople} khách</span>
              {t.reviewCount > 0 && (
                <span className="inline-flex items-center gap-1 text-amber-500">
                  <Star className="h-4 w-4 fill-amber-400" />
                  {t.averageRating.toFixed(1)} ({t.reviewCount} đánh giá)
                </span>
              )}
            </div>
          </div>

          {t.description && (
            <div className="card mt-4 p-5">
              <h2 className="mb-2 text-lg font-bold text-slate-800">Mô tả tour</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{t.description}</p>
            </div>
          )}

          {t.itineraries.length > 0 && (
            <div className="card mt-4 p-5">
              <h2 className="mb-3 text-lg font-bold text-slate-800">Lịch trình chi tiết</h2>
              <ol className="relative space-y-4 border-l-2 border-brand-200 pl-6">
                {t.itineraries.map((it) => (
                  <li key={it.id} className="relative">
                    <span className="absolute -left-[33px] grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                      {it.dayNumber}
                    </span>
                    <h3 className="font-semibold text-slate-800">{it.title}</h3>
                    {it.description && <p className="mt-1 text-sm text-slate-600">{it.description}</p>}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="card mt-4 p-5">
            <h2 className="mb-3 text-lg font-bold text-slate-800">Đánh giá từ khách hàng</h2>
            {reviews.data && reviews.data.length > 0 ? (
              <div className="space-y-4">
                {reviews.data.map((r) => (
                  <div key={r.id} className="rounded-lg border border-slate-100 p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-700">{r.userName}</div>
                      <Stars value={r.rating} />
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{r.comment}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatDate(r.createdAt)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Chưa có đánh giá" description="Hãy là người đầu tiên đánh giá tour này." />
            )}
          </div>

          {/* Q&A Section */}
          <QaSection tourId={t.id} tourName={t.name} />
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-20 p-5">
            <div className="mb-3 flex items-end gap-2">
              {t.originalPrice && t.originalPrice > t.adultPrice && (
                <span className="text-sm text-slate-400 line-through">{formatVND(t.originalPrice)}</span>
              )}
              <span className="text-2xl font-bold text-brand-700">{formatVND(t.adultPrice)}</span>
              {discount > 0 && <span className="badge-red">-{discount}%</span>}
            </div>
            <p className="text-xs text-slate-500">Giá người lớn / Trẻ em: {formatVND(t.childPrice)} / Em bé: {formatVND(t.infantPrice)}</p>

            <div className="mt-4 space-y-2 text-sm">
              {t.departureDates.length > 0 ? (
                <>
                  <p className="text-xs font-semibold text-slate-500">Lịch khởi hành:</p>
                  <div className="flex flex-wrap gap-2">
                    {t.departureDates.map((d) => (
                      <span key={d} className="badge-slate">
                        <Calendar className="mr-1 inline h-3 w-3" />
                        {formatDate(d)}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-amber-600">Tour chưa có lịch khởi hành. Vui lòng liên hệ.</p>
              )}
            </div>

            <button
              onClick={() => navigate(`/booking?tourId=${t.id}`)}
              className="btn-primary mt-4 w-full"
              disabled={t.departureDates.length === 0 || isAdmin}
              title={isAdmin ? 'Admin không thể đặt tour' : ''}
            >
              Đặt tour ngay
            </button>
            {!isAdmin && (
              <button
                onClick={toggleFav}
                className={`mt-2 flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${
                  favorited
                    ? 'border-red-300 bg-red-50 text-red-600'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Heart className={`h-4 w-4 ${favorited ? 'fill-red-500' : ''}`} />
                {favorited ? 'Đã yêu thích' : 'Thêm vào yêu thích'}
              </button>
            )}
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Đã sao chép liên kết');
              }}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <Share2 className="h-4 w-4" /> Chia sẻ
            </button>
          </div>
        </div>
      </div>

      {related.data && related.data.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Tour liên quan</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.data.map((t) => (
              <Link key={t.id} to={`/tours/${t.id}`} className="card overflow-hidden hover:shadow-md">
                <div className="aspect-[4/3] bg-slate-100">
                  {t.coverImage ? (
                    <img src={t.coverImage} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-4xl">🏝️</div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-2 text-sm font-semibold">{t.name}</h3>
                  <p className="mt-1 text-sm font-bold text-brand-700">{formatVND(t.adultPrice)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default TourDetailPage;
