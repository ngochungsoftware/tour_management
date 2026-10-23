import { useMemo, useState } from 'react';
import { adminApi } from '@/api/admin.api';
import { useAsync } from '@/hooks/useAsync';
import { PageResponse, RoleName, UserCreateRequest, UserResponse } from '@/types';
import { Spinner, EmptyState } from '@/components/ui/Feedback';
import ConfirmModal from '@/components/ui/ConfirmModal';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Search,
  Lock,
  Unlock,
  ShieldCheck,
  UserCog,
} from 'lucide-react';
import toast from 'react-hot-toast';

type ModalMode = 'create' | 'edit' | null;

interface UserFormState {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  gender: '' | 'MALE' | 'FEMALE' | 'OTHER';
  status: 'ACTIVE' | 'LOCKED';
  roles: RoleName[];
}

const EMPTY_FORM: UserFormState = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  address: '',
  gender: '',
  status: 'ACTIVE',
  roles: [],
};

/**
 * UserManagementPage - dùng chung cho màn "Nhân viên" và màn "Khách hàng".
 *
 * - `mode='staff'`    : tài khoản nội bộ (ADMIN/STAFF), quản lý đầy đủ CRUD.
 * - `mode='customer'` : tài khoản CUSTOMER, quản lý đầy đủ CRUD.
 *
 * Cả hai dùng chung bảng + modal, chỉ khác danh sách role được phép chọn.
 */
interface UserManagementPageProps {
  mode: 'staff' | 'customer';
}

const UserManagementPage = ({ mode }: UserManagementPageProps) => {
  const isStaff = mode === 'staff';

  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | 'ACTIVE' | 'LOCKED'>('');
  const [page, setPage] = useState(0);

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editing, setEditing] = useState<UserResponse | null>(null);
  const [form, setForm] = useState<UserFormState>(EMPTY_FORM);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const users = useAsync<PageResponse<UserResponse>>(
    () =>
      isStaff
        ? adminApi.staff(keyword, statusFilter || undefined, page, 10)
        : adminApi.customers(keyword, statusFilter || undefined, page, 10),
    [keyword, statusFilter, page, mode],
  );

  const roleOptions = useMemo<RoleName[]>(
    () => (isStaff ? ['ADMIN', 'STAFF'] : ['CUSTOMER']),
    [isStaff],
  );

  const title = isStaff ? 'Quản lý nhân viên' : 'Quản lý khách hàng';
  const searchPlaceholder = isStaff
    ? 'Tìm theo tên, email hoặc SĐT...'
    : 'Tìm khách hàng theo tên, email hoặc SĐT...';

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, roles: isStaff ? ['STAFF'] : ['CUSTOMER'] });
    setModalMode('create');
  };

  const openEdit = (u: UserResponse) => {
    setEditing(u);
    setForm({
      fullName: u.fullName,
      email: u.email,
      password: '',
      phone: u.phone ?? '',
      address: u.address ?? '',
      gender: (u.gender as UserFormState['gender']) ?? '',
      status: (u.status as 'ACTIVE' | 'LOCKED') ?? 'ACTIVE',
      roles: (u.roles ?? []).filter((r): r is RoleName =>
        (['ADMIN', 'STAFF', 'CUSTOMER'] as string[]).includes(r),
      ),
    });
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const toggleRole = (role: RoleName) => {
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(role)
        ? f.roles.filter((r) => r !== role)
        : [...f.roles, role],
    }));
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.roles.length === 0) {
      toast.error('Vui lòng chọn ít nhất một vai trò');
      return;
    }
    setSaving(true);
    try {
      const body: UserCreateRequest = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        gender: form.gender || undefined,
        status: form.status,
        roles: form.roles,
      };

      if (modalMode === 'edit' && editing) {
        if (isStaff) await adminApi.updateStaff(editing.id, body);
        else await adminApi.updateCustomer(editing.id, body);
        toast.success('Đã cập nhật');
      } else {
        if (isStaff) await adminApi.createStaff(body);
        else await adminApi.createCustomer(body);
        toast.success('Đã tạo tài khoản');
      }
      closeModal();
      users.refetch();
    } catch {
      /* handled by interceptor */
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (deletingId === null) return;
    const id = deletingId;
    setDeletingId(null);
    try {
      if (isStaff) await adminApi.deleteStaff(id);
      else await adminApi.deleteCustomer(id);
      users.refetch();
      toast.success('Đã xóa tài khoản');
    } catch {
      /* handled by interceptor */
    }
  };

  const toggleLock = async (u: UserResponse) => {
    try {
      if (u.status === 'LOCKED') {
        await adminApi.unlockUser(u.id);
        toast.success(`Đã mở khóa ${u.fullName}`);
      } else {
        await adminApi.lockUser(u.id);
        toast.success(`Đã khóa ${u.fullName}`);
      }
      users.refetch();
    } catch {
      /* handled */
    }
  };

  const isLocked = (u: UserResponse) => u.status === 'LOCKED';

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        <span className="badge-blue">
          {users.data ? users.data.totalElements : 0} tài khoản
        </span>
      </div>

      <div className="card mb-4 flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(0);
            }}
            placeholder={searchPlaceholder}
            className="input pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as '' | 'ACTIVE' | 'LOCKED');
            setPage(0);
          }}
          className="input w-auto"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="LOCKED">Đã khóa</option>
        </select>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="h-4 w-4" />
          Thêm {isStaff ? 'nhân viên' : 'khách hàng'}
        </button>
      </div>

      {users.loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : users.data && users.data.content.length > 0 ? (
        <>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Họ tên</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">SĐT</th>
                  <th className="px-4 py-3">Vai trò</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.data.content.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500">{u.id}</td>
                    <td className="px-4 py-3 font-medium">{u.fullName}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{u.email}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {u.phone || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {(u.roles ?? []).map((r) => (
                        <span key={r} className="badge-blue mr-1">
                          {r}
                        </span>
                      ))}
                    </td>
                    <td className="px-4 py-3">
                      {isLocked(u) ? (
                        <span className="badge-red">LOCKED</span>
                      ) : (
                        <span className="badge-green">ACTIVE</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleLock(u)}
                        title={isLocked(u) ? 'Mở khóa' : 'Khóa tài khoản'}
                        className="rounded p-1 text-slate-600 hover:bg-slate-100"
                      >
                        {isLocked(u) ? (
                          <Unlock className="h-4 w-4" />
                        ) : (
                          <Lock className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => openEdit(u)}
                        title="Sửa"
                        className="ml-1 rounded p-1 text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(u.id)}
                        title="Xóa"
                        className="ml-1 rounded p-1 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                disabled={users.data.page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="btn-secondary"
              >
                ← Trước
              </button>
              <span className="text-sm text-slate-500">
                {users.data.page + 1} / {users.data.totalPages}
              </span>
              <button
                disabled={users.data.last}
                onClick={() => setPage((p) => p + 1)}
                className="btn-secondary"
              >
                Sau →
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title={isStaff ? 'Chưa có nhân viên' : 'Chưa có khách hàng'}
          description={
            isStaff
              ? 'Thêm tài khoản nhân viên để giao quyền xử lý đơn, tour, hỏi đáp.'
              : 'Tài khoản khách hàng sẽ xuất hiện ở đây khi họ đăng ký.'
          }
          action={
            <button onClick={openAdd} className="btn-primary">
              <Plus className="h-4 w-4" />
              Thêm {isStaff ? 'nhân viên' : 'khách hàng'}
            </button>
          }
        />
      )}

      {/* ===== Modal thêm / sửa ===== */}
      {modalMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeModal}
        >
          <div
            className="card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold">
                {modalMode === 'edit' ? 'Cập nhật' : 'Thêm'}{' '}
                {isStaff ? 'nhân viên' : 'khách hàng'}
              </h3>
              <button onClick={closeModal} type="button">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={onSave} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Họ tên *</label>
                <input
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="input"
                  placeholder="vd: Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">Email *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input"
                  placeholder="vd: staff@travelgo.com"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">
                  Mật khẩu {modalMode === 'edit' ? '(để trống = giữ nguyên)' : '*'}
                </label>
                <input
                  type="password"
                  required={modalMode === 'create'}
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input"
                  placeholder="Tối thiểu 6 ký tự"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600">Số điện thoại</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="input"
                    placeholder="0900000000"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Giới tính</label>
                  <select
                    value={form.gender}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        gender: e.target.value as UserFormState['gender'],
                      })
                    }
                    className="input"
                  >
                    <option value="">-- Chọn --</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">Địa chỉ</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="input"
                  placeholder="Hà Nội"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">Vai trò *</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {roleOptions.map((r) => {
                    const active = form.roles.includes(r);
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => toggleRole(r)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                          active
                            ? 'border-brand-500 bg-brand-50 text-brand-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {r === 'ADMIN' ? (
                          <ShieldCheck className="h-3.5 w-3.5" />
                        ) : (
                          <UserCog className="h-3.5 w-3.5" />
                        )}
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">Trạng thái</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as 'ACTIVE' | 'LOCKED',
                    })
                  }
                  className="input"
                >
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="LOCKED">Đã khóa</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Hủy
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  <Save className="h-4 w-4" />
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={deletingId !== null}
        title={`Xóa ${isStaff ? 'nhân viên' : 'khách hàng'}?`}
        description="Hành động này không thể hoàn tác. Nếu tài khoản còn dữ liệu liên quan, hệ thống sẽ yêu cầu khóa thay vì xóa."
        confirmText="Xóa"
        onConfirm={onDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};

export default UserManagementPage;
