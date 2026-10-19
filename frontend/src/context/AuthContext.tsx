import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { authApi } from '@/api/auth.api';
import { clearAuth, tokenStorage, userStorage } from '@/api/client';
import { AuthResponse, LoginRequest, RegisterRequest, UserResponse } from '@/types';

interface AuthState {
  user: UserResponse | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

interface AuthContextValue extends AuthState {
  login: (req: LoginRequest) => Promise<AuthResponse>;
  register: (req: RegisterRequest) => Promise<AuthResponse>;
  logout: () => void;
  refresh: () => Promise<void>;
  setUser: (user: UserResponse) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserResponse | null>(() => userStorage.get<UserResponse>());
  const [token, setToken] = useState<string | null>(() => tokenStorage.get());
  const [loading, setLoading] = useState<boolean>(!!tokenStorage.get());

  const refresh = useCallback(async () => {
    if (!tokenStorage.get()) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }
    try {
      const user = await authApi.me();
      setUser(user);
      userStorage.set(user);
    } catch {
      clearAuth();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (req: LoginRequest): Promise<AuthResponse> => {
    const res = await authApi.login(req);
    tokenStorage.set(res.token);
    userStorage.set(res.user);
    setToken(res.token);
    setUser(res.user);
    return res;
  }, []);

  const register = useCallback(async (req: RegisterRequest): Promise<AuthResponse> => {
    const res = await authApi.register(req);
    tokenStorage.set(res.token);
    userStorage.set(res.user);
    setToken(res.token);
    setUser(res.user);
    return res;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!user && !!token,
      isAdmin: !!user?.roles?.includes('ADMIN'),
      login,
      register,
      logout,
      refresh,
      setUser,
    }),
    [user, token, loading, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
