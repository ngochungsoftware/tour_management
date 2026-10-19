import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login({ email, password });
      toast.success('Đăng nhập thành công');
      navigate('/');
    } catch {
      /* toast đã hiển thị qua interceptor */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800">Đăng nhập</h1>
        <p className="mt-1 text-sm text-slate-500">Chào mừng bạn quay lại với TravelGo</p>
      </div>
      <form onSubmit={onSubmit} className="card space-y-4 p-6">
        <div>
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input mt-1"
            placeholder="you@email.com"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
          <div className="relative mt-1">
            <input
              type={showPwd ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          <LogIn className="h-4 w-4" /> {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
        <div className="flex items-center justify-between text-sm">
          <Link to="/auth/forgot" className="text-brand-600 hover:underline">Quên mật khẩu?</Link>
          <Link to="/auth/register" className="text-brand-600 hover:underline">Tạo tài khoản</Link>
        </div>
      </form>
      <div className="card bg-slate-50 p-4 text-xs text-slate-500">
        <p className="font-semibold text-slate-700">Tài khoản demo:</p>
        <p>Admin: <code>admin@travelgo.com / Admin@123</code></p>
        <p>Customer: <code>customer@travelgo.com / Customer@123</code></p>
      </div>
    </div>
  );
};

export default LoginPage;
