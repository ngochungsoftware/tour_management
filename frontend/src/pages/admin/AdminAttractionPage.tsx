import { useState } from 'react';
import { attractionApi } from '@/api/attraction.api';
import { destinationApi } from '@/api/catalog.api';
import { useAsync } from '@/hooks/useAsync';
import { AttractionRequest, AttractionResponse } from '@/types';
import { Spinner, EmptyState, StatusBadge } from '@/components/ui/Feedback';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminAttractionPage = () => {
  const [keyword, setKeyword] = useState('');
  const [editing, setEditing] = useState<AttractionResponse | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<AttractionRequest>({ name: '', destinationId: 0 });
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const attractions = useAsync(() => attractionApi.adminSearch(keyword, undefined, 0, 50), [keyword]);
  const destinations = useAsync(() => destinationApi.list());

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) await attractionApi.update(editing.id, form);
      else await attractionApi.create(form);
      setShowModal(false);
      setEditing(null);
      setForm({ name: '', destinationId: 0 });
      attractions.refetch();
      toast.success(editing ? 'Đã cập nhật' : 'Đã tạo');
    } catch { /* handled */ }
  };

  const onDelete = async () => {
    if (deletingId === null) return;
    const id = deletingId;
    setDeletingId(null);
    try { await attractionApi.remove(id); attractions.refetch(); toast.success('Đã xóa'); } catch { /* handled */ }
  };

  const openAdd = () => { setEditing(null); setForm({ name: '', destinationId: destinations.data?.[0]?.id || 0 }); setShowModal(true); };
  const openEdit = (a: AttractionResponse) => { setEditing(a); setForm({ name: a.name, destinationId: a.destinationId || 0, description: a.description, image: a.image, address: a.address, status: a.status }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm({ name: '', destinationId: 0 }); };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Quản lý điểm tham quan</h1>
      <div className="mb-4 flex items-center gap-3">
        <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm điểm tham quan..." className="input flex-1" />
        <button onClick={openAdd} className="btn-primary"><Plus className="h-4 w-4" />Thêm</button>
      </div>
      {attractions.loading ? <Spinner /> : attractions.data && attractions.data.content.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-3">Tên</th><th className="px-4 py-3">Điểm đến</th><th className="px-4 py-3">Địa chỉ</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3 text-right">Hành động</th></tr>
            </thead>
            <tbody className="divide-y">
              {attractions.data.content.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{a.name}</td>
                  <td className="px-4 py-3 text-xs">{a.destinationName || '-'}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{a.address || '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(a)} className="rounded p-1 text-blue-600 hover:bg-blue-50"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => setDeletingId(a.id)} className="ml-1 rounded p-1 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState title="Chưa có điểm tham quan" />}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold">{editing ? 'Cập nhật' : 'Thêm'} điểm tham quan</h3>
              <button onClick={closeModal}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={onSave} className="space-y-3">
              <div><label className="text-xs">Tên</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></div>
              <div>
                <label className="text-xs">Điểm đến</label>
                <select required value={form.destinationId} onChange={(e) => setForm({ ...form, destinationId: Number(e.target.value) })} className="input">
                  <option value={0} disabled>-- Chọn điểm đến --</option>
                  {destinations.data?.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.province})</option>)}
                </select>
              </div>
              <div><label className="text-xs">Địa chỉ</label><input value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" /></div>
              <div><label className="text-xs">Ảnh (URL)</label><input value={form.image || ''} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input" /></div>
              <div><label className="text-xs">Mô tả</label><textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" /></div>
              <div className="flex justify-end gap-2"><button type="button" onClick={closeModal} className="btn-secondary">Hủy</button><button className="btn-primary"><Save className="h-4 w-4" />Lưu</button></div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        open={deletingId !== null}
        title="Xóa điểm tham quan?"
        description="Hành động này không thể hoàn tác."
        confirmText="Xóa"
        onConfirm={onDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};

export default AdminAttractionPage;
