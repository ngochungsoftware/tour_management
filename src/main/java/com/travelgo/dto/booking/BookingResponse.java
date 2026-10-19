package com.travelgo.dto.booking;

import com.travelgo.common.enums.BookingStatus;
import com.travelgo.dto.payment.PaymentResponse;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class BookingResponse {
    private Long id;
    private String bookingCode;
    private Long tourId;
    private String tourName;
    private String tourCode;
    private LocalDate departureDate;
    private Integer adultCount;
    private Integer childCount;
    private Integer infantCount;
    private Integer totalPeople;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String couponCode;
    private BookingStatus status;
    private LocalDateTime createdAt;
    private List<GuestResponse> guests;
    private List<PaymentResponse> payments;
}
