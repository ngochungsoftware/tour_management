package com.travelgo.service.review;

import com.travelgo.common.enums.ReviewStatus;
import com.travelgo.dto.review.ReviewRequest;
import com.travelgo.dto.review.ReviewResponse;
import com.travelgo.entity.Review;

import java.util.List;

public interface ReviewService {
    List<ReviewResponse> byTour(Long tourId);
    List<ReviewResponse> adminAll();
    ReviewResponse create(ReviewRequest request);
    ReviewResponse changeVisibility(Long id, ReviewStatus status);
    void delete(Long id);
    ReviewResponse toResponse(Review review);

    /**
     * Kiểm tra booking cụ thể đã được người dùng hiện tại đánh giá chưa.
     * Dùng cho màn chi tiết đơn để ẩn/hiện form đánh giá.
     */
    boolean hasReviewed(Long bookingId);
}
