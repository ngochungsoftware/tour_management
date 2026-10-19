import { useState } from 'react';
import { tourApi } from '@/api/tour.api';
import { useAsync } from '@/hooks/useAsync';
import {
  PageResponse,
  TourCreateRequest,
  TourResponse,
  TourStatus,
  TourUpdateRequest,
  TourDetailResponse,
} from '@/types';
import { formatVND } from '@/utils/format';
import { Spinner, EmptyState } from '@/components/ui/Feedback';
import {
  Edit,
  Trash2,
  Eye,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  EyeOff,
  CheckCircle2,
  Star,
} from 'lucide-react';
import toast from 'react-hot-toast';
import TourForm from '@/components/admin/TourForm';

const TOUR_STATUS_LABEL: Record<TourStatus, string> = {
  ACTIVE: 'Hoạt động',
  HIDDEN: 'Đã ẩn',
  INACTIVE: 'Ngưng',
};

const TOUR_STATUS_BADGE: Record<TourStatus, string> = {
  ACTIVE: 'rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700',
  HIDDEN: 'rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700',
  INACTIVE: 'rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700',
};

const AdminTourPage = () => {
  const [page, setPage] = useState(0);
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<'ALL' | TourStatus>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Load tours list
  const tours = useAsync<PageResponse<TourResponse>>(
    () =>
      tourApi.adminSearch({
        keyword: keyword || undefined,
        status: status === 'ALL' ? undefined : status,
        page,
        size: 10,
      }),
    [page, keyword, status],
  );

  // Load chi tiết tour khi edit
  const tourDetail = useAsync<TourDetailResponse | null>(
    async () => (editingId ? await tourApi.detail(editingId) : null),
    [editingId],
  );

  const handleSearch = () => {
    setPage(0);
    setKeyword(keywordInput.trim());
  };

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const refresh = () => {
    tours.refetch();
  };

  const handleAdd = () => {
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (id: number) => {
    setEditingId(id);
    setShowForm(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Xóa tour "${name}"?\nHành động này không thể hoàn tác.`)) return;
    setActionLoading(id);
    try {
      await tourApi.remove(id);
      toast.success('Đã xóa tour');
      tours.refetch();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Xóa thất bại';
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (t: TourResponse) => {
    setActionLoading(t.id);
    try {
      if (t.status === 'ACTIVE') {
        await tourApi.hide(t.id);
        toast.success('Đã ẩn tour');
      } else {
        await tourApi.show(t.id);
        toast.success('Đã hiện tour');
      }
      tours.refetch();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Thao tác thất bại';
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleFormSubmit = async (
    data: TourCreateRequest | TourUpdateRequest,
    isEdit: boolean,
  ) => {
    try {
      if (isEdit && editingId) {
        await tourApi.update(editingId, data as TourUpdateRequest);
        toast.success('Đã cập nhật tour');
      } else {
        await tourApi.create(data as TourCreateRequest);
        toast.success('Đã tạo tour mới');
      }
      setShowForm(false);
      setEditingId(null);
      tours.refetch();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lưu thất bại';
      toast.error(msg);
      throw err;
    }
  };

  const data = tours.data;
  const items = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Tour</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tổng cộng <span className="font-semibold text-slate-700">{totalElements}</span> tour
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
            title="Làm mới"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" /> Thêm tour
          </button>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="card mb-4 p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleSearchKey}
              placeholder="Tìm theo tên, mã tour..."
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as 'ALL' | TourStatus);
              setPage(0);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="HIDDEN">Đã ẩn</option>
            <option value="INACTIVE">Ngưng</option>
          </select>
          <button
            onClick={handleSearch}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Tìm
          </button>
        </div>
      </div>

      {/* Lỗi */}
      {tours.error && (
        <div className="card mb-4 flex items-start gap-3 border-l-4 border-rose-500 bg-rose-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-rose-700">Đã xảy ra lỗi</p>
            <p className="mt-0.5 text-xs text-rose-600">{tours.error}</p>
          </div>
          <button
            onClick={refresh}
            className="rounded-lg border border-rose-200 bg-white px-3 py-1 text-xs text-rose-700 hover:bg-rose-100"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Loading */}
      {tours.loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title={
            keyword || status !== 'ALL' ? 'Không tìm thấy tour phù hợp' : 'Chưa có tour nào'
          }
          description={
            keyword || status !== 'ALL'
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              : 'Bấm "Thêm tour" để tạo tour đầu tiên'
          }
          action={
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" /> Thêm tour
            </button>
          }
        />
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Tour</th>
                    <th className="px-4 py-3 font-semibold">Giá</th>
                    <th className="px-4 py-3 font-semibold">Thời lượng</th>
                    <th className="px-4 py-3 font-semibold">Đánh giá</th>
                    <th className="px-4 py-3 font-semibold">Trạng thái</th>
                    <th className="px-4 py-3 text-right font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((t) => {
                    const isLoading = actionLoading === t.id;
                    return (
                      <tr key={t.id} className="transition hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {t.coverImage && (
                              <img
                                src={t.coverImage}
                                alt={t.name}
                                className="h-12 w-16 shrink-0 rounded object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[10px] font-semibold text-slate-500">
                                  {t.code}
                                </span>
                                {t.featured && (
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                )}
                              </div>
                              <div className="truncate font-medium text-slate-800" title={t.name}>
                                {t.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                {t.destinationName} · {t.categoryName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-700">
                            {formatVND(t.adultPrice)}
                          </div>
                          {t.originalPrice && t.originalPrice > t.adultPrice && (
                            <div className="text-xs text-slate-400 line-through">
                              {formatVND(t.originalPrice)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {t.durationDays}N{t.durationDays - 1}Đ
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div className="flex items-center gap-1 text-slate-700">
                            ⭐ {t.averageRating.toFixed(1)}
                          </div>
                          <div className="text-slate-400">{t.reviewCount} đánh giá</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={TOUR_STATUS_BADGE[t.status]}>
                            {TOUR_STATUS_LABEL[t.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <a
                              href={`/tours/${t.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                              title="Xem trên client"
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                            <button
                              onClick={() => handleEdit(t.id)}
                              disabled={isLoading}
                              className="rounded p-1.5 text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(t)}
                              disabled={isLoading}
                              className={`rounded p-1.5 transition disabled:opacity-50 ${
                                t.status === 'ACTIVE'
                                  ? 'text-amber-600 hover:bg-amber-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={t.status === 'ACTIVE' ? 'Ẩn tour' : 'Hiện tour'}
                            >
                              {t.status === 'ACTIVE' ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(t.id, t.name)}
                              disabled={isLoading}
                              className="rounded p-1.5 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Trang {page + 1} / {totalPages} · {totalElements} tour
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  ← Trước
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showForm && (
        <TourForm
          initial={editingId ? (tourDetail.data ?? null) : null}
          onClose={() => {
            setShowForm(false);
            setEditingId(null);
          }}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default AdminTourPage;
