import { get, post } from './client';
import { TourResponse } from '@/types';

export const favoriteApi = {
  myFavorites: () => get<TourResponse[]>('/favorites'),
  add: (tourId: number) => post<void>(`/favorites/${tourId}`),
  remove: (tourId: number) =>
    fetch(`/api/v1/favorites/${tourId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('travelgo_token') ?? ''}` },
    }).then((r) => r.json()),
};
