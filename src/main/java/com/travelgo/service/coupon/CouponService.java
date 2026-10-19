package com.travelgo.service.coupon;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.dto.coupon.CouponRequest;
import com.travelgo.dto.coupon.CouponResponse;
import com.travelgo.entity.Coupon;

import java.util.List;

public interface CouponService {
    List<CouponResponse> findAll();
    CouponResponse get(Long id);
    CouponResponse create(CouponRequest request);
    CouponResponse update(Long id, CouponRequest request);
    void delete(Long id);
    Coupon validateUsable(String code);
    Coupon find(Long id);
}
