import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useLocation } from 'react-router-dom';
import App from './App';
import { AuthProvider } from '@/context/AuthContext';
import { AdminAuthProvider } from '@/admin/AdminAuthContext';
import './index.css';

/**
 * Root component - Quyết định wrap với provider nào
 * dựa vào URL hiện tại:
 * - /admin-portal/* → AdminAuthProvider (riêng admin)
 * - /            → AuthProvider (client)
 */
const Root = () => {
  const location = useLocation();
  const isAdminPortal = location.pathname.startsWith('/admin-portal');

  if (isAdminPortal) {
    return (
      <AdminAuthProvider>
        <App />
      </AdminAuthProvider>
    );
  }
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </StrictMode>
);
