import { useState } from 'react';
import { transportModeApi } from '@/api/transportMode.api';
import { useAsync } from '@/hooks/useAsync';
import { TransportModeRequest, TransportModeResponse } from '@/types';
import { Spinner, EmptyState, StatusBadge } from '@/components/ui/Feedback';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminTransportModePage = () => {
  const [keyword, setKeyword] = useState('');
  const [editing, setEditing] = useState<TransportModeResponse | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<TransportModeRequest>({ name: '' });
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const items = useAsync(() => transportModeApi.adminSearch(keyword, 0, 50), [keyword]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) await transportModeApi.update(editing.id, form);
      else await transportModeApi.create(form);
      setShowModal(false);
      setEditing(null);
      setForm({ name: '' });
      items.refetch();
      toast.success(editing ? 'Đã cập nhật' : 'Đã tạo');
    } catch { /* handled */ }
  };

  const onDelete = async () => {
    if (deletingId === null) return;
    const id = deletingId;
    setDeletingId(null);
    try { await transportModeApi.remove(id); items.refetch(); toast.success('Đã xóa'); } catch { /* handled */ }
  };

  const openAdd = () => { setEditing(null); setForm({ name: '' }); setShowModal(true); };
  const openEdit = (t: TransportModeResponse) => { setEditing(t); setForm({ name: t.name, description: t.description, icon: t.icon, status: t.status }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm({ name: '' }); };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Quản lý phương tiện</h1>
      <div className="mb-4 flex items-center gap-3">
        <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm phương tiện..." className="input flex-1" />
        <button onClick={openAdd} className="btn-primary"><Plus className="h-4 w-4" />Thêm</button>
      </div>
      {items.loading ? <Spinner /> : items.data && items.data.content.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-3">Tên</th><th className="px-4 py-3">Mô tả</th><th className="px-4 py-3">Icon</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3 text-right">Hành động</th></tr>
            </thead>
            <tbody className="divide-y">
              {items.data.content.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{t.description || '-'}</td>
                  <td className="px-4 py-3 text-xs">{t.icon || '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(t)} className="rounded p-1 text-blue-600 hover:bg-blue-50"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => setDeletingId(t.id)} className="ml-1 rounded p-1 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState title="Chưa có phương tiện" />}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold">{editing ? 'Cập nhật' : 'Thêm'} phương tiện</h3>
              <button onClick={closeModal}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={onSave} className="space-y-3">
              <div><label className="text-xs">Tên phương tiện</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="vd: Máy bay, Xe khách, Tàu hỏa" /></div>
              <div><label className="text-xs">Mô tả</label><input value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" /></div>
              <div><label className="text-xs">Icon (Lucide name)</label><input value={form.icon || ''} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="input" placeholder="vd: Plane, Bus, Train" /></div>
              <div className="flex justify-end gap-2"><button type="button" onClick={closeModal} className="btn-secondary">Hủy</button><button className="btn-primary"><Save className="h-4 w-4" />Lưu</button></div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        open={deletingId !== null}
        title="Xóa phương tiện?"
        description="Hành động này không thể hoàn tác."
        confirmText="Xóa"
        onConfirm={onDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};

export default AdminTransportModePage;
