package com.travelgo.dto.tour;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class TourResponse {
    private Long id;
    private String code;
    private String name;
    private String coverImage;
    private String destinationName;
    private String categoryName;
    private BigDecimal originalPrice;
    private BigDecimal adultPrice;
    private BigDecimal childPrice;
    private BigDecimal averageRating;
    private Integer reviewCount;
    private Integer durationDays;
    private Boolean featured;
}
