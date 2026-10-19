package com.travelgo.service.payment;

import com.travelgo.dto.payment.PaymentResponse;
import com.travelgo.entity.Booking;
import com.travelgo.entity.Payment;

import java.util.List;

public interface PaymentService {
    PaymentResponse simulatePay(Long bookingId, boolean success);
    List<PaymentResponse> findAll();
    PaymentResponse toResponse(Payment payment, Booking booking);
}
