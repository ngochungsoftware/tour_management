import { Link } from 'react-router-dom';
import {
  Mail, Phone, MapPin, Facebook, Instagram, Youtube, Send,
  Sparkles, Shield, Award, Headphones, CreditCard, ArrowUpRight,
} from 'lucide-react';
import { useState } from 'react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => { setSubscribed(false); setEmail(''); }, 3000);
    }
  };

  return (
    <footer className="relative mt-20 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-pink-600/20 blur-3xl" />
      </div>

      {/* Trust bar */}
      <div className="relative border-b border-white/10">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          <TrustItem icon={Shield} title="Thanh toán bảo mật" desc="Mã hóa SSL 256-bit" />
          <TrustItem icon={Award} title="Thương hiệu uy tín" desc="Top 10 ĐNA 2024" />
          <TrustItem icon={Headphones} title="Hỗ trợ 24/7" desc="Phản hồi dưới 5 phút" />
          <TrustItem icon={CreditCard} title="Hoàn tiền 100%" desc="Nếu giá cao hơn" />
        </div>
      </div>

      {/* Main footer */}
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-12">
        {/* Brand */}
        <div className="md:col-span-4">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-white">
              Travel<span className="text-indigo-400">Go</span>
            </span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Hệ thống đặt tour du lịch trực tuyến hàng đầu Việt Nam. Hơn 1.000+ tour
            trong nước và quốc tế với giá tốt nhất thị trường.
          </p>

          {/* Newsletter */}
          <form onSubmit={onSubscribe} className="mt-5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Nhận ưu đãi mới nhất
            </label>
            <div className="mt-2 flex overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                required
              />
              <button
                type="submit"
                className="grid place-items-center bg-gradient-to-r from-indigo-500 to-violet-500 px-4 text-white transition hover:from-indigo-400 hover:to-violet-400"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            {subscribed && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 animate-fadeIn">
                <Sparkles className="h-3 w-3" /> Đăng ký thành công! Cảm ơn bạn.
              </div>
            )}
          </form>

          {/* Socials */}
          <div className="mt-5 flex items-center gap-2">
            <SocialBtn icon={Facebook} label="Facebook" />
            <SocialBtn icon={Instagram} label="Instagram" />
            <SocialBtn icon={Youtube} label="YouTube" />
          </div>
        </div>

        {/* Links columns */}
        <div className="md:col-span-2">
          <h4 className="text-sm font-bold text-white">Khám phá</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <FooterLink to="/tours">Tất cả tour</FooterLink>
            <FooterLink to="/tours?featured=true">Tour nổi bật</FooterLink>
            <FooterLink to="/tours?discount=true">Tour giảm giá</FooterLink>
            <FooterLink to="/tours?sort=newest">Tour mới nhất</FooterLink>
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-sm font-bold text-white">Hỗ trợ</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/about" className="group inline-flex items-center gap-1 transition hover:text-white">
                Về chúng tôi
                <ArrowUpRight className="h-3 w-3 -translate-y-0.5 opacity-0 transition group-hover:opacity-100" />
              </Link>
            </li>
            <li className="hover:text-white cursor-pointer">Liên hệ</li>
            <li className="hover:text-white cursor-pointer">Điều khoản sử dụng</li>
            <li className="hover:text-white cursor-pointer">Chính sách bảo mật</li>
            <li className="hover:text-white cursor-pointer">Câu hỏi thường gặp</li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <h4 className="text-sm font-bold text-white">Liên hệ</h4>
          <ul className="mt-3 space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
              <span>Tầng 8, Tòa nhà ABC, 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-indigo-400" />
              <a href="tel:19006868" className="hover:text-white">1900 6868</a>
              <span className="text-slate-500">·</span>
              <a href="tel:+84901234567" className="hover:text-white">+84 901 234 567</a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-indigo-400" />
              <a href="mailto:support@travelgo.vn" className="hover:text-white">support@travelgo.vn</a>
            </li>
          </ul>

          {/* Payment methods */}
          <div className="mt-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Chấp nhận thanh toán
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {['VISA', 'MC', 'JCB', 'MOMO', 'VNPay', 'QR'].map((p) => (
                <span
                  key={p}
                  className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-300"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-slate-500 md:flex-row">
          <div>© 2026 TravelGo. Đồ án môn học UTC — All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link to="/about" className="transition hover:text-slate-300">Về chúng tôi</Link>
            <span className="hover:text-slate-300 cursor-pointer">Điều khoản</span>
            <span className="hover:text-slate-300 cursor-pointer">Bảo mật</span>
            <span className="hover:text-slate-300 cursor-pointer">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const TrustItem = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <div className="flex items-center gap-3">
    <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
      <Icon className="h-5 w-5 text-indigo-400" />
    </div>
    <div>
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="text-xs text-slate-400">{desc}</div>
    </div>
  </div>
);

const SocialBtn = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <a
    href="#"
    aria-label={label}
    className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition hover:border-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300"
  >
    <Icon className="h-4 w-4" />
  </a>
);

const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <li>
    <Link
      to={to}
      className="group inline-flex items-center gap-1 transition hover:text-white"
    >
      {children}
      <ArrowUpRight className="h-3 w-3 -translate-y-0.5 opacity-0 transition group-hover:opacity-100" />
    </Link>
  </li>
);

export default Footer;
