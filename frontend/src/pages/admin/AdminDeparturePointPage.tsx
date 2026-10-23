import { useState } from 'react';
import { departurePointApi } from '@/api/departurePoint.api';
import { useAsync } from '@/hooks/useAsync';
import { DeparturePointRequest, DeparturePointResponse } from '@/types';
import { Spinner, EmptyState, StatusBadge } from '@/components/ui/Feedback';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDeparturePointPage = () => {
  const [keyword, setKeyword] = useState('');
  const [editing, setEditing] = useState<DeparturePointResponse | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<DeparturePointRequest>({ name: '', city: '' });
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const items = useAsync(() => departurePointApi.adminSearch(keyword, 0, 50), [keyword]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) await departurePointApi.update(editing.id, form);
      else await departurePointApi.create(form);
      setShowModal(false);
      setEditing(null);
      setForm({ name: '', city: '' });
      items.refetch();
      toast.success(editing ? 'Đã cập nhật' : 'Đã tạo');
    } catch { /* handled */ }
  };

  const onDelete = async () => {
    if (deletingId === null) return;
    const id = deletingId;
    setDeletingId(null);
    try { await departurePointApi.remove(id); items.refetch(); toast.success('Đã xóa'); } catch { /* handled */ }
  };

  const openAdd = () => { setEditing(null); setForm({ name: '', city: '' }); setShowModal(true); };
  const openEdit = (d: DeparturePointResponse) => { setEditing(d); setForm({ name: d.name, city: d.city, address: d.address, status: d.status }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm({ name: '', city: '' }); };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Quản lý điểm khởi hành</h1>
      <div className="mb-4 flex items-center gap-3">
        <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm..." className="input flex-1" />
        <button onClick={openAdd} className="btn-primary"><Plus className="h-4 w-4" />Thêm</button>
      </div>
      {items.loading ? <Spinner /> : items.data && items.data.content.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-3">Tên</th><th className="px-4 py-3">Thành phố</th><th className="px-4 py-3">Địa chỉ</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3 text-right">Hành động</th></tr>
            </thead>
            <tbody className="divide-y">
              {items.data.content.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{d.name}</td>
                  <td className="px-4 py-3 text-xs">{d.city}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{d.address || '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(d)} className="rounded p-1 text-blue-600 hover:bg-blue-50"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => setDeletingId(d.id)} className="ml-1 rounded p-1 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState title="Chưa có điểm khởi hành" />}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold">{editing ? 'Cập nhật' : 'Thêm'} điểm khởi hành</h3>
              <button onClick={closeModal}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={onSave} className="space-y-3">
              <div><label className="text-xs">Tên điểm khởi hành</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="vd: Sân bay Tân Sơn Nhất" /></div>
              <div><label className="text-xs">Thành phố</label><input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input" placeholder="vd: TP. Hồ Chí Minh" /></div>
              <div><label className="text-xs">Địa chỉ chi tiết</label><input value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" /></div>
              <div className="flex justify-end gap-2"><button type="button" onClick={closeModal} className="btn-secondary">Hủy</button><button className="btn-primary"><Save className="h-4 w-4" />Lưu</button></div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        open={deletingId !== null}
        title="Xóa điểm khởi hành?"
        description="Hành động này không thể hoàn tác."
        confirmText="Xóa"
        onConfirm={onDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};

export default AdminDeparturePointPage;
