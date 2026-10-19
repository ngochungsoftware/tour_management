import { useState } from 'react';
import { adminApi } from '@/api/admin.api';
import { useAsync } from '@/hooks/useAsync';
import { PageResponse, UserResponse } from '@/types';
import { Spinner, EmptyState } from '@/components/ui/Feedback';
import { Lock, Unlock, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUserPage = () => {
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const users = useAsync<PageResponse<UserResponse>>(() => adminApi.users(keyword, page), [keyword, page]);

  const toggleLock = async (u: UserResponse) => {
    try {
      if (u.roles.includes('LOCKED') || (u as { status?: string }).status === 'LOCKED') {
        await adminApi.unlockUser(u.id);
        toast.success(`Đã mở khóa ${u.fullName}`);
      } else {
        await adminApi.lockUser(u.id);
        toast.success(`Đã khóa ${u.fullName}`);
      }
      users.refetch();
    } catch { /* handled */ }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Quản lý khách hàng</h1>
      <div className="card mb-4 flex gap-2 p-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(0); }} placeholder="Tìm theo tên hoặc email..." className="input pl-9" />
        </div>
      </div>
      {users.loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : users.data && users.data.content.length > 0 ? (
        <>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Họ tên</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">SĐT</th>
                  <th className="px-4 py-3">Vai trò</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.data.content.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">{u.id}</td>
                    <td className="px-4 py-3 font-medium">{u.fullName}</td>
                    <td className="px-4 py-3 text-xs">{u.email}</td>
                    <td className="px-4 py-3 text-xs">{u.phone || '—'}</td>
                    <td className="px-4 py-3">
                      {u.roles.map((r) => <span key={r} className="badge-blue mr-1">{r}</span>)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => toggleLock(u)} className="rounded p-1 text-slate-600 hover:bg-slate-100">
                        {u.roles.includes('LOCKED') ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button disabled={users.data.page === 0} onClick={() => setPage((p) => p - 1)} className="btn-secondary">← Trước</button>
              <span className="text-sm text-slate-500">{users.data.page + 1} / {users.data.totalPages}</span>
              <button disabled={users.data.last} onClick={() => setPage((p) => p + 1)} className="btn-secondary">Sau →</button>
            </div>
          )}
        </>
      ) : <EmptyState title="Chưa có khách hàng" />}
    </div>
  );
};

export default AdminUserPage;
