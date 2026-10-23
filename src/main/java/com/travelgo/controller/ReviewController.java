package com.travelgo.controller;

import com.travelgo.dto.review.ReviewRequest;
import com.travelgo.dto.review.ReviewResponse;
import com.travelgo.service.review.ReviewService;
import com.travelgo.util.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/tour/{tourId}")
    public ApiResponse<List<ReviewResponse>> byTour(@PathVariable Long tourId) {
        return ApiResponse.ok(reviewService.byTour(tourId));
    }

    /**
     * Kiểm tra người dùng hiện tại đã đánh giá booking này chưa.
     * Trả về { "reviewed": true/false }.
     */
    @GetMapping("/booking/{bookingId}/reviewed")
    public ApiResponse<Boolean> hasReviewed(@PathVariable Long bookingId) {
        return ApiResponse.ok(reviewService.hasReviewed(bookingId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ReviewResponse> create(@Valid @RequestBody ReviewRequest request) {
        return ApiResponse.ok("Đánh giá thành công", reviewService.create(request));
    }
}
