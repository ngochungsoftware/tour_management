import { useState } from 'react';
import { bannerApi } from '@/api/banner.api';
import { useAsync } from '@/hooks/useAsync';
import { BannerPosition, BannerRequest, BannerResponse } from '@/types';
import { Spinner, EmptyState, StatusBadge } from '@/components/ui/Feedback';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const POSITION_LABEL: Record<BannerPosition, string> = {
  HOME_HERO: 'Trang chủ - Hero',
  HOME_SIDE: 'Trang chủ - Bên',
  HOME_MIDDLE: 'Trang chủ - Giữa',
  TOUR_LIST: 'Danh sách tour',
  TOUR_DETAIL: 'Chi tiết tour',
};

const POSITION_OPTIONS: BannerPosition[] = ['HOME_HERO', 'HOME_SIDE', 'HOME_MIDDLE', 'TOUR_LIST', 'TOUR_DETAIL'];

const AdminBannerPage = () => {
  const [keyword, setKeyword] = useState('');
  const [filterPos, setFilterPos] = useState<BannerPosition | ''>('');
  const [editing, setEditing] = useState<BannerResponse | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<BannerRequest>({ title: '', imageUrl: '', position: 'HOME_HERO' });
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const items = useAsync(() => bannerApi.adminSearch(filterPos || undefined, keyword, 0, 50), [keyword, filterPos]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) await bannerApi.update(editing.id, form);
      else await bannerApi.create(form);
      setShowModal(false);
      setEditing(null);
      setForm({ title: '', imageUrl: '', position: 'HOME_HERO' });
      items.refetch();
      toast.success(editing ? 'Đã cập nhật' : 'Đã tạo');
    } catch { /* handled */ }
  };

  const onDelete = async () => {
    if (deletingId === null) return;
    const id = deletingId;
    setDeletingId(null);
    try { await bannerApi.remove(id); items.refetch(); toast.success('Đã xóa'); } catch { /* handled */ }
  };

  const openAdd = () => { setEditing(null); setForm({ title: '', imageUrl: '', position: 'HOME_HERO' }); setShowModal(true); };
  const openEdit = (b: BannerResponse) => {
    setEditing(b);
    setForm({
      title: b.title, subtitle: b.subtitle, imageUrl: b.imageUrl, linkUrl: b.linkUrl,
      position: b.position, sortOrder: b.sortOrder, startDate: b.startDate, endDate: b.endDate, status: b.status,
    });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm({ title: '', imageUrl: '', position: 'HOME_HERO' }); };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Quản lý banner quảng cáo</h1>
      <div className="mb-4 flex items-center gap-3">
        <select value={filterPos} onChange={(e) => setFilterPos(e.target.value as BannerPosition | '')} className="input w-48">
          <option value="">Tất cả vị trí</option>
          {POSITION_OPTIONS.map((p) => <option key={p} value={p}>{POSITION_LABEL[p]}</option>)}
        </select>
        <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm banner..." className="input flex-1" />
        <button onClick={openAdd} className="btn-primary"><Plus className="h-4 w-4" />Thêm</button>
      </div>
      {items.loading ? <Spinner /> : items.data && items.data.content.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-3">Tiêu đề</th><th className="px-4 py-3">Vị trí</th><th className="px-4 py-3">Hình ảnh</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3 text-right">Hành động</th></tr>
            </thead>
            <tbody className="divide-y">
              {items.data.content.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{b.title}</div>
                    {b.subtitle && <div className="text-xs text-slate-500">{b.subtitle}</div>}
                  </td>
                  <td className="px-4 py-3 text-xs">{POSITION_LABEL[b.position]}</td>
                  <td className="px-4 py-3"><img src={b.imageUrl} alt={b.title} className="h-10 rounded" /></td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(b)} className="rounded p-1 text-blue-600 hover:bg-blue-50"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => setDeletingId(b.id)} className="ml-1 rounded p-1 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState title="Chưa có banner" />}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold">{editing ? 'Cập nhật' : 'Thêm'} banner</h3>
              <button onClick={closeModal}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={onSave} className="space-y-3">
              <div><label className="text-xs">Tiêu đề</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" /></div>
              <div><label className="text-xs">Phụ đề</label><input value={form.subtitle || ''} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="input" /></div>
              <div><label className="text-xs">URL hình ảnh</label><input required value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="input" placeholder="https://..." /></div>
              <div><label className="text-xs">URL liên kết</label><input value={form.linkUrl || ''} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} className="input" placeholder="https://..." /></div>
              <div>
                <label className="text-xs">Vị trí hiển thị</label>
                <select required value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value as BannerPosition })} className="input">
                  {POSITION_OPTIONS.map((p) => <option key={p} value={p}>{POSITION_LABEL[p]}</option>)}
                </select>
              </div>
              <div><label className="text-xs">Thứ tự hiển thị</label><input type="number" value={form.sortOrder || 0} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="input" /></div>
              <div><label className="text-xs">Ngày bắt đầu</label><input type="datetime-local" value={form.startDate ? form.startDate.slice(0, 16) : ''} onChange={(e) => setForm({ ...form, startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })} className="input" /></div>
              <div><label className="text-xs">Ngày kết thúc</label><input type="datetime-local" value={form.endDate ? form.endDate.slice(0, 16) : ''} onChange={(e) => setForm({ ...form, endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })} className="input" /></div>
              <div className="flex justify-end gap-2"><button type="button" onClick={closeModal} className="btn-secondary">Hủy</button><button className="btn-primary"><Save className="h-4 w-4" />Lưu</button></div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        open={deletingId !== null}
        title="Xóa banner?"
        description="Hành động này không thể hoàn tác."
        confirmText="Xóa"
        onConfirm={onDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};

export default AdminBannerPage;
