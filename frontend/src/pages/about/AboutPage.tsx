import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Users, Globe2, Award, Heart, Shield, Clock, CheckCircle2,
  Sparkles, Compass, Calendar, Star, ArrowRight, Quote, Plane,
  Palmtree, Mountain, Building2, Camera, Mail, Phone, Send, Target,
  Eye, Zap, Handshake, Leaf, Target as TargetIcon, MessageSquare,
} from 'lucide-react';
import { tourApi } from '@/api/tour.api';
import { categoryApi, destinationApi } from '@/api/catalog.api';
import { useAsync } from '@/hooks/useAsync';
import { Spinner } from '@/components/ui/Feedback';
import { formatVND } from '@/utils/format';

/* ============================================================
 *  Static content data
 * ============================================================ */

const STATS = [
  { icon: MapPin, value: '500+', label: 'Điểm đến trên toàn quốc', color: 'from-indigo-500 to-violet-600' },
  { icon: Users, value: '120K+', label: 'Khách hàng tin tưởng', color: 'from-pink-500 to-rose-600' },
  { icon: Globe2, value: '30+', label: 'Tỉnh thành & quốc tế', color: 'from-emerald-500 to-teal-600' },
  { icon: Award, value: '4.9/5', label: 'Đánh giá trung bình', color: 'from-amber-500 to-orange-600' },
];
const VALUES = [
  {
    icon: Target,
    title: 'Chất lượng là ưu tiên',
    desc: 'Mỗi tour đều được kiểm duyệt nghiêm ngặt về lịch trình, chất lượng dịch vụ và an toàn. Chúng tôi chỉ giới thiệu những trải nghiệm thực sự đáng nhớ.',
  },
  {
    icon: Eye,
    title: 'Minh bạch về giá cả',
    desc: 'Giá hiển thị trên website là giá cuối cùng, đã bao gồm phí, bảo hiểm và các khoản phụ thu. Không có chi phí ẩn, không phí phát sinh bất ngờ.',
  },
  {
    icon: Zap,
    title: 'Đặt tour tức thì',
    desc: 'Quy trình đặt tour chỉ mất vài phút. Thanh toán linh hoạt qua thẻ, chuyển khoản, ví điện tử — xác nhận đơn hàng ngay lập tức.',
  },
  {
    icon: Handshake,
    title: 'Đồng hành tận tâm',
    desc: 'Đội ngũ hướng dẫn viên được đào tạo bài bản, luôn sẵn sàng hỗ trợ 24/7 để chuyến đi của bạn trở nên nhẹ nhàng.',
  },
  {
    icon: Leaf,
    title: 'Du lịch bền vững',
    desc: 'Chúng tôi ưu tiên các điểm đến du lịch xanh, hỗ trợ cộng đồng địa phương và giảm thiểu tác động tiêu cực tới môi trường.',
  },
  {
    icon: Heart,
    title: 'Kỷ niệm chân thành',
    desc: 'Mỗi hành trình đều là cơ hội để kết nối với gia đình, bạn bè và vẻ đẹp trầm tích của Việt Nam.',
  },
];

const TIMELINE = [
  {
    year: '2018',
    title: 'Khởi đầu',
    desc: 'TravelGo được thành lập tại TP. Hồ Chí Minh với 12 tour nội địa đầu tiên và một đội ngũ 5 nhân sự.',
    icon: Sparkles,
  },
  {
    year: '2020',
    title: 'Mở rộng toàn quốc',
    desc: 'Vượt qua giai đoạn đại dịch, chúng tôi ra mắt nền tảng đặt tour trực tuyến phục vụ hơn 20.000 khách hàng.',
    icon: Globe2,
  },
  {
    year: '2022',
    title: 'Đạt 100.000 khách hàng',
    desc: 'Tham gia 150+ tour trên toàn quốc, mở rộng thêm các tuyến quốc tế đi Đài Loan, Hàn Quốc, Thái Lan.',
    icon: Users,
  },
  {
    year: '2024',
    title: 'Top 10 ĐNA',
    desc: 'Được vinh danh là một trong 10 nền tảng đặt tour trực tuyến uy tín nhất Việt Nam nhờ chất lượng dịch vụ.',
    icon: Award,
  },
  {
    year: '2026',
    title: 'Hướng tới tương lai',
    desc: 'Tiếp tục đổi mới công nghệ, mở rộng trải nghiệm du lịch thông minh và phát triển du lịch bền vững.',
    icon: Compass,
  },
];

const TEAM = [
  {
    name: 'Nguyễn Minh Quân',
    role: 'Giám đốc điều hành',
    bio: '12 năm kinh nghiệm trong ngành du lịch, từng điều hành chuỗi resort 5 sao tại Đà Nẵng và Phú Quốc.',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
  },
  {
    name: 'Trần Thị Mai Anh',
    role: 'Giám đốc điều hành',
    bio: 'Chuyên gia vận hành tour với 10 năm kinh nghiệm, phụ trách chuỗi giá trị từ đặt tour đến hậu mãi.',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80',
  },
  {
    name: 'Lê Hoàng Nam',
    role: 'Giám đốc Công nghệ',
    bio: 'Kiến trúc sư hệ thống, dẫn dắt đội ngũ kỹ thuật xây dựng nền tảng đặt tour với hơn 500.000 lượt sử dụng.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  },
  {
    name: 'Phạm Thuỳ Linh',
    role: 'Giám đốc Marketing',
    bio: 'Kiến trúc thương hiệu, từng dẫn dắt chiến lược ra mắt thương hiệu cho nhiều startup du lịch tại Việt Nam.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
  },
];

const CATEGORY_ICONS: Record<string, any> = {
  'Tour biển': Palmtree,
  'Tour Núi': Mountain,
  'Tour thành phố': Building2,
  'Tour văn hóa': Camera,
};

const CATEGORY_COLORS: Record<string, string> = {
  'Tour biển': 'from-cyan-500 to-blue-600',
  'Tour Núi': 'from-emerald-500 to-teal-600',
  'Tour thành phố': 'from-violet-500 to-purple-600',
  'Tour văn hóa': 'from-amber-500 to-orange-600',
};

const CONTACT_CHANNELS = [
  { icon: Phone, title: 'Hotline', value: '1900 6868', desc: 'Miễn phí trong nước', href: 'tel:19006868' },
  { icon: Mail, title: 'Email', value: 'support@travelgo.vn', desc: 'Phản hồi trong 24 giờ', href: 'mailto:support@travelgo.vn' },
  { icon: MessageSquare, title: 'Live chat', value: 'Chat trực tiếp', desc: '8:00 - 22:00 hàng ngày', href: '#' },
];

/* ============================================================
 *  Page
 * ============================================================ */
const AboutPage = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const home = useAsync(() => tourApi.home());
  const categories = useAsync(() => categoryApi.list());
  const destinations = useAsync(() => destinationApi.list());

  // Số liệu thật từ API
  const liveStats = useMemo(() => {
    const tours = home.data?.featuredTours.length ?? 0;
    const newTours = home.data?.newTours.length ?? 0;
    const dests = destinations.data?.length ?? 0;
    const cats = categories.data?.length ?? 0;
    return { tours, newTours, dests, cats };
  }, [home.data, destinations.data, categories.data]);

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <div className="bg-slate-50">
      {/* ===================== HERO ===================== */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=2000&q=80"
            alt="about hero"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/92 via-indigo-900/88 to-violet-900/85" />
        </div>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 top-8 h-80 w-80 rounded-full bg-indigo-500/30 blur-3xl animate-blob" />
          <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-pink-500/25 blur-3xl animate-blob" style={{ animationDelay: '3s' }} />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center md:py-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-200 backdrop-blur animate-fadeIn">
            <Sparkles className="h-3.5 w-3.5" /> Về TravelGo
          </div>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight text-white md:text-6xl animate-fadeInUp">
            Chúng tôi kết nối bạn với
            <span className="block text-gradient-animated">những chuyến đi đáng nhớ</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg animate-fadeInUp delay-100">
            Từ năm 2018, TravelGo đã giúp hơn 120.000 khách hàng khám phá Việt Nam và thế giới
            bằng những chuyến đi được thiết kế cẩn thận, giá cả minh bạch và dịch vụ chu đáo.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 animate-fadeInUp delay-200 sm:flex-row">
            <Link to="/tours" className="btn-primary !px-6 !py-3">
              <Compass className="h-4 w-4" /> Khám phá tour
            </Link>
            <a href="#contact" className="btn-glass !px-6 !py-3">
              <MessageSquare className="h-4 w-4" /> Liên hệ với chúng tôi
            </a>
          </div>
        </div>
      </section>

      {/* ===================== STATS ===================== */}
      <section className="relative -mt-14 mx-auto max-w-7xl px-4">
        <div className="card grid grid-cols-2 gap-px overflow-hidden bg-slate-100 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="group flex flex-col items-center gap-2 bg-white px-4 py-8 text-center transition hover:bg-slate-50 animate-fadeInUp"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${s.color} shadow-lg transition-transform group-hover:scale-110`}>
                <s.icon className="h-6 w-6 text-white" />
              </div>
              <div className="mt-1 text-2xl font-extrabold text-slate-800 md:text-3xl">{s.value}</div>
              <div className="text-xs text-slate-500 md:text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== CÂU CHUYỆN ===================== */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="animate-fadeInUp">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700">
              <TargetIcon className="h-3.5 w-3.5" /> Câu chuyện của chúng tôi
            </div>
            <h2 className="section-title mt-4 text-slate-800">
              Khởi đầu từ một <span className="gradient-text">niềm tin đơn giản</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600">
              Năm 2018, chúng tôi bắt đầu với một căn xe 16 chỗ và niềm tin rằng việc đi du lịch
              không nên phải là trải nghiệm phức tạp hay đầy bất ngờ. Chỉ cần một lịch trình
              được cân nhắc kỹ, một giá minh bạch và một đội ngũ thật lòng quan tâm.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Từ đó, TravelGo đã phát triển thành nền tảng đặt tour trực tuyến với
              hệ sinh thái{' '}
              <strong className="text-slate-800">hàng trăm điểm đến</strong> và{' '}
              <strong className="text-slate-800">nhiều thể loại tour</strong> đa dạng.
              Chúng tôi vẫn giữ nguyên cách làm việc đó: mỗi chuyến đi đều được một
              con người thật sự chuẩn bị, kiểm tra và đảm bảo trải nghiệm tốt nhất có thể.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { icon: Shield, title: 'Bảo hành chất lượng', desc: 'Hoàn tiền 100% nếi không đúng cam kết' },
                { icon: Clock, title: 'Hỗ trợ 24/7', desc: 'Luôn có người nghe và hỗ trợ bạn' },
                { icon: CheckCircle2, title: 'Hoàn tiền linh hoạt', desc: 'Đổi lịch hoặc hoàn tiền dễ dàng' },
                { icon: Plane, title: 'Đối tác uy tín', desc: 'Hàng không, khách sạn đạt chuẩn quốc tế' },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-4">
                  <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{f.title}</div>
                    <div className="mt-0.5 text-xs leading-relaxed text-slate-500">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mosaic images */}
          <div className="relative animate-fadeInUp delay-200">
            <div className="mosaic-grid">
              {[
                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
                'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80',
                'https://images.unsplash.com/photo-1513415564515-9d8b1e7d4e2b?w=800&q=80',
                'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
                'https://images.unsplash.com/photo-1504598318550-17eba1008a68?w=800&q=80',
                'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80',
                'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80',
                'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&q=80',
                'https://images.unsplash.com/photo-1499591934245-40b55745b905?w=800&q=80',
                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`du lịch ${i + 1}`}
                  loading="lazy"
                  className="mosaic-item h-full w-full rounded-xl object-cover transition duration-500 hover:scale-105"
                />
              ))}
            </div>
            <div className="absolute -bottom-6 -left-4 hidden rounded-2xl bg-white/90 p-4 shadow-xl backdrop-blur sm:block">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
                  <Star className="h-5 w-5 fill-white text-white" />
                </div>
                <div>
                  <div className="text-lg font-extrabold text-slate-800">4.9/5</div>
                  <div className="text-[11px] text-slate-500">từ 28.500 đánh giá</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SỐ LIỆU LIVE TỪ API ===================== */}
      <section className="border-y border-slate-100 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <h2 className="section-title text-slate-800">Hệ sinh thái TravelGo</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-500">
              Những con số được cập nhật trực tiếp từ hệ thống đặt tour của chúng tôi
            </p>
          </div>

          {home.loading ? (
            <div className="flex justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Tour nổi bật', value: liveStats.tours, icon: Star, href: '/tours?featured=true' },
                { label: 'Tour mới nhất', value: liveStats.newTours, icon: Sparkles, href: '/tours?sort=newest' },
                { label: 'Điểm đến', value: liveStats.dests, icon: MapPin, href: '/tours' },
                { label: 'Thể loại tour', value: liveStats.cats, icon: Compass, href: '/tours' },
              ].map((s) => (
                <Link
                  key={s.label}
                  to={s.href}
                  className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-5 transition hover:-translate-y-1 hover:border-indigo-200 hover:bg-white hover:shadow-lg"
                >
                  <div>
                    <div className="text-3xl font-extrabold text-slate-800">
                      {s.value}
                      <span className="ml-1 text-base font-semibold text-slate-400">+</span>
                    </div>
                    <div className="mt-1 text-sm text-slate-500">{s.label}</div>
                  </div>
                  <s.icon className="h-6 w-6 text-slate-300 transition group-hover:text-indigo-500" />
                </Link>
              ))}
            </div>
          )}

          {/* Categories từ API */}
          {categories.data && categories.data.length > 0 && (
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {categories.data.map((c) => {
                const Icon = CATEGORY_ICONS[c.name] || Compass;
                const color = CATEGORY_COLORS[c.name] || 'from-slate-500 to-slate-600';
                return (
                  <Link
                    key={c.id}
                    to={`/tours?categoryId=${c.id}`}
                    className="group flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-2 pl-2 pr-4 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
                  >
                    <span className={`grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br ${color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </span>
                    {c.name}
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ===================== GIÁ TRỊ ===================== */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700">
            <Heart className="h-3.5 w-3.5" /> Giá trị cốt lõi
          </div>
          <h2 className="section-title mt-4 text-slate-800">
            Điều làm chúng tôi <span className="gradient-text">khác biệt</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-500">
            Sáu cam kết mà chúng tôi không bao giờ thay đổi, bất kể thị trường hay công nghệ thay đổi
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((v, i) => (
            <div
              key={v.title}
              className="card card-hover group p-6 animate-fadeInUp"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-110 group-hover:rotate-3">
                <v.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-800">{v.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== TIMELINE ===================== */}
      <section className="border-y border-slate-100 bg-white py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-3.5 py-1.5 text-xs font-semibold text-pink-700">
              <Calendar className="h-3.5 w-3.5" /> Hành trình của chúng tôi
            </div>
            <h2 className="section-title mt-4 text-slate-800">Từ 2018 đến hôm nay</h2>
          </div>

          <div className="relative mt-14">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-indigo-300 via-violet-300 to-transparent md:left-1/2" />

            {TIMELINE.map((t, i) => {
              const Icon = t.icon;
              const isLeft = i % 2 === 0;
              return (
                <div
                  key={t.year}
                  className={`relative mb-10 flex gap-5 md:mb-0 md:gap-0 ${isLeft ? '' : 'md:flex-row-reverse'}`}
                >
                  {/* Dot */}
                  <div className="relative z-10 shrink-0 md:w-1/2 md:flex md:justify-center">
                    <div className="grid h-10 w-10 place-items-center rounded-full border-4 border-white bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  {/* Card */}
                  <div className={`flex-1 md:w-1/2 md:pb-12 ${isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <div className={`card p-5 ${isLeft ? 'md:text-right' : ''}`}>
                      <span className="inline-block rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1 text-xs font-bold text-white">
                        {t.year}
                      </span>
                      <h3 className="mt-3 text-base font-bold text-slate-800">{t.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{t.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== ĐỘI NGŨ ===================== */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700">
            <Users className="h-3.5 w-3.5" /> Đội ngũ
          </div>
          <h2 className="section-title mt-4 text-slate-800">Người đứng sau TravelGo</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-500">
            Một đội ngũ nhỏ nhưng đầy nhiệt huyết, luôn tin rằng công nghệ chỉ có ý nghĩa
            khi nó phục vụ con người
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((m, i) => (
            <div
              key={m.name}
              className="card card-hover group overflow-hidden text-center animate-fadeInUp"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={m.avatar}
                  alt={m.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-0 right-0 px-3">
                  <div className="text-sm font-bold text-white">{m.name}</div>
                  <div className="text-[11px] text-indigo-300">{m.role}</div>
                </div>
              </div>
              <p className="px-5 py-4 text-xs leading-relaxed text-slate-600">{m.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== TESTIMONIAL ===================== */}
      <section className="relative isolate overflow-hidden bg-slate-900 py-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-indigo-600/25 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-pink-600/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <Quote className="mx-auto h-10 w-10 text-indigo-400" />
          <p className="mt-6 text-xl font-medium leading-relaxed text-white md:text-2xl">
            “TravelGo không chỉ bán tour, họ bán sự an tâm. Từ lúc đặt đến lúc về, mọi thứ
            đều được chu đáo đến từng chi tiết nhỏ nhất. Đây là lý do chúng tôi quay lại
            lần thứ ba.”
          </p>
          <div className="mt-7 flex items-center justify-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=80"
              alt="Nguyễn Thị Mai"
              className="h-12 w-12 rounded-full object-cover ring-2 ring-indigo-400"
            />
            <div className="text-left">
              <div className="text-sm font-bold text-white">Nguyễn Thị Mai</div>
              <div className="text-xs text-slate-400">Khách hàng thân thiết · 3 chuyến</div>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
        </div>
      </section>

      {/* ===================== LIÊN HỆ ===================== */}
      <section id="contact" className="mx-auto max-w-7xl px-4 py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3.5 py-1.5 text-xs font-semibold text-violet-700">
              <MessageSquare className="h-3.5 w-3.5" /> Liên hệ
            </div>
            <h2 className="section-title mt-4 text-slate-800">Chúng tôi luôn sẵn sàng</h2>
            <p className="mt-4 text-slate-600">
              Bất kỳ câu hỏi nào về tour, lịch trình hay chính sách đặt tour, đội ngũ
              TravelGo sẽ phản hồi trong vòng 24 giờ làm việc.
            </p>

            <div className="mt-8 space-y-3">
              {CONTACT_CHANNELS.map((c) => (
                <a
                  key={c.title}
                  href={c.href}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
                    <c.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{c.title}</div>
                    <div className="truncate text-sm font-semibold text-slate-800">{c.value}</div>
                    <div className="text-xs text-slate-500">{c.desc}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-500" />
                </a>
              ))}
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
              <div>
                <div className="text-sm font-semibold text-slate-800">Văn phòng chính</div>
                <div className="mt-0.5 text-sm text-slate-600">
                  Tầng 8, Tòa nhà ABC, 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="card relative overflow-hidden p-7">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-2xl" />
            </div>
            <div className="relative">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
                <Send className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-800">Nhận ưu đãi du lịch</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Đăng ký để nhận tour mới, ưu đãi độc quyền và mẹo du lịch hữu ích
                mỗi tuần — hoàn toàn miễn phí.
              </p>

              <form onSubmit={onSubscribe} className="mt-6">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="input"
                />
                <button type="submit" className="btn-primary mt-3 w-full">
                  <Send className="h-4 w-4" /> Đăng ký nhận ưu đãi
                </button>
              </form>

              {subscribed && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 animate-fadeIn">
                  <CheckCircle2 className="h-4 w-4" /> Đăng ký thành công! Cảm ơn bạn.
                </div>
              )}

              <div className="mt-6 space-y-2 border-t border-slate-100 pt-5">
                {[
                  'Tour mới được công bố hàng tuần',
                  'Ưu đãi độc quyền dành cho thành viên',
                  'Hướng dẫn viên chia sẻ kinh nghiệm thực tế',
                ].map((t) => (
                  <div key={t} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-6 py-14 text-center">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-16 top-0 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-pink-400/20 blur-3xl" />
          </div>
          <div className="relative">
            <h2 className="text-3xl font-extrabold text-white md:text-4xl">
              Sẵn sàng cho chuyến đi tiếp theo?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-indigo-100">
              Hàng trăm điểm đến trên khắp Việt Nam đang chờ bạn khám phá.
              Đặt tour chỉ mất vài phút.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/tours" className="btn bg-white !px-6 !py-3 text-indigo-700 hover:shadow-xl">
                <Compass className="h-4 w-4" /> Xem tất cả tour
              </Link>
              <Link to="/auth/register" className="btn-glass !px-6 !py-3">
                Tạo tài khoản miễn phí
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
