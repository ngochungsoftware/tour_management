import { useState } from 'react';
import { Link } from 'react-router-dom';
import { tourQaApi } from '@/api/tourqa.api';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/context/AuthContext';
import { timeAgo, formatDateTime } from '@/utils/format';
import { Spinner, EmptyState, StatusBadge } from '@/components/ui/Feedback';
import { HelpCircle, MessageCircle, Trash2, ExternalLink, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import type { TourQaResponse } from '@/types';

const MyQuestionsPage = () => {
  const { isAuthenticated } = useAuth();
  const [version, setVersion] = useState(0);
  const apiResult = useAsync(
    () => tourQaApi.myQuestions(),
    [version]
  );
  const data = apiResult.data;
  const loading = apiResult.loading;

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa câu hỏi này?')) return;
    try {
      await tourQaApi.deleteMyQuestion(id);
      setVersion((v) => v + 1);
      toast.success('Đã xóa');
    } catch {
      /* handled */
    }
  };

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Vui lòng đăng nhập"
        description="Bạn cần đăng nhập để xem câu hỏi của mình."
        action={
          <Link to="/auth/login" className="btn-primary">
            Đăng nhập
          </Link>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
          <HelpCircle className="h-6 w-6 text-brand-600" />
          Câu hỏi của tôi
        </h1>
        <Link to="/qa/search" className="btn-ghost text-sm">
          Tìm kiếm nâng cao
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner className="h-6 w-6" />
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="Bạn chưa đặt câu hỏi nào"
          description="Hãy khám phá các tour và đặt câu hỏi để được giải đáp."
          action={
            <Link to="/tours" className="btn-primary">
              Khám phá tour
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {data.map((q) => (
            <div key={q.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Link
                      to={`/tours/${q.tourId}`}
                      className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline"
                    >
                      {q.tourName}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <StatusBadge status={q.status} />
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <MessageCircle className="h-3 w-3" /> {q.replyCount} trả lời
                    </span>
                    {q.replies && q.replies.some((r) => r.isAnswer) && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                        <Award className="h-3 w-3" /> Có câu trả lời hay
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{q.question}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatDateTime(q.createdAt)} · {timeAgo(q.createdAt)}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Link
                    to={`/tours/${q.tourId}`}
                    className="rounded p-1 text-slate-600 hover:bg-slate-100"
                    title="Xem trong tour"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="rounded p-1 text-red-600 hover:bg-red-50"
                    title="Xóa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyQuestionsPage;
