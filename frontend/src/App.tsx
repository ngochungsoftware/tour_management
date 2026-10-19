import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import HomePage from '@/pages/home/HomePage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import TourListPage from '@/pages/tour/TourListPage';
import TourDetailPage from '@/pages/tour/TourDetailPage';
import BookingPage from '@/pages/booking/BookingPage';
import MyBookingsPage from '@/pages/booking/MyBookingsPage';
import BookingDetailPage from '@/pages/booking/BookingDetailPage';
import ProfilePage from '@/pages/profile/ProfilePage';
import FavoritesPage from '@/pages/favorite/FavoritesPage';
import MyQuestionsPage from '@/pages/qa/MyQuestionsPage';
import QaSearchPage from '@/pages/qa/QaSearchPage';
import NotFoundPage from '@/pages/notFound/NotFoundPage';
import AdminApp from '@/admin/AdminApp';
import { useAuth } from '@/context/AuthContext';
import { ReactNode } from 'react';

const Protected = ({ children, admin = false }: { children: ReactNode; admin?: boolean }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  if (admin && !isAdmin) return <Navigate to="/admin-portal/403" replace />;
  return <>{children}</>;
};

/**
 * App chính cho client
 * - KHÔNG BAO GỒM admin routes
 * - Admin ở một app riêng tại /admin-portal/*
 */
const App = () => {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <ErrorBoundary>
        <Routes>
          {/* Admin Portal - App riêng biệt hoàn toàn */}
          <Route path="/admin-portal/*" element={<AdminApp />} />

          {/* Auth routes - không có Header/Footer */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot" element={<ForgotPasswordPage />} />

          {/* Client routes với Header/Footer */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/tours" element={<TourListPage />} />
            <Route path="/tours/:id" element={<TourDetailPage />} />
            <Route path="/booking" element={<Protected><BookingPage /></Protected>} />
            <Route path="/bookings/my" element={<Protected><MyBookingsPage /></Protected>} />
            <Route path="/bookings/my/:id" element={<Protected><BookingDetailPage /></Protected>} />
            <Route path="/favorites" element={<Protected><FavoritesPage /></Protected>} />
            <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
            <Route path="/qa/my" element={<Protected><MyQuestionsPage /></Protected>} />
            <Route path="/qa/search" element={<QaSearchPage />} />

            {/* Redirect /admin cũ sang /admin-portal để tương thích */}
            <Route path="/admin" element={<Navigate to="/admin-portal" replace />} />
            <Route path="/admin/*" element={<Navigate to="/admin-portal" replace />} />

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </>
  );
};

export default App;
