import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { favoriteApi } from '@/api/favorite.api';
import { useAsync } from '@/hooks/useAsync';
import { TourResponse } from '@/types';
import { EmptyState } from '@/components/ui/Feedback';
import { Spinner } from '@/components/ui/Feedback';
import TourCard from '@/components/tour/TourCard';
import { useAuth } from '@/context/AuthContext';

const FavoritesPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const favorites = useAsync<TourResponse[]>(() => favoriteApi.myFavorites(), []);

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth/login');
  }, [isAuthenticated, navigate]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Tour yêu thích ❤️</h1>
      {favorites.loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : favorites.data && favorites.data.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {favorites.data.map((t) => (
            <TourCard key={t.id} tour={t} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Chưa có tour yêu thích nào"
          description="Hãy thêm những tour bạn thích vào danh sách yêu thích."
          action={<Link to="/tours" className="btn-primary">Khám phá tour</Link>}
        />
      )}
    </div>
  );
};

export default FavoritesPage;
