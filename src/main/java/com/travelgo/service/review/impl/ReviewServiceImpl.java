package com.travelgo.service.review.impl;

import com.travelgo.common.enums.BookingStatus;
import com.travelgo.common.enums.ReviewStatus;
import com.travelgo.dto.review.ReviewRequest;
import com.travelgo.dto.review.ReviewResponse;
import com.travelgo.entity.Booking;
import com.travelgo.entity.Review;
import com.travelgo.entity.Tour;
import com.travelgo.exception.BusinessException;
import com.travelgo.exception.ResourceNotFoundException;
import com.travelgo.repository.BookingRepository;
import com.travelgo.repository.ReviewRepository;
import com.travelgo.security.SecurityUtils;
import com.travelgo.service.review.ReviewService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;

    public ReviewServiceImpl(ReviewRepository reviewRepository, BookingRepository bookingRepository) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
    }

    @Override
    public List<ReviewResponse> byTour(Long tourId) {
        return reviewRepository.findByTourIdAndStatusOrderByCreatedAtDesc(tourId, ReviewStatus.VISIBLE)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<ReviewResponse> adminAll() {
        return reviewRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public ReviewResponse create(ReviewRequest request) {
        Booking booking = bookingRepository.findByIdAndUserId(request.getBookingId(), SecurityUtils.currentUserId())
                .orElseThrow(() -> new BusinessException("Chỉ được đánh giá tour đã đặt"));
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new BusinessException("Chỉ đánh giá sau khi hoàn thành tour");
        }
        if (reviewRepository.existsByBookingId(booking.getId())) {
            throw new BusinessException("Booking này đã được đánh giá");
        }
        Review review = Review.builder()
                .user(booking.getUser())
                .tour(booking.getTour())
                .booking(booking)
                .rating(request.getRating())
                .comment(request.getComment())
                .status(ReviewStatus.VISIBLE)
                .build();
        reviewRepository.save(review);
        refreshTourRating(booking.getTour());
        return toResponse(review);
    }

    @Override
    @Transactional
    public ReviewResponse changeVisibility(Long id, ReviewStatus status) {
        Review review = find(id);
        review.setStatus(status);
        refreshTourRating(review.getTour());
        return toResponse(review);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Review review = find(id);
        Tour tour = review.getTour();
        reviewRepository.delete(review);
        refreshTourRating(tour);
    }

    private void refreshTourRating(Tour tour) {
        List<Review> visible = reviewRepository.findByTourIdAndStatusOrderByCreatedAtDesc(tour.getId(), ReviewStatus.VISIBLE);
        tour.setReviewCount(visible.size());
        if (visible.isEmpty()) {
            tour.setAverageRating(BigDecimal.ZERO);
            return;
        }
        double avg = visible.stream().mapToInt(Review::getRating).average().orElse(0);
        tour.setAverageRating(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
    }

    private Review find(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đánh giá không tồn tại"));
    }

    @Override
    public ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .tourId(review.getTour() != null ? review.getTour().getId() : null)
                .tourName(review.getTour() != null ? review.getTour().getName() : null)
                .userName(review.getUser() != null ? review.getUser().getFullName() : null)
                .rating(review.getRating())
                .comment(review.getComment())
                .status(review.getStatus())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
