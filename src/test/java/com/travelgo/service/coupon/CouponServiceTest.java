package com.travelgo.service.coupon;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.entity.Coupon;
import com.travelgo.exception.BusinessException;
import com.travelgo.repository.CouponRepository;
import com.travelgo.service.coupon.impl.CouponServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    @Mock private CouponRepository couponRepository;
    @InjectMocks private CouponServiceImpl couponService;

    @Test
    void validCoupon() {
        Coupon coupon = Coupon.builder()
                .code("SUMMER10")
                .discountPercent(new BigDecimal("10"))
                .startDate(LocalDate.now().minusDays(1))
                .endDate(LocalDate.now().plusDays(10))
                .maxUsage(100)
                .usedCount(1)
                .status(ActiveStatus.ACTIVE)
                .build();
        when(couponRepository.findByCodeIgnoreCase("SUMMER10")).thenReturn(Optional.of(coupon));
        assertThat(couponService.validateUsable("SUMMER10").getCode()).isEqualTo("SUMMER10");
    }

    @Test
    void expiredCoupon() {
        Coupon coupon = Coupon.builder()
                .code("OLD")
                .startDate(LocalDate.now().minusDays(10))
                .endDate(LocalDate.now().minusDays(1))
                .maxUsage(10)
                .usedCount(0)
                .status(ActiveStatus.ACTIVE)
                .build();
        when(couponRepository.findByCodeIgnoreCase("OLD")).thenReturn(Optional.of(coupon));
        assertThatThrownBy(() -> couponService.validateUsable("OLD"))
                .isInstanceOf(BusinessException.class);
    }
}
