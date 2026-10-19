package com.travelgo.service.coupon.impl;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.dto.coupon.CouponRequest;
import com.travelgo.dto.coupon.CouponResponse;
import com.travelgo.entity.Coupon;
import com.travelgo.exception.BadRequestException;
import com.travelgo.exception.BusinessException;
import com.travelgo.exception.ResourceNotFoundException;
import com.travelgo.repository.CouponRepository;
import com.travelgo.service.coupon.CouponService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;

    public CouponServiceImpl(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    @Override
    public List<CouponResponse> findAll() {
        return couponRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public CouponResponse get(Long id) {
        return toResponse(find(id));
    }

    @Override
    @Transactional
    public CouponResponse create(CouponRequest request) {
        if (couponRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new BadRequestException("Mã coupon đã tồn tại");
        }
        Coupon coupon = Coupon.builder()
                .code(request.getCode().toUpperCase())
                .name(request.getName())
                .discountPercent(request.getDiscountPercent())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .maxUsage(request.getMaxUsage())
                .usedCount(0)
                .status(request.getStatus() == null ? ActiveStatus.ACTIVE : request.getStatus())
                .build();
        return toResponse(couponRepository.save(coupon));
    }

    @Override
    @Transactional
    public CouponResponse update(Long id, CouponRequest request) {
        Coupon coupon = find(id);
        coupon.setName(request.getName());
        coupon.setDiscountPercent(request.getDiscountPercent());
        coupon.setStartDate(request.getStartDate());
        coupon.setEndDate(request.getEndDate());
        coupon.setMaxUsage(request.getMaxUsage());
        if (request.getStatus() != null) {
            coupon.setStatus(request.getStatus());
        }
        return toResponse(coupon);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        couponRepository.delete(find(id));
    }

    @Override
    public Coupon validateUsable(String code) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new BusinessException("Mã giảm giá không tồn tại"));
        LocalDate today = LocalDate.now();
        if (coupon.getStatus() != ActiveStatus.ACTIVE) {
            throw new BusinessException("Mã giảm giá không còn hiệu lực");
        }
        if (today.isBefore(coupon.getStartDate()) || today.isAfter(coupon.getEndDate())) {
            throw new BusinessException("Mã giảm giá không trong thời gian sử dụng");
        }
        if (coupon.getUsedCount() >= coupon.getMaxUsage()) {
            throw new BusinessException("Mã giảm giá đã hết lượt sử dụng");
        }
        return coupon;
    }

    @Override
    public Coupon find(Long id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon không tồn tại"));
    }

    private CouponResponse toResponse(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .name(coupon.getName())
                .discountPercent(coupon.getDiscountPercent())
                .startDate(coupon.getStartDate())
                .endDate(coupon.getEndDate())
                .maxUsage(coupon.getMaxUsage())
                .usedCount(coupon.getUsedCount())
                .status(coupon.getStatus())
                .build();
    }
}
