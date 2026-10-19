package com.travelgo.service.favorite;

import com.travelgo.dto.tour.TourResponse;

import java.util.List;

public interface FavoriteService {
    void add(Long tourId);
    void remove(Long tourId);
    List<TourResponse> myFavorites();
}
