package com.travelgo.dto.coupon;

import com.travelgo.common.enums.ActiveStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class CouponResponse {
    private Long id;
    private String code;
    private String name;
    private BigDecimal discountPercent;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer maxUsage;
    private Integer usedCount;
    private ActiveStatus status;
}
