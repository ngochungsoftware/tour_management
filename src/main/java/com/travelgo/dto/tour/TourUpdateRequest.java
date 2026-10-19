package com.travelgo.dto.tour;

import com.travelgo.common.enums.TourStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class TourUpdateRequest {
    private String name;
    private String description;
    private Integer durationDays;
    private Integer durationNights;
    private BigDecimal originalPrice;
    private BigDecimal adultPrice;
    private BigDecimal childPrice;
    private BigDecimal infantPrice;
    private Integer maxPeople;
    private TourStatus status;
    private Boolean featured;
}
