import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import DashboardPage from '@/pages/admin/DashboardPage';
import AdminTourPage from '@/pages/admin/AdminTourPage';
import AdminBookingPage from '@/pages/admin/AdminBookingPage';
import AdminUserPage from '@/pages/admin/AdminUserPage';
import AdminStaffPage from '@/pages/admin/AdminStaffPage';
import AdminCatalogPage from '@/pages/admin/AdminCatalogPage';
import AdminCouponPage from '@/pages/admin/AdminCouponPage';
import AdminReviewPage from '@/pages/admin/AdminReviewPage';
import AdminTourQaPage from '@/pages/admin/AdminTourQaPage';
import AdminTourTagPage from '@/pages/admin/AdminTourTagPage';
import AdminAttractionPage from '@/pages/admin/AdminAttractionPage';
import AdminDeparturePointPage from '@/pages/admin/AdminDeparturePointPage';
import AdminTransportModePage from '@/pages/admin/AdminTransportModePage';
import AdminAirlinePage from '@/pages/admin/AdminAirlinePage';
import AdminBannerPage from '@/pages/admin/AdminBannerPage';
import AdminLoginPage from './AdminLoginPage';
import { useAdminAuth } from './AdminAuthContext';
import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, LogIn } from 'lucide-react';

const Protected = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAdminAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100">
        <div className="text-sm text-slate-500">Đang tải...</div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/admin-portal/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
};

// Trang 403 - không đủ quyền (cho cả admin lẫn user thường cố truy cập)
const ForbiddenPage = () => {
  const { logout } = useAdminAuth();
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-6">
      <div className="max-w-md rounded-2xl bg-slate-800 p-8 text-center shadow-2xl">
        <ShieldAlert className="mx-auto h-16 w-16 text-amber-400" />
        <h1 className="mt-4 text-2xl font-bold text-white">403 - Truy cập bị từ chối</h1>
        <p className="mt-2 text-sm text-slate-400">
          Tài khoản của bạn không có quyền truy cập trang quản trị.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            to="/admin-portal/login"
            onClick={() => logout()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-900 hover:bg-amber-300"
          >
            <LogIn className="h-4 w-4" /> Đăng nhập admin
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-700 px-5 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-600"
          >
            Về trang khách
          </Link>
        </div>
      </div>
    </div>
  );
};

/**
 * AdminApp - Ứng dụng admin HOÀN TOÀN ĐỘC LẬP với client
 * - Mount tại /admin-portal/*
 * - Có login page riêng
 * - Layout riêng (KHÔNG Header/Footer public)
 * - Auth riêng (AdminAuthProvider trong main.tsx)
 * - Token lưu key riêng
 */
const AdminApp = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Login route - không cần layout */}
        <Route path="login" element={<AdminLoginPage />} />

        {/* Trang 403 */}
        <Route path="403" element={<ForbiddenPage />} />

        {/* Tất cả admin pages trong AdminLayout */}
        <Route element={<Protected><AdminLayout /></Protected>}>
          <Route index element={<DashboardPage />} />
          <Route path="tours" element={<AdminTourPage />} />
          <Route path="bookings" element={<AdminBookingPage />} />
          <Route path="users" element={<AdminUserPage />} />
          <Route path="staff" element={<AdminStaffPage />} />
          <Route path="categories" element={<AdminCatalogPage />} />
          <Route path="destinations" element={<AdminCatalogPage />} />
          <Route path="coupons" element={<AdminCouponPage />} />
          <Route path="reviews" element={<AdminReviewPage />} />
          <Route path="tour-qa" element={<AdminTourQaPage />} />
          <Route path="tour-tags" element={<AdminTourTagPage />} />
          <Route path="attractions" element={<AdminAttractionPage />} />
          <Route path="departure-points" element={<AdminDeparturePointPage />} />
          <Route path="transport-modes" element={<AdminTransportModePage />} />
          <Route path="airlines" element={<AdminAirlinePage />} />
          <Route path="banners" element={<AdminBannerPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/admin-portal" replace />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default AdminApp;
