import { reviewApi } from '@/api/review.api';
import { useAsync } from '@/hooks/useAsync';
import { formatDate, formatDateTime } from '@/utils/format';
import { Spinner, EmptyState, StatusBadge } from '@/components/ui/Feedback';
import { Eye, EyeOff, Trash2, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminReviewPage = () => {
  const reviews = useAsync(() => reviewApi.adminAll());

  const toggle = async (id: number, status: 'VISIBLE' | 'HIDDEN') => {
    try {
      if (status === 'HIDDEN') await reviewApi.hide(id);
      else await reviewApi.show(id);
      reviews.refetch();
      toast.success('Đã cập nhật');
    } catch { /* handled */ }
  };

  const onDelete = async (id: number) => {
    if (!confirm('Xóa đánh giá?')) return;
    try { await reviewApi.remove(id); reviews.refetch(); } catch { /* handled */ }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Quản lý đánh giá</h1>
      {reviews.loading ? <Spinner /> : reviews.data && reviews.data.length > 0 ? (
        <div className="space-y-3">
          {reviews.data.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{r.userName}</span>
                    <span className="text-xs text-slate-500">đánh giá</span>
                    <span className="font-medium text-brand-600">{r.tourName}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                    ))}
                    <span className="ml-1 text-sm font-medium text-slate-700">{r.rating}/5</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{r.comment}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatDateTime(r.createdAt)}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => toggle(r.id, r.status === 'VISIBLE' ? 'HIDDEN' : 'VISIBLE')}
                    className="rounded p-1 text-slate-600 hover:bg-slate-100"
                    title={r.status === 'VISIBLE' ? 'Ẩn' : 'Hiện'}
                  >
                    {r.status === 'VISIBLE' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button onClick={() => onDelete(r.id)} className="rounded p-1 text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : <EmptyState title="Chưa có đánh giá" />}
    </div>
  );
};

export default AdminReviewPage;
