package com.travelgo.repository;

import com.travelgo.common.enums.ReviewStatus;
import com.travelgo.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByBookingId(Long bookingId);
    long countByUserId(Long userId);
    List<Review> findByTourIdAndStatusOrderByCreatedAtDesc(Long tourId, ReviewStatus status);
    List<Review> findByTourIdOrderByCreatedAtDesc(Long tourId);
}
