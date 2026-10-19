import { useAsync } from '@/hooks/useAsync';
import { adminApi } from '@/api/admin.api';
import { DashboardResponse } from '@/types';
import { formatVND } from '@/utils/format';
import { Spinner } from '@/components/ui/Feedback';
import {
  Users,
  Map,
  CalendarRange,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  Award,
} from 'lucide-react';

const StatCard = ({
  icon, label, value, color, sub,
}: { icon: React.ReactNode; label: string; value: string | number; color: string; sub?: string }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
        {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
      </div>
      <div className={`rounded-full p-3 ${color}`}>{icon}</div>
    </div>
  </div>
);

const DashboardPage = () => {
  const dash = useAsync<DashboardResponse>(() => adminApi.dashboard());

  if (dash.loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!dash.data) return null;
  const d = dash.data;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Tổng quan hệ thống</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5 text-white" />} label="Khách hàng" value={d.totalCustomers} color="bg-blue-500" />
        <StatCard icon={<Map className="h-5 w-5 text-white" />} label="Tổng tour" value={d.totalTours} color="bg-emerald-500" />
        <StatCard icon={<CalendarRange className="h-5 w-5 text-white" />} label="Tổng booking" value={d.totalBookings} color="bg-violet-500" />
        <StatCard icon={<DollarSign className="h-5 w-5 text-white" />} label="Doanh thu" value={formatVND(d.totalRevenue)} color="bg-amber-500" sub="Từ booking đã thanh toán" />
      </div>
      <h2 className="mt-8 mb-4 text-lg font-semibold text-slate-700">Trạng thái booking</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Clock className="h-4 w-4 text-white" />} label="Chờ xác nhận" value={d.pendingBookings} color="bg-yellow-500" />
        <StatCard icon={<CheckCircle2 className="h-4 w-4 text-white" />} label="Đã xác nhận" value={d.confirmedBookings} color="bg-sky-500" />
        <StatCard icon={<Award className="h-4 w-4 text-white" />} label="Hoàn thành" value={d.completedBookings} color="bg-emerald-500" />
        <StatCard icon={<XCircle className="h-4 w-4 text-white" />} label="Đã hủy" value={d.cancelledBookings} color="bg-red-500" />
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-500" /><h3 className="font-semibold text-slate-700">Tăng trưởng</h3></div>
          <p className="mt-2 text-sm text-slate-600">
            Hệ thống đã xử lý <strong>{d.totalBookings}</strong> đơn đặt tour với doanh thu <strong>{formatVND(d.totalRevenue)}</strong>.
            Tỷ lệ hoàn thành {d.totalBookings > 0 ? Math.round((d.completedBookings / d.totalBookings) * 100) : 0}%.
          </p>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-slate-700">Khách hàng VIP</h3>
          <p className="mt-2 text-sm text-slate-600">
            Có <strong>{d.totalCustomers}</strong> khách hàng đã đăng ký.
            Hãy chăm sóc tốt để tăng tỷ lệ quay lại.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
