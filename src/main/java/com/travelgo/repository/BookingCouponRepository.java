package com.travelgo.repository;

import com.travelgo.entity.BookingCoupon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingCouponRepository extends JpaRepository<BookingCoupon, Long> {
    List<BookingCoupon> findByBooking_Id(Long bookingId);
}
