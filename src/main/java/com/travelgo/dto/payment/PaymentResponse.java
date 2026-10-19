package com.travelgo.dto.payment;

import com.travelgo.common.enums.PaymentMethod;
import com.travelgo.common.enums.PaymentStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class PaymentResponse {
    private Long id;
    private Long bookingId;
    private String bookingCode;
    private PaymentMethod method;
    private BigDecimal amount;
    private PaymentStatus status;
    private String transactionRef;
    private LocalDateTime paidAt;
}
