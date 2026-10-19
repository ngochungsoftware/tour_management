import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, MapPin, Star, Tag, Sparkles, TrendingUp, Award, Calendar,
  Users, Shield, Headphones, CreditCard, ChevronRight, Plane, Heart,
  MapPinned, Mountain, Building2, Palmtree, Camera, ArrowRight, Flame, Binoculars,
  Clock, CheckCircle2, Quote, Globe, Wifi, Car, Coffee, Send,
  Trophy, BadgeCheck, Wallet, MousePointer2, ChevronLeft, ChevronRight as ChevronRightIcon,
  Play,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { tourApi } from '@/api/tour.api';
import { categoryApi, destinationApi } from '@/api/catalog.api';
import {
  CategoryResponse, DestinationResponse, HomeResponse, TourResponse,
} from '@/types';
import { useAsync } from '@/hooks/useAsync';
import TourCard from '@/components/tour/TourCard';
import { Spinner } from '@/components/ui/Feedback';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

/* ============================================================
 *  HERO — Modern travel với animated search + glassmorphism
 * ============================================================ */
const POPULAR_KEYWORDS = ['Phú Quốc', 'Đà Lạt', 'Sapa', 'Hạ Long', 'Nha Trang', 'Đà Nẵng'];

const Hero = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [travellers, setTravellers] = useState(2);
  const destinations = useAsync<DestinationResponse[]>(() => destinationApi.list());

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const search = new URLSearchParams();
    if (keyword) search.set('keyword', keyword);
    if (destination) search.set('destinationId', destination);
    if (date) search.set('date', date);
    navigate(`/tours?${search.toString()}`);
  };

  return (
    <section className="relative isolate z-0 overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2000&q=80"
          alt="hero"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-indigo-900/85 to-violet-900/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
      </div>

      {/* Animated blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl animate-blob" />
        <div className="absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-pink-500/30 blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative mx-auto flex min-h-[760px] max-w-7xl items-center px-4 pb-32 pt-20 md:pb-40 md:pt-28 lg:pb-48 lg:pt-24">
        <div className="grid w-full items-center gap-12 lg:grid-cols-5">
          {/* Left content */}
          <div className="lg:col-span-3 animate-fadeInUp">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold text-amber-200 backdrop-blur">
              <Flame className="h-3.5 w-3.5" /> Ưu đãi mùa hè lên tới <span className="text-amber-100">30% OFF</span>
            </div>

            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-white md:text-6xl lg:text-7xl">
              Khám phá thế giới,<br />
              <span className="font-display italic text-gradient-animated">trọn vẹn từng khoảnh khắc</span>
            </h1>

            <p className="mt-5 max-w-xl text-base text-white/80 md:text-lg">
              Hơn <strong className="text-white">1.000+</strong> tour trong nước và quốc tế.
              Đặt nhanh trong 60 giây, thanh toán an toàn, hỗ trợ <strong className="text-white">24/7</strong>.
            </p>

            {/* Search box — 2 rows: 4 fields + 1 button full-width */}
            <form
              onSubmit={onSearch}
              className="mt-8 overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl"
            >
              {/* Row 1: 4 search fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <SearchField icon={MapPin} label="Điểm đến">
                  <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Bạn muốn đi đâu?"
                    className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder-white/50"
                  />
                </SearchField>

                <SearchField icon={MapPinned} label="Tỉnh thành" divider>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full min-w-0 appearance-none bg-transparent text-sm text-white outline-none"
                  >
                    <option value="" className="text-slate-900">Tất cả</option>
                    {(destinations.data ?? []).slice(0, 12).map((d) => (
                      <option key={d.id} value={d.id} className="text-slate-900">{d.name}</option>
                    ))}
                  </select>
                </SearchField>

                <SearchField icon={Calendar} label="Ngày đi" divider>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full min-w-0 bg-transparent text-sm text-white outline-none [color-scheme:dark]"
                  />
                </SearchField>

                <SearchField icon={Users} label="Số khách" divider>
                  <select
                    value={travellers}
                    onChange={(e) => setTravellers(Number(e.target.value))}
                    className="w-full min-w-0 appearance-none bg-transparent text-sm text-white outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                      <option key={n} value={n} className="text-slate-900">{n} khách</option>
                    ))}
                  </select>
                </SearchField>
              </div>

              {/* Row 2: full-width submit button */}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-3.5 text-sm font-extrabold text-slate-900 transition hover:from-amber-300 hover:to-orange-400"
              >
                <Search className="h-4 w-4" /> Tìm tour ngay
              </button>
            </form>

            {/* Popular keywords */}
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-white/60">Phổ biến:</span>
              {POPULAR_KEYWORDS.map((k, i) => (
                <button
                  key={k}
                  onClick={() => {
                    setKeyword(k);
                    navigate(`/tours?keyword=${encodeURIComponent(k)}`);
                  }}
                  className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-white/90 backdrop-blur transition hover:border-amber-300/50 hover:bg-amber-400/10 hover:text-amber-200 animate-fadeInUp"
                  style={{ animationDelay: `${0.3 + i * 0.05}s` }}
                >
                  {k}
                </button>
              ))}
            </div>

            {/* Trust badges */}
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/80 animate-fadeInUp delay-500">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-300 text-amber-300" />
                  ))}
                </div>
                <span><strong className="text-white">4.8/5</strong> · 12k đánh giá</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                </div>
                <span>Đã phục vụ 50K+ khách</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-sky-300" />
                <span>Thanh toán bảo mật SSL</span>
              </div>
            </div>
          </div>

          {/* Right floating cards */}
          <div className="relative hidden lg:col-span-2 lg:block">
            <div className="relative h-[520px]">
              <FloatingPreview
                className="absolute right-0 top-0 w-72 rotate-[3deg]"
                title="Tour Phú Quốc 4N3Đ"
                location="Kiên Giang"
                price="5.990.000đ"
                rating="4.9"
                image="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600"
                delay="0s"
              />
              <FloatingPreview
                className="absolute left-0 top-40 w-72 -rotate-[2deg]"
                title="Tour Đà Lạt 3N2Đ"
                location="Lâm Đồng"
                price="2.490.000đ"
                rating="4.8"
                image="https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600"
                delay="0.5s"
                badge="Hot"
              />
              <FloatingPreview
                className="absolute bottom-0 right-4 w-72 rotate-[2deg]"
                title="Tour Sapa 2N1Đ"
                location="Lào Cai"
                price="1.890.000đ"
                rating="4.7"
                image="https://images.unsplash.com/photo-1528127269322-539801943592?w=600"
                delay="1s"
              />

              {/* Mini stats badge */}
              <div className="absolute left-4 top-4 animate-float-slow rounded-2xl border border-white/20 bg-white/10 p-3 text-white backdrop-blur-xl">
                <div className="text-[10px] uppercase tracking-wider text-white/60">Khách đang xem</div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['from-indigo-400', 'from-pink-400', 'from-amber-400'].map((g, i) => (
                      <div key={i} className={`h-6 w-6 rounded-full border-2 border-white/30 bg-gradient-to-br ${g} to-violet-500`} />
                    ))}
                  </div>
                  <span className="text-sm font-bold">+1.2k</span>
                </div>
              </div>

              {/* Rating badge */}
              <div className="absolute bottom-32 left-2 animate-float-slow rounded-2xl border border-white/20 bg-white/10 p-3 text-white backdrop-blur-xl" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
                    <Trophy className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] text-white/60">Top 1 ĐNA</div>
                    <div className="text-xs font-bold">Best Travel App 2025</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute inset-x-0 bottom-0">
        <svg viewBox="0 0 1440 80" className="w-full" preserveAspectRatio="none">
          <path
            d="M0,40 C240,80 480,0 720,30 C960,60 1200,20 1440,40 L1440,80 L0,80 Z"
            fill="#f8fafc"
          />
        </svg>
      </div>
    </section>
  );
};

const SearchField = ({
  icon: Icon, label, children, divider, className = '',
}: { icon: any; label: string; children: React.ReactNode; divider?: boolean; className?: string }) => (
  <div
    className={`group relative flex items-center gap-2.5 px-4 py-3 transition hover:bg-white/10 ${
      divider ? 'lg:border-l lg:border-white/10' : ''
    } ${className}`}
  >
    <Icon className="h-4 w-4 shrink-0 text-white/60 transition group-hover:text-amber-300" />
    <div className="min-w-0 flex-1">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-white/50">{label}</div>
      <div className="mt-0.5 truncate">{children}</div>
    </div>
  </div>
);

const FloatingPreview = ({
  className, title, location, price, rating, image, delay, badge,
}: { className?: string; title: string; location?: string; price: string; rating: string; image: string; delay: string; badge?: string }) => (
  <div
    className={`animate-float rounded-2xl border border-white/20 bg-white/95 p-3 text-slate-800 shadow-2xl backdrop-blur ${className ?? ''}`}
    style={{ animationDelay: delay }}
  >
    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
      <img src={image} alt={title} className="h-full w-full object-cover" loading="lazy" />
      {badge && (
        <div className="absolute left-2 top-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-2 py-0.5 text-[10px] font-bold text-white">
          {badge}
        </div>
      )}
      <button className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-rose-500 shadow">
        <Heart className="h-3.5 w-3.5" />
      </button>
    </div>
    <div className="mt-2.5 px-1">
      <div className="truncate text-sm font-bold">{title}</div>
      {location && (
        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
          <MapPin className="h-3 w-3" /> {location}
        </div>
      )}
      <div className="mt-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1 text-amber-500">
          <Star className="h-3 w-3 fill-current" />
          <span className="text-[11px] font-semibold">{rating}</span>
        </div>
        <span className="text-sm font-extrabold text-indigo-600">{price}</span>
      </div>
    </div>
  </div>
);

/* ============================================================
 *  PARTNERS — Logo strip
 * ============================================================ */
const PARTNERS = ['Vietnam Airlines', 'VietJet Air', 'Bamboo Airways', 'Meliá Hotels', 'Marriott', 'Hilton', 'Saigontourist', 'Vinpearl'];

const PartnersBar = () => (
  <section className="relative z-10 border-y border-slate-200/60 bg-slate-50 py-6">
    <div className="mx-auto max-w-7xl px-4">
      <div className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
        Đối tác chiến lược của chúng tôi
      </div>
      <div className="mt-4 overflow-hidden">
        <div className="flex w-max gap-12 animate-marquee">
          {[...PARTNERS, ...PARTNERS].map((p, i) => (
            <div
              key={i}
              className="grid h-10 min-w-[160px] place-items-center rounded-lg border border-slate-200 bg-white px-6 text-sm font-bold tracking-wider text-slate-400"
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* ============================================================
 *  STATS — Animated counter
 * ============================================================ */
const STATS = [
  { icon: Plane, value: 1000, suffix: '+', label: 'Tour chất lượng' },
  { icon: MapPin, value: 50, suffix: '+', label: 'Điểm đến' },
  { icon: Users, value: 12, suffix: 'K+', label: 'Khách hàng' },
  { icon: Star, value: 4.8, suffix: '/5', label: 'Đánh giá', decimals: 1 },
];

const AnimatedNumber = ({ value, suffix, decimals = 0 }: { value: number; suffix: string; decimals?: number }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!ref.current || started.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const startTime = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(value * eased);
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-4xl font-extrabold md:text-5xl">
      {display.toFixed(decimals)}
      <span className="text-amber-300">{suffix}</span>
    </div>
  );
};

const Stats = () => (
  <section className="relative z-10 overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-900 text-white">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />
    </div>
    <div className="relative mx-auto max-w-7xl px-4 py-16">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-bold md:text-3xl">Được hàng triệu du khách tin tưởng</h2>
        <p className="mt-2 text-white/60">Những con số ấn tượng sau hơn 10 năm phục vụ</p>
      </div>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="group rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur transition hover:-translate-y-1 hover:border-amber-300/30 hover:bg-white/10"
          >
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
              <s.icon className="h-6 w-6 text-white" />
            </div>
            <div className="mt-4 text-amber-300">
              <AnimatedNumber value={s.value} suffix={s.suffix} decimals={s.decimals || 0} />
            </div>
            <div className="mt-1 text-sm text-white/70">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ============================================================
 *  CATEGORIES — Premium cards với gradient + 3D hover
 * ============================================================ */
const CATEGORIES_VISUAL = [
  { name: 'Tour biển', icon: Palmtree, gradient: 'from-sky-400 to-cyan-500', desc: 'Cát trắng, nắng vàng' },
  { name: 'Tour núi', icon: Mountain, gradient: 'from-emerald-400 to-teal-600', desc: 'Chinh phục đỉnh cao' },
  { name: 'Nghỉ dưỡng', icon: Building2, gradient: 'from-amber-400 to-orange-500', desc: 'Resort 5 sao sang trọng' },
  { name: 'Khám phá', icon: Binoculars, gradient: 'from-violet-500 to-purple-600', desc: 'Trải nghiệm mới mẻ' },
  { name: 'Văn hóa', icon: Camera, gradient: 'from-rose-500 to-pink-600', desc: 'Lịch sử, di sản' },
  { name: 'Ẩm thực', icon: Coffee, gradient: 'from-orange-400 to-red-500', desc: 'Hành trình vị giác' },
];

const Categories = ({ data }: { data: CategoryResponse[] }) => {
  const display = (data?.length ? data : CATEGORIES_VISUAL.map((c, i) => ({ id: i, name: c.name } as any))).slice(0, 6);
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <SectionHeader
        title="Khám phá theo phong cách"
        subtitle="Mỗi chuyến đi là một câu chuyện — chọn phong cách của bạn"
        link={{ to: '/tours', label: 'Xem tất cả' }}
      />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {display.map((c, i) => {
          const visual = CATEGORIES_VISUAL.find((v) => v.name === c.name) ?? CATEGORIES_VISUAL[i % 6];
          const Icon = visual.icon;
          return (
            <Link
              key={c.id}
              to={`/tours?categoryId=${c.id}`}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 transition-all duration-300 hover:-translate-y-2 hover:border-transparent hover:shadow-2xl hover:shadow-indigo-200/50"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${visual.gradient} opacity-0 transition group-hover:opacity-100`} />
              <div className="relative">
                <div className={`inline-grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${visual.gradient} text-white shadow-lg transition group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="mt-4 font-bold text-slate-800 transition group-hover:text-white">
                  {c.name}
                </div>
                <div className="mt-1 text-xs text-slate-500 transition group-hover:text-white/80">
                  {visual.desc}
                </div>
                <ArrowRight className="absolute right-3 top-3 h-4 w-4 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-white" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

/* ============================================================
 *  DESTINATIONS — Mosaic Pinterest-style
 * ============================================================ */
const Destinations = ({ data }: { data: DestinationResponse[] }) => {
  if (!data?.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <SectionHeader
        title="Điểm đến truyền cảm hứng"
        subtitle="Những vùng đất đang chờ bạn khám phá"
        link={{ to: '/tours', label: 'Xem bản đồ' }}
      />
      <div className="mt-8 mosaic-grid">
        {data.slice(0, 10).map((d, i) => (
          <Link
            key={d.id}
            to={`/tours?destinationId=${d.id}`}
            className="mosaic-item group relative overflow-hidden rounded-2xl shadow-md"
          >
            <div className="absolute inset-0 bg-slate-200">
              {d.image ? (
                <img
                  src={d.image}
                  alt={d.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="grid h-full place-items-center text-5xl">🌏</div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent transition group-hover:via-indigo-900/30" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
              <div className="text-lg font-extrabold transition group-hover:translate-y-[-2px]">{d.name}</div>
              {d.province && d.province !== d.name && (
                <div className="mt-0.5 text-xs text-white/80">{d.province}</div>
              )}
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur transition group-hover:bg-white group-hover:text-indigo-600">
                Khám phá <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

/* ============================================================
 *  PROMO BANNER — Countdown style
 * ============================================================ */
const PromoBanner = () => (
  <section className="mx-auto max-w-7xl px-4 py-12">
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-8 text-white md:p-12">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
      </div>
      {/* Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" viewBox="0 0 100 100">
          <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="white" />
          </pattern>
          <rect width="100" height="100" fill="url(#dots)" />
        </svg>
      </div>

      <div className="relative grid items-center gap-8 md:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">
            <Flame className="h-3.5 w-3.5" /> FLASH SALE
          </span>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight md:text-5xl">
            Giảm đến <span className="text-amber-100">30%</span><br />
            tour mùa hè 2026
          </h2>
          <p className="mt-3 max-w-md text-white/90">
            Đặt ngay hôm nay để nhận ưu đãi hấp dẫn. Số lượng có hạn, đừng bỏ lỡ!
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              to="/tours?discount=true"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-orange-600 shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl"
            >
              Săn deal ngay <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="text-xs text-white/80">* Áp dụng đến 31/08/2026</div>
          </div>
        </div>
        <div className="hidden md:block">
          <div className="ml-auto w-fit rounded-3xl border border-white/30 bg-white/15 p-6 text-center backdrop-blur-xl">
            <div className="text-[10px] uppercase tracking-widest text-white/70">Mã giảm giá</div>
            <div className="mt-1 font-mono text-2xl font-extrabold tracking-wider">SUMMER30</div>
            <div className="my-3 h-px bg-white/20" />
            <Countdown />
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Countdown = () => {
  const [time, setTime] = useState({ d: 5, h: 12, m: 30, s: 0 });
  useEffect(() => {
    const id = setInterval(() => {
      setTime((t) => {
        let s = t.s - 1, m = t.m, h = t.h, d = t.d;
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) { h = 23; d -= 1; }
        if (d < 0) return { d: 0, h: 0, m: 0, s: 0 };
        return { d, h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const cell = (n: number, l: string) => (
    <div className="rounded-lg bg-white/20 px-3 py-2 backdrop-blur">
      <div className="text-xl font-extrabold">{String(n).padStart(2, '0')}</div>
      <div className="text-[9px] uppercase tracking-wider text-white/70">{l}</div>
    </div>
  );
  return (
    <div className="flex items-end justify-center gap-2">
      {cell(time.d, 'ngày')}
      {cell(time.h, 'giờ')}
      {cell(time.m, 'phút')}
      {cell(time.s, 'giây')}
    </div>
  );
};

/* ============================================================
 *  TOUR SECTIONS — Với tab toggle
 * ============================================================ */
const TourSection = ({
  title, subtitle, icon, tours, viewAllLink, accent = 'indigo',
}: {
  title: string; subtitle?: string; icon?: React.ReactNode;
  tours: TourResponse[]; viewAllLink?: string;
  accent?: 'indigo' | 'amber' | 'emerald' | 'rose';
}) => {
  if (!tours?.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <SectionHeader title={title} subtitle={subtitle} icon={icon} link={viewAllLink ? { to: viewAllLink, label: 'Xem tất cả' } : undefined} />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {tours.slice(0, 4).map((t, i) => (
          <div key={t.id} className="animate-fadeInUp" style={{ animationDelay: `${i * 0.08}s` }}>
            <TourCard tour={t} />
          </div>
        ))}
      </div>
    </section>
  );
};

/* ============================================================
 *  WHY CHOOSE US — Với illustration
 * ============================================================ */
const FEATURES = [
  { icon: Shield, title: 'Thanh toán an toàn', desc: 'Mã hóa SSL 256-bit, hỗ trợ đa dạng phương thức', color: 'from-emerald-400 to-teal-500', bgLight: 'bg-emerald-50', textColor: 'text-emerald-700' },
  { icon: Headphones, title: 'Hỗ trợ 24/7', desc: 'Đội ngũ tư vấn nhiệt tình mọi lúc mọi nơi', color: 'from-sky-400 to-blue-500', bgLight: 'bg-sky-50', textColor: 'text-sky-700' },
  { icon: CreditCard, title: 'Giá tốt nhất', desc: 'Cam kết hoàn tiền 200% nếu tìm thấy giá rẻ hơn', color: 'from-amber-400 to-orange-500', bgLight: 'bg-amber-50', textColor: 'text-amber-700' },
  { icon: Award, title: 'Đối tác uy tín', desc: '500+ khách sạn & hãng bay hàng đầu thế giới', color: 'from-violet-400 to-purple-500', bgLight: 'bg-violet-50', textColor: 'text-violet-700' },
];

const WhyChooseUs = () => (
  <section className="bg-white py-16">
    <div className="mx-auto max-w-7xl px-4">
      <div className="mx-auto max-w-2xl text-center">
        <span className="badge-violet">Tại sao chọn TravelGo</span>
        <h2 className="mt-3 section-title text-slate-900">
          Trải nghiệm <span className="gradient-text">đẳng cấp</span> cho mỗi chuyến đi
        </h2>
        <p className="mt-3 text-slate-500">
          Chúng tôi không chỉ bán tour — chúng tôi kiến tạo những kỷ niệm trọn đời
        </p>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200/60"
          >
            <div className={`inline-grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${f.color} text-white shadow-lg transition group-hover:scale-110 group-hover:rotate-3`}>
              <f.icon className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.desc}</p>
            <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 opacity-0 transition group-hover:opacity-100">
              Tìm hiểu thêm <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ============================================================
 *  HOW IT WORKS — Step-by-step
 * ============================================================ */
const STEPS = [
  { num: '01', icon: Search, title: 'Tìm kiếm & chọn tour', desc: 'Duyệt qua 1000+ tour, lọc theo sở thích và ngân sách' },
  { num: '02', icon: Wallet, title: 'Đặt cọc & thanh toán', desc: 'Thanh toán bảo mật với nhiều phương thức tiện lợi' },
  { num: '03', icon: BadgeCheck, title: 'Xác nhận tức thì', desc: 'Nhận voucher và thông tin chi tiết qua email/SMS' },
  { num: '04', icon: Plane, title: 'Khởi hành & tận hưởng', desc: 'Hướng dẫn viên chuyên nghiệp đồng hành cùng bạn' },
];

const HowItWorks = () => (
  <section className="bg-slate-50 py-16">
    <div className="mx-auto max-w-7xl px-4">
      <div className="mx-auto max-w-2xl text-center">
        <span className="badge-blue">Quy trình đơn giản</span>
        <h2 className="mt-3 section-title text-slate-900">Đặt tour chỉ với <span className="gradient-text">4 bước</span></h2>
        <p className="mt-3 text-slate-500">Nhanh chóng, dễ dàng, an toàn tuyệt đối</p>
      </div>
      <div className="relative mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Connector line */}
        <div className="absolute left-0 right-0 top-12 hidden h-0.5 bg-gradient-to-r from-indigo-200 via-violet-300 to-pink-200 lg:block" />
        {STEPS.map((s) => (
          <div key={s.num} className="group relative rounded-2xl border border-slate-200/80 bg-white p-6 text-center transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-0.5 text-xs font-bold text-white shadow">
              {s.num}
            </div>
            <div className="mx-auto mt-2 grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 transition group-hover:scale-110 group-hover:from-indigo-100 group-hover:to-violet-100">
              <s.icon className="h-9 w-9 text-indigo-600" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ============================================================
 *  TESTIMONIALS — Với carousel
 * ============================================================ */
const TESTIMONIALS = [
  { name: 'Nguyễn Thị Mai', role: 'Đã đi Phú Quốc', avatar: 'https://i.pravatar.cc/120?img=1', rating: 5, text: 'Dịch vụ tuyệt vời! Tour được sắp xếp chu đáo, hướng dẫn viên nhiệt tình. Sẽ quay lại TravelGo trong thời gian sớm nhất.' },
  { name: 'Trần Văn Nam', role: 'Đã đi Sapa', avatar: 'https://i.pravatar.cc/120?img=2', rating: 5, text: 'Giá cả hợp lý, tour chất lượng. Đặc biệt hỗ trợ khách hàng 24/7 rất tốt. Cảm ơn team!' },
  { name: 'Lê Hoàng Anh', role: 'Đã đi Đà Lạt', avatar: 'https://i.pravatar.cc/120?img=3', rating: 4, text: 'Chuyến đi gia đình rất vui. Khách sạn sạch đẹp, lịch trình hợp lý. Bé nhà mình rất thích.' },
  { name: 'Phạm Thị Hương', role: 'Đã đi Hạ Long', avatar: 'https://i.pravatar.cc/120?img=5', rating: 5, text: 'Trải nghiệm đáng nhớ! Du thuyền sang trọng, đồ ăn ngon. Sẽ giới thiệu bạn bè.' },
  { name: 'Đỗ Minh Quân', role: 'Đã đi Nha Trang', avatar: 'https://i.pravatar.cc/120?img=8', rating: 5, text: 'App đặt tour dễ dùng, thanh toán nhanh. Tour đúng như mô tả. 10 điểm!' },
];

const Testimonials = () => {
  const [index, setIndex] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(TESTIMONIALS.length / itemsPerPage);

  const next = () => setIndex((i) => (i + 1) % totalPages);
  const prev = () => setIndex((i) => (i - 1 + totalPages) % totalPages);
  const visible = TESTIMONIALS.slice(index * itemsPerPage, (index + 1) * itemsPerPage);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-pink-50 py-20">
      <div className="pointer-events-none absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-1/3 h-72 w-72 rounded-full bg-pink-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="badge-rose">Cảm nhận khách hàng</span>
            <h2 className="mt-3 section-title text-slate-900">
              Hơn 12.000 lượt <span className="gradient-text-warm">đánh giá 5 sao</span>
            </h2>
            <p className="mt-2 text-slate-500">Lắng nghe chia sẻ từ những du khách đã đồng hành cùng chúng tôi</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={prev}
              className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {visible.map((t, i) => (
            <div
              key={`${index}-${i}`}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-xl animate-fadeInUp"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <Quote className="absolute right-4 top-4 h-12 w-12 text-indigo-100 transition group-hover:text-indigo-200" />
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: t.rating }, (_, j) => (
                  <Star key={j} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">"{t.text}"</p>
              <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-indigo-100"
                  loading="lazy"
                />
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-900">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
                <BadgeCheck className="h-5 w-5 text-sky-500" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                index === i ? 'w-8 bg-indigo-600' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

/* ============================================================
 *  NEWSLETTER BAND
 * ============================================================ */
const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-900 p-8 text-white md:p-12">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-400 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-pink-500 blur-3xl" />
        </div>
        <div className="relative grid items-center gap-8 md:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-200">
              <Sparkles className="h-3.5 w-3.5" /> Ưu đãi độc quyền
            </div>
            <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">
              Tiết kiệm đến 50% khi đăng ký nhận tin
            </h2>
            <p className="mt-2 text-white/70">
              Nhận ngay mã giảm giá 500K cho booking đầu tiên + cập nhật tour mới mỗi tuần
            </p>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); if (email) { setDone(true); setEmail(''); setTimeout(() => setDone(false), 3000); } }}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              required
              className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/50 outline-none backdrop-blur transition focus:border-amber-300"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 text-sm font-extrabold text-slate-900 shadow-lg shadow-amber-500/30 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <Send className="h-4 w-4" /> Đăng ký
            </button>
            {done && (
              <div className="absolute -bottom-2 right-0 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white animate-fadeIn">
                ✓ Thành công!
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

/* ============================================================
 *  FLOATING CHAT
 * ============================================================ */
const FloatingChat = () => (
  <button
    className="fixed bottom-6 right-6 z-30 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-2xl shadow-indigo-500/40 transition hover:scale-110"
    aria-label="Chat với chúng tôi"
  >
    <div className="absolute inset-0 rounded-full bg-indigo-500/40 animate-pulse-ring" />
    <Headphones className="relative h-6 w-6" />
    <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-[10px] font-bold ring-2 ring-white">
      1
    </span>
  </button>
);

/* ============================================================
 *  SECTION HEADER
 * ============================================================ */
const SectionHeader = ({
  title, subtitle, link, icon,
}: { title: string; subtitle?: string; link?: { to: string; label: string }; icon?: React.ReactNode }) => (
  <div className="flex flex-wrap items-end justify-between gap-4">
    <div>
      <h2 className="flex items-center gap-2.5 text-2xl font-extrabold text-slate-900 md:text-3xl">
        {icon && (
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-600">
            {icon}
          </span>
        )}
        {title}
      </h2>
      {subtitle && <p className="mt-1.5 text-sm text-slate-500 md:text-base">{subtitle}</p>}
    </div>
    {link && (
      <Link
        to={link.to}
        className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
      >
        {link.label}
        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
      </Link>
    )}
  </div>
);

/* ============================================================
 *  HOMEPAGE
 * ============================================================ */
const HomePage = () => {
  const [searchParams] = useSearchParams();
  useEffect(() => { window.scrollTo(0, 0); }, [searchParams]);

  return (
    <ErrorBoundary>
      <HomeContent />
    </ErrorBoundary>
  );
};

const HomeContent = () => {
  const home = useAsync<HomeResponse>(() => tourApi.home());
  const categories = useAsync<CategoryResponse[]>(() => categoryApi.list());
  const destinations = useAsync<DestinationResponse[]>(() => destinationApi.list());

  const totalTours = useMemo(
    () => home.data
      ? home.data.featuredTours.length + home.data.newTours.length +
        home.data.discountedTours.length + home.data.topRatedTours.length
      : 0,
    [home.data]
  );

  return (
    <div className="relative">
      <Hero />
      <PartnersBar />
      <Stats />

      <Categories data={categories.data ?? []} />
      <PromoBanner />

      {home.data && (
        <>
          <TourSection
            title="Tour nổi bật"
            subtitle="Những tour được yêu thích nhất tuần qua"
            icon={<Award className="h-5 w-5" />}
            tours={home.data.featuredTours}
            viewAllLink="/tours"
            accent="indigo"
          />
          <Destinations data={destinations.data ?? []} />
          <TourSection
            title="Tour mới cập nhật"
            subtitle="Khám phá những hành trình mới nhất"
            icon={<Sparkles className="h-5 w-5" />}
            tours={home.data.newTours}
            viewAllLink="/tours"
            accent="rose"
          />
          <HowItWorks />
          <TourSection
            title="Đang giảm giá sốc"
            subtitle="Săn deal giá tốt — số lượng có hạn"
            icon={<Flame className="h-5 w-5" />}
            tours={home.data.discountedTours}
            viewAllLink="/tours?discount=true"
            accent="amber"
          />
          <TourSection
            title="Đánh giá cao nhất"
            subtitle="Được du khách tin tưởng và lựa chọn"
            icon={<Star className="h-5 w-5" />}
            tours={home.data.topRatedTours}
            viewAllLink="/tours?sort=rating"
            accent="emerald"
          />
        </>
      )}

      <WhyChooseUs />
      <Testimonials />
      <Newsletter />

      {totalTours > 0 && (
        <p className="pb-10 text-center text-xs text-slate-400">
          Đã hiển thị {totalTours} tour nổi bật từ TravelGo
        </p>
      )}

      <FloatingChat />
    </div>
  );
};

export default HomePage;
