package com.travelgo.controller;

import com.travelgo.dto.coupon.CouponResponse;
import com.travelgo.service.coupon.CouponService;
import com.travelgo.util.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/coupons")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @GetMapping("/{code}")
    public ApiResponse<CouponResponse> validate(@PathVariable String code) {
        return ApiResponse.ok("Mã hợp lệ", couponService.get(couponService.validateUsable(code).getId()));
    }
}
