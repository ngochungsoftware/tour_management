package com.travelgo.dto.coupon;

import com.travelgo.common.enums.ActiveStatus;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class CouponRequest {
    @NotBlank
    private String code;
    @NotBlank
    private String name;
    @NotNull
    @DecimalMin("0.0")
    @DecimalMax("100.0")
    private BigDecimal discountPercent;
    @NotNull
    private LocalDate startDate;
    @NotNull
    private LocalDate endDate;
    @NotNull
    @Min(1)
    private Integer maxUsage;
    private ActiveStatus status;
}
