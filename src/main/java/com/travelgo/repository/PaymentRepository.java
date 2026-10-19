package com.travelgo.repository;

import com.travelgo.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findTopByBookingIdOrderByCreatedAtDesc(Long bookingId);
    List<Payment> findByBookingId(Long bookingId);
}
