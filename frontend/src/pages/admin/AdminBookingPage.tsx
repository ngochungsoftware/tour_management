import { useState } from 'react';
import { bookingApi } from '@/api/booking.api';
import { useAsync } from '@/hooks/useAsync';
import { BookingResponse, PageResponse } from '@/types';
import {
  formatVND,
  formatDate,
  timeAgo,
  bookingStatusBadge,
  bookingStatusLabel,
} from '@/utils/format';
import { Spinner, EmptyState } from '@/components/ui/Feedback';
import ConfirmModal from '@/components/ui/ConfirmModal';
import {
  CheckCircle2,
  XCircle,
  Award,
  Eye,
  Search,
  RefreshCw,
  AlertCircle,
  Users as UsersIcon,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import BookingDetailModal from '@/components/admin/BookingDetailModal';

type StatusFilter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

const AdminBookingPage = () => {
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [viewing, setViewing] = useState<BookingResponse | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<{ id: number; type: 'confirm' | 'cancel' | 'complete' } | null>(null);

  const bookings = useAsync<PageResponse<BookingResponse>>(
    () => bookingApi.adminSearch(page, 10, keyword, status === 'ALL' ? undefined : status),
    [page, keyword, status],
  );

  const handleSearch = () => {
    setPage(0);
    setKeyword(searchInput.trim());
  };

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const refresh = () => {
    bookings.refetch();
  };

  const confirmAction = async () => {
    if (!pendingAction) return;
    const { id, type } = pendingAction;
    const labels = {
      confirm: { done: 'Đã xác nhận đơn', err: 'Xác nhận đơn thất bại' },
      cancel: { done: 'Đã hủy đơn', err: 'Hủy đơn thất bại' },
      complete: { done: 'Đã đánh dấu hoàn thành', err: 'Đánh dấu hoàn thành thất bại' },
    } as const;
    setPendingAction(null);
    setActionLoading(id);
    try {
      if (type === 'confirm') await bookingApi.confirm(id);
      else if (type === 'cancel') await bookingApi.cancelByAdmin(id);
      else await bookingApi.complete(id);
      toast.success(labels[type].done);
      bookings.refetch();
    } catch (err) {
      const msg = err instanceof Error ? err.message : labels[type].err;
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const data = bookings.data;
  const items = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý đơn đặt tour</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tổng cộng <span className="font-semibold text-slate-700">{totalElements}</span> đơn
          </p>
        </div>
        <button
          onClick={refresh}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          title="Làm mới"
        >
          <RefreshCw className="h-4 w-4" /> Làm mới
        </button>
      </div>

      {/* Bộ lọc */}
      <div className="card mb-4 p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKey}
              placeholder="Tìm theo mã đơn hoặc tên tour..."
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as StatusFilter);
              setPage(0);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
          <button
            onClick={handleSearch}
            disabled={bookings.loading}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {bookings.loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
            Tìm
          </button>
        </div>
      </div>

      {/* Trạng thái lỗi */}
      {bookings.error && (
        <div className="card mb-4 flex items-start gap-3 border-l-4 border-rose-500 bg-rose-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-rose-700">Đã xảy ra lỗi</p>
            <p className="mt-0.5 text-xs text-rose-600">{bookings.error}</p>
          </div>
          <button
            onClick={refresh}
            className="rounded-lg border border-rose-200 bg-white px-3 py-1 text-xs text-rose-700 hover:bg-rose-100"
          >
            Thử lại
          </button>
        </div>
      )}

      {bookings.loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title={keyword || status !== 'ALL' ? 'Không tìm thấy đơn phù hợp' : 'Chưa có đơn đặt tour nào'}
          description={
            keyword || status !== 'ALL'
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              : 'Các đơn đặt tour từ khách hàng sẽ hiển thị ở đây'
          }
        />
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Mã đơn</th>
                    <th className="px-4 py-3 font-semibold">Tour</th>
                    <th className="px-4 py-3 font-semibold">Khởi hành</th>
                    <th className="px-4 py-3 font-semibold">Khách</th>
                    <th className="px-4 py-3 font-semibold">Tổng tiền</th>
                    <th className="px-4 py-3 font-semibold">Trạng thái</th>
                    <th className="px-4 py-3 text-right font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((b) => {
                    const isLoading = actionLoading === b.id;
                    return (
                      <tr key={b.id} className="transition hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-mono text-xs font-semibold text-slate-700">
                            {b.bookingCode}
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-400">
                            {timeAgo(b.createdAt)}
                          </div>
                        </td>
                        <td className="max-w-[240px] truncate px-4 py-3" title={b.tourName}>
                          {b.tourName}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">
                          <Calendar className="mr-1 inline h-3 w-3 text-slate-400" />
                          {formatDate(b.departureDate)}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div className="whitespace-nowrap text-slate-700">
                            <UsersIcon className="mr-1 inline h-3 w-3 text-slate-400" />
                            {b.totalPeople} người
                          </div>
                          <div className="mt-0.5 whitespace-nowrap text-[11px] text-slate-400">
                            {b.adultCount} NL · {b.childCount} TE · {b.infantCount} EB
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {formatVND(b.totalAmount)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={bookingStatusBadge(b.status)}>
                            {bookingStatusLabel(b.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setViewing(b)}
                              className="rounded p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {b.status === 'PENDING' && (
                              <button
                                onClick={() => setPendingAction({ id: b.id, type: 'confirm' })}
                                disabled={isLoading}
                                className="rounded p-1.5 text-sky-600 transition hover:bg-sky-50 disabled:opacity-50"
                                title="Xác nhận"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                            )}
                            {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                              <>
                                <button
                                  onClick={() => setPendingAction({ id: b.id, type: 'complete' })}
                                  disabled={isLoading}
                                  className="rounded p-1.5 text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                                  title="Hoàn thành"
                                >
                                  <Award className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setPendingAction({ id: b.id, type: 'cancel' })}
                                  disabled={isLoading}
                                  className="rounded p-1.5 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                  title="Hủy đơn"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
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
                Trang {page + 1} / {totalPages} · {totalElements} đơn
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

      {viewing && (
        <BookingDetailModal
          booking={viewing}
          onClose={() => setViewing(null)}
          onStatusChange={() => bookings.refetch()}
        />
      )}
      <ConfirmModal
        open={pendingAction !== null}
        title={
          pendingAction
            ? `${pendingAction.type === 'confirm' ? 'Xác nhận' : pendingAction.type === 'cancel' ? 'Hủy' : 'Hoàn thành'} đơn này?`
            : ''
        }
        description="Hành động này sẽ thay đổi trạng thái đơn đặt tour."
        confirmText={pendingAction ? (pendingAction.type === 'confirm' ? 'Xác nhận' : pendingAction.type === 'cancel' ? 'Hủy đơn' : 'Hoàn thành') : 'Xác nhận'}
        onConfirm={confirmAction}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
};

export default AdminBookingPage;
