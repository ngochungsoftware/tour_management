package com.travelgo.controller;

import com.travelgo.dto.tour.TourResponse;
import com.travelgo.service.favorite.FavoriteService;
import com.travelgo.util.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @GetMapping
    public ApiResponse<List<TourResponse>> myFavorites() {
        return ApiResponse.ok(favoriteService.myFavorites());
    }

    @PostMapping("/{tourId}")
    public ApiResponse<Void> add(@PathVariable Long tourId) {
        favoriteService.add(tourId);
        return ApiResponse.message("Đã thêm vào yêu thích");
    }

    @DeleteMapping("/{tourId}")
    public ApiResponse<Void> remove(@PathVariable Long tourId) {
        favoriteService.remove(tourId);
        return ApiResponse.message("Đã xóa khỏi yêu thích");
    }
}
