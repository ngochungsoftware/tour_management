import { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';
import { Lock, Mail, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * AdminLoginPage - Trang đăng nhập RIÊNG cho admin
 * - Style khác client (dark, formal)
 * - Tự verify role admin
 * - KHÔNG liên quan đến AuthContext của client
 */
const AdminLoginPage = () => {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('admin@travelgo.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Đăng nhập admin thành công');
      const from = (location.state as { from?: string } | null)?.from ?? '/admin-portal';
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Đăng nhập thất bại';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Left: branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-brand-700 via-slate-800 to-slate-900 p-12 text-white lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400">
              <ShieldCheck className="h-5 w-5 text-slate-900" />
            </div>
            <div>
              <div className="text-lg font-bold">TravelGo Admin</div>
              <div className="text-xs text-slate-400">Admin Control Panel</div>
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-tight">
            Trang quản trị
            <br />
            <span className="text-amber-300">TravelGo</span>
          </h1>
          <p className="mt-3 max-w-md text-slate-300">
            Hệ thống quản lý tour, đơn hàng, khách hàng và toàn bộ nội dung trang.
            Vui lòng đăng nhập bằng tài khoản admin.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="font-bold">10+</div>
              <div className="text-xs text-slate-400">Tours</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="font-bold">9</div>
              <div className="text-xs text-slate-400">Điểm đến</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="font-bold">5</div>
              <div className="text-xs text-slate-400">Danh mục</div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500">© 2026 TravelGo. Admin panel v1.0</div>
      </div>

      {/* Right: login form */}
      <div className="flex w-full flex-col p-6 lg:w-1/2 lg:p-12">
        <a
          href="/"
          className="inline-flex items-center gap-2 self-start text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Về trang khách hàng
        </a>

        <div className="m-auto w-full max-w-md">
          <div className="lg:hidden">
            <div className="mb-6 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-amber-400" />
              <span className="text-lg font-bold text-white">TravelGo Admin</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white">Đăng nhập quản trị</h2>
          <p className="mt-2 text-sm text-slate-400">
            Chỉ tài khoản có quyền <span className="font-semibold text-amber-300">ADMIN</span> mới truy cập được.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 focus-within:border-amber-400">
                <Mail className="h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent py-3 text-sm text-white outline-none"
                  placeholder="admin@travelgo.com"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Mật khẩu</label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 focus-within:border-amber-400">
                <Lock className="h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent py-3 text-sm text-white outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 py-3 text-sm font-bold text-slate-900 transition hover:bg-amber-300 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập Admin'}
            </button>
          </form>

          <div className="mt-6 rounded-lg border border-slate-700 bg-slate-800/50 p-3 text-xs text-slate-400">
            <div className="font-semibold text-slate-300">Tài khoản demo:</div>
            <div className="mt-1">Email: <code className="text-amber-300">admin@travelgo.com</code></div>
            <div>Mật khẩu: <code className="text-amber-300">Admin@123</code></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
