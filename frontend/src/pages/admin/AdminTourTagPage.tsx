import { useState } from 'react';
import { tourTagApi } from '@/api/tourTag.api';
import { useAsync } from '@/hooks/useAsync';
import { TourTagRequest, TourTagResponse } from '@/types';
import { Spinner, EmptyState, StatusBadge } from '@/components/ui/Feedback';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminTourTagPage = () => {
  const [keyword, setKeyword] = useState('');
  const [editing, setEditing] = useState<TourTagResponse | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<TourTagRequest>({ name: '', slug: '' });
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const tags = useAsync(() => tourTagApi.adminSearch(keyword, 0, 50), [keyword]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) await tourTagApi.update(editing.id, form);
      else await tourTagApi.create(form);
      setShowModal(false);
      setEditing(null);
      setForm({ name: '', slug: '' });
      tags.refetch();
      toast.success(editing ? 'Đã cập nhật nhãn' : 'Đã tạo nhãn');
    } catch { /* handled */ }
  };

  const onDelete = async () => {
    if (deletingId === null) return;
    const id = deletingId;
    setDeletingId(null);
    try { await tourTagApi.remove(id); tags.refetch(); toast.success('Đã xóa'); } catch { /* handled */ }
  };

  const openAdd = () => { setEditing(null); setForm({ name: '', slug: '' }); setShowModal(true); };
  const openEdit = (t: TourTagResponse) => { setEditing(t); setForm({ name: t.name, slug: t.slug, status: t.status }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm({ name: '', slug: '' }); };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Quản lý nhãn tour</h1>
      <div className="mb-4 flex items-center gap-3">
        <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm nhãn..." className="input flex-1" />
        <button onClick={openAdd} className="btn-primary"><Plus className="h-4 w-4" />Thêm</button>
      </div>
      {tags.loading ? <Spinner /> : tags.data && tags.data.content.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-3">Tên</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3 text-right">Hành động</th></tr>
            </thead>
            <tbody className="divide-y">
              {tags.data.content.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{t.slug}</td>
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
      ) : <EmptyState title="Chưa có nhãn" />}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold">{editing ? 'Cập nhật' : 'Thêm'} nhãn</h3>
              <button onClick={closeModal}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={onSave} className="space-y-3">
              <div><label className="text-xs">Tên</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></div>
              <div><label className="text-xs">Slug (URL-friendly)</label><input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} className="input" placeholder="vd: bien-dao, nui-cao" /></div>
              <div className="flex justify-end gap-2"><button type="button" onClick={closeModal} className="btn-secondary">Hủy</button><button className="btn-primary"><Save className="h-4 w-4" />Lưu</button></div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        open={deletingId !== null}
        title="Xóa nhãn tour?"
        description="Hành động này không thể hoàn tác."
        confirmText="Xóa"
        onConfirm={onDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};

export default AdminTourTagPage;
