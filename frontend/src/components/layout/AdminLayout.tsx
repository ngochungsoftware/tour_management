import { ReactNode } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/admin/AdminAuthContext';
import {
  LayoutDashboard,
  Map,
  CalendarRange,
  Tag,
  MessageSquare,
  Users,
  MapPin,
  FolderTree,
  LogOut,
  HelpCircle,
  Bell,
  Search,
  UserCog,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  Hash,
  Camera,
  PlaneTakeoff,
  Bus,
  Image as ImageIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const SIDEBAR_COLLAPSED_KEY = 'travelgo_admin_sidebar_collapsed';
const SIDEBAR_WIDTH_EXPANDED = 256; // 16rem
const SIDEBAR_WIDTH_COLLAPSED = 72; // 4.5rem

/**
 * AdminShell - Layout hoàn toàn độc lập với client
 * - Sidebar có thể đóng/mở (collapsible)
 * - Trạng thái được lưu vào localStorage
 * - Responsive: mobile dùng overlay, desktop dùng animation mượt
 * - Topbar với user menu
 * - KHÔNG dùng Header/Footer public
 */
const AdminShell = ({ children }: { children?: ReactNode }) => {
  const { user, isAuthenticated, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Collapsed state - lưu vào localStorage để nhớ preference
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  });

  // Mobile drawer state
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
  }, [collapsed]);

  // Đóng mobile drawer khi route thay đổi
  useEffect(() => {
    const handleRouteChange = () => setMobileOpen(false);
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  // Đóng user menu khi click bên ngoài
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClick = () => setUserMenuOpen(false);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [userMenuOpen]);

  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.replace('/admin-portal/login');
    }
    return null;
  }

  // Nhân viên chỉ xem/duyệt vận hành, không quản lý danh mục hệ thống & tài khoản.
  const isAdmin = !!user?.roles?.includes('ADMIN');
  const links = [
    { to: '/admin-portal', label: 'Tổng quan', icon: LayoutDashboard, end: true },
    { to: '/admin-portal/tours', label: 'Quản lý Tour', icon: Map },
    { to: '/admin-portal/bookings', label: 'Đơn đặt tour', icon: CalendarRange },
    ...(isAdmin
      ? [
          { to: '/admin-portal/users', label: 'Khách hàng', icon: Users },
          { to: '/admin-portal/staff', label: 'Nhân viên', icon: UserCog },
          { to: '/admin-portal/categories', label: 'Danh mục', icon: FolderTree },
          { to: '/admin-portal/destinations', label: 'Điểm đến', icon: MapPin },
          { to: '/admin-portal/attractions', label: 'Điểm tham quan', icon: Camera },
          { to: '/admin-portal/tour-tags', label: 'Nhãn tour', icon: Hash },
          { to: '/admin-portal/departure-points', label: 'Điểm khởi hành', icon: PlaneTakeoff },
          { to: '/admin-portal/transport-modes', label: 'Phương tiện', icon: Bus },
          { to: '/admin-portal/airlines', label: 'Hãng bay', icon: PlaneTakeoff },
          { to: '/admin-portal/coupons', label: 'Mã giảm giá', icon: Tag },
          { to: '/admin-portal/banners', label: 'Banner quảng cáo', icon: ImageIcon },
        ]
      : []),
    { to: '/admin-portal/reviews', label: 'Đánh giá', icon: MessageSquare },
    { to: '/admin-portal/tour-qa', label: 'Hỏi đáp', icon: HelpCircle },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/auth/login';
  };

  const sidebarWidth = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-200
          transition-[width,transform] duration-300 ease-in-out
          lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ width: sidebarWidth }}
      >
        {/* Header của sidebar */}
        <div
          className={`flex h-16 shrink-0 items-center border-b border-slate-800 ${
            collapsed ? 'justify-center px-2' : 'gap-2 px-5'
          }`}
        >
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-600">
            <Map className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="truncate text-sm font-bold text-white">TravelGo</div>
              <div className="truncate text-[10px] uppercase tracking-wider text-slate-400">
                Admin Panel
              </div>
            </div>
          )}
          {/* Close button trên mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Đóng menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {!collapsed && (
            <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Quản lý
            </div>
          )}
          <div className="flex flex-col gap-1">
            {links.map((l) => {
              const Icon = l.icon;
              return (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  title={collapsed ? l.label : undefined}
                  className={({ isActive }) =>
                    `group relative flex items-center rounded-lg py-2 text-sm font-medium transition ${
                      collapsed ? 'justify-center px-2' : 'gap-3 px-3'
                    } ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-lg'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{l.label}</span>}
                  {/* Tooltip khi collapsed */}
                  {collapsed && (
                    <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                      {l.label}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Footer của sidebar */}
        <div className="shrink-0 border-t border-slate-800 p-3">
          <Link
            to="/"
            title={collapsed ? 'Về trang khách hàng' : undefined}
            className={`flex items-center rounded-lg py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-white ${
              collapsed ? 'justify-center px-2' : 'gap-2 px-3'
            }`}
          >
            <span className="shrink-0">←</span>
            {!collapsed && <span>Về trang khách hàng</span>}
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 shadow-sm lg:px-6">
          <div className="flex flex-1 items-center gap-2">
            {/* Mobile: open drawer button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
              aria-label="Mở menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Desktop: toggle collapse button */}
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="hidden h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 lg:grid"
              aria-label={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
              title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </button>

            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Tìm kiếm nhanh..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <button
              className="relative grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label="Thông báo"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
            </button>

            <div
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100"
              >
                <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {user?.fullName?.[0]?.toUpperCase() ?? 'A'}
                </div>
                <div className="hidden text-left md:block">
                  <div className="text-sm font-semibold text-slate-800">
                    {user?.fullName ?? 'Admin'}
                  </div>
                  <div className="text-[10px] uppercase text-amber-600">
                    {isAdmin ? 'Administrator' : 'Nhân viên'}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                  <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="text-sm font-semibold">{user?.fullName}</div>
                    <div className="text-xs text-slate-500">{user?.email}</div>
                  </div>
<Link
                    to="/"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Map className="h-4 w-4" /> Xem trang khách
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin-portal/users"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <UserCog className="h-4 w-4" /> Tài khoản
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-slate-50">
          <div className="mx-auto max-w-7xl p-4 lg:p-6">{children ?? <Outlet />}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
