import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LogOut, User as UserIcon, Settings, Heart, LayoutDashboard,
  Ticket, MapPin, HelpCircle, Menu, X, Sparkles, ChevronDown, Search, Globe,
} from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/tours', label: 'Tour', match: '/tours' },
  { to: '/tours?featured=true', label: 'Nổi bật', match: '/tours?featured=true' },
  { to: '/qa/search', label: 'Hỏi đáp', match: '/qa/search' },
];

const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setOpen(false); }, [location.pathname]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:py-4">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-2.5 shrink-0">
            <div className="relative">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-110 group-hover:rotate-3">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                Travel<span className="text-indigo-600">Go</span>
              </span>
              <span className="text-[10px] font-medium text-slate-400">Khám phá không giới hạn</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} match={l.match}>{l.label}</NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search icon */}
            <Link
              to="/tours"
              className="hidden h-10 w-10 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600 sm:grid"
              aria-label="Tìm tour"
            >
              <Search className="h-4 w-4" />
            </Link>

            {isAuthenticated ? (
              <UserMenu
                user={user}
                isAdmin={isAdmin}
                open={open}
                onToggle={() => setOpen((o) => !o)}
                onClose={() => setOpen(false)}
                onLogout={logout}
              />
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link to="/auth/login" className="nav-pill">Đăng nhập</Link>
                <Link to="/auth/register" className="btn-primary !px-4 !py-2 !text-sm">
                  <Sparkles className="h-4 w-4" /> Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              className="grid h-10 w-10 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100 md:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-x-0 top-[60px] z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl md:hidden animate-fadeIn">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  {l.label}
                </Link>
              ))}
              <div className="my-2 h-px bg-slate-200" />
              {!isAuthenticated ? (
                <div className="flex flex-col gap-2">
                  <Link to="/auth/login" className="btn-secondary w-full">Đăng nhập</Link>
                  <Link to="/auth/register" className="btn-primary w-full">Đăng ký</Link>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <Link to="/profile" className="rounded-xl px-4 py-3 text-sm text-slate-700 hover:bg-slate-50">Hồ sơ</Link>
                  <Link to="/bookings/my" className="rounded-xl px-4 py-3 text-sm text-slate-700 hover:bg-slate-50">Booking của tôi</Link>
                  <Link to="/favorites" className="rounded-xl px-4 py-3 text-sm text-slate-700 hover:bg-slate-50">Yêu thích</Link>
                  {isAdmin && <Link to="/admin" className="rounded-xl px-4 py-3 text-sm text-slate-700 hover:bg-slate-50">Quản trị</Link>}
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

const NavLink = ({ to, children, end, match }: { to: string; children: ReactNode; end?: boolean; match?: string }) => {
  const location = useLocation();
  const [base] = to.split('?');
  // Nếu có prop `match` thì so khớp cả search params
  let active: boolean;
  if (match) {
    const [mBase, mQuery = ''] = match.split('?');
    const lBase = location.pathname;
    const lQuery = location.search.replace(/^\?/, '');
    if (mBase !== lBase) {
      active = false;
    } else {
      // So khớp các param key=value trong match với URL hiện tại
      const mParams = new URLSearchParams(mQuery);
      const lParams = new URLSearchParams(lQuery);
      let allMatch = true;
      mParams.forEach((v, k) => {
        if (lParams.get(k) !== v) allMatch = false;
      });
      active = allMatch;
    }
  } else if (end) {
    active = location.pathname === base;
  } else {
    active = location.pathname === base || (base !== '/' && location.pathname.startsWith(base + '/'));
  }
  return (
    <Link
      to={to}
      className={`relative px-4 py-2 text-sm font-medium transition-colors ${
        active ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'
      }`}
    >
      {children}
      {active && (
        <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600" />
      )}
    </Link>
  );
};

const UserMenu = ({
  user, isAdmin, open, onToggle, onClose, onLogout,
}: {
  user: any; isAdmin: boolean; open: boolean; onToggle: () => void; onClose: () => void;
  onLogout: () => void;
}) => (
  <div className="relative">
    <button
      onClick={onToggle}
      className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 py-1 pl-1 pr-3 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:shadow-md"
    >
      <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white shadow">
        {user?.fullName?.[0]?.toUpperCase() ?? 'U'}
      </span>
      <span className="hidden sm:inline max-w-[120px] truncate">{user?.fullName}</span>
      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    {open && (
      <>
        <div className="fixed inset-0 z-40" onClick={onClose} />
        <div className="absolute right-0 z-50 mt-2 w-64 origin-top-right animate-fadeIn">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-4 text-white">
              <div className="text-sm font-semibold">{user?.fullName}</div>
              <div className="text-xs text-white/80 truncate">{user?.email}</div>
            </div>
            <div className="p-1.5">
              <MenuLink to="/profile" icon={<UserIcon className="h-4 w-4" />}>Hồ sơ cá nhân</MenuLink>
              <MenuLink to="/bookings/my" icon={<Ticket className="h-4 w-4" />}>Booking của tôi</MenuLink>
              <MenuLink to="/favorites" icon={<Heart className="h-4 w-4" />}>Tour yêu thích</MenuLink>
              <MenuLink to="/qa/my" icon={<HelpCircle className="h-4 w-4" />}>Câu hỏi của tôi</MenuLink>
              {isAdmin && (
                <>
                  <div className="my-1 h-px bg-slate-100" />
                  <MenuLink to="/admin" icon={<LayoutDashboard className="h-4 w-4" />} highlight>Quản trị hệ thống</MenuLink>
                </>
              )}
              <div className="my-1 h-px bg-slate-100" />
              <button
                onClick={() => { onLogout(); window.location.href = '/'; }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" /> Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </>
    )}
  </div>
);

const MenuLink = ({ to, icon, children, highlight }: { to: string; icon: ReactNode; children: ReactNode; highlight?: boolean }) => (
  <Link
    to={to}
    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition ${
      highlight
        ? 'font-semibold text-indigo-600 hover:bg-indigo-50'
        : 'text-slate-700 hover:bg-slate-50'
    }`}
  >
    {icon}
    {children}
  </Link>
);

export default Header;
