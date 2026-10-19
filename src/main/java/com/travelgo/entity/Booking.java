package com.travelgo.entity;

import com.travelgo.common.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "BOOKINGS")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "booking_seq")
    @SequenceGenerator(name = "booking_seq", sequenceName = "SEQ_BOOKINGS", allocationSize = 1)
    private Long id;

    @Column(name = "BOOKING_CODE", nullable = false, unique = true, length = 30)
    private String bookingCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TOUR_ID", nullable = false)
    private Tour tour;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SCHEDULE_ID", nullable = false)
    private TourSchedule schedule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COUPON_ID")
    private Coupon coupon;

    @Column(name = "ADULT_COUNT", nullable = false)
    private Integer adultCount;

    @Column(name = "CHILD_COUNT", nullable = false)
    @Builder.Default
    private Integer childCount = 0;

    @Column(name = "INFANT_COUNT", nullable = false)
    @Builder.Default
    private Integer infantCount = 0;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "DISCOUNT_AMOUNT", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "TOTAL_AMOUNT", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BookingGuest> guests = new ArrayList<>();

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Payment> payments = new ArrayList<>();

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = BookingStatus.PENDING;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public int totalPeople() {
        return adultCount + childCount + infantCount;
    }
}
