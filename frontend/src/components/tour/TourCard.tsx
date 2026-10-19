import { Link } from 'react-router-dom';
import { TourResponse } from '@/types';
import { formatVND } from '@/utils/format';
import { Star, MapPin, Clock } from 'lucide-react';

interface Props {
  tour: TourResponse;
}

const TourCard = ({ tour }: Props) => (
  <Link
    to={`/tours/${tour.id}`}
    className="group block overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 transition hover:-translate-y-0.5 hover:shadow-md"
  >
    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
      {tour.coverImage ? (
        <img
          src={tour.coverImage}
          alt={tour.name}
          className="h-full w-full object-cover transition group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="grid h-full place-items-center text-4xl">🏝️</div>
      )}
      {tour.featured && (
        <span className="absolute left-3 top-3 badge-yellow">Nổi bật</span>
      )}
      {tour.originalPrice && tour.originalPrice > tour.adultPrice && (
        <span className="absolute right-3 top-3 badge-red">
          -{Math.round(((tour.originalPrice - tour.adultPrice) / tour.originalPrice) * 100)}%
        </span>
      )}
    </div>
    <div className="p-4">
      <h3 className="line-clamp-2 text-sm font-semibold text-slate-800 group-hover:text-brand-700">{tour.name}</h3>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        {tour.destinationName && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {tour.destinationName}
          </span>
        )}
        {tour.categoryName && <span>· {tour.categoryName}</span>}
      </div>
      <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" /> {tour.durationDays} ngày
        </span>
        {tour.reviewCount > 0 && (
          <span className="inline-flex items-center gap-1 text-amber-500">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {tour.averageRating.toFixed(1)} ({tour.reviewCount})
          </span>
        )}
      </div>
      <div className="mt-3 flex items-end gap-2">
        {tour.originalPrice && tour.originalPrice > tour.adultPrice && (
          <span className="text-xs text-slate-400 line-through">{formatVND(tour.originalPrice)}</span>
        )}
        <span className="text-base font-bold text-brand-700">{formatVND(tour.adultPrice)}</span>
        <span className="ml-auto text-xs text-slate-400">/khách</span>
      </div>
    </div>
  </Link>
);

export default TourCard;
