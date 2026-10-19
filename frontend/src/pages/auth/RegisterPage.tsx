import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '', gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER' });
  const [loading, setLoading] = useState(false);

  const onChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await register(form);
      toast.success('Đăng ký thành công');
      navigate('/');
    } catch {
      /* handled */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800">Tạo tài khoản</h1>
        <p className="mt-1 text-sm text-slate-500">Đăng ký để đặt tour và nhận ưu đãi</p>
      </div>
      <form onSubmit={onSubmit} className="card space-y-4 p-6">
        <div>
          <label className="text-sm font-medium text-slate-700">Họ và tên</label>
          <input required value={form.fullName} onChange={onChange('fullName')} className="input mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input type="email" required value={form.email} onChange={onChange('email')} className="input mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
          <input value={form.phone} onChange={onChange('phone')} className="input mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-700">Giới tính</label>
            <select value={form.gender} onChange={onChange('gender')} className="input mt-1">
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={onChange('password')}
              className="input mt-1"
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
        </button>
        <p className="text-center text-sm text-slate-500">
          Đã có tài khoản?{' '}
          <Link to="/auth/login" className="text-brand-600 hover:underline">Đăng nhập</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
