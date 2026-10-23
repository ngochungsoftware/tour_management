package com.travelgo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "BOOKING_COUPONS")
public class BookingCoupon {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "booking_coupon_seq")
    @SequenceGenerator(name = "booking_coupon_seq", sequenceName = "SEQ_BOOKING_COUPONS", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BOOKING_ID", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COUPON_ID", nullable = false)
    private Coupon coupon;

    @Column(name = "DISCOUNT_AMOUNT", nullable = false, precision = 14, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "APPLIED_AT", nullable = false)
    private LocalDateTime appliedAt;

    @PrePersist
    void prePersist() {
        if (appliedAt == null) appliedAt = LocalDateTime.now();
    }
}
