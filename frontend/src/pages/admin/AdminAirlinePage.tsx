import { useState } from 'react';
import { airlineApi } from '@/api/airline.api';
import { useAsync } from '@/hooks/useAsync';
import { AirlineRequest, AirlineResponse } from '@/types';
import { Spinner, EmptyState, StatusBadge } from '@/components/ui/Feedback';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminAirlinePage = () => {
  const [keyword, setKeyword] = useState('');
  const [editing, setEditing] = useState<AirlineResponse | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<AirlineRequest>({ code: '', name: '' });
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const items = useAsync(() => airlineApi.adminSearch(keyword, 0, 50), [keyword]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) await airlineApi.update(editing.id, form);
      else await airlineApi.create(form);
      setShowModal(false);
      setEditing(null);
      setForm({ code: '', name: '' });
      items.refetch();
      toast.success(editing ? 'Đã cập nhật' : 'Đã tạo');
    } catch { /* handled */ }
  };

  const onDelete = async () => {
    if (deletingId === null) return;
    const id = deletingId;
    setDeletingId(null);
    try { await airlineApi.remove(id); items.refetch(); toast.success('Đã xóa'); } catch { /* handled */ }
  };

  const openAdd = () => { setEditing(null); setForm({ code: '', name: '' }); setShowModal(true); };
  const openEdit = (a: AirlineResponse) => { setEditing(a); setForm({ code: a.code, name: a.name, logo: a.logo, status: a.status }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm({ code: '', name: '' }); };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Quản lý hãng hàng không</h1>
      <div className="mb-4 flex items-center gap-3">
        <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm hãng..." className="input flex-1" />
        <button onClick={openAdd} className="btn-primary"><Plus className="h-4 w-4" />Thêm</button>
      </div>
      {items.loading ? <Spinner /> : items.data && items.data.content.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-3">Mã</th><th className="px-4 py-3">Tên hãng</th><th className="px-4 py-3">Logo</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3 text-right">Hành động</th></tr>
            </thead>
            <tbody className="divide-y">
              {items.data.content.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-medium">{a.code}</td>
                  <td className="px-4 py-3">{a.name}</td>
                  <td className="px-4 py-3 text-xs">{a.logo ? <img src={a.logo} alt={a.code} className="h-6" /> : '-'}</td>
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
      ) : <EmptyState title="Chưa có hãng hàng không" />}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold">{editing ? 'Cập nhật' : 'Thêm'} hãng hàng không</h3>
              <button onClick={closeModal}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={onSave} className="space-y-3">
              <div><label className="text-xs">Mã IATA (2 ký tự)</label><input required maxLength={2} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input" placeholder="vd: VJ, VNA, BB" /></div>
              <div><label className="text-xs">Tên hãng</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="vd: VietJet Air" /></div>
              <div><label className="text-xs">Logo (URL)</label><input value={form.logo || ''} onChange={(e) => setForm({ ...form, logo: e.target.value })} className="input" /></div>
              <div className="flex justify-end gap-2"><button type="button" onClick={closeModal} className="btn-secondary">Hủy</button><button className="btn-primary"><Save className="h-4 w-4" />Lưu</button></div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        open={deletingId !== null}
        title="Xóa hãng hàng không?"
        description="Hành động này không thể hoàn tác."
        confirmText="Xóa"
        onConfirm={onDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};

export default AdminAirlinePage;
