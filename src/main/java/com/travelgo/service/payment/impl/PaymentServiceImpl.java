package com.travelgo.service.payment.impl;

import com.travelgo.common.enums.BookingStatus;
import com.travelgo.common.enums.PaymentStatus;
import com.travelgo.dto.payment.PaymentResponse;
import com.travelgo.entity.Booking;
import com.travelgo.entity.Payment;
import com.travelgo.exception.BusinessException;
import com.travelgo.exception.ResourceNotFoundException;
import com.travelgo.repository.BookingRepository;
import com.travelgo.repository.PaymentRepository;
import com.travelgo.security.SecurityUtils;
import com.travelgo.service.payment.PaymentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    public PaymentServiceImpl(PaymentRepository paymentRepository, BookingRepository bookingRepository) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
    }

    @Override
    @Transactional
    public PaymentResponse simulatePay(Long bookingId, boolean success) {
        Booking booking = bookingRepository.findByIdAndUserId(bookingId, SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking không tồn tại"));
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BusinessException("Không thể thanh toán booking đã hủy");
        }
        Payment payment = paymentRepository.findTopByBookingIdOrderByCreatedAtDesc(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Chưa có giao dịch thanh toán"));
        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new BusinessException("Booking đã được thanh toán");
        }
        if (success) {
            payment.setStatus(PaymentStatus.PAID);
            payment.setPaidAt(LocalDateTime.now());
            payment.setTransactionRef("PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            if (booking.getStatus() == BookingStatus.PENDING) {
                booking.setStatus(BookingStatus.CONFIRMED);
            }
        } else {
            payment.setStatus(PaymentStatus.FAILED);
        }
        return toResponse(payment, booking);
    }

    @Override
    public List<PaymentResponse> findAll() {
        return paymentRepository.findAll().stream()
                .map(p -> toResponse(p, p.getBooking()))
                .toList();
    }

    @Override
    public PaymentResponse toResponse(Payment payment, Booking booking) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .bookingId(booking != null ? booking.getId() : null)
                .bookingCode(booking != null ? booking.getBookingCode() : null)
                .method(payment.getMethod())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .transactionRef(payment.getTransactionRef())
                .paidAt(payment.getPaidAt())
                .build();
    }
}
