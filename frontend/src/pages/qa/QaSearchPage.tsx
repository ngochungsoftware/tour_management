import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tourQaApi } from '@/api/tourqa.api';
import { useAsync } from '@/hooks/useAsync';
import { timeAgo } from '@/utils/format';
import { Spinner, EmptyState, StatusBadge } from '@/components/ui/Feedback';
import { Search, Filter, Award, MessageCircle, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import type { PageResponse, QaSortBy, TourQaResponse, TourQaSearchParams } from '@/types';

const QaSearchPage = () => {
  const [filters, setFilters] = useState<TourQaSearchParams>({
    keyword: '',
    sortBy: 'NEWEST',
    page: 0,
    size: 10,
  });
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Debounce keyword
  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(filters.keyword || ''), 400);
    return () => clearTimeout(t);
  }, [filters.keyword]);

  const apiResult = useAsync(
    () => tourQaApi.search({ ...filters, keyword: debouncedKeyword }),
    [debouncedKeyword, filters.sortBy, filters.hasReply, filters.hasAcceptedAnswer, filters.quickRange, filters.fromDate, filters.toDate, filters.page]
  );
  const data = apiResult.data;
  const loading = apiResult.loading;

  const totalPages = data?.totalPages ?? 0;
  const items = data?.content ?? [];

  const updateFilter = <K extends keyof TourQaSearchParams>(key: K, value: TourQaSearchParams[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 0 }));
  };

  const reset = () => {
    setFilters({ keyword: '', sortBy: 'NEWEST', page: 0, size: 10 });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
          <HelpCircle className="h-6 w-6 text-brand-600" />
          Tìm kiếm câu hỏi
        </h1>
        <Link to="/qa/my" className="btn-ghost text-sm">
          Câu hỏi của tôi
        </Link>
      </div>

      {/* Thanh tìm kiếm chính */}
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
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value as QaSortBy)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="NEWEST">Mới nhất</option>
            <option value="OLDEST">Cũ nhất</option>
            <option value="MOST_REPLIES">Nhiều trả lời nhất</option>
            <option value="HAS_ANSWER">Có câu trả lời hay</option>
            <option value="UPDATED">Cập nhật gần nhất</option>
          </select>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="btn-ghost inline-flex items-center gap-1 px-3 py-2 text-sm"
          >
            <Filter className="h-4 w-4" />
            Bộ lọc
          </button>
          <button onClick={reset} className="btn-ghost px-3 py-2 text-sm">
            Đặt lại
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Trạng thái trả lời</label>
              <select
                value={filters.hasReply === undefined ? '' : String(filters.hasReply)}
                onChange={(e) => {
                  const v = e.target.value;
                  updateFilter('hasReply', v === '' ? undefined : v === 'true');
                }}
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              >
                <option value="">Tất cả</option>
                <option value="true">Đã có trả lời</option>
                <option value="false">Chưa có trả lời</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Câu trả lời hay</label>
              <select
                value={filters.hasAcceptedAnswer === undefined ? '' : String(filters.hasAcceptedAnswer)}
                onChange={(e) => {
                  const v = e.target.value;
                  updateFilter('hasAcceptedAnswer', v === '' ? undefined : v === 'true');
                }}
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              >
                <option value="">Tất cả</option>
                <option value="true">Có câu trả lời hay</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Khoảng thời gian</label>
              <select
                value={filters.quickRange || ''}
                onChange={(e) => updateFilter('quickRange', (e.target.value || undefined) as TourQaSearchParams['quickRange'])}
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              >
                <option value="">Tất cả</option>
                <option value="TODAY">Hôm nay</option>
                <option value="THIS_WEEK">Tuần này</option>
                <option value="THIS_MONTH">Tháng này</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Từ ngày</label>
              <input
                type="date"
                value={filters.fromDate || ''}
                onChange={(e) => updateFilter('fromDate', e.target.value || undefined)}
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Đến ngày</label>
              <input
                type="date"
                value={filters.toDate || ''}
                onChange={(e) => updateFilter('toDate', e.target.value || undefined)}
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Kết quả */}
      <div className="mb-3 text-sm text-slate-500">
        {loading ? 'Đang tìm...' : `Tìm thấy ${data?.totalElements ?? 0} câu hỏi`}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner className="h-6 w-6" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Không tìm thấy câu hỏi nào"
          description="Thử thay đổi bộ lọc hoặc từ khóa khác."
        />
      ) : (
        <div className="space-y-3">
          {items.map((q) => (
            <div key={q.id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {q.userAvatar ? (
                    <img src={q.userAvatar} alt={q.userName} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    q.userName?.[0]?.toUpperCase() ?? '?'
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/tours/${q.tourId}`}
                      className="text-sm font-semibold text-brand-600 hover:underline"
                    >
                      {q.tourName}
                    </Link>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-sm font-medium text-slate-700">{q.userName}</span>
                    <span className="text-xs text-slate-400">· {timeAgo(q.createdAt)}</span>
                    <StatusBadge status={q.status} />
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <MessageCircle className="h-3 w-3" /> {q.replyCount}
                    </span>
                    {q.replies && q.replies.some((r) => r.isAnswer) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        <Award className="h-3 w-3" /> Câu trả lời hay
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{q.question}</p>
                  <Link
                    to={`/tours/${q.tourId}`}
                    className="mt-2 inline-block text-xs text-brand-600 hover:underline"
                  >
                    Xem trong tour →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => updateFilter('page', Math.max(0, (filters.page || 0) - 1))}
            disabled={(filters.page || 0) === 0}
            className="btn-ghost inline-flex items-center gap-1 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" /> Trước
          </button>
          <span className="text-sm text-slate-600">
            Trang {(filters.page || 0) + 1} / {totalPages}
          </span>
          <button
            onClick={() => updateFilter('page', Math.min(totalPages - 1, (filters.page || 0) + 1))}
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

export default QaSearchPage;
