package com.travelgo.repository;

import com.travelgo.common.enums.BookingStatus;
import com.travelgo.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"tour", "schedule", "coupon", "user"})
    Page<Booking> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Optional<Booking> findByIdAndUserId(Long id, Long userId);

    Optional<Booking> findByBookingCode(String bookingCode);

    boolean existsByUserIdAndTourIdAndStatus(Long userId, Long tourId, BookingStatus status);

    long countByStatus(BookingStatus status);

    long countByUserId(Long userId);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.status IN ('CONFIRMED', 'COMPLETED')")
    BigDecimal sumRevenue();

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"tour", "schedule", "coupon", "user"})
    Page<Booking> findByUserId(Long userId, Pageable pageable);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"tour", "schedule", "coupon", "user"})
    Page<Booking> findAll(Pageable pageable);
}
