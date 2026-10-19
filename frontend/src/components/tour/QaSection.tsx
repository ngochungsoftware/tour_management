import { useState } from 'react';
import { Link } from 'react-router-dom';
import { tourQaApi } from '@/api/tourqa.api';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/context/AuthContext';
import { timeAgo, formatDateTime } from '@/utils/format';
import { Spinner, EmptyState } from '@/components/ui/Feedback';
import {
  MessageCircle,
  Send,
  CheckCircle2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Reply,
  Award,
  HelpCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { QaReplyResponse, TourQaResponse } from '@/types';

interface QaSectionProps {
  tourId: number;
  tourName?: string;
}

/**
 * Component Hỏi đáp nhúng vào trang chi tiết tour.
 * - Public xem
 * - User đăng nhập để hỏi & trả lời
 * - Chủ câu hỏi hoặc admin đánh dấu câu trả lời hay
 */
const QaSection = ({ tourId, tourName }: QaSectionProps) => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const [page, setPage] = useState(0);
  const size = 5;
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [questionText, setQuestionText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const apiResult = useAsync(
    () => tourQaApi.byTour(tourId, page, size),
    [tourId, page]
  );
  const data = apiResult.data;
  const loading = apiResult.loading;
  const refetch = apiResult.refetch;

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đặt câu hỏi');
      return;
    }
    const text = questionText.trim();
    if (!text) return;
    if (text.length < 10) {
      toast.error('Câu hỏi phải có ít nhất 10 ký tự');
      return;
    }
    setSubmitting(true);
    try {
      await tourQaApi.create({ tourId, question: text });
      setQuestionText('');
      setPage(0);
      refetch();
      toast.success('Đã đặt câu hỏi');
    } catch {
      /* toast handled by interceptor */
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa câu hỏi này?')) return;
    try {
      await tourQaApi.deleteMyQuestion(id);
      refetch();
      toast.success('Đã xóa');
    } catch {
      /* handled */
    }
  };

  const totalPages = data?.totalPages ?? 0;
  const qas = data?.content ?? [];

  return (
    <div className="card mt-6 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <HelpCircle className="h-5 w-5 text-brand-600" />
          Hỏi đáp về tour
          {tourName && <span className="text-sm font-normal text-slate-500">· {tourName}</span>}
        </h2>
        <span className="text-sm text-slate-500">
          {data?.totalElements ?? 0} câu hỏi
        </span>
      </div>

      {/* Form đặt câu hỏi */}
      {isAuthenticated ? (
        <form onSubmit={handleAsk} className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-start gap-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
              {user?.fullName?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1">
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Bạn có thắc mắc gì về tour này? (tối thiểu 10 ký tự)"
                rows={2}
                maxLength={1000}
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                disabled={submitting}
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-slate-400">{questionText.length}/1000</span>
                <button
                  type="submit"
                  disabled={submitting || questionText.trim().length < 10}
                  className="btn-primary inline-flex items-center gap-1 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  Gửi câu hỏi
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-600">
          <Link to="/auth/login" className="font-semibold text-brand-600 hover:underline">
            Đăng nhập
          </Link>{' '}
          để đặt câu hỏi hoặc trả lời.
        </div>
      )}

      {/* Danh sách câu hỏi */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner className="h-6 w-6" />
        </div>
      ) : qas.length === 0 ? (
        <EmptyState
          title="Chưa có câu hỏi nào"
          description="Hãy là người đầu tiên đặt câu hỏi về tour này."
        />
      ) : (
        <div className="space-y-3">
          {qas.map((q) => (
            <QaItem
              key={q.id}
              qa={q}
              expanded={expanded.has(q.id)}
              onToggle={() => toggleExpand(q.id)}
              onDelete={() => handleDelete(q.id)}
              onChange={() => refetch()}
              currentUserId={user?.id}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="btn-ghost px-3 py-1.5 text-sm disabled:opacity-50"
          >
            ← Trước
          </button>
          <span className="text-sm text-slate-600">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="btn-ghost px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
};

interface QaItemProps {
  qa: TourQaResponse;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onChange: () => void;
  currentUserId?: number;
  isAdmin: boolean;
}

const QaItem = ({ qa, expanded, onToggle, onDelete, onChange, currentUserId, isAdmin }: QaItemProps) => {
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isOwner = currentUserId === qa.userId;
  const canManage = isOwner || isAdmin;

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = replyText.trim();
    if (!text) return;
    setSubmitting(true);
    try {
      await tourQaApi.reply({ qaId: qa.id, reply: text });
      setReplyText('');
      onChange();
      toast.success('Đã gửi trả lời');
    } catch {
      /* handled */
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReply = async (replyId: number) => {
    if (!confirm('Xóa trả lời này?')) return;
    try {
      await tourQaApi.deleteMyReply(replyId);
      onChange();
      toast.success('Đã xóa');
    } catch {
      /* handled */
    }
  };

  const handleMarkAnswer = async (replyId: number) => {
    try {
      await tourQaApi.markAnswer(replyId);
      onChange();
      toast.success('Đã đánh dấu là câu trả lời hay');
    } catch {
      /* handled */
    }
  };

  const handleUnmarkAnswer = async (replyId: number) => {
    try {
      await tourQaApi.unmarkAnswer(replyId);
      onChange();
      toast.success('Đã bỏ đánh dấu');
    } catch {
      /* handled */
    }
  };

  // Lấy replies (nếu đã load sẵn thì dùng, nếu chưa thì fetch on expand)
  const replies = qa.replies;

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-start gap-3 p-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
          {qa.userAvatar ? (
            <img src={qa.userAvatar} alt={qa.userName} className="h-full w-full rounded-full object-cover" />
          ) : (
            qa.userName?.[0]?.toUpperCase() ?? '?'
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-800">{qa.userName}</span>
            <span className="text-xs text-slate-400">· {timeAgo(qa.createdAt)}</span>
            {qa.replyCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                <MessageCircle className="h-3 w-3" /> {qa.replyCount}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-700">{qa.question}</p>

          <div className="mt-2 flex items-center gap-3 text-xs">
            <button
              onClick={onToggle}
              className="inline-flex items-center gap-1 font-medium text-brand-600 hover:underline"
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? 'Ẩn trả lời' : qa.replyCount > 0 ? `Xem ${qa.replyCount} trả lời` : 'Trả lời'}
            </button>
            {canManage && (
              <button
                onClick={onDelete}
                className="inline-flex items-center gap-1 text-red-500 hover:underline"
              >
                <Trash2 className="h-3 w-3" /> Xóa
              </button>
            )}
          </div>

          {expanded && (
            <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
              {replies && replies.length > 0 ? (
                replies.map((r) => (
                  <ReplyItem
                    key={r.id}
                    reply={r}
                    qaOwnerId={qa.userId}
                    currentUserId={currentUserId}
                    isAdmin={isAdmin}
                    onDelete={() => handleDeleteReply(r.id)}
                    onMark={() => handleMarkAnswer(r.id)}
                    onUnmark={() => handleUnmarkAnswer(r.id)}
                  />
                ))
              ) : (
                <p className="text-xs text-slate-500">Chưa có trả lời nào.</p>
              )}

              {/* Form trả lời */}
              <form onSubmit={handleReply} className="flex items-start gap-2 pt-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Viết trả lời của bạn..."
                  rows={2}
                  maxLength={2000}
                  className="flex-1 resize-none rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
                  disabled={submitting}
                />
                <button
                  type="submit"
                  disabled={submitting || !replyText.trim()}
                  className="btn-primary inline-flex items-center gap-1 px-3 py-1.5 text-sm disabled:opacity-50"
                  title="Gửi trả lời"
                >
                  <Reply className="h-3.5 w-3.5" /> Gửi
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ReplyItemProps {
  reply: QaReplyResponse;
  qaOwnerId: number;
  currentUserId?: number;
  isAdmin: boolean;
  onDelete: () => void;
  onMark: () => void;
  onUnmark: () => void;
}

const ReplyItem = ({ reply, qaOwnerId, currentUserId, isAdmin, onDelete, onMark, onUnmark }: ReplyItemProps) => {
  const isOwner = currentUserId === reply.userId;
  const canManage = isOwner || isAdmin;
  const canMark = currentUserId === qaOwnerId || isAdmin;

  return (
    <div
      className={`rounded-lg p-3 ${
        reply.isAnswer ? 'border border-amber-300 bg-amber-50' : 'bg-slate-50'
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
          {reply.userAvatar ? (
            <img src={reply.userAvatar} alt={reply.userName} className="h-full w-full rounded-full object-cover" />
          ) : (
            reply.userName?.[0]?.toUpperCase() ?? '?'
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700">{reply.userName}</span>
            <span className="text-slate-400">· {timeAgo(reply.createdAt)}</span>
            {reply.isAnswer && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-200 px-2 py-0.5 font-semibold text-amber-800">
                <Award className="h-3 w-3" /> Câu trả lời hay
              </span>
            )}
          </div>
          <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{reply.reply}</p>

          <div className="mt-1 flex items-center gap-2 text-xs">
            {canMark && !reply.isAnswer && (
              <button
                onClick={onMark}
                className="inline-flex items-center gap-1 font-medium text-amber-600 hover:underline"
                title="Đánh dấu là câu trả lời hay"
              >
                <CheckCircle2 className="h-3 w-3" /> Đánh dấu hay
              </button>
            )}
            {canMark && reply.isAnswer && (
              <button onClick={onUnmark} className="font-medium text-slate-500 hover:underline">
                Bỏ đánh dấu
              </button>
            )}
            {canManage && (
              <button onClick={onDelete} className="text-red-500 hover:underline">
                Xóa
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QaSection;
