import { FormEvent, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/auth.api';
import { formatDate } from '@/utils/format';
import { toast } from 'react-hot-toast';
import { Camera, Save } from 'lucide-react';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: user?.address || '',
    dateOfBirth: '',
    gender: (user as { gender?: string })?.gender || 'MALE',
  });
  const [loading, setLoading] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '' });
  const fileRef = useRef<HTMLInputElement>(null);

  const onChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updated = await authApi.updateProfile({
        ...form,
        gender: form.gender as 'MALE' | 'FEMALE' | 'OTHER',
      });
      setUser(updated);
      toast.success('Cập nhật thông tin thành công');
    } catch { /* handled */ }
    finally { setLoading(false); }
  };

  const changePwd = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await authApi.changePassword(pwdForm as any);
      toast.success('Đổi mật khẩu thành công');
      setPwdForm({ currentPassword: '', newPassword: '' });
    } catch { /* handled */ }
  };

  const uploadAvatar = async (file: File) => {
    try {
      const user = await authApi.uploadAvatar(file);
      setUser(user);
      toast.success('Cập nhật avatar thành công');
    } catch { /* handled */ }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Hồ sơ cá nhân</h1>

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
              {user?.avatar ? (
                <img src={user.avatar} className="h-full w-full rounded-full object-cover" />
              ) : (
                (user?.fullName?.[0] || 'U').toUpperCase()
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white shadow hover:bg-brand-700"
            >
              <Camera className="h-3 w-3" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadAvatar(file);
            }} />
          </div>
          <div>
            <div className="font-semibold text-slate-800">{user?.fullName}</div>
            <div className="text-sm text-slate-500">{user?.email}</div>
          </div>
        </div>

        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Họ và tên</label>
            <input value={form.fullName} onChange={onChange('fullName')} className="input mt-1" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Điện thoại</label>
              <input value={form.phone} onChange={onChange('phone')} className="input mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Giới tính</label>
              <select value={form.gender} onChange={onChange('gender')} className="input mt-1">
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Địa chỉ</label>
            <input value={form.address} onChange={onChange('address')} className="input mt-1" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            <Save className="h-4 w-4" /> {loading ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        </form>
      </div>

      <div className="card mt-6 p-6">
        <h2 className="mb-4 font-semibold text-slate-700">Đổi mật khẩu</h2>
        <form onSubmit={changePwd} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Mật khẩu hiện tại</label>
            <input type="password" value={pwdForm.currentPassword} onChange={(e) => setPwdForm((f) => ({ ...f, currentPassword: e.target.value }))} className="input mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Mật khẩu mới</label>
            <input type="password" value={pwdForm.newPassword} onChange={(e) => setPwdForm((f) => ({ ...f, newPassword: e.target.value }))} className="input mt-1" />
          </div>
          <button type="submit" className="btn-secondary">Đổi mật khẩu</button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
