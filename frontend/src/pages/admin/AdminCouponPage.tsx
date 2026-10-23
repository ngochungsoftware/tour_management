import { useState } from 'react';
import { couponApi } from '@/api/coupon.api';
import { useAsync } from '@/hooks/useAsync';
import { CouponRequest, CouponResponse } from '@/types';
import { Spinner, EmptyState, StatusBadge } from '@/components/ui/Feedback';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@/utils/format';

const AdminCouponPage = () => {
  const [editing, setEditing] = useState<CouponResponse | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CouponRequest>({
    code: '',
    name: '',
    discountPercent: 10,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    maxUsage: 100,
  });
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const coupons = useAsync(() => couponApi.adminList());

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) await couponApi.update(editing.id, form);
      else await couponApi.create(form);
      setShowForm(false); setEditing(null);
      coupons.refetch();
      toast.success('Đã lưu');
    } catch { /* handled */ }
  };

  const onDelete = async () => {
    if (deletingId === null) return;
    const id = deletingId;
    setDeletingId(null);
    try { await couponApi.remove(id); coupons.refetch(); toast.success('Đã xóa'); } catch { /* handled */ }
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý mã giảm giá</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ code: '', name: '', discountPercent: 10, startDate: new Date().toISOString().slice(0, 10), endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10), maxUsage: 100 }); }} className="btn-primary ml-auto"><Plus className="h-4 w-4" />Thêm</button>
      </div>
      {coupons.loading ? <Spinner /> : coupons.data && coupons.data.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-3">Mã</th><th className="px-4 py-3">Tên</th><th className="px-4 py-3">%</th><th className="px-4 py-3">Hiệu lực</th><th className="px-4 py-3">Đã dùng</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3 text-right">Hành động</th></tr>
            </thead>
            <tbody className="divide-y">
              {coupons.data.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-bold">{c.code}</td>
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-600">{c.discountPercent}%</td>
                  <td className="px-4 py-3 text-xs">{formatDate(c.startDate)} → {formatDate(c.endDate)}</td>
                  <td className="px-4 py-3">{c.usedCount}/{c.maxUsage}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditing(c); setForm({ code: c.code, name: c.name, discountPercent: c.discountPercent, startDate: c.startDate, endDate: c.endDate, maxUsage: c.maxUsage }); setShowForm(true); }} className="rounded p-1 text-blue-600 hover:bg-blue-50"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => setDeletingId(c.id)} className="ml-1 rounded p-1 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState title="Chưa có coupon" />}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold">{editing ? 'Cập nhật' : 'Thêm'} coupon</h3>
              <button onClick={() => { setShowForm(false); setEditing(null); }}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={onSave} className="space-y-3">
              <div><label className="text-xs">Mã</label><input required disabled={!!editing} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input" /></div>
              <div><label className="text-xs">Tên</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs">% giảm</label><input required type="number" min={1} max={100} value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })} className="input" /></div>
                <div><label className="text-xs">Max dùng</label><input required type="number" min={1} value={form.maxUsage} onChange={(e) => setForm({ ...form, maxUsage: Number(e.target.value) })} className="input" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs">Bắt đầu</label><input required type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="input" /></div>
                <div><label className="text-xs">Kết thúc</label><input required type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="input" /></div>
              </div>
              <div className="flex justify-end gap-2"><button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary">Hủy</button><button className="btn-primary"><Save className="h-4 w-4" />Lưu</button></div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        open={deletingId !== null}
        title="Xóa mã giảm giá?"
        description="Hành động này không thể hoàn tác."
        confirmText="Xóa"
        onConfirm={onDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};

export default AdminCouponPage;
