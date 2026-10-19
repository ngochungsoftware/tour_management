package com.travelgo.controller;

import com.travelgo.common.enums.TourStatus;
import com.travelgo.dto.tour.TourDetailResponse;
import com.travelgo.dto.tour.TourResponse;
import com.travelgo.service.tour.TourService;
import com.travelgo.util.ApiResponse;
import com.travelgo.util.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tours")
public class TourController {

    private final TourService tourService;

    public TourController(TourService tourService) {
        this.tourService = tourService;
    }

    @GetMapping
    public ApiResponse<PageResponse<TourResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long destinationId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer durationDays,
            @RequestParam(required = false) LocalDate departureDate,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) Boolean discount,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        return ApiResponse.ok(tourService.search(keyword, categoryId, destinationId, minPrice, maxPrice,
                durationDays, departureDate, TourStatus.ACTIVE, featured, discount, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<TourDetailResponse> detail(@PathVariable Long id) {
        return ApiResponse.ok(tourService.getDetail(id));
    }

    @GetMapping("/{id}/related")
    public ApiResponse<List<TourResponse>> related(@PathVariable Long id) {
        return ApiResponse.ok(tourService.related(id));
    }
}
