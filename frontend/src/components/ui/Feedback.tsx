import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <Loader2 className={`animate-spin text-slate-500 ${className}`} />
);

export const FullPageSpinner = () => (
  <div className="flex h-screen items-center justify-center">
    <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
  </div>
);

export const EmptyState = ({ title, description, action }: { title: string; description?: string; action?: ReactNode }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
    <div className="mb-3 text-5xl">🗺️</div>
    <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
    {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const StatusBadge = ({ status, className = '' }: { status: string; className?: string }) => {
  const map: Record<string, string> = {
    PENDING: 'badge-yellow',
    CONFIRMED: 'badge-blue',
    COMPLETED: 'badge-green',
    CANCELLED: 'badge-red',
    PAID: 'badge-green',
    FAILED: 'badge-red',
    REFUNDED: 'badge-slate',
    ACTIVE: 'badge-green',
    INACTIVE: 'badge-slate',
    HIDDEN: 'badge-slate',
    OPEN: 'badge-green',
    CLOSED: 'badge-slate',
    VISIBLE: 'badge-green',
  };
  return <span className={`${map[status] || 'badge-slate'} ${className}`}>{status}</span>;
};
