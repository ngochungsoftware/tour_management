package com.travelgo.controller;

import com.travelgo.dto.payment.PaymentResponse;
import com.travelgo.service.payment.PaymentService;
import com.travelgo.util.ApiResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/{bookingId}/simulate")
    public ApiResponse<PaymentResponse> simulate(@PathVariable Long bookingId,
                                                 @RequestParam(defaultValue = "true") boolean success) {
        PaymentResponse response = paymentService.simulatePay(bookingId, success);
        String message = response.getStatus().name().equals("PAID")
                ? "Thanh toán thành công"
                : "Thanh toán thất bại";
        return ApiResponse.ok(message, response);
    }
}
