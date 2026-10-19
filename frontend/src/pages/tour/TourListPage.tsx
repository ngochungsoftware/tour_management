import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tourApi } from '@/api/tour.api';
import { categoryApi, destinationApi } from '@/api/catalog.api';
import { PageResponse, TourResponse } from '@/types';
import { useAsync } from '@/hooks/useAsync';
import { Spinner } from '@/components/ui/Feedback';
import { EmptyState } from '@/components/ui/Feedback';
import TourCard from '@/components/tour/TourCard';
import { Filter, Search, X, Award, Flame } from 'lucide-react';

const TourListPage = () => {
  const [params, setParams] = useSearchParams();
  const [showFilter, setShowFilter] = useState(false);

  const filter = useMemo(
    () => ({
      keyword: params.get('keyword') || undefined,
      categoryId: params.get('categoryId') ? Number(params.get('categoryId')) : undefined,
      destinationId: params.get('destinationId') ? Number(params.get('destinationId')) : undefined,
      minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : undefined,
      maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
      durationDays: params.get('durationDays') ? Number(params.get('durationDays')) : undefined,
      departureDate: params.get('departureDate') || undefined,
      featured: params.get('featured') === 'true' ? true : undefined,
      discount: params.get('discount') === 'true' ? true : undefined,
      page: params.get('page') ? Number(params.get('page')) : 0,
      size: 12,
    }),
    [params]
  );

  const isFeatured = params.get('featured') === 'true';
  const isDiscount = params.get('discount') === 'true';

  const tours = useAsync<PageResponse<TourResponse>>(() => tourApi.search(filter), [params.toString()]);
  const categories = useAsync(() => categoryApi.list());
  const destinations = useAsync(() => destinationApi.list());

  const updateParam = (key: string, value?: string | number) => {
    const next = new URLSearchParams(params);
    if (value === undefined || value === '' || value === null) {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
    next.set('page', '0');
    setParams(next);
  };

  const clearAll = () => setParams(new URLSearchParams());

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isFeatured ? 'Tour nổi bật' : isDiscount ? 'Tour đang giảm giá' : 'Khám phá tour'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isFeatured
              ? 'Những tour được yêu thích và đánh giá cao nhất'
              : isDiscount
              ? 'Săn deal giá tốt, tiết kiệm đến 30%'
              : 'Tìm kiếm và đặt tour yêu thích của bạn'}
          </p>
        </div>
        <span className="text-sm text-slate-500">
          {tours.data ? `${tours.data.totalElements} kết quả` : ''}
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              defaultValue={params.get('keyword') || ''}
              onKeyDown={(e) => {
                if (e.key === 'Enter') updateParam('keyword', (e.target as HTMLInputElement).value);
              }}
              className="input pl-9"
              placeholder="Tìm theo tên..."
            />
          </div>
          <button className="btn-secondary md:hidden" onClick={() => setShowFilter((s) => !s)}>
            <Filter className="h-4 w-4" /> Lọc
          </button>
        </div>
      </div>

      {/* Quick filter chips */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          onClick={() => { updateParam('featured', undefined); updateParam('discount', undefined); }}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
            !isFeatured && !isDiscount
              ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => { updateParam('featured', isFeatured ? undefined : 'true'); updateParam('discount', undefined); }}
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
            isFeatured
              ? 'border-amber-300 bg-amber-50 text-amber-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:text-amber-600'
          }`}
        >
          <Award className="h-3 w-3" /> Nổi bật
        </button>
        <button
          onClick={() => { updateParam('discount', isDiscount ? undefined : 'true'); updateParam('featured', undefined); }}
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
            isDiscount
              ? 'border-rose-300 bg-rose-50 text-rose-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:text-rose-600'
          }`}
        >
          <Flame className="h-3 w-3" /> Giảm giá
        </button>
        {(isFeatured || isDiscount) && (
          <button
            onClick={() => { updateParam('featured', undefined); updateParam('discount', undefined); }}
            className="ml-1 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
          >
            <X className="h-3 w-3" /> Bỏ lọc
          </button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <aside className={`${showFilter ? 'block' : 'hidden'} md:block`}>
          <div className="card sticky top-20 space-y-4 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-700">Bộ lọc</h3>
              <button onClick={clearAll} className="text-xs text-brand-600 hover:underline">
                <X className="mr-1 inline h-3 w-3" /> Xóa
              </button>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Danh mục</label>
              <select
                value={params.get('categoryId') || ''}
                onChange={(e) => updateParam('categoryId', e.target.value)}
                className="input mt-1"
              >
                <option value="">Tất cả</option>
                {categories.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Điểm đến</label>
              <select
                value={params.get('destinationId') || ''}
                onChange={(e) => updateParam('destinationId', e.target.value)}
                className="input mt-1"
              >
                <option value="">Tất cả</option>
                {destinations.data?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Thời gian (ngày)</label>
              <select
                value={params.get('durationDays') || ''}
                onChange={(e) => updateParam('durationDays', e.target.value)}
                className="input mt-1"
              >
                <option value="">Tất cả</option>
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <option key={d} value={d}>
                    {d} ngày
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-500">Giá từ</label>
                <input
                  type="number"
                  placeholder="0"
                  defaultValue={params.get('minPrice') || ''}
                  onBlur={(e) => updateParam('minPrice', e.target.value)}
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Đến</label>
                <input
                  type="number"
                  placeholder="∞"
                  defaultValue={params.get('maxPrice') || ''}
                  onBlur={(e) => updateParam('maxPrice', e.target.value)}
                  className="input mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Ngày khởi hành</label>
              <input
                type="date"
                defaultValue={params.get('departureDate') || ''}
                onChange={(e) => updateParam('departureDate', e.target.value)}
                className="input mt-1"
              />
            </div>
          </div>
        </aside>

        <div>
          {tours.loading ? (
            <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
          ) : tours.data && tours.data.content.length > 0 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tours.data.content.map((t) => (
                  <TourCard key={t.id} tour={t} />
                ))}
              </div>
              {tours.data.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    disabled={tours.data.page === 0}
                    onClick={() => updateParam('page', tours.data!.page - 1)}
                    className="btn-secondary"
                  >
                    Trang trước
                  </button>
                  <span className="text-sm text-slate-500">
                    Trang {tours.data.page + 1} / {tours.data.totalPages}
                  </span>
                  <button
                    disabled={tours.data.last}
                    onClick={() => updateParam('page', tours.data!.page + 1)}
                    className="btn-secondary"
                  >
                    Trang sau
                  </button>
                </div>
              )}
            </>
          ) : (
            <EmptyState title="Không tìm thấy tour phù hợp" description="Hãy thử thay đổi bộ lọc của bạn." />
          )}
        </div>
      </div>
    </div>
  );
};

export default TourListPage;
