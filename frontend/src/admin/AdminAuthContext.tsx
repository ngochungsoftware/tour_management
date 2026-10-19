import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { authApi } from '@/api/auth.api';
import { adminGet, adminTokenStorage, adminUserStorage, clearAdminAuth } from './adminClient';
import { UserResponse, LoginRequest } from '@/types';

interface AdminAuthState {
  user: UserResponse | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface AdminAuthContextValue extends AdminAuthState {
  login: (req: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

/**
 * AdminAuthProvider - Provider RIÊNG cho admin portal
 * - Lưu token riêng (travelgo_admin_token)
 * - Không chia sẻ state với client AuthContext
 * - Logout admin KHÔNG ảnh hưởng session client
 */
export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserResponse | null>(() =>
    adminUserStorage.get<UserResponse>(),
  );
  const [token, setToken] = useState<string | null>(() => adminTokenStorage.get());
  const [loading, setLoading] = useState<boolean>(!!adminTokenStorage.get());

  // Verify token khi mount - gọi endpoint admin (yêu cầu ADMIN role)
  useEffect(() => {
    const verify = async () => {
      if (!adminTokenStorage.get()) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }
      try {
        // Gọi 1 endpoint admin để verify token + role
        await adminGet('/dashboard');
        // Lưu user từ session nếu chưa có
        const stored = adminUserStorage.get<UserResponse>();
        if (stored) {
          setUser(stored);
        }
        setLoading(false);
      } catch {
        // Token invalid hoặc không phải admin
        clearAdminAuth();
        setUser(null);
        setToken(null);
        setLoading(false);
      }
    };
    verify();
  }, []);

  const login = useCallback(async (req: LoginRequest): Promise<void> => {
    // Login vẫn dùng endpoint client /auth/login
    // Sau đó verify role admin bằng cách gọi /admin/dashboard
    const res = await authApi.login(req);

    if (!res.user.roles?.includes('ADMIN')) {
      throw new Error('Tài khoản này không có quyền admin');
    }

    adminTokenStorage.set(res.token);
    adminUserStorage.set(res.user);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    clearAdminAuth();
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};
