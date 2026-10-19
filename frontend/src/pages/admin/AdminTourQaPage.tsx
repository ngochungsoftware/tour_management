import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tourQaApi } from '@/api/tourqa.api';
import { useAsync } from '@/hooks/useAsync';
import { formatDateTime, timeAgo } from '@/utils/format';
import { Spinner, EmptyState, StatusBadge } from '@/components/ui/Feedback';
import {
  Search,
  Trash2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Award,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { PageResponse, QaSortBy, TourQaResponse, TourQaSearchParams } from '@/types';

const AdminTourQaPage = () => {
  const [filters, setFilters] = useState<TourQaSearchParams>({
    keyword: '',
    sortBy: 'NEWEST',
    page: 0,
    size: 10,
  });
  const [debouncedKeyword, setDebouncedKeyword] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(filters.keyword || ''), 400);
    return () => clearTimeout(t);
  }, [filters.keyword]);

  const apiResult = useAsync(
    () => tourQaApi.adminSearch({ ...filters, keyword: debouncedKeyword }),
    [
      debouncedKeyword,
      filters.sortBy,
      filters.hasReply,
      filters.hasAcceptedAnswer,
      filters.quickRange,
      filters.fromDate,
      filters.toDate,
      filters.status,
      filters.page,
    ]
  );
  const data = apiResult.data;
  const loading = apiResult.loading;
  const refetch = apiResult.refetch;

  const totalPages = data?.totalPages ?? 0;
  const items = data?.content ?? [];

  const updateFilter = <K extends keyof TourQaSearchParams>(key: K, value: TourQaSearchParams[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 0 }));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa câu hỏi này?')) return;
    try {
      await tourQaApi.adminDelete(id);
      refetch();
      toast.success('Đã xóa');
    } catch {
      /* handled */
    }
  };

  const toggleStatus = async (id: number, current: string) => {
    try {
      const next = current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await tourQaApi.changeStatus(id, next);
      refetch();
      toast.success('Đã cập nhật');
    } catch {
      /* handled */
    }
  };

  const updatePage = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
          <HelpCircle className="h-6 w-6 text-brand-600" />
          Quản lý Hỏi đáp
        </h1>
      </div>

      {/* Bộ lọc */}
      <div className="card mb-4 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => updateFilter('keyword', e.target.value)}
              placeholder="Tìm kiếm trong câu hỏi..."
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <select
            value={filters.status || ''}
            onChange={(e) => updateFilter('status', (e.target.value || undefined) as TourQaSearchParams['status'])}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hiển thị</option>
            <option value="INACTIVE">Đã ẩn</option>
          </select>
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value as QaSortBy)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="NEWEST">Mới nhất</option>
            <option value="OLDEST">Cũ nhất</option>
            <option value="MOST_REPLIES">Nhiều trả lời nhất</option>
            <option value="HAS_ANSWER">Có câu trả lời hay</option>
            <option value="UPDATED">Cập nhật gần nhất</option>
          </select>
        </div>
      </div>

      <div className="mb-3 text-sm text-slate-500">
        {loading ? 'Đang tải...' : `Tổng ${data?.totalElements ?? 0} câu hỏi`}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner className="h-6 w-6" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState title="Chưa có câu hỏi nào" />
      ) : (
        <div className="space-y-3">
          {items.map((q) => (
            <div key={q.id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {q.userName?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold text-slate-700">{q.userName}</span>
                    <span className="text-xs text-slate-400">hỏi về</span>
                    <Link
                      to={`/tours/${q.tourId}`}
                      className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline"
                    >
                      {q.tourName}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <StatusBadge status={q.status} />
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <MessageCircle className="h-3 w-3" /> {q.replyCount}
                    </span>
                    {q.replies && q.replies.some((r) => r.isAnswer) && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                        <Award className="h-3 w-3" /> Câu trả lời hay
                      </span>
                    )}
                    <span className="text-xs text-slate-400">· {timeAgo(q.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{q.question}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatDateTime(q.createdAt)}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => toggleStatus(q.id, q.status)}
                    className="rounded p-1 text-slate-600 hover:bg-slate-100"
                    title={q.status === 'ACTIVE' ? 'Ẩn' : 'Hiện'}
                  >
                    {q.status === 'ACTIVE' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="rounded p-1 text-red-600 hover:bg-red-50"
                    title="Xóa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => updatePage(Math.max(0, (filters.page || 0) - 1))}
            disabled={(filters.page || 0) === 0}
            className="btn-ghost inline-flex items-center gap-1 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" /> Trước
          </button>
          <span className="text-sm text-slate-600">
            Trang {(filters.page || 0) + 1} / {totalPages}
          </span>
          <button
            onClick={() => updatePage(Math.min(totalPages - 1, (filters.page || 0) + 1))}
            disabled={(filters.page || 0) >= totalPages - 1}
            className="btn-ghost inline-flex items-center gap-1 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Sau <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminTourQaPage;
