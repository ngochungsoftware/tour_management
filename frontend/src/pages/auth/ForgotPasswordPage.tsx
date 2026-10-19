import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await authApi.forgotPassword({ email });
      setToken(data.resetToken);
      toast.success('Đã tạo token đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-800">Quên mật khẩu</h1>
      <p className="mt-1 text-sm text-slate-500">Nhập email để nhận token đặt lại mật khẩu (demo đồ án).</p>
      <form onSubmit={onSubmit} className="card mt-6 space-y-4 p-6">
        <div>
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input mt-1"
          />
        </div>
        <button disabled={loading} className="btn-primary w-full">
          {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
        </button>
        {token && (
          <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
            <p className="font-semibold">Token (copy để test):</p>
            <code className="break-all text-xs">{token}</code>
          </div>
        )}
        <p className="text-center text-sm text-slate-500">
          <Link to="/auth/login" className="text-brand-600 hover:underline">Quay lại đăng nhập</Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
