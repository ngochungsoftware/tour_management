import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { categoryApi, destinationApi } from '@/api/catalog.api';
import { useAsync } from '@/hooks/useAsync';
import { CategoryRequest, DestinationRequest, CategoryResponse, DestinationResponse } from '@/types';
import { Spinner, EmptyState, StatusBadge } from '@/components/ui/Feedback';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const CategoryManager = () => {
  const [keyword, setKeyword] = useState('');
  const [editing, setEditing] = useState<CategoryResponse | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CategoryRequest>({ name: '', description: '' });
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const cats = useAsync(() => categoryApi.adminSearch(keyword, 0, 50), [keyword]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await categoryApi.update(editing.id, form);
        toast.success('Đã cập nhật danh mục');
      } else {
        await categoryApi.create(form);
        toast.success('Đã tạo danh mục');
      }
      setShowModal(false);
      setEditing(null);
      setForm({ name: '', description: '' });
      cats.refetch();
    } catch { /* handled */ }
  };

  const onDelete = async () => {
    if (deletingId === null) return;
    const id = deletingId;
    setDeletingId(null);
    try { await categoryApi.remove(id); cats.refetch(); toast.success('Đã xóa'); } catch { /* handled */ }
  };

  const openAdd = () => { setEditing(null); setForm({ name: '', description: '' }); setShowModal(true); };
  const openEdit = (c: CategoryResponse) => { setEditing(c); setForm({ name: c.name, description: c.description || '', status: c.status }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm({ name: '', description: '' }); };

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm danh mục..." className="input flex-1" />
        <button onClick={openAdd} className="btn-primary"><Plus className="h-4 w-4" />Thêm</button>
      </div>
      {cats.loading ? <Spinner /> : cats.data && cats.data.content.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-3">Tên</th><th className="px-4 py-3">Mô tả</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3 text-right">Hành động</th></tr>
            </thead>
            <tbody className="divide-y">
              {cats.data.content.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{c.description}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(c)} className="rounded p-1 text-blue-600 hover:bg-blue-50"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => setDeletingId(c.id)} className="ml-1 rounded p-1 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState title="Chưa có danh mục" />}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold">{editing ? 'Cập nhật' : 'Thêm'} danh mục</h3>
              <button onClick={closeModal}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={onSave} className="space-y-3">
              <div><label className="text-xs">Tên</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></div>
              <div><label className="text-xs">Mô tả</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" /></div>
              <div className="flex justify-end gap-2"><button type="button" onClick={closeModal} className="btn-secondary">Hủy</button><button className="btn-primary"><Save className="h-4 w-4" />Lưu</button></div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        open={deletingId !== null}
        title="Xóa danh mục?"
        description="Hành động này không thể hoàn tác."
        confirmText="Xóa"
        onConfirm={onDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};

const DestinationManager = () => {
  const [keyword, setKeyword] = useState('');
  const [editing, setEditing] = useState<DestinationResponse | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<DestinationRequest>({ name: '', province: '', description: '', image: '' });
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const dests = useAsync(() => destinationApi.adminSearch(keyword, 0, 50), [keyword]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) await destinationApi.update(editing.id, form);
      else await destinationApi.create(form);
      setShowModal(false);
      setEditing(null);
      setForm({ name: '', province: '', description: '', image: '' });
      dests.refetch();
      toast.success('Đã lưu');
    } catch { /* handled */ }
  };

  const onDelete = async () => {
    if (deletingId === null) return;
    const id = deletingId;
    setDeletingId(null);
    try { await destinationApi.remove(id); dests.refetch(); toast.success('Đã xóa'); } catch { /* handled */ }
  };

  const openAdd = () => { setEditing(null); setForm({ name: '', province: '', description: '', image: '' }); setShowModal(true); };
  const openEdit = (d: DestinationResponse) => { setEditing(d); setForm({ name: d.name, province: d.province, description: d.description || '', image: d.image || '', status: d.status }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm({ name: '', province: '', description: '', image: '' }); };

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm điểm đến..." className="input flex-1" />
        <button onClick={openAdd} className="btn-primary"><Plus className="h-4 w-4" />Thêm</button>
      </div>
      {dests.loading ? <Spinner /> : dests.data && dests.data.content.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-3">Tên</th><th className="px-4 py-3">Tỉnh</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3 text-right">Hành động</th></tr>
            </thead>
            <tbody className="divide-y">
              {dests.data.content.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{d.name}</td>
                  <td className="px-4 py-3 text-xs">{d.province}</td>
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
      ) : <EmptyState title="Chưa có điểm đến" />}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold">{editing ? 'Cập nhật' : 'Thêm'} điểm đến</h3>
              <button onClick={closeModal}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={onSave} className="space-y-3">
              <div><label className="text-xs">Tên</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></div>
              <div><label className="text-xs">Tỉnh/TP</label><input required value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} className="input" /></div>
              <div><label className="text-xs">Ảnh (URL)</label><input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input" /></div>
              <div><label className="text-xs">Mô tả</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" /></div>
              <div className="flex justify-end gap-2"><button type="button" onClick={closeModal} className="btn-secondary">Hủy</button><button className="btn-primary"><Save className="h-4 w-4" />Lưu</button></div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        open={deletingId !== null}
        title="Xóa điểm đến?"
        description="Hành động này không thể hoàn tác."
        confirmText="Xóa"
        onConfirm={onDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};

const AdminCatalogPage = () => {
  const location = useLocation();
  const [tab, setTab] = useState<'category' | 'destination'>(
    location.pathname.includes('/destinations') ? 'destination' : 'category'
  );
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Quản lý danh mục & điểm đến</h1>
      <div className="mb-4 flex gap-2">
        <button onClick={() => setTab('category')} className={`btn ${tab === 'category' ? 'btn-primary' : 'btn-secondary'}`}>Danh mục</button>
        <button onClick={() => setTab('destination')} className={`btn ${tab === 'destination' ? 'btn-primary' : 'btn-secondary'}`}>Điểm đến</button>
      </div>
      {tab === 'category' ? <CategoryManager /> : <DestinationManager />}
    </div>
  );
};

export default AdminCatalogPage;
