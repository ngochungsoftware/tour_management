package com.travelgo.service.favorite.impl;

import com.travelgo.dto.tour.TourResponse;
import com.travelgo.entity.Favorite;
import com.travelgo.entity.Tour;
import com.travelgo.entity.User;
import com.travelgo.exception.BadRequestException;
import com.travelgo.exception.ResourceNotFoundException;
import com.travelgo.repository.FavoriteRepository;
import com.travelgo.repository.TourRepository;
import com.travelgo.repository.UserRepository;
import com.travelgo.security.SecurityUtils;
import com.travelgo.service.favorite.FavoriteService;
import com.travelgo.service.tour.TourService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final TourRepository tourRepository;
    private final UserRepository userRepository;
    private final TourService tourService;

    public FavoriteServiceImpl(FavoriteRepository favoriteRepository,
                               TourRepository tourRepository,
                               UserRepository userRepository,
                               TourService tourService) {
        this.favoriteRepository = favoriteRepository;
        this.tourRepository = tourRepository;
        this.userRepository = userRepository;
        this.tourService = tourService;
    }

    @Override
    @Transactional
    public void add(Long tourId) {
        Long userId = SecurityUtils.currentUserId();
        if (favoriteRepository.existsByUserIdAndTourId(userId, tourId)) {
            throw new BadRequestException("Tour đã nằm trong danh sách yêu thích");
        }
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new ResourceNotFoundException("Tour không tồn tại"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));
        favoriteRepository.save(Favorite.builder().user(user).tour(tour).build());
    }

    @Override
    @Transactional
    public void remove(Long tourId) {
        favoriteRepository.deleteByUserIdAndTourId(SecurityUtils.currentUserId(), tourId);
    }

    @Override
    public List<TourResponse> myFavorites() {
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(SecurityUtils.currentUserId()).stream()
                .map(Favorite::getTour)
                .map(tourService::toResponse)
                .toList();
    }
}
